# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### Google Login
```http
POST /auth/google
```

**Request Body:**
```json
{
  "idToken": "firebase_id_token"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### Get Profile
```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "photo": "https://example.com/photo.jpg",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Profile
```http
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "photo": "https://example.com/new-photo.jpg"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Updated",
  "photo": "https://example.com/new-photo.jpg",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Resumes

#### Upload Resume
```http
POST /resumes/upload
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
resume: <file>
```

**Response:**
```json
{
  "id": "resume_id",
  "userId": "user_id",
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "fileUrl": "https://storage.example.com/resume.pdf",
  "fileSize": 12345,
  "parsedData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": [...],
    "education": [...],
    "projects": [...],
    "certifications": [...],
    "languages": ["English", "Spanish"]
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Get User Resumes
```http
GET /resumes
```

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "resumes": [
    {
      "id": "resume_id",
      "fileName": "resume.pdf",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

#### Get Resume by ID
```http
GET /resumes/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "resume_id",
  "userId": "user_id",
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "fileUrl": "https://storage.example.com/resume.pdf",
  "fileSize": 12345,
  "parsedData": {...},
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Delete Resume
```http
DELETE /resumes/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Resume deleted successfully"
}
```

#### Scan Resume
```http
POST /resumes/:id/scan
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "jobDescriptionId": "job_description_id"
}
```

**Response:**
```json
{
  "id": "scan_id",
  "resumeId": "resume_id",
  "jobDescriptionId": "job_description_id",
  "overallScore": 85,
  "formattingScore": 90,
  "keywordScore": 80,
  "skillScore": 85,
  "experienceScore": 75,
  "educationScore": 90,
  "achievementsScore": 80,
  "missingKeywords": ["Python", "Docker"],
  "weakBulletPoints": ["Improved performance"],
  "grammarSuggestions": ["Use active voice"],
  "resumeSummary": "Software engineer with 5 years experience...",
  "improvedBulletPoints": [...],
  "atsRecommendations": [...],
  "matchPercentage": 85,
  "matchReasons": [...],
  "missingSkills": ["Python"],
  "matchingSkills": ["JavaScript", "React"],
  "status": "completed",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Job Descriptions

#### Create Job Description
```http
POST /job-descriptions
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Company",
  "description": "We are looking for a senior software engineer...",
  "requirements": ["5+ years experience", "JavaScript", "React"],
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"]
}
```

**Response:**
```json
{
  "id": "job_description_id",
  "userId": "user_id",
  "title": "Senior Software Engineer",
  "company": "Tech Company",
  "description": "We are looking for a senior software engineer...",
  "requirements": ["5+ years experience", "JavaScript", "React"],
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Get Job Descriptions
```http
GET /job-descriptions
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "jobDescriptions": [
    {
      "id": "job_description_id",
      "title": "Senior Software Engineer",
      "company": "Tech Company",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Job Description by ID
```http
GET /job-descriptions/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "job_description_id",
  "userId": "user_id",
  "title": "Senior Software Engineer",
  "company": "Tech Company",
  "description": "We are looking for a senior software engineer...",
  "requirements": ["5+ years experience", "JavaScript", "React"],
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Update Job Description
```http
PUT /job-descriptions/:id
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": "job_description_id",
  "title": "Updated Title",
  "company": "Tech Company",
  "description": "Updated description",
  "requirements": ["5+ years experience", "JavaScript", "React"],
  "skills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Delete Job Description
```http
DELETE /job-descriptions/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Job description deleted successfully"
}
```

### ATS Features

#### Rewrite Section
```http
POST /ats/rewrite
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "section": "summary",
  "content": "Current summary text",
  "jobDescriptionId": "job_description_id"
}
```

**Response:**
```json
{
  "original": "Current summary text",
  "rewritten": "Improved summary text with better keywords",
  "improvements": ["Added action verbs", "Quantified achievements"]
}
```

#### Generate Interview Questions
```http
POST /ats/interview-questions
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeId": "resume_id",
  "jobDescriptionId": "job_description_id"
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "Tell me about your experience with React",
      "category": "Technical",
      "difficulty": "Medium"
    }
  ]
}
```

#### Generate Cover Letter
```http
POST /ats/cover-letter
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeId": "resume_id",
  "jobDescriptionId": "job_description_id"
}
```

**Response:**
```json
{
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to express my interest...",
  "tips": ["Customize the company name", "Add specific examples"]
}
```

#### Generate Career Suggestions
```http
POST /ats/career-suggestions
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeId": "resume_id"
}
```

**Response:**
```json
{
  "courses": [
    {
      "title": "Advanced React Patterns",
      "platform": "Udemy",
      "reason": "To improve React skills"
    }
  ],
  "skills": ["GraphQL", "AWS"],
  "certifications": ["AWS Certified Developer"],
  "projects": ["Build a full-stack application"]
}
```

#### Compare Resumes
```http
POST /ats/compare
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeId1": "resume_id_1",
  "resumeId2": "resume_id_2"
}
```

**Response:**
```json
{
  "comparison": {
    "resume1": {
      "overallScore": 75,
      "strengths": ["Strong technical skills"],
      "weaknesses": ["Limited soft skills"]
    },
    "resume2": {
      "overallScore": 85,
      "strengths": ["Well-rounded profile"],
      "weaknesses": ["Less technical depth"]
    },
    "recommendation": "Use resume 2 for technical roles",
    "improvements": ["Add more metrics to resume 1"]
  }
}
```

### Admin (Protected)

#### Get Admin Stats
```http
GET /admin/stats
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalUsers": 100,
  "totalResumes": 250,
  "totalScans": 500,
  "averageScore": 78.5
}
```

#### Get All Users
```http
GET /admin/users
```

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### Update User Role
```http
PUT /admin/users/:id/role
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "ADMIN",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Health Check

#### Health
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

API requests are rate limited to prevent abuse. The default limit is 100 requests per minute per user.

## Pagination

List endpoints support pagination using `page` and `limit` query parameters.
