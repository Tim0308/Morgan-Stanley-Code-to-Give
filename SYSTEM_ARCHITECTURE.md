# Project Reach - System Architecture Design

## Executive Summary

Project Reach is a mobile-first educational platform designed to bridge income-induced gaps in early childhood education in Hong Kong. The system follows a microservices architecture with a React Native mobile application, FastAPI backend services, and Supabase as the Backend-as-a-Service (BaaS) platform.

## System Overview

### Mission Statement
Bridge income-induced gaps in early childhood education by equipping Hong Kong parents with guidance, community, and gamified motivation to support learning at home.

### Key Performance Indicators (KPIs)
- Weekly activity completion rate per child
- 7-day and 30-day parent retention
- Community helpfulness rate (questions with accepted answers / total questions)

## Architecture Principles

### Design Philosophy
- **Privacy-First**: HK PDPO compliance with default child face blurring
- **Inclusive Design**: English and Traditional Chinese (繁中) support
- **Positive Gamification**: No shaming, encouraging progress tracking
- **Mobile-First**: Optimized for varying digital literacy levels
- **Microservices**: Scalable, maintainable service-oriented architecture

### Technical Principles
- **Cloud-Native**: Leveraging Supabase for scalability and real-time features
- **API-First**: RESTful APIs with OpenAPI documentation
- **Type Safety**: TypeScript across frontend and Python Pydantic models
- **Real-time Updates**: WebSocket connections via Supabase Realtime
- **Security by Design**: Row Level Security (RLS) and JWT authentication

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  React Native Mobile App (Expo)                                │
│  ├── Component Architecture                                     │
│  ├── Context Providers (Auth, Cache)                           │
│  ├── Navigation & Routing                                      │
│  └── State Management                                          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Application (Python 3.11)                            │
│  ├── CORS Middleware                                           │
│  ├── Authentication Middleware                                 │
│  ├── Global Exception Handling                                 │
│  └── API Versioning (/api/v1)                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Service Calls
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐ │
│  │   Auth    │ Profiles  │ Content   │Community  │  Tokens   │ │
│  │ Service   │ Service   │ Service   │ Service   │ Service   │ │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘ │
│  ┌───────────┬───────────┬───────────┬───────────┬───────────┐ │
│  │Analytics  │  Games    │Notifications│  User   │  (Future) │ │
│  │ Service   │ Service   │  Service   │ Service   │ Services  │ │
│  └───────────┴───────────┴───────────┴───────────┴───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Supabase SDK
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend-as-a-Service Layer                   │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Platform                                             │
│  ├── PostgreSQL Database (with RLS)                           │
│  ├── Authentication Service                                    │
│  ├── Real-time Subscriptions                                  │
│  ├── File Storage                                             │
│  └── Edge Functions                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Network
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                           │
├─────────────────────────────────────────────────────────────────┤
│  ├── PostHog (Analytics)                                      │
│  ├── Expo Push Notifications                                  │
│  ├── ngrok (Development Tunneling)                            │
│  └── External SuperAPP Integration (Future)                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Mobile Application (React Native + Expo)

#### Technology Stack
- **Framework**: React Native with Expo SDK ~53.0.20
- **Language**: TypeScript
- **State Management**: React Context API
- **Navigation**: Custom tab-based navigation
- **HTTP Client**: Custom API layer with caching
- **Authentication**: Supabase Auth SDK
- **Media Handling**: Expo ImagePicker, MediaLibrary
- **Storage**: AsyncStorage for local caching

#### Component Structure
```
my-rn-app/
├── App.tsx                 # Main application component
├── components/             # UI components
│   ├── auth/              # Authentication components
│   ├── Header.tsx         # App header with user info
│   ├── BottomNavigation.tsx # Tab navigation
│   ├── WeeklyGoal.tsx     # Progress tracking
│   ├── BookletProgress.tsx # Learning material progress
│   ├── TokensPage.tsx     # Token system and shop
│   ├── CommunityPage.tsx  # Social features
│   ├── LearnPage.tsx      # Educational content
│   ├── GamesPage.tsx      # Gamification features
│   └── AnalyticsPage.tsx  # Performance metrics
├── contexts/              # State management
│   ├── AuthContext.tsx    # Authentication state
│   └── CacheContext.tsx   # Data caching layer
├── lib/                   # Utilities and configuration
│   ├── api.ts            # API client (1300+ lines)
│   └── supabase.ts       # Supabase configuration
└── assets/               # Static assets
```

#### Key Features
- **Authentication Flow**: Login, registration, profile management
- **Learning Modules**: Interactive activities, progress tracking
- **Community Features**: Forums, chats, expert directory
- **Gamification**: Badges, certificates, token system
- **Analytics**: Performance metrics and progress visualization
- **Offline Support**: Local caching for improved UX

### 2. Backend Services (FastAPI)

#### Technology Stack
- **Framework**: FastAPI 0.116.1
- **Language**: Python 3.11
- **ASGI Server**: Uvicorn 0.35.0
- **Database ORM**: Supabase SDK (primary), SQLAlchemy (read-only)
- **Authentication**: Supabase JWT
- **Validation**: Pydantic v2
- **Testing**: pytest

#### Service Architecture
```
backend/
├── main.py                # FastAPI application entry point
├── core/                  # Core configuration and utilities
│   ├── config.py         # Application settings
│   ├── database.py       # Supabase client management
│   └── auth.py           # Authentication utilities
├── models/               # Pydantic data models
│   ├── base.py          # Base model classes
│   ├── profiles.py      # User profile models
│   ├── content.py       # Educational content models
│   ├── community.py     # Community feature models
│   └── tokens.py        # Token system models
├── services/            # Microservice modules
│   ├── auth/           # Authentication service
│   ├── profiles/       # User management service
│   ├── content/        # Educational content service
│   ├── community/      # Social features service
│   ├── tokens/         # Token economy service
│   ├── analytics/      # Analytics service
│   ├── games/          # Gamification service
│   ├── notifications/  # Push notification service
│   └── user/           # User data aggregation service
└── supabase/           # Database schema and policies
    ├── schema.sql      # Database schema
    ├── rls_policies.sql # Row Level Security policies
    └── seed.sql        # Sample data
```

#### Service Responsibilities

**Authentication Service (`/auth`)**
- User registration and login
- JWT token validation
- Password reset functionality
- Profile initialization

**Profiles Service (`/profiles`)**
- User profile management
- Child profile creation
- Class enrollment
- Teacher role management

**Content Service (`/content`)**
- Booklet and module management
- Activity progress tracking
- Material upload handling
- Weekly goal calculations

**Community Service (`/community`)**
- Forum post management
- Chat messaging
- Comment and reaction systems
- Content moderation

**Tokens Service (`/tokens`)**
- Token balance management
- Shop item catalog
- Redemption processing
- Leaderboard calculations

**Analytics Service (`/analytics`)**
- Performance metrics calculation
- Progress tracking
- KPI aggregation
- External integration data

**Games Service (`/games`)**
- Weekly challenge management
- Game instance tracking
- Progress monitoring
- Badge awarding logic

**Notifications Service (`/notifications`)**
- Push notification delivery
- In-app notification management
- Notification preferences
- Event-triggered messaging

### 3. Database Layer (Supabase PostgreSQL)

#### Database Schema Overview
```sql
-- Core Entities
├── auth.users              # Supabase authentication
├── profiles                # User profiles and roles
├── children                # Child profiles
├── classes                 # School classes
├── enrollments            # Child-class relationships

-- Educational Content
├── booklets               # Learning materials
├── modules                # Booklet sections
├── activities             # Individual tasks
├── activity_progress      # Completion tracking

-- Gamification
├── badges                 # Achievement definitions
├── child_badges          # Awarded badges
├── certificates          # Achievement certificates
├── child_certificates    # Awarded certificates
├── games                 # Game definitions
├── game_instances        # Weekly challenges
├── game_progress         # Game completion tracking

-- Community Features
├── posts                 # Forum posts and achievements
├── comments              # Post comments
├── reactions             # Likes and reactions
├── reports               # Content moderation
├── threads               # Chat conversations
├── thread_participants   # Chat members
├── messages              # Chat messages

-- Token Economy
├── token_accounts        # Token balances
├── token_transactions    # Transaction history
├── shop_items           # Purchasable items
├── redemptions          # Purchase requests
├── leaderboards         # Weekly rankings

-- Analytics & Monitoring
├── kpi_metrics          # Performance indicators
├── external_integrations # Third-party connections
├── external_metrics     # External app data
└── notifications        # System notifications
```

#### Row Level Security (RLS) Policies
- **Profile Access**: Users can only access their own profiles
- **Child Data**: Parents can only access their children's data
- **Community Content**: Class-based access control
- **Token Transactions**: Account-based access restrictions
- **Teacher Permissions**: Class-specific read access
- **Admin Operations**: Service role for moderation

### 4. Real-time Features

#### Supabase Realtime Integration
- **Community Updates**: Live post and comment updates
- **Chat Messaging**: Real-time message delivery
- **Token Notifications**: Instant balance updates
- **Progress Tracking**: Live activity completion updates
- **Leaderboard Changes**: Real-time rank updates

#### WebSocket Connections
- Automatic reconnection handling
- Subscription management per user context
- Efficient channel filtering
- Offline queue management

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Supabase-managed authentication
- **Row Level Security**: Database-enforced access control
- **API Authentication**: Bearer token validation
- **Service Role**: Admin operations with elevated permissions

### Data Protection
- **HK PDPO Compliance**: Privacy-first design principles
- **Child Safety**: Default face blurring in community posts
- **Data Retention**: 90-day proof storage with deletion rights
- **Parental Controls**: Content visibility management

### API Security
- **CORS Configuration**: Restricted origin access
- **Input Validation**: Pydantic model validation
- **File Upload Limits**: Size and type restrictions
- **Rate Limiting**: Protection against abuse

## Development & Deployment

### Development Environment
- **Local Setup**: Docker Compose for backend services
- **Mobile Development**: Expo development server
- **Database**: Supabase cloud instance
- **Tunneling**: ngrok for mobile-backend communication

### Development Workflow
```bash
# Start backend services
./start-dev.sh

# Services started:
├── FastAPI Backend (Port 8000)
├── ngrok Tunnel (Public HTTPS)
└── React Native App (Expo)
```

### Environment Configuration
```
# Backend Environment
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key
POSTHOG_KEY=analytics-key
EXPO_PUSH_KEY=notification-key

# Mobile Environment
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=backend-url
EXPO_PUBLIC_POSTHOG_KEY=analytics-key
```

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **API Testing**: pytest with coverage reporting
- **Mobile Testing**: TypeScript validation and lint checks
- **Docker Build**: Containerized backend deployment

## Performance & Scalability

### Performance Targets
- **API Response Time**: P95 < 300ms (cached reads)
- **Mobile Bundle Size**: < 8MB (release build)
- **Offline Tolerance**: Read-only list caching
- **Network Resilience**: Graceful degradation on low bandwidth

### Scalability Considerations
- **Horizontal Scaling**: Stateless FastAPI services
- **Database Scaling**: Supabase managed PostgreSQL
- **CDN Integration**: Static asset optimization
- **Caching Strategy**: Client-side data caching

### Monitoring & Analytics
- **Application Metrics**: PostHog integration
- **Error Tracking**: FastAPI exception handling
- **Performance Monitoring**: Database query optimization
- **User Analytics**: Engagement and retention tracking

## Data Flow Architecture

### User Journey Data Flow
```
1. User Authentication
   Mobile App → Supabase Auth → Profile Creation

2. Activity Completion
   Mobile App → Content Service → Database → Token Service

3. Community Interaction
   Mobile App → Community Service → Real-time Updates

4. Token Redemption
   Mobile App → Tokens Service → Admin Approval → Fulfillment

5. Analytics Collection
   Mobile App → Analytics Service → PostHog → Dashboard
```

### Real-time Data Synchronization
- **Optimistic Updates**: Immediate UI feedback
- **Conflict Resolution**: Server-side truth source
- **Offline Queue**: Delayed operation execution
- **State Reconciliation**: Cache invalidation strategies

## Integration Architecture

### External Service Integrations
- **PostHog Analytics**: User behavior and performance tracking
- **Expo Push Notifications**: Mobile notification delivery
- **Supabase Storage**: File and media management
- **Future SuperAPP**: OAuth integration for external progress sync

### API Design Patterns
- **RESTful APIs**: Resource-based URL structure
- **OpenAPI Documentation**: Automatic API documentation
- **Versioning Strategy**: `/api/v1` prefix for version management
- **Error Handling**: Consistent error response format

## Future Architecture Considerations

### Planned Enhancements
- **Microservice Expansion**: Additional domain services
- **Container Orchestration**: Kubernetes deployment
- **CDN Integration**: Global content delivery
- **Advanced Analytics**: Machine learning insights
- **Multi-tenancy**: School district management

### Scalability Roadmap
- **Service Mesh**: Inter-service communication
- **Event-Driven Architecture**: Asynchronous processing
- **CQRS Pattern**: Read/write separation
- **Distributed Caching**: Redis integration

## Technical Debt & Improvements

### Current Limitations
- **Single Database**: Supabase dependency
- **Monolithic Mobile App**: Large bundle size
- **Manual Deployments**: Limited automation
- **Basic Monitoring**: Enhanced observability needed

### Recommended Improvements
- **Code Splitting**: Reduce mobile app bundle size
- **Database Optimization**: Query performance tuning
- **Test Coverage**: Increased unit and integration testing
- **Documentation**: API and architectural documentation

## Conclusion

The Project Reach system architecture successfully implements a scalable, secure, and user-friendly educational platform. The microservices approach with Supabase as the backend provides a solid foundation for future growth while maintaining development velocity and operational simplicity.

The architecture effectively addresses the core requirements of privacy compliance, multilingual support, real-time collaboration, and gamified learning experiences while providing a robust foundation for future enhancements and scaling.