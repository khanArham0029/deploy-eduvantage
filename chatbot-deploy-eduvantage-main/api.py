from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import asyncio
from typing import List, Dict

from agentic_RAG import university_agent, UniversityAIDeps, supabase, openai_client

app = FastAPI()

# CORS middleware setup
origins = [
    "http://localhost:5173",  # Your frontend URL
    "http://localhost:3000",  # If you're using another frontend port, like React's default
    # You can also add other origins if necessary, like:
    # "https://yourfrontend.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow all origins specified in the list
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

@app.get("/ask")
async def ask_university_agent(query: str = Query(..., description="Your university-related question")):
    ctx = UniversityAIDeps(supabase=supabase, openai_client=openai_client)
    try:
        result = await university_agent.run(query, deps=ctx)
        
        # Extracting only the text data from the result
        if result and hasattr(result, "data"):
            text_data = result.data  # Extract the 'data' field
        else:
            raise ValueError("No text data in response.")
        
        # Return the response with the text
        return {"response": {"text": text_data}}  # Send only the text part

    except Exception as e:
        return {"error": str(e)}
    

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Dict[str, str]]
    user_id: str


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    ctx = UniversityAIDeps(supabase=supabase, openai_client=openai_client)
    try:
        result = await university_agent.run(request.message, deps=ctx)
        return {
            "response": result.data,
            "sources": [],
            "model": "gpt-4o",
            "confidence": 0.95,
            "processing_time": 1.2
        }
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
