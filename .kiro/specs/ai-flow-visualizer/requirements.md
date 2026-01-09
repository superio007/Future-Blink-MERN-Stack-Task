# Requirements Document

## Introduction

A MERN stack application that allows users to input prompts, execute AI flows through a visual interface using React Flow, and save prompt-response pairs to MongoDB. The system provides a clean separation between frontend visualization and backend AI processing while maintaining security best practices.

## Glossary

- **AI_Flow_System**: The complete MERN application
- **Input_Node**: React Flow node containing user prompt textarea
- **Result_Node**: React Flow node displaying AI response
- **Flow_Canvas**: React Flow visualization area
- **OpenRouter_API**: External AI service provider
- **Prompt_Response_Pair**: Combined user input and AI output data

## Requirements

### Requirement 1: Visual Flow Interface

**User Story:** As a user, I want to interact with AI through a visual flow interface, so that I can see the relationship between my input and the AI response.

#### Acceptance Criteria

1. WHEN the application loads, THE AI_Flow_System SHALL display a Flow_Canvas with one Input_Node and one Result_Node
2. WHEN the Flow_Canvas is rendered, THE AI_Flow_System SHALL show an edge connecting Input_Node to Result_Node
3. THE Input_Node SHALL contain a textarea for user prompt input
4. THE Result_Node SHALL initially display placeholder text or remain empty
5. THE Flow_Canvas SHALL be implemented using React Flow library

### Requirement 2: AI Processing Workflow

**User Story:** As a user, I want to execute AI flows by clicking a button, so that I can get AI responses to my prompts.

#### Acceptance Criteria

1. WHEN a user types text in the Input_Node textarea, THE AI_Flow_System SHALL capture the prompt input
2. WHEN a user clicks the Run Flow button, THE AI_Flow_System SHALL send the prompt to the backend via POST request
3. WHEN the backend processes the request, THE AI_Flow_System SHALL call the OpenRouter API using a free model
4. WHEN the AI response is received, THE Result_Node SHALL update to display the AI output
5. THE AI_Flow_System SHALL use either google/gemini-2.0-flash-lite-preview-02-05:free OR mistralai/mistral-7b-instruct:free model

### Requirement 3: Data Persistence

**User Story:** As a user, I want to save my prompt-response pairs, so that I can keep a record of my AI interactions.

#### Acceptance Criteria

1. WHEN a user clicks the Save button, THE AI_Flow_System SHALL send the current prompt and response to the backend
2. WHEN the backend receives save request, THE AI_Flow_System SHALL store the data in MongoDB
3. THE AI_Flow_System SHALL save prompt, response, and createdAt timestamp
4. WHEN saving data, THE AI_Flow_System SHALL use Mongoose for database operations
5. THE AI_Flow_System SHALL handle database connection errors gracefully

### Requirement 4: Backend API Security

**User Story:** As a system administrator, I want secure API handling, so that sensitive credentials are not exposed to the frontend.

#### Acceptance Criteria

1. THE AI_Flow_System SHALL NOT expose the OpenRouter API key to the frontend
2. WHEN making AI requests, THE AI_Flow_System SHALL handle all OpenRouter API calls on the backend
3. THE AI_Flow_System SHALL implement a POST /api/ask-ai endpoint that accepts { prompt: string }
4. WHEN processing AI requests, THE AI_Flow_System SHALL return { response: string } to the frontend
5. THE AI_Flow_System SHALL implement a POST /api/save endpoint for data persistence

### Requirement 5: Application Architecture

**User Story:** As a developer, I want clean separation of concerns, so that the application is maintainable and follows best practices.

#### Acceptance Criteria

1. THE AI_Flow_System SHALL implement frontend using React with React Flow
2. THE AI_Flow_System SHALL implement backend using Node.js with Express.js
3. THE AI_Flow_System SHALL use MongoDB with Mongoose for data storage
4. THE AI_Flow_System SHALL maintain clear separation between frontend and backend
5. THE AI_Flow_System SHALL use Tailwind CSS for styling

### Requirement 6: Configuration and Documentation

**User Story:** As a developer, I want proper configuration and documentation, so that I can set up and run the application locally.

#### Acceptance Criteria

1. THE AI_Flow_System SHALL provide example .env structure for environment variables
2. THE AI_Flow_System SHALL include README with complete setup instructions
3. THE AI_Flow_System SHALL handle environment configuration for API keys and database connections
4. WHEN setting up locally, THE AI_Flow_System SHALL provide clear instructions for MongoDB setup
5. THE AI_Flow_System SHALL include instructions for obtaining and configuring OpenRouter API key
