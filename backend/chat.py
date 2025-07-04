import os
import random
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import LLMChain
import database
import asyncpg
from aiolimiter import AsyncLimiter

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

# Configure Gemini LLM
try:
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=GOOGLE_API_KEY, temperature=0.65)
except Exception as e:
    raise RuntimeError(f"Error initializing Langchain Gemini model: {str(e)}")

# --- Rate Limiter ---
# Allow 58 requests per minute to stay safely under the 60 RPM limit.
rate_limiter = AsyncLimiter(58, 60)

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
reflection_prompt = PromptTemplate(input_variables=["chat_history", "user_input"], template=REFLECTION_PROMPT_TEMPLATE)
answer_prompt = PromptTemplate(input_variables=["chat_history", "user_input"], template=ANSWER_PROMPT_TEMPLATE)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, pool: asyncpg.Pool = Depends(database.get_pool)):
    session_id = request.session_id
    user_input = request.message
    current_mode = request.mode.lower()

    # Load conversation history from the database
    memory = await database.load_memory_from_db(pool, session_id)

    # Determine prompt and modify input if needed
    if current_mode == "reflection":
        prompt = reflection_prompt
        if request.give_answer_requested:
            user_input += " [User explicitly requested the answer. Please provide it directly now, followed by the thinking steps.]"
    elif current_mode == "answer":
        prompt = answer_prompt
    else:
        raise HTTPException(status_code=400, detail="Invalid mode specified.")

    # Create and run the Langchain chain
    chain = LLMChain(llm=llm, prompt=prompt, memory=memory)

    try:
        async with rate_limiter:
            response_dict = await chain.ainvoke({"chat_history": memory.load_memory_variables({})["chat_history"], "user_input": user_input})
        
        bot_response = response_dict.get('text', 'Error: Could not generate a valid response.')
        # Manually save context to our persistent DB
        await database.save_context_to_db(pool, session_id, user_input, bot_response)

    except Exception as e:
        print(f"Error generating content with Langchain: {e}")
        # Check if the error is a rate limit error and provide a user-friendly message
        if "429" in str(e) or "ResourceExhausted" in str(e):
             raise HTTPException(status_code=429, detail="Our AI is currently experiencing high traffic. Please try again in a moment.")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    return ChatResponse(response=bot_response, mode=current_mode, session_id=session_id)


@router.post("/clear_chat")
async def clear_chat(request: ClearChatRequest, pool: asyncpg.Pool = Depends(database.get_pool)):
    try:
        await database.clear_chat_history(pool, request.session_id)
        return {"message": f"Chat history cleared for session {request.session_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))