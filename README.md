# Crypto Advisor Dashboard

A full-stack cryptocurrency advisory application with personalized market insights, news, and memes.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for database)

## Setup

### 1. Start the Database

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL database on port 5432 with:
- Database: `crypto_advisor`
- User: `postgres`
- Password: `password`

### 2. Configure Environment Variables

#### Server

Create a `.env` file in the `server` directory:

```bash
cd server
cp ../env.example .env
```

Edit `.env` and set:
- `JWT_SECRET` - A secret key for JWT token generation (required)
- `DATABASE_URL` - PostgreSQL connection string (defaults to the Docker setup)
- `CORS_ORIGIN` - Frontend URL (defaults to http://localhost:5173)
- `PORT` - Server port (defaults to 3000)
- `CRYPTOPANIC_API_KEY` - Optional, for crypto news
- `HUGGINGFACE_API_KEY` - Optional, for AI insights

#### Client

The client doesn't require environment variables for basic functionality.

### 3. Install Dependencies

#### Server

```bash
cd server
npm install
```

#### Client

```bash
cd client
npm install
```

### 4. Set Up Database

Run Prisma migrations to set up the database schema:

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

## Running the Project

### Development Mode

#### Start the Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:3000` (or the port specified in `.env`).

#### Start the Client

In a new terminal:

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`.

### Production Build

#### Build the Client

```bash
cd client
npm run build
```

The built files will be in `client/dist`.

#### Preview Production Build

```bash
cd client
npm run preview
```

## Running Tests

### Server Tests

```bash
cd server
npm test
```

### Client Tests

```bash
cd client
npm test
```

For a single test run:

```bash
cd client
npm test -- --run
```

## Project Structure

```
Moveo_project/
├── client/          # React frontend (Vite + TypeScript)
├── server/          # Express backend (TypeScript)
├── docker-compose.yml
└── README.md
```

## API Endpoints

- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /dashboard/data` - Get dashboard data (requires authentication)
- `POST /feedback` - Submit feedback (requires authentication)
- `GET /health` - Health check

## Features

- User authentication (signup/login)
- Personalized crypto dashboard
- Real-time coin prices
- Market news aggregation
- AI-generated insights
- Daily meme from Reddit
- User feedback system
