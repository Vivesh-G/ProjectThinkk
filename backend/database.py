import os
import asyncpg
from langchain.memory import ConversationBufferMemory
from langchain_core.messages import HumanMessage, AIMessage
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the PostgreSQL connection URL from environment variables
DATABASE_URL = os.getenv("POSTGRES_URL")

async def get_db_connection():
    """Establishes a new database connection."""
    if not DATABASE_URL:
        raise ValueError("POSTGRES_URL environment variable not set.")
    return await asyncpg.connect(DATABASE_URL)

async def init_db():
    """Initializes the database by creating the messages table if it doesn't exist."""
    conn = await get_db_connection()
    try:
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                session_id TEXT NOT NULL,
                sender TEXT NOT NULL, -- 'user' or 'ai'
                text TEXT NOT NULL,
                timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        ''')
        await conn.execute('CREATE INDEX IF NOT EXISTS session_id_index ON messages (session_id);')
    finally:
        await conn.close()

async def load_memory_from_db(session_id: str, k: int = 5) -> ConversationBufferMemory:
    """Loads chat history for a session and returns a ConversationBufferWindowMemory instance."""
    conn = await get_db_connection()
    try:
        rows = await conn.fetch(
            'SELECT sender, text FROM messages WHERE session_id = $1 ORDER BY timestamp DESC LIMIT $2', session_id, k
        )
        rows.reverse() # Re-reverse to maintain chronological order
    finally:
        await conn.close()

    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    for row in rows:
        if row['sender'] == 'user':
            memory.chat_memory.add_message(HumanMessage(content=row['text']))
        else:  # 'ai'
            memory.chat_memory.add_message(AIMessage(content=row['text']))
    return memory

async def save_context_to_db(session_id: str, user_input: str, ai_output: str):
    """Saves the user input and AI output to the database."""
    conn = await get_db_connection()
    try:
        await conn.execute(
            'INSERT INTO messages (session_id, sender, text) VALUES ($1, $2, $3)',
            session_id, 'user', user_input
        )
        await conn.execute(
            'INSERT INTO messages (session_id, sender, text) VALUES ($1, $2, $3)',
            session_id, 'ai', ai_output
        )
    finally:
        await conn.close()

async def clear_chat_history(session_id: str):
    """Deletes all messages for a given session_id."""
    conn = await get_db_connection()
    try:
        await conn.execute('DELETE FROM messages WHERE session_id = $1', session_id)
    finally:
        await conn.close()
