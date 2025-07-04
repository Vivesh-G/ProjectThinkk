from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database, chat
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(docs_url=None, redoc_url=None)

FRONTEND_URL = os.getenv("FRONTEND_URL")
origins = []
origins.append(FRONTEND_URL) #Frontend URL
origins.append("http://localhost:5173") #Local Frontend Url for testing

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
    """Initialize the database connection pool and create tables."""
    await database.get_pool() # This initializes the pool
    await database.init_db()

@app.on_event("shutdown")
async def shutdown_event():
    """Close the database connection pool."""
    await database.close_pool()

app.include_router(chat.router)

@app.get("/")
async def read_root():
    return {"message": "ProjectThink FastAPI Backend with Langchain and PostgreSQL Memory"}
