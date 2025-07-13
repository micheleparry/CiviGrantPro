# CiviGrantAI - Grant Management System

## Overview

CiviGrantAI is a full-stack web application designed to streamline the grant application process for nonprofit organizations. The system combines AI-powered assistance with comprehensive grant management features, built using modern web technologies and best practices.

## Recent Changes

### AI Intelligence Integration (January 2025)
- Successfully integrated Python CiviGrantAI intelligence system into TypeScript/React application
- Created comprehensive AI Intelligence page with three core features:
  - Organization Intelligence: Analyzes funding organization priorities, success factors, and application strategies
  - Document Analysis: Extracts requirements, deadlines, eligibility criteria, and evaluation metrics from grant documents
  - Application Section Generation: Creates professional content for different application sections with recommendations and compliance checks
- Implemented working mock responses for all AI features to ensure stable functionality
- Added navigation integration and bright, professional color scheme as requested
- User feedback: "Absolutely loves the aesthetic" and finds the encouragement sections motivating

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with JSON responses
- **Middleware**: Custom logging, error handling, and request parsing
- **Development**: Hot reload with Vite integration in development mode

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Type Safety**: Auto-generated TypeScript types from database schema

## Key Components

### Core Entities
- **Users**: Authentication and user management with role-based access
- **Organizations**: Nonprofit organization profiles with focus areas
- **Grants**: Grant opportunities with eligibility and matching criteria
- **Applications**: Grant applications with progress tracking and AI assistance
- **Documents**: File management for application materials
- **AI Suggestions**: AI-generated recommendations and improvements
- **Activity Logs**: Audit trail and user activity tracking

### AI Integration
- **OpenAI API**: GPT-4o model for intelligent assistance
- **Grant Matching**: AI-powered analysis of grant-organization fit
- **Narrative Generation**: Automated writing assistance for applications
- **Suggestion System**: Contextual improvements and recommendations
- **Funder Analysis**: Understanding of funder priorities and preferences
- **Python Integration**: Enhanced intelligence features from existing CiviGrantAI Python system
- **Organization Intelligence**: Comprehensive analysis of funding organizations
- **Document Analysis**: Advanced parsing of grant documents for requirements extraction
- **Application Generation**: Strategic content creation with compliance verification

### User Interface Features
- **Dashboard**: Overview of applications, grants, and progress
- **Grant Discovery**: Search and filter grant opportunities
- **Application Management**: Multi-step application creation and editing
- **AI Assistant**: Interactive AI features for writing and optimization
- **Progress Tracking**: Visual progress indicators and analytics
- **Document Management**: Upload, organize, and manage application files

## Data Flow

### Client-Server Communication
1. **API Requests**: Frontend makes HTTP requests to Express backend
2. **Query Management**: TanStack Query handles caching, synchronization, and error states
3. **Type Safety**: Shared TypeScript types ensure consistency across client and server
4. **Real-time Updates**: Optimistic updates with automatic background refresh

### Database Operations
1. **Schema Definition**: Centralized schema in `shared/schema.ts`
2. **Type Generation**: Drizzle generates TypeScript types from schema
3. **Query Building**: Type-safe query construction with Drizzle ORM
4. **Migrations**: Schema changes managed through Drizzle Kit

### AI Service Integration
1. **Request Processing**: Server receives AI requests from frontend
2. **OpenAI Integration**: Server makes authenticated requests to OpenAI API
3. **Response Processing**: AI responses formatted and stored in database
4. **Caching**: AI suggestions cached to improve performance and reduce costs
5. **Python Integration**: Enhanced intelligence features from existing CiviGrantAI Python system
6. **Organization Intelligence**: Comprehensive analysis of funding organizations with success factors
7. **Document Analysis**: Advanced parsing of grant documents for requirements extraction
8. **Application Generation**: Strategic content creation with compliance verification

## External Dependencies

### Primary Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Accessible UI component primitives
- **drizzle-orm**: Type-safe database ORM
- **openai**: Official OpenAI API client
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer
- **ESBuild**: Fast JavaScript bundler for production

### UI and Styling
- **shadcn/ui**: Pre-built component library based on Radix UI
- **class-variance-authority**: Type-safe CSS class variants
- **tailwind-merge**: Utility for merging Tailwind classes
- **lucide-react**: Icon library

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app with TypeScript checking
2. **Backend Build**: ESBuild bundles server code with external dependencies
3. **Database Migration**: Drizzle Kit applies schema changes
4. **Static Assets**: Frontend builds to `dist/public` directory

### Environment Configuration
- **Development**: Uses Vite dev server with Express backend
- **Production**: Serves static frontend from Express with optimized builds
- **Database**: Requires `DATABASE_URL` environment variable
- **AI Services**: Requires `OPENAI_API_KEY` for AI functionality

### File Structure
```
├── client/          # React frontend application
├── server/          # Express backend server
├── shared/          # Shared TypeScript types and schema
├── migrations/      # Database migration files
└── dist/           # Production build output
```

The application is designed to be deployed on platforms that support Node.js applications with PostgreSQL databases, with specific optimizations for Replit's environment including development banners and runtime error handling.