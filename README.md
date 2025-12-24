# Motion Design Studio Platform

A premium, integrated website combining a professional motion design agency portfolio with a comprehensive learning platform.

## Project Structure

```
motion-studio-platform/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   └── index.ts        # Main server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
└── .env.example            # Root environment variables
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL or MySQL database
- Git

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database connection string and other configuration

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## Technology Stack

### Backend
- Express.js - Web framework
- TypeScript - Type safety
- Prisma - ORM
- PostgreSQL/MySQL - Database
- JWT - Authentication
- bcrypt - Password hashing
- Nodemailer - Email service

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Framer Motion - Animations
- React Router - Navigation
- Zustand - State management
- Axios - HTTP client

## Brand Colors

- Primary Background: `#F6C1CC` (soft blush pink)
- Secondary Background: `#F9D6DC` (light dusty pink)
- Primary Text & CTAs: `#2B2B2E` (charcoal black)
- Secondary Text & Dividers: `#8A8A8E` (mid gray)
- Accent (hover, progress, active states only): `#C89AA6` (muted rose pink)

## Development

### Running Both Services

In separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Database

The project uses Prisma ORM with PostgreSQL/MySQL. Key models include:

- User (students, instructors, admins)
- Course (learning content)
- Enrollment (student-course relationships)
- Lesson (course content)
- Assignment (tasks for students)
- Submission (student work)
- Feedback (instructor comments)
- Payment (course purchases)
- Project (portfolio items)

## API Documentation

The backend provides REST API endpoints for:
- Authentication (sign-up, login, email verification)
- Course management
- Lesson management
- Assignment and submission handling
- Payment processing
- User management

See the design document for detailed API endpoint specifications.

## Testing

Tests will be implemented following the design document specifications:
- Unit tests for components and functions
- Property-based tests for correctness properties
- Integration tests for critical workflows

## License

ISC
