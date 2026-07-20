# AI ATS Resume Scanner

An enterprise-level, AI-powered Applicant Tracking System (ATS) Resume Scanner built with modern technologies.

## Features

- **Authentication**: Firebase Authentication with Google Login and Email/Password
- **Resume Upload**: Support for PDF and DOCX with drag & drop
- **Resume Parsing**: Extract name, email, phone, skills, experience, education, projects, certifications
- **ATS Scoring**: Comprehensive scoring including formatting, keyword, skill, experience, education, and achievements
- **AI Analysis**: Missing keywords, weak bullet points, grammar suggestions, resume summary, improved bullet points
- **Resume Rewriter**: AI-powered rewriting of summary, projects, experience, skills, achievements
- **Resume Comparison**: Compare two resumes and highlight improvements
- **Semantic Matching**: Calculate similarity using embeddings with match percentage
- **Interview Generator**: Generate interview questions based on resume and job description
- **Cover Letter Generator**: Generate professional cover letters
- **Career Suggestions**: Recommend courses, skills, certifications, and projects
- **Resume History**: Track previous scans, scores, suggestions, and versions
- **Admin Panel**: Manage users, reports, analytics, feedback, and jobs
- **Analytics**: Charts for daily/monthly uploads, top skills, most uploaded roles, average ATS score
- **Dashboard**: Resume count, recent scans, ATS score history, skill match, job match, recent reports

## Tech Stack

### Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- Framer Motion
- Axios
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript

### Database
- PostgreSQL
- Prisma ORM

### Authentication & Storage
- Firebase Authentication
- Firebase Storage

### AI
- OpenAI GPT
- Embeddings for semantic matching

### Resume Parsing
- pdf-parse
- mammoth

## Installation

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Firebase project configured
- OpenAI API key

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ats-resume-scanner
```

2. **Install dependencies**

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` in both frontend and backend directories:
```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Fill in the required values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure secret for JWT tokens
- `FIREBASE_*`: Your Firebase configuration
- `OPENAI_API_KEY`: Your OpenAI API key

4. **Set up the database**

Generate Prisma client and run migrations:
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

5. **Run the application**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`.

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

API endpoints are documented in the `docs/api.md` file.

## Folder Structure

```
ats-resume-scanner/
├── frontend/          # Next.js frontend application
├── backend/           # Express.js backend API
├── prisma/            # Prisma schema and migrations
├── uploads/           # File upload storage
├── docs/              # Documentation
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy

### Database (Neon PostgreSQL)
1. Create a Neon PostgreSQL database
2. Update `DATABASE_URL` in environment variables
3. Run migrations

## Testing

Run tests:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License

## Support

For support, email support@example.com or open an issue in the repository.
