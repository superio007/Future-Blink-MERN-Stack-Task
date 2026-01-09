# AI Flow Visualizer

A MERN stack application that provides a visual interface for AI interactions using React Flow. Users can input prompts through visual nodes, execute AI processing workflows, and save results to MongoDB with secure backend processing.

## Features

- **Visual Flow Interface**: Interactive React Flow canvas with Input and Result nodes
- **AI Processing**: Secure backend integration with OpenRouter API using free models
- **Data Persistence**: Save prompt-response pairs to MongoDB with timestamps
- **Clean Architecture**: Clear separation between frontend visualization and backend processing
- **Security**: API keys and sensitive operations handled securely on backend
- **Real-time Updates**: Loading states and error handling for smooth user experience

## Tech Stack

- **Frontend**: React 18+ with Vite, React Flow, Tailwind CSS
- **Backend**: Node.js with Express.js, CORS, error handling middleware
- **Database**: MongoDB with Mongoose ODM and connection retry logic
- **AI Provider**: OpenRouter API with free models (Gemini 2.0 Flash Lite or Mistral 7B)
- **Styling**: Tailwind CSS for responsive, clean UI

## Prerequisites

Before setting up the application, ensure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local installation or MongoDB Atlas account)
- **OpenRouter API key** (free account available)
- **Git** for cloning the repository

## Setup Instructions

### 1. Clone Repository and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ai-flow-visualizer

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. MongoDB Setup

Choose one of the following options:

#### Option A: Local MongoDB Installation

**Windows:**

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB as a Windows service or manually:
   ```bash
   # Start MongoDB service
   net start MongoDB
   ```

**macOS:**

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu/Debian):**

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Verify Installation:**

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

#### Option B: MongoDB Atlas (Cloud Database)

1. **Create Account**: Visit [MongoDB Atlas](https://cloud.mongodb.com) and sign up
2. **Create Cluster**:
   - Click "Create a New Cluster"
   - Choose the free tier (M0 Sandbox)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"
3. **Configure Access**:
   - Go to "Database Access" and create a database user
   - Go to "Network Access" and add your IP address (or 0.0.0.0/0 for development)
4. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 3. OpenRouter API Key Setup

1. **Create Account**: Visit [OpenRouter](https://openrouter.ai/keys)
2. **Sign Up**: Create a free account using email or GitHub
3. **Generate API Key**:
   - Go to the "Keys" section in your dashboard
   - Click "Create Key"
   - Give it a descriptive name (e.g., "AI Flow Visualizer")
   - Copy the generated API key
4. **Free Models**: The application uses these free models:
   - `google/gemini-2.0-flash-lite-preview-02-05:free`
   - `mistralai/mistral-7b-instruct:free`

### 4. Environment Configuration

#### Frontend Environment Setup

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and update if needed:

```env
VITE_API_URL=http://localhost:5000
```

#### Backend Environment Setup

```bash
# Copy the example file
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your actual values:

**For Local MongoDB:**

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-flow-visualizer
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
SITE_URL=http://localhost:3000
NODE_ENV=development
```

**For MongoDB Atlas:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-flow-visualizer?retryWrites=true&w=majority
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 5. Run the Application

#### Development Mode (Recommended)

Open two terminal windows:

**Terminal 1 - Frontend:**

```bash
npm run dev
```

**Terminal 2 - Backend:**

```bash
cd backend
npm run dev
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

#### Production Mode

```bash
# Build frontend for production
npm run build

# Start backend in production mode
cd backend
npm start
```

## Usage Guide

### Basic Workflow

1. **Open Application**: Navigate to http://localhost:3000
2. **Input Prompt**: Click on the Input Node and type your prompt in the textarea
3. **Execute AI Flow**: Click the "Run Flow" button to send your prompt to the AI
4. **View Response**: The AI response will appear in the Result Node
5. **Save Results**: Click the "Save" button to store the prompt-response pair in MongoDB

### Example Prompts

Try these example prompts to test the application:

- "Explain quantum computing in simple terms"
- "Write a short poem about artificial intelligence"
- "What are the benefits of using React for web development?"
- "Create a simple recipe for chocolate chip cookies"

### Visual Interface

- **Input Node**: Contains a textarea for entering prompts
- **Result Node**: Displays AI responses and loading states
- **Edge Connection**: Visual connection showing data flow
- **Control Buttons**: Run Flow and Save buttons outside the canvas

## Project Structure

```
ai-flow-visualizer/
├── src/                          # Frontend React application
│   ├── components/              # React components
│   │   ├── InputNode.jsx       # Custom input node for React Flow
│   │   ├── ResultNode.jsx      # Custom result node for React Flow
│   │   ├── ErrorBoundary.jsx   # Error handling component
│   │   └── LoadingSpinner.jsx  # Loading state component
│   ├── utils/                  # Utility functions
│   ├── App.jsx                 # Main application component
│   └── main.jsx               # Application entry point
├── backend/                    # Backend Express application
│   ├── config/                # Configuration files
│   │   └── database.js        # MongoDB connection setup
│   ├── models/                # Mongoose data models
│   │   └── PromptResponse.js  # Prompt-response schema
│   ├── routes/                # API route handlers
│   ├── services/              # External service integrations
│   │   └── openRouterClient.js # OpenRouter API client
│   ├── middleware/            # Custom middleware
│   │   └── errorHandler.js    # Global error handling
│   ├── utils/                 # Backend utilities
│   └── server.js              # Main server file
├── .env.example               # Frontend environment template
├── backend/.env.example       # Backend environment template
└── README.md                  # This file
```

## API Documentation

### Endpoints

#### GET /health

Health check endpoint for monitoring application status.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-09T10:30:00.000Z",
  "database": "connected"
}
```

#### POST /api/ask-ai

Process AI requests securely on the backend.

**Request Body:**

```json
{
  "prompt": "Your question or prompt here"
}
```

**Response:**

```json
{
  "response": "AI generated response text"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE"
  }
}
```

#### POST /api/save

Save prompt-response pairs to MongoDB.

**Request Body:**

```json
{
  "prompt": "User's original prompt",
  "response": "AI's response"
}
```

**Response:**

```json
{
  "success": true,
  "id": "mongodb_document_id"
}
```

## Troubleshooting

### Common Issues and Solutions

#### MongoDB Connection Problems

**Issue**: `MongoNetworkError: failed to connect to server`

**Solutions:**

- **Local MongoDB**: Ensure MongoDB service is running

  ```bash
  # Windows
  net start MongoDB

  # macOS
  brew services start mongodb/brew/mongodb-community

  # Linux
  sudo systemctl start mongod
  ```

- **MongoDB Atlas**: Check your connection string and network access settings
- **Firewall**: Ensure port 27017 is not blocked by firewall
- **Connection String**: Verify the format and credentials in your `.env` file

#### OpenRouter API Issues

**Issue**: `401 Unauthorized` or `Invalid API key`

**Solutions:**

- Verify your API key is correctly copied from OpenRouter dashboard
- Ensure the key starts with `sk-or-v1-`
- Check that your OpenRouter account is active
- Verify you have credits/quota available (free tier has limits)

**Issue**: `429 Too Many Requests`

**Solutions:**

- Wait a few minutes before trying again
- Check your OpenRouter usage limits
- Consider upgrading your OpenRouter plan if needed

#### Port Conflicts

**Issue**: `EADDRINUSE: address already in use :::5000`

**Solutions:**

- Change the PORT in `backend/.env` to a different value (e.g., 5001)
- Update `VITE_API_URL` in frontend `.env` to match the new port
- Kill the process using the port:

  ```bash
  # Find process using port 5000
  lsof -i :5000

  # Kill the process (replace PID with actual process ID)
  kill -9 PID
  ```

#### Frontend Build Issues

**Issue**: Build fails or components not rendering

**Solutions:**

- Clear node_modules and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```
- Check for TypeScript/JavaScript syntax errors
- Ensure all dependencies are properly installed
- Verify React Flow and Tailwind CSS are correctly configured

#### CORS Issues

**Issue**: `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solutions:**

- Ensure CORS is properly configured in the backend
- Check that `SITE_URL` in backend `.env` matches your frontend URL
- Verify the backend server is running and accessible

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your backend `.env` file. This will provide more detailed error messages and request logging.

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify all environment variables are correctly set
4. Ensure all services (MongoDB, backend, frontend) are running
5. Test API endpoints directly using tools like Postman or curl

## Development

### Adding New Features

1. **Frontend Components**: Add new React components in `src/components/`
2. **Backend Routes**: Add new API routes in `backend/routes/`
3. **Database Models**: Define new schemas in `backend/models/`
4. **Styling**: Use Tailwind CSS classes for consistent styling

### Testing

```bash
# Run frontend tests (if available)
npm test

# Run backend tests (if available)
cd backend
npm test
```

### Code Style

- Use ESLint for code linting
- Follow React best practices for component structure
- Use async/await for asynchronous operations
- Implement proper error handling throughout the application

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- [React Flow](https://reactflow.dev/) for the visual flow interface
- [OpenRouter](https://openrouter.ai/) for AI model access
- [MongoDB](https://www.mongodb.com/) for data persistence
- [Tailwind CSS](https://tailwindcss.com/) for styling
