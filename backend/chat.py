import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI
import database


load_dotenv()

# Load API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY environment variable not set.")

# --- Load Prompt Templates from Environment ---
REFLECTION_PROMPT_TEMPLATE = os.getenv("REFLECTION_PROMPT_TEMPLATE")
if not REFLECTION_PROMPT_TEMPLATE:
    raise RuntimeError("REFLECTION_PROMPT_TEMPLATE environment variable not set.")

ANSWER_PROMPT_TEMPLATE = os.getenv("ANSWER_PROMPT_TEMPLATE")
if not ANSWER_PROMPT_TEMPLATE:
    raise RuntimeError("ANSWER_PROMPT_TEMPLATE environment variable not set.")

router = APIRouter()

# --- Pydantic Models ---
class ChatRequest(BaseModel):
    session_id: str
    message: str
    mode: str
    give_answer_requested: bool = False

class ChatResponse(BaseModel):
    response: str
    mode: str
    session_id: str

class ClearChatRequest(BaseModel):
    session_id: str

# --- Prompt Templates ---
reflection_prompt = ChatPromptTemplate.from_messages([
    ("system", REFLECTION_PROMPT_TEMPLATE),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{user_input}")
])

answer_prompt = ChatPromptTemplate.from_messages([
    ("system", ANSWER_PROMPT_TEMPLATE),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{user_input}")
])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id
    user_input = request.message
    current_mode = request.mode.lower()

    # Load conversation history from the database
    history = await database.load_history_from_db(session_id)

    # Determine prompt and modify input if needed
    if current_mode == "reflection":
        prompt = reflection_prompt
        if request.give_answer_requested:
            user_input += " [User explicitly requested the answer. Please provide it directly now, followed by the thinking steps.]"
    elif current_mode == "answer":
        prompt = answer_prompt
    else:
        raise HTTPException(status_code=400, detail="Invalid mode specified.")

    # Configure Gemini LLM
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0.7)
    except Exception as e:
        raise RuntimeError(f"Error initializing Langchain Gemini model: {str(e)}")

    # Create and run the Langchain chain
    chain = prompt | llm

    try:
        response_dict = await chain.ainvoke({
            "user_input": user_input,
            "chat_history": history
        })
        
        bot_response = response_dict.content
        # Manually save context to our persistent DB
        await database.save_context_to_db(session_id, user_input, bot_response)

    except Exception as e:
        print(f"Error generating content with Langchain: {e}")
        # Check if the error is a rate limit error and provide a user-friendly message
        if "429" in str(e) or "ResourceExhausted" in str(e):
             raise HTTPException(status_code=429, detail="Our AI is currently experiencing high traffic. Please try again in a moment.")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    return ChatResponse(response=bot_response, mode=current_mode, session_id=session_id)


@router.post("/clear_chat")
async def clear_chat(request: ClearChatRequest):
    try:
        await database.clear_chat_history(request.session_id)
        return {"message": f"Chat history cleared for session {request.session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))