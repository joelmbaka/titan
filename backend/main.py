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

### 📌 Define Blog Post Models
class BlogPostRequest(BaseModel):
    prompt: str
    store_id: str
    category: Optional[str] = None

class BlogPostResponse(BaseModel):
    title: str
    content: str
    meta_description: str
    tags: list[str]
    category: str

### 🏢 Define Blog Writer Agent
blog_writer_agent = Agent(
    role="Blog Writer",
    goal="Generate high-quality blog posts with SEO optimization",
    backstory="An experienced content writer specializing in creating engaging, SEO-optimized blog posts.",
    allow_delegation=False,
    llm=llm,
    verbose=True
)

### 📝 Define Blog Writing Task
blog_writing_task = Task(
    description="""Generate a complete blog post based on the following prompt: {prompt}.
    The output must be a valid JSON object with the following structure:
    {{
        "title": "The generated blog post title",
        "content": "The full blog post content (min 300 words, markdown formatted)",
        "meta_description": "A concise meta description (50-160 characters)",
        "tags": ["tag1", "tag2", "tag3"],
        "category": "The blog post category"
    }}
    
    Important:
    - Ensure the JSON is properly formatted
    - Escape all special characters in the content
    - Do not include any control characters except for \n, \t, and \r
    - Remove any trailing commas
    - The JSON must be parseable by Python's json.loads() function""",
    expected_output="A complete blog post in valid JSON format with all required fields",
    agent=blog_writer_agent
)

# Define a Blog Manager Agent
blog_manager_agent = Agent(
    role="Blog Manager",
    goal="Ensure blog posts are high quality and SEO optimized",
    backstory="An experienced content manager who oversees blog post creation.",
    manager=True,
    llm=llm,
    verbose=True
)

### 🏗️ Create Blog Crew
blog_generation_crew = Crew(
    agents=[blog_writer_agent],
    tasks=[blog_writing_task],
    process=Process.hierarchical,
    manager_agent=blog_manager_agent
)

### 🌐 FastAPI Endpoint for Blog Generation
@app.post("/generate-blog-post", response_model=BlogPostResponse)
async def generate_blog_post(request: BlogPostRequest):
    try:
        print("Received blog request:", request.dict())
        
        result = blog_generation_crew.kickoff(inputs={"prompt": request.prompt})
        print("AI Blog Response (raw):", result)
        
        # Add this for debugging
        with open("raw_blog_response.txt", "w", encoding="utf-8") as f:
            f.write(str(result))
        
        blog_data = validate_and_parse_blog_response(result)
        print("Parsed Blog Data:", blog_data)
        
        return BlogPostResponse(**blog_data)
    except ValueError as e:
        print("Blog Validation Error:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print("Blog Server Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

def validate_and_parse_blog_response(response: str) -> dict:
    """Validate and parse the blog response into structured data"""
    try:
        if hasattr(response, 'raw_output'):
            response = response.raw_output
        
        # Clean the response string
        response = str(response).strip()
        
        # Handle markdown code blocks
        if response.startswith('```json') and response.endswith('```'):
            response = response[7:-3].strip()
        elif response.startswith('```') and response.endswith('```'):
            response = response[3:-3].strip()
        
        # Clean the JSON response
        response = clean_json_response(response)
        
        # Parse JSON
        data = json.loads(response)
        
        # Validate required fields
        required_fields = ['title', 'content', 'meta_description', 'tags', 'category']
        if not all(field in data for field in required_fields):
            raise ValueError(f"Missing required fields. Found: {list(data.keys())}")
            
        # Validate tags
        if not isinstance(data['tags'], list) or len(data['tags']) < 3:
            raise ValueError("Tags must be a list with at least 3 items")
            
        # Validate content length
        if len(data['content'].split()) < 200:  # Reduced minimum word count
            raise ValueError("Content must be at least 200 words")
            
        return data
    except json.JSONDecodeError as e:
        print("Failed JSON:", response)  # Add this for debugging
        raise ValueError(f"Invalid JSON format: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error parsing response: {str(e)}")

def clean_json_response(response: str) -> str:
    """Clean the JSON response by removing invalid control characters and escape sequences"""
    # Remove control characters except for \n, \t, and \r
    response = ''.join(char for char in response if char.isprintable() or char in '\n\t\r')
    
    # Fix invalid escape sequences
    response = re.sub(r'\\(?![\\/"bfnrtu])', r'\\\\', response)
    
    # Remove any trailing commas that might break JSON parsing
    response = re.sub(r',\s*}', '}', response)
    response = re.sub(r',\s*]', ']', response)
    
    return response

