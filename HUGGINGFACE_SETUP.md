# 🤗 Hugging Face Setup for AI Explain Feature

To use the AI Explain feature, you need a Hugging Face account and API token.

## Step 1: Create Hugging Face Account

1. Go to [huggingface.co](https://huggingface.co/)
2. Click "Sign Up" (or "Log In" if you already have an account)
3. Complete the registration process

## Step 2: Generate API Token

1. Go to [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click "New token"
3. Give it a name like "Project Reach AI"
4. Select type: **"Read"** (sufficient for inference)
5. Click "Generate a token"
6. **Copy the token** (you won't see it again!)

## Step 3: Add Token to Your Project

Add your token to the `backend/.env` file:

```env
# Add this line to your existing .env file
HF_TOKEN=hf_your_actual_token_here
```

**Example .env file:**
```env
DEBUG=true
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
CORS_ORIGINS=http://localhost:8081,http://localhost:19006
HF_TOKEN=hf_your_actual_token_here
```

## Step 4: Test the Setup

Run the dependency test:
```bash
cd backend
python test_ai_dependencies.py
```

You should see:
```
✅ All AI dependencies are properly installed!
🚀 You can now use the AI Explain feature.
```

## Token Security 🔒

- **Never commit your token to git** (it's in .gitignore)
- **Don't share your token** with others
- **Regenerate if compromised**
- **Use environment variables** in production

## Rate Limits 📊

**Free Tier:**
- 1000 requests per month
- Rate limited to ~10 requests/minute

**Pro Tier ($9/month):**
- 10,000 requests per month  
- Higher rate limits
- Priority access

For a small team/testing, the free tier should be sufficient.

## Troubleshooting 🔧

**"Invalid token" error:**
- Double-check token in .env file
- Ensure token starts with `hf_`
- Try generating a new token

**Rate limit errors:**
- Wait a few minutes between requests
- Consider upgrading to Pro
- Check usage at https://huggingface.co/settings/billing

**Permission denied:**
- Ensure token has "Read" permission
- Some models require special access (Qwen2.5-VL is public)

---

That's it! Your AI Explain feature is now ready to use with Hugging Face's powerful inference API. 🚀
