# AI Flow Visualizer

A MERN stack application that provides a visual interface for AI interactions using React Flow. Users can input prompts through visual nodes, execute AI processing workflows, and save results to MongoDB.

## Features

- Visual flow interface using React Flow
- AI processing through OpenRouter API
- Data persistence with MongoDB
- Clean separation between frontend and backend
- Secure API handling

## Tech Stack

- **Frontend**: React 18+ with Vite, React Flow, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Provider**: OpenRouter API

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- OpenRouter API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Configuration

#### Frontend Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

#### Backend Environment

Copy `backend/.env.example` to `backend/.env` and configure:

```bash
cp backend/.env.example backend/.env
```

Update the backend `.env` file with your actual values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-flow-visualizer
OPENROUTER_API_KEY=your_actual_openrouter_api_key
SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. MongoDB Setup

#### Option A: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. The application will connect to `mongodb://localhost:27017/ai-flow-visualizer`

#### Option B: MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `backend/.env`

### 4. OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Update `OPENROUTER_API_KEY` in `backend/.env`

### 5. Run the Application

#### Development Mode

Terminal 1 (Frontend):

```bash
npm run dev
```

Terminal 2 (Backend):

```bash
cd backend
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

#### Production Mode

```bash
# Build frontend
npm run build

# Start backend
cd backend
npm start
```

## Project Structure

```
├── src/                    # Frontend React application
├── backend/               # Backend Express application
│   ├── config/           # Database and other configurations
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Main server file
├── .env.example          # Frontend environment template
└── backend/.env.example  # Backend environment template
```

## API Endpoints

- `GET /` - Basic API information
- `GET /health` - Health check endpoint
- `POST /api/ask-ai` - Process AI requests (coming soon)
- `POST /api/save` - Save prompt-response pairs (coming soon)

## Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running locally or check your Atlas connection string
- Verify network connectivity and firewall settings

### OpenRouter API Issues

- Verify your API key is correct
- Check your OpenRouter account credits/limits
- Ensure the API key has proper permissions

### Port Conflicts

- Change the PORT in `backend/.env` if 5000 is already in use
- Update `VITE_API_URL` in frontend `.env` accordingly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.
