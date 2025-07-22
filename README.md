# CiviGrantPro - AI-Powered Grant Writing Platform

An intelligent grant writing platform that leverages advanced AI to help organizations strategically identify, analyze, and apply for funding opportunities.

## Features

- 🤖 **AI-Powered Analysis**: Advanced document processing and grant matching
- 🎯 **AI Recommendations**: Personalized grant suggestions based on organization profile
- 🧠 **Advanced NLP Analysis**: Entity recognition, sentiment analysis, and content classification
- 📊 **Strategic Intelligence**: Organization and funder analysis
- 📝 **Smart Narrative Builder**: AI-generated grant narratives
- 🔍 **Grant Discovery**: Real-time search of Grants.gov opportunities
- 📈 **Progress Tracking**: Comprehensive application monitoring
- 👥 **Team Collaboration**: Real-time collaboration tools

## Prerequisites

Before running this application, you need:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download here](https://python.org/)
3. **PostgreSQL Database** - Local or cloud instance
4. **OpenAI API Key** - [Get one here](https://platform.openai.com/)
5. **Grants.gov API Key** - [Get one here](https://www.grants.gov/developers/)
6. **Google Cloud Project** - [Set up here](https://cloud.google.com/) with Natural Language API enabled

## AI Recommendation System

The platform features a sophisticated AI-driven recommendation engine that combines real-time Grants.gov data with intelligent analysis to provide personalized grant suggestions.

### How It Works

1. **User Profile Analysis**: Analyzes your organization's focus areas, budget range, experience level, and past performance
2. **Real-time Grant Search**: Searches Grants.gov for relevant opportunities using your profile criteria
3. **AI-Powered Matching**: Uses GPT-4o to analyze grant-organization alignment and calculate match scores
4. **Intelligent Scoring**: Combines multiple factors including:
   - Mission alignment (40% weight)
   - Budget compatibility (20% weight)
   - Deadline timing (15% weight)
   - Complexity match (15% weight)
   - Agency preferences (10% weight)
5. **Personalized Insights**: Provides reasoning, strengths, challenges, and actionable recommendations

### Key Features

- **Match Scoring**: Percentage-based match scores with detailed reasoning
- **Priority Classification**: High/Medium/Low priority based on match score and deadline
- **Success Rate Estimation**: AI-predicted success probability based on historical patterns
- **Complexity Assessment**: Evaluates grant complexity against your experience level
- **Customizable Filters**: Adjust match score thresholds, budget preferences, and deadline requirements

### Usage

1. Navigate to "AI Recommendations" in the sidebar
2. Review your organization profile
3. Adjust filters and preferences
4. Generate personalized recommendations
5. Review detailed analysis for each opportunity
6. Start applications directly from recommendations

## Advanced NLP Analysis

The platform now includes sophisticated Natural Language Processing capabilities powered by Google's Natural Language API, providing deep insights into text content.

### NLP Features

- **Entity Recognition**: Automatically identify organizations, people, locations, and key terms
- **Sentiment Analysis**: Analyze emotional tone and sentiment at document and sentence levels
- **Content Classification**: Categorize content into relevant topics and themes
- **Syntax Analysis**: Detailed grammatical and structural analysis
- **Grant Document Insights**: Specialized analysis for grant documents including:
  - Funding agency identification
  - Eligibility requirements extraction
  - Geographic focus detection
  - Document tone and complexity assessment
  - Urgency indicators
- **Application Quality Analysis**: Evaluate grant application content for:
  - Writing quality assessment
  - Tone and clarity analysis
  - Impact strength evaluation
  - Improvement suggestions

### How to Use NLP Analysis

1. Navigate to "NLP Analysis" in the sidebar
2. Select analysis type (comprehensive, entities, sentiment, etc.)
3. Paste or upload text content
4. Review detailed analysis results
5. Use insights to improve grant applications and documents

### Google Cloud Setup

1. Create a Google Cloud Project
2. Enable the Natural Language API
3. Create a service account and download credentials
4. Set environment variables:
   - `GOOGLE_APPLICATION_CREDENTIALS`: Path to your credentials JSON file
   - `GOOGLE_CLOUD_PROJECT_ID`: Your Google Cloud project ID

## Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
pip install PyPDF2 python-docx
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/civigrant_pro

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Grants.gov API Configuration
GRANTS_GOV_API_KEY=your_grants_gov_api_key_here

# Google Cloud Configuration
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id

# Server Configuration
NODE_ENV=development
PORT=5000
```

### 3. Database Setup

```bash
# Generate database migrations
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
CiviGrantPro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                 # Express.js backend
│   ├── services/          # Business logic and AI services
│   ├── routes.ts          # API routes
│   └── db.ts             # Database configuration
├── shared/                # Shared TypeScript types and schemas
└── attached_assets/       # Static assets and templates
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Login (demo mode)
- `GET /api/logout` - Logout

### Grants
- `GET /api/grants` - List grants
- `GET /api/grants/:id` - Get grant details
- `POST /api/grants` - Create grant

### Applications
- `GET /api/applications/organization/:id` - Get organization applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application

### AI Services
- `POST /api/ai/analyze-grant-match` - Analyze grant match
- `POST /api/ai/generate-narrative` - Generate narrative
- `POST /api/ai/analyze-grant-document` - Analyze grant document

### Grants.gov Integration
- `GET /api/grants-gov/search` - Search real grant opportunities
- `GET /api/grants-gov/opportunity/:id` - Get opportunity details
- `GET /api/grants-gov/agencies` - Get funding agencies
- `GET /api/grants-gov/categories` - Get funding categories
- `POST /api/grants-gov/import` - Import opportunity to local database

## Troubleshooting

### Common Issues

1. **"npm not recognized"**
   - Install Node.js from [nodejs.org](https://nodejs.org/)
   - Restart your terminal after installation

2. **"DATABASE_URL must be set"**
   - Create a `.env` file with your database connection string
   - Ensure your PostgreSQL database is running

3. **"Python not found"**
   - Install Python from [python.org](https://python.org/)
   - Add Python to your system PATH

4. **"OpenAI API key error"**
   - Get an API key from [OpenAI Platform](https://platform.openai.com/)
   - Add it to your `.env` file

5. **Database connection issues**
   - Verify your PostgreSQL database is running
   - Check your connection string format
   - Ensure the database exists

### Development Commands

```bash
# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:generate    # Generate migrations
npm run db:push        # Push schema changes
npm run db:seed        # Seed sample data
npm run db:migrate     # Run migrations
```

## Demo Mode

This application includes a demo mode with:
- Sample organizations and users
- Pre-populated grants and applications
- AI-powered analysis features
- Mock authentication system

Click "Get Started (Demo)" on the landing page to access the full application.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support or questions, please open an issue on GitHub or contact the development team. 