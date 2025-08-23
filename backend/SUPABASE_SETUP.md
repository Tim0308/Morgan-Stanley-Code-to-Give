# Supabase Setup Guide for Project Reach

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Choose your organization
5. Fill in project details:
   - **Name**: `project-reach` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
6. Click **"Create new project"**
7. Wait for the project to initialize (2-3 minutes)

## Step 2: Get API Keys

Once your project is ready, go to **Settings > API**:

### Required API Keys:

1. **Project URL**

   ```
   https://your-project-id.supabase.co
   ```

2. **Anonymous Key (anon/public)**

   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   - Used by frontend/mobile app
   - RLS policies enforced
   - Safe to expose in client code

3. **Service Role Key (secret)**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Used by backend API
   - **NEVER expose in client code**
   - Bypasses RLS (full database access)

## Step 3: Configure Environment Variables

Create `.env` file in your backend directory:

```bash
# Copy the example file
cp .env.example .env
```

Update `.env` with your Supabase credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-service-role-key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key

# App Configuration
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-change-in-production

# CORS Origins (update with your React Native app URL)
ALLOWED_ORIGINS=http://localhost:3000,exp://192.168.1.100:8081
```

## Step 4: Set Up Database Schema

### 4.1 Run Schema Creation

Go to your Supabase dashboard → **SQL Editor** → **New Query**

Copy and paste the contents of `supabase/schema.sql`:

```sql
-- Copy the entire content from supabase/schema.sql
-- This creates all tables, enums, and relationships
```

Click **"Run"** to execute.

### 4.2 Enable Row Level Security

Copy and paste the contents of `supabase/rls_policies.sql`:

```sql
-- Copy the entire content from supabase/rls_policies.sql
-- This sets up security policies for data access
```

Click **"Run"** to execute.

### 4.3 Add Sample Data

Copy and paste the contents of `supabase/seed.sql`:

```sql
-- Copy the entire content from supabase/seed.sql
-- This adds sample classes, booklets, activities, and shop items
```

Click **"Run"** to execute.

## Step 5: Configure Authentication

### 5.1 Enable Email Authentication

Go to **Authentication > Settings**:

1. **Enable Email authentication**
2. **Disable "Confirm email"** for development (optional)
3. **Set Site URL**: `http://localhost:3000` (for development)
4. **Add Redirect URLs**: Add your app URLs

### 5.2 Configure JWT Settings

Go to **Settings > API**:

1. **JWT expiry**: Set to `604800` (7 days) or your preference
2. Note the **JWT Secret** (automatically managed)

## Step 6: Set Up Storage (Required for File Uploads)

To support proof image uploads for pen & paper activities:

1. Go to **Storage** in your Supabase dashboard
2. Click **"Create a new bucket"**
3. Create bucket: `proof-images`
4. Set bucket to **Public** so images can be accessed by parents
5. Configure upload policies:
   - Allow authenticated users to upload
   - File size limit: 10MB
   - Allowed file types: image/jpeg, image/png

## Step 7: Test Connection

### 7.1 Test from Backend

```bash
cd backend
source venv/bin/activate
python -c "
from core.database import get_supabase_client
client = get_supabase_client()
result = client.table('classes').select('*').execute()
print('Connection successful:', len(result.data), 'classes found')
"
```

### 7.2 Start Backend Server

```bash
uvicorn main:app --reload
```

Visit: http://localhost:8000/health

You should see: `{"status": "healthy", "service": "project-reach-api"}`

## Step 8: Frontend Configuration

Update your React Native app's environment:

```typescript
// In your React Native app
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key"; // NOT the service role key!

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## API Keys Summary

| Key Type             | Usage                     | Security Level | Where to Use         |
| -------------------- | ------------------------- | -------------- | -------------------- |
| **Project URL**      | Base URL for all requests | Public         | Frontend + Backend   |
| **Anonymous Key**    | Client-side operations    | RLS enforced   | Frontend/Mobile only |
| **Service Role Key** | Server-side operations    | Full access    | Backend only         |

## Security Best Practices

### ✅ DO:

- Use **Service Role Key** only in backend
- Use **Anonymous Key** in frontend/mobile
- Keep Service Role Key in environment variables
- Enable RLS on all tables
- Test policies with different user roles

### ❌ DON'T:

- Expose Service Role Key in client code
- Disable RLS without proper policies
- Use Service Role Key in frontend
- Commit API keys to version control

## Troubleshooting

### Connection Issues:

1. **Check API keys** - ensure they're copied correctly
2. **Verify project URL** - should include your project ID
3. **Check network** - ensure Supabase is accessible
4. **Review logs** - check backend logs for specific errors

### RLS Issues:

1. **Test policies** - use Supabase SQL editor to test queries
2. **Check user context** - ensure `auth.uid()` returns expected user
3. **Verify relationships** - ensure foreign keys are correct
4. **Review policy logic** - test with different user scenarios

### Schema Issues:

1. **Check execution order** - run schema.sql → rls_policies.sql → seed.sql
2. **Review error messages** - SQL editor shows specific errors
3. **Verify dependencies** - ensure all referenced tables exist

## Next Steps

Once Supabase is configured:

1. **Test API endpoints** at http://localhost:8000/api/docs
2. **Create test user** via Supabase Auth
3. **Test authentication** with JWT tokens
4. **Verify RLS policies** work correctly
5. **Connect React Native app** to backend API

## Support

- **Supabase Docs**: https://supabase.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Project PRD**: See `project_reach_prd_cursor_ready.md` for complete specifications
