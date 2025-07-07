# ProjectThinkk

ProjectThinkk is a full-stack AI-powered chat application that helps users reflect and get answers using LLM's.

Live Demo: https://project-thinkk.vercel.app/

![image](https://github.com/user-attachments/assets/2b4de39c-4a17-4ca9-80ae-d8e1377496bf)

## Why #ProjectThinkk

A random thought, "Are we thinking less due to overuse of LLMs? What if the models ask us questions back?" lead to this project.

LLM nowadays are faster than google search. The answer that we are looking for is generated in a fraction of time, not like the old days where we need to surf through multiple pages after a google search to find the answer.

If we overuse LLMs for quick answers, what are the long-term implications for our cognitive abilities? We believe that consistent, unchallenging interaction with LLMs could potentially lead to diminished brain activity

Instead of a one-way street where we only pose questions, the solution lies in a two-way conversation. This project explores the profound impact that could arise if LLMs were designed to question us back. By prompting us for clarification, challenging our assumptions, or encouraging deeper thought

## Local Setup
### Backend

1. **Install Python dependencies:**
   ```sh
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create a `.env` file in `backend/` with:
   ```
   POSTGRES_URL=postgresql://user:password@host:port/dbname
   GOOGLE_API_KEY=your_google_gemini_api_key
   REFLECTION_PROMPT_TEMPLATE=...
   ANSWER_PROMPT_TEMPLATE=...
   FRONTEND_URL=http://localhost:5173
   ```

3. **Run the backend:**
   ```sh
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. **Install Node dependencies:**
   ```sh
   cd frontend
   npm install
   ```

2. **Start the frontend:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

## Customization

- **Prompt Templates:** Set `REFLECTION_PROMPT_TEMPLATE` and `ANSWER_PROMPT_TEMPLATE` in your backend `.env` for custom LLM behavior.
- **Frontend API URL:** By default, the frontend uses `VITE_API_BASE_URL` from environment variables or falls back to `http://127.0.0.1:8000`.

Made with ❤️ by [Vivesh-G](https://github.com/Vivesh-G)
