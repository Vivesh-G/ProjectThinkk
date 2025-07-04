from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import database, chat
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(docs_url=None, redoc_url=None)

async def get_db_pool():
    async for pool in database.get_pool():
        yield pool

FRONTEND_URL = os.getenv("FRONTEND_URL")
origins = []
if FRONTEND_URL:
    origins.append(FRONTEND_URL)  # Only add if not None/empty
origins.append("http://localhost:5173")  # Local Frontend Url for testing

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.on_event("startup")
async def startup_event():
    async for pool in get_db_pool():
        await database.init_db(pool)

app.include_router(chat.router)

@app.get("/")
async def read_root():
    return {"message": "ProjectThink FastAPI Backend with Langchain and PostgreSQL Memory"}
