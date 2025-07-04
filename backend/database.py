import os
import asyncpg
from langchain.memory import ConversationBufferWindowMemory
from langchain.schema import HumanMessage, AIMessage
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the PostgreSQL connection URL from environment variables
DATABASE_URL = os.getenv("POSTGRES_URL")

# Global connection pool
async def get_pool():
    """Creates and returns a connection pool."""
    if not DATABASE_URL:
        raise ValueError("POSTGRES_URL environment variable not set.")
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=10)
    try:
        yield pool
    finally:
        await pool.close()

async def init_db(pool: asyncpg.Pool):
    """Initializes the database by creating the messages table if it doesn't exist."""
    async with pool.acquire() as conn:
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

async def load_memory_from_db(pool: asyncpg.Pool, session_id: str, k: int = 5) -> ConversationBufferWindowMemory:
    """Loads chat history for a session and returns a ConversationBufferWindowMemory instance."""
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            'SELECT sender, text FROM messages WHERE session_id = $1 ORDER BY timestamp ASC', session_id
        )

    memory = ConversationBufferWindowMemory(k=k, memory_key="chat_history", return_messages=True)
    for row in rows:
        if row['sender'] == 'user':
            memory.chat_memory.add_message(HumanMessage(content=row['text']))
        else:  # 'ai'
            memory.chat_memory.add_message(AIMessage(content=row['text']))
    return memory

async def save_context_to_db(pool: asyncpg.Pool, session_id: str, user_input: str, ai_output: str):
    """Saves the user input and AI output to the database."""
    async with pool.acquire() as conn:
        # Use a transaction to ensure both inserts succeed
        async with conn.transaction():
            await conn.execute(
                'INSERT INTO messages (session_id, sender, text) VALUES ($1, $2, $3)',
                session_id, 'user', user_input
            )
            await conn.execute(
                'INSERT INTO messages (session_id, sender, text) VALUES ($1, $2, $3)',
                session_id, 'ai', ai_output
            )

async def clear_chat_history(pool: asyncpg.Pool, session_id: str):
    """Deletes all messages for a given session_id."""
    async with pool.acquire() as conn:
        await conn.execute('DELETE FROM messages WHERE session_id = $1', session_id)
