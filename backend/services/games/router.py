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
            Role: You are a friendly and encouraging children's game AI. Your job is to judge pictures submitted by kids against a daily word. 
            Your feedback must be positive, constructive, and simple enough for a child to understand.

            Instruction: Analyze the provided image. The "Word of the Day" is {word_of_the_day}.

            Output Format: You MUST respond in the following exact format. 

            Correct/Wrong: Correct
            Feedback: [Your feedback text here]

            OR

            Correct/Wrong: Wrong
            Feedback: [Your feedback text here]

            Feedback Rules:

                1. If the picture is CORRECT and clearly shows {word_of_the_day}:
                Correct/Wrong: Correct
                Your feedback must be a short, excited encouragement.
                Choose one of these phrases or mix and match their style:
                "Wow! You found a perfect {word_of_the_day}! Great job!"
                "That's it! A fantastic {word_of_the_day}! You're a superstar!"
                "Well done! I recognized that {word_of_the_day} right away!"
                "Perfect! That's exactly what a {word_of_the_day} looks like! 🎉"

                2. If the picture is WRONG and shows something else (e.g., a toy):

                Correct/Wrong: Wrong
                First, gently identify what you see. "I see a [object name]!"
                Then, provide a simple, guiding hint. Frame it as a fun clue, not a correction.
                Finally, encourage them to try again.
                Formula:"I see a [object name]! Try looking for something that [hint about {word_of_the_day}]. Can you try again?"

                    Example Hints:
                            If {word_of_the_day} is elephant: "...something with a big trunk and floppy ears."

                            If {word_of_the_day} is apple: "...something red or green that grows on a tree and is yummy to eat."

                            If {word_of_the_day} is book: "...something with pages that we read stories from."

                3. If the image is unclear, blurry, or you cannot identify the main object:
                    Correct/Wrong: Wrong
                    Feedback: "Hmm, my robot eyes are having a little trouble seeing this clearly! Could you take another picture so I can get a better look? I'm looking for a {word_of_the_day}!"


        
        
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
        
        print(f"🎯 AI Raw Response: {content}")  # Debug log
        print(f"🎯 Number of lines: {len(lines)}")  # Debug log
        
        for i, line in enumerate(lines):
            line = line.strip()
            print(f"🎯 Line {i}: '{line}'")  # Debug log
            
            if line.lower().startswith('correct/wrong:'):
                print(f"🎯 Found Correct/Wrong line: '{line}'")  # Debug log
                # Handle "Correct/Wrong: Correct" format
                if ': correct' in line.lower():
                    is_correct = True
                    print(f"🎯 Setting is_correct = True")  # Debug log
                elif ': wrong' in line.lower():
                    is_correct = False
                    print(f"🎯 Setting is_correct = False")  # Debug log
            elif line.lower().startswith('correct:'):
                is_correct = True
                print(f"🎯 Found 'Correct:' line, setting is_correct = True")  # Debug log
            elif line.lower().startswith('wrong:'):
                is_correct = False
                print(f"🎯 Found 'Wrong:' line, setting is_correct = False")  # Debug log
            elif line.lower().startswith('feedback:'):
                feedback = line.replace('Feedback:', '').replace('feedback:', '').strip()
                print(f"🎯 Found feedback line: '{feedback}'")  # Debug log
            elif feedback == "" and line and not line.lower().startswith('correct') and not line.lower().startswith('wrong') and not line.lower().startswith('correct/wrong'):
                feedback = line
                print(f"🎯 Using line as feedback: '{feedback}'")  # Debug log
        
        print(f"🎯 Final parsed result - is_correct: {is_correct}, feedback: {feedback}")  # Debug log
        
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