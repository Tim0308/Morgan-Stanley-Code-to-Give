"""
Games microservice router
"""

import os 
import requests

from fastapi import APIRouter, Depends
from core.auth import get_current_user, AuthUser

router = APIRouter()

@router.get("/weekly")
async def get_weekly_games(current_user: AuthUser = Depends(get_current_user)):
    """Get weekly games"""
    return {"message": "Games endpoint - to be implemented"}

#[Tiffany, 10.55pm 23/8] new endpoint added for AI Game
@router.post("/vocabventure")
async def vocabventure_game(
    request: dict,
    current_user: AuthUser = Depends(get_current_user)
):
    """
    VocabVenture game endpoint
    Expects: {"image": "base64_string", "word_of_the_day": "DOG", "attempts": 5}
    """
    try:
        # Extract data from request
        image_base64 = request.get("image")
        word_of_the_day = request.get("word_of_the_day", "DOG")
        attempts = request.get("attempts", 5)
        
        if not image_base64:
            return {"error": "No image provided"}
        
        # Call GPT-4o API to analyze image
        result = await analyze_image_with_gpt4o(image_base64, word_of_the_day)
        
        # Add game metadata
        result.update({
            "attempts": attempts,
            "word_of_the_day": word_of_the_day,
            "can_try_again": attempts < 5 and not result.get("is_correct", False)
        })
        
        return result
        
    except Exception as e:
        return {"error": f"Failed to process game: {str(e)}"}

async def analyze_image_with_gpt4o(image_base64: str, word_of_the_day: str):
    """
    Analyze image using GPT-4o API
    """
    import base64
    import requests
    
    # API Configuration (you'll need to set these as environment variables)
    API_CONFIG = {
        "api_base": "https://hkust.azure-api.net/openai",
        "api_version": "2024-10-21",
        "deployment_name": "gpt-4o",
        "api_key": os.getenv("OPENAI_API_KEY")  # Set this in environment variables
    }
    
    try:
        # Prepare headers
        headers = {
            "Content-Type": "application/json", 
            "api-key": API_CONFIG['api_key']
        }
        
        # Prepare endpoint
        endpoint = f"{API_CONFIG['api_base']}/deployments/{API_CONFIG['deployment_name']}/chat/completions?api-version={API_CONFIG['api_version']}"
        
        # Prepare system prompt
        system_prompt = f"""
This is a kids game. The kid has sent in a picture. Today's word is {word_of_the_day}. 
Analyze the picture and return with the following format:

Correct/Wrong (this will determine if the picture taken by the kid is exactly of the word_of_the_day)
A feedback: 
[if correct, put in short encouragements that's different all the time. for e.g. Good job! This is a {word_of_the_day}; Well done! You nailed it! ]
[if wrong, suggest how to guide them to their answer. for e.g. if word_of_the_day = {word_of_the_day}, but picture shows: a toy. Feedback: "This seems to be a toy, maybe find something that has this feature?" and clip a small part of the {word_of_the_day}'s body parts, maybe its face, or its tail wtv.]
        """
        
        # Prepare request payload
        payload = {
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"Please analyze this image for the word '{word_of_the_day}'"
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }
        
        # Make API call
        response = requests.post(endpoint, headers=headers, json=payload)
        response.raise_for_status()
        
        # Parse response
        result = response.json()
        content = result['choices'][0]['message']['content']
        
        # Parse the response to extract Correct/Wrong and feedback
        lines = content.strip().split('\n')
        is_correct = False
        feedback = ""
        
        for line in lines:
            line = line.strip()
            if line.lower().startswith('correct'):
                is_correct = True
                feedback = line.replace('Correct', '').replace('correct', '').strip(': ')
            elif line.lower().startswith('wrong'):
                is_correct = False
                feedback = line.replace('Wrong', '').replace('wrong', '').strip(': ')
            elif line.lower().startswith('feedback'):
                feedback = line.replace('Feedback', '').replace('feedback', '').strip(': ')
            elif feedback == "" and line:
                feedback = line
        
        return {
            "is_correct": is_correct,
            "feedback": feedback,
            "raw_response": content
        }
        
    except Exception as e:
        return {
            "is_correct": False,
            "feedback": f"Sorry, there was an error analyzing your image: {str(e)}",
            "raw_response": ""
        } 