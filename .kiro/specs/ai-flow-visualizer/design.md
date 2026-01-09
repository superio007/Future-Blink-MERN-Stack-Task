# Design Document: AI Flow Visualizer

## Overview

The AI Flow Visualizer is a MERN stack application that provides a visual interface for AI interactions using React Flow. Users input prompts through visual nodes, execute AI processing workflows, and save results to MongoDB. The system maintains strict separation between frontend visualization and backend AI processing while ensuring security best practices.

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        A[React App] --> B[React Flow Canvas]
        B --> C[Input Node]
        B --> D[Result Node]
        B --> E[Edge Connection]
        A --> F[Run Flow Button]
        A --> G[Save Button]
    end

    subgraph "Backend (Node.js + Express)"
        H[Express Server] --> I[/api/ask-ai Endpoint]
        H --> J[/api/save Endpoint]
        I --> K[OpenRouter API Client]
    end

    subgraph "External Services"
        L[OpenRouter API]
        M[MongoDB Database]
    end

    F --> I
    G --> J
    K --> L
    J --> M
    I --> A
    J --> A
```

### Technology Stack

- **Frontend**: React 18+ with Vite, React Flow, Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Provider**: OpenRouter API with free models
- **Styling**: Tailwind CSS only

## Components and Interfaces

### Frontend Components

#### React Flow Canvas

- **Purpose**: Main visualization area for the AI flow
- **Implementation**: Uses React Flow library with custom node types
- **State Management**: Local React state for nodes, edges, and flow data

#### Input Node Component

```javascript
// Custom Input Node structure
{
  id: 'input-1',
  type: 'inputNode',
  position: { x: 100, y: 100 },
  data: {
    label: 'User Input',
    value: '', // User's prompt text
    onChange: handleInputChange
  }
}
```

#### Result Node Component

```javascript
// Custom Result Node structure
{
  id: 'result-1',
  type: 'resultNode',
  position: { x: 400, y: 100 },
  data: {
    label: 'AI Response',
    content: '', // AI response text
    loading: false
  }
}
```

#### Edge Configuration

```javascript
// Connection between Input and Result nodes
{
  id: 'input-to-result',
  source: 'input-1',
  target: 'result-1',
  type: 'smoothstep',
  animated: false
}
```

### Backend API Endpoints

#### POST /api/ask-ai

- **Purpose**: Process AI requests securely on backend
- **Request Body**: `{ prompt: string }`
- **Response Body**: `{ response: string }`
- **Implementation**: Calls OpenRouter API with configured model

#### POST /api/save

- **Purpose**: Persist prompt-response pairs to MongoDB
- **Request Body**: `{ prompt: string, response: string }`
- **Response Body**: `{ success: boolean, id: string }`
- **Implementation**: Creates new document in MongoDB collection

### OpenRouter Integration

#### API Configuration

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Authentication**: Bearer token in Authorization header
- **Model Selection**: Either `google/gemini-2.0-flash-lite-preview-02-05:free` or `mistralai/mistral-7b-instruct:free`

#### Request Format

```javascript
{
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.OPENROUTER_API_KEY,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.SITE_URL,
    'X-Title': 'AI Flow Visualizer'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
    messages: [
      {
        role: 'user',
        content: userPrompt
      }
    ]
  })
}
```

## Data Models

### MongoDB Schema (Mongoose)

#### PromptResponse Model

```javascript
const promptResponseSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    trim: true,
    maxLength: 10000,
  },
  response: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
```

### Frontend State Models

#### Flow State

```javascript
const flowState = {
  nodes: [
    // Input and Result nodes
  ],
  edges: [
    // Connection between nodes
  ],
  currentPrompt: "",
  currentResponse: "",
  isLoading: false,
  error: null,
};
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

Now I'll analyze the acceptance criteria to determine which ones can be tested as properties:

### Property 1: UI Input-Output Flow

_For any_ valid text input in the Input_Node textarea, the system should capture the input and, after processing, update the Result_Node with the corresponding AI response
**Validates: Requirements 2.1, 2.4**

### Property 2: Secure Backend Processing

_For any_ user prompt, when the Run Flow button is clicked, the system should handle all AI processing on the backend without exposing API credentials to the frontend
**Validates: Requirements 2.2, 2.3, 4.1, 4.2**

### Property 3: Complete Data Persistence

_For any_ prompt-response pair, when the Save button is clicked, the system should store the prompt, response, and timestamp in MongoDB and return success confirmation
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: API Response Format Consistency

_For any_ AI request processed by the backend, the system should return a response in the format { response: string } to the frontend
**Validates: Requirements 4.4**

### Property 5: Error Handling Resilience

_For any_ database connection failure or API error, the system should handle the error gracefully without crashing
**Validates: Requirements 3.5**

### Property 6: Frontend-Backend Separation

_For any_ system operation, the frontend should never directly access external APIs or database connections, maintaining clear architectural boundaries
**Validates: Requirements 5.4**

### Property 7: Environment Configuration Handling

_For any_ valid environment configuration with required API keys and database connections, the system should initialize and function correctly
**Validates: Requirements 6.3**

## Error Handling

### Frontend Error Handling

- **Network Errors**: Display user-friendly messages when backend is unreachable
- **API Errors**: Show specific error messages from backend responses
- **Validation Errors**: Prevent empty prompts from being submitted
- **Loading States**: Show loading indicators during AI processing

### Backend Error Handling

- **OpenRouter API Errors**: Log errors and return generic error messages to frontend
- **Database Connection Errors**: Implement retry logic and graceful degradation
- **Invalid Requests**: Validate request bodies and return appropriate HTTP status codes
- **Rate Limiting**: Handle API rate limits with exponential backoff

### Error Response Format

```javascript
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE",
    details: {} // Additional error context (development only)
  }
}
```

## Testing Strategy

### Dual Testing Approach

The system will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using generated test data

### Property-Based Testing Configuration

- **Library**: fast-check for JavaScript/TypeScript property-based testing
- **Iterations**: Minimum 100 iterations per property test
- **Test Tags**: Each property test will reference its design document property
- **Tag Format**: `// Feature: ai-flow-visualizer, Property {number}: {property_text}`

### Unit Testing Focus Areas

- React component rendering and user interactions
- API endpoint request/response handling
- MongoDB schema validation and CRUD operations
- Error boundary behavior and error message display
- Environment configuration loading

### Property Testing Focus Areas

- Input validation across all possible user inputs
- API response consistency across different prompts
- Data persistence integrity for all prompt-response combinations
- Security boundary enforcement across all operations
- Error handling resilience across various failure scenarios

### Integration Testing

- End-to-end flow from user input to AI response display
- Database connection and data persistence workflows
- OpenRouter API integration with both supported models
- Error propagation from backend to frontend display
