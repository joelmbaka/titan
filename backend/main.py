from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from crewai import Agent, Task, Crew, Process, LLM
from dotenv import load_dotenv
from typing import Optional
import re
import json
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file
load_dotenv()

# After load_dotenv()
print("Loaded NVIDIA API Key:", os.getenv("NVIDIA_NIM_API_KEY"))

# Initialize LLM
llm = LLM(
    model="nvidia_nim/meta/llama3-70b-instruct",
    temperature=0.7
)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


### 📌 Define API Request and Response Models
class ProductRequest(BaseModel):
    prompt: str
    store_id: Optional[str] = None  # Add store ID for database context

class ProductResponse(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    price_suggestion: Optional[float] = None
    sku_suggestion: Optional[str] = None

### 🏢 Define Agents in CrewAI

# Manager Agent - Oversees product description generation
manager_agent = Agent(
    role="Product Manager",
    goal="Ensure product descriptions are complete and database-ready",
    backstory="An experienced product manager who ensures quality descriptions and database compatibility.",
    manager=True,
    llm=llm,
    verbose=True
)

# Product Description Writer Agent
writer_agent = Agent(
    role="Product Description Writer",
    goal="Generate complete product descriptions with all necessary fields",
    backstory="A skilled writer who crafts compelling product titles and descriptions with all required fields.",
    allow_delegation=False,
    llm=llm,
    verbose=True
)

### 📝 Define Task for the Product Writer
product_description_task = Task(
    description="""Generate a complete product description based on: {prompt}.
    The output must include:
    1. Title
    2. Description
    3. Suggested category
    4. Suggested price (as a number)
    5. Suggested SKU (using product name initials and numbers)
    
    Format as JSON:
    {{
        "title": "...",
        "description": "...",
        "category": "...",
        "price_suggestion": ...,
        "sku_suggestion": "..."
    }}""",
    expected_output="A complete product description in JSON format with all required fields",
    agent=writer_agent
)

### 🏗️ Create Crew
product_generation_crew = Crew(
    agents=[writer_agent],
    tasks=[product_description_task],
    process=Process.hierarchical,
    manager_agent=manager_agent
)

def validate_and_parse_response(response: str) -> dict:
    """Validate and parse the AI response into structured data"""
    try:
        # If response is a CrewOutput object, get the raw output
        if hasattr(response, 'raw_output'):
            response = response.raw_output
        
        # Clean the response string
        response = str(response).strip()
        response = re.sub(r'```json|```', '', response)  # Remove markdown code blocks
        response = response.strip()
        
        # Parse JSON
        data = json.loads(response)
        
        # Validate required fields
        required_fields = ['title', 'description', 'category', 'price_suggestion', 'sku_suggestion']
        if not all(field in data for field in required_fields):
            raise ValueError("Missing required fields in response")
            
        # Additional validation
        if not isinstance(data['price_suggestion'], (int, float)):
            raise ValueError("Price suggestion must be a number")
            
        return data
        
    except Exception as e:
        raise ValueError(f"Invalid response format: {str(e)}")

### 🌐 FastAPI Endpoint
@app.post("/generate-product", response_model=ProductResponse)
async def generate_product(request: ProductRequest):
    try:
        print("Received request:", request.dict())
        
        result = product_generation_crew.kickoff(inputs={"prompt": request.prompt})
        print("AI Response (raw):", result)
        
        product_data = validate_and_parse_response(result)
        print("Parsed Data:", product_data)
        
        return ProductResponse(**product_data)
    except ValueError as e:
        print("Validation Error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("Server Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

