# Project Reach Backend API

FastAPI microservices backend for the educational parent engagement platform.

## Architecture

This backend uses a **microservices architecture** with:
- **Single Supabase database** for all services
- **Service-oriented design** with separate routers for each domain
- **JWT authentication** via Supabase Auth
- **RESTful API** with OpenAPI documentation

## Technology Stack

- **Framework**: FastAPI 0.116.1
- **Language**: Python 3.11+
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: Supabase Auth with JWT
- **Validation**: Pydantic v2
- **Testing**: pytest
- **Deployment**: Docker

## Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── core/
│   ├── config.py          # Settings and configuration
│   ├── database.py        # Supabase client setup
│   └── auth.py            # JWT validation and auth middleware
├── models/
│   ├── base.py            # Base Pydantic models and enums
│   ├── profiles.py        # User, children, and class models
│   ├── content.py         # Booklets, activities, progress models
│   ├── community.py       # Posts, comments, chat models
│   └── tokens.py          # Token system and shop models
├── services/
│   ├── auth/              # Authentication service
│   ├── profiles/          # User profiles and children management
│   ├── content/           # Educational content and progress
│   ├── community/         # Community features
│   ├── tokens/            # Token economy and shop
│   ├── analytics/         # Performance analytics
│   ├── games/             # Weekly challenges and games
│   └── notifications/     # Push and in-app notifications
├── supabase/
│   ├── schema.sql         # Database schema
│   └── seed.sql           # Sample data
├── tests/                 # Unit and integration tests
├── requirements.txt       # Python dependencies
├── Dockerfile            # Container configuration
└── docker-compose.yml    # Local development setup
```

## Microservices

### 1. Authentication Service (`/api/v1/auth`)
- JWT token validation
- User session management
- Role-based access control

### 2. Profiles Service (`/api/v1/profiles`)
- User profile management
- Children profiles
- Class enrollment
- `/me` endpoint for current user data

### 3. Content Service (`/api/v1/content`)
- Educational booklets and modules
- Activity management
- Progress tracking
- Weekly progress summaries

### 4. Community Service (`/api/v1/community`)
- Achievement posts and questions
- Comments and reactions
- Expert parent directory
- Direct messaging and chats

### 5. Tokens Service (`/api/v1/tokens`)
- Token balance management
- Shop items and redemptions
- Transaction history
- Leaderboards and rankings

### 6. Analytics Service (`/api/v1/analytics`)
- Performance metrics
- Distribution charts
- External app integrations
- KPI tracking

### 7. Games Service (`/api/v1/games`)
- Weekly challenges
- Game progress tracking
- Extra educational games

### 8. Notifications Service (`/api/v1/notifications`)
- Push notifications
- In-app notification inbox
- Read status management

## Setup Instructions

### 1. Environment Setup

```bash
# Clone and navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (full access)
- `SUPABASE_ANON_KEY`: Anonymous key (RLS enforced)

### 3. Database Setup

Run the schema and seed files in your Supabase project:

```sql
-- Run in Supabase SQL Editor
\i supabase/schema.sql
\i supabase/seed.sql
```

### 4. Run Development Server

```bash
# Activate virtual environment
source venv/bin/activate

# Run with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Docker Development

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/api/docs
- **ReDoc**: http://localhost:8000/api/redoc
- **Health Check**: http://localhost:8000/health

## Key Features

### Authentication
- **Supabase JWT validation** with role-based access
- **Parent/Teacher/Admin** role separation
- **Automatic profile creation** on first access

### Progress Tracking
- **Activity completion** with proof uploads
- **Automatic token awards** for completed activities
- **Weekly goal tracking** and streak management
- **Real-time progress updates**

### Token Economy
- **Earning tokens** through activities and engagement
- **Shop system** with redemption workflow
- **Leaderboards** and community rankings
- **Transaction history** and balance tracking

### Community Features
- **Achievement sharing** with media support
- **Forum discussions** by educational subject
- **Expert parent directory** with ratings
- **Direct messaging** between parents and teachers

### Analytics
- **Performance metrics** (reading speed, comprehension)
- **Distribution charts** showing child's position
- **External app integration** (SuperAPP sync)
- **KPI tracking** and reporting

## Security

### Row Level Security (RLS)
- **Parent access**: Own children and progress only
- **Teacher access**: Class-level read access
- **Admin access**: Full management capabilities
- **Automatic enforcement** via Supabase RLS policies

### Data Privacy
- **PDPO compliance** with explicit consent
- **Child face blurring** by default
- **Parental controls** for data visibility
- **90-day retention** for uploaded proofs

## Testing

```bash
# Run unit tests
pytest

# Run with coverage
pytest --cov=.

# Run specific test file
pytest tests/test_profiles.py
```

## Deployment

### Production Environment

1. **Set environment variables** in production
2. **Configure CORS origins** for your mobile app
3. **Set up proper JWT validation** with JWKS
4. **Configure file storage** buckets in Supabase
5. **Set up background jobs** for leaderboards and notifications

### Environment Variables for Production

```bash
APP_ENV=production
DEBUG=false
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ALLOWED_ORIGINS=https://your-app-domain.com
```

## API Endpoints Summary

### Profiles
- `GET /api/v1/profiles/me` - Current user profile
- `POST /api/v1/profiles/children` - Create child
- `GET /api/v1/profiles/children` - List children

### Content
- `GET /api/v1/content/booklets` - List booklets
- `POST /api/v1/content/progress` - Update activity progress
- `GET /api/v1/content/activities/{id}` - Activity details

### Community
- `GET /api/v1/community/feed` - Community feed
- `POST /api/v1/community/posts` - Create post
- `GET /api/v1/community/experts` - Expert directory

### Tokens
- `GET /api/v1/tokens/balance` - Token balance
- `POST /api/v1/tokens/redeem` - Redeem shop items
- `GET /api/v1/tokens/shop/items` - Shop catalog

### Analytics
- `GET /api/v1/analytics/performance` - Performance metrics
- `GET /api/v1/analytics/distribution` - Score distributions

## Contributing

1. **Follow microservices pattern** - each feature in its own service
2. **Use Pydantic models** for all request/response validation
3. **Implement proper error handling** with meaningful messages
4. **Add comprehensive tests** for business logic
5. **Follow security best practices** with RLS and JWT validation

## Support

For questions about the backend architecture or implementation, refer to the PRD document and the agent instructions in `.github/agent_instruction.md`. 