# Chat Backend API

A backend application for a real-time-style 1:1 chat system built using **Node.js, TypeScript, MySQL, Sequelize, and Firebase Firestore**.

This project was developed as a backend engineering assignment to demonstrate REST API development, relational database design, NoSQL data modeling, request validation, and message management.

## Features

- Create and manage users.
- Create 1:1 conversations between two users.
- Prevent duplicate conversations between the same users.
- Send messages using Firebase Firestore.
- Retrieve messages with pagination.
- Maintain message ordering.
- Mark individual messages as read.
- Track the last-seen message of each user in a conversation.
- Retrieve all conversations belonging to a user.
- Validate requests using Zod.
- Centralized error handling.
- Strict TypeScript configuration.

## Technology Stack

| Technology         | Purpose                          |
| ------------------ | -------------------------------- |
| Node.js            | Backend runtime                  |
| TypeScript         | Type safety                      |
| Express.js         | REST API framework               |
| MySQL              | Relational database              |
| Sequelize          | ORM                              |
| Firebase Firestore | Message and read-receipt storage |
| Firebase Admin SDK | Firestore server-side access     |
| Zod                | Request validation               |
| dotenv             | Environment configuration        |

## Architecture

The application uses a modular, feature-based architecture.

```text
src/
├── config/
│   ├── database.ts
│   ├── firebase.ts
│   └── env.ts
│
├── database/
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── chat.model.ts
│   │   └── chat-member.model.ts
│   └── associations.ts
│
├── modules/
│   ├── users/
│   │   ├── schemas/
│   │   ├── user.routes.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── user.validation.ts
│   │
│   └── chats/
│       ├── schemas/
│       ├── chat.routes.ts
│       ├── chat.controller.ts
│       ├── chat.service.ts
│       ├── chat.repository.ts
│       ├── message.repository.ts
│       ├── receipt.repository.ts
│       ├── lastseen.repository.ts
│       └── chat.validation.ts
│
├── shared/
│   ├── errors/
│   │   └── app-error.ts
│   ├── middlewares/
│   │   ├── validate.middleware.ts
│   │   └── error.middleware.ts
│   └── types/
│       └── express.d.ts
│
├── app.ts
└── server.ts
```

### Layer responsibilities

- **Routes:** Define API endpoints and middleware.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Implement business logic.
- **Repositories:** Handle database operations.
- **Schemas:** Define request validation rules.
- **Models:** Define relational database entities.
- **Middlewares:** Handle validation and centralized errors.
- **Config:** Manage MySQL and Firebase connections.

## Database Design

### MySQL

MySQL stores users, conversations, and conversation memberships.

#### 1. Users

Stores registered users.

| Column    | Description           |
| --------- | --------------------- |
| id        | Primary key           |
| name      | User name             |
| email     | Unique email address  |
| createdAt | Creation timestamp    |
| updatedAt | Last update timestamp |

#### 2. Chats

Stores conversation information.

| Column         | Description                         |
| -------------- | ----------------------------------- |
| id             | Primary key                         |
| type           | Conversation type, such as private  |
| participantKey | Unique key for the two participants |
| createdAt      | Creation timestamp                  |
| updatedAt      | Last update timestamp               |

`participantKey` is generated using sorted user IDs to prevent duplicate 1:1 conversations.

For example:

```text
User IDs: 10 and 20
participantKey: 10:20
```

The same key is generated regardless of which user initiates the conversation.

#### 3. Chat Members

Maintains the many-to-many relationship between users and chats.

| Column | Description                   |
| ------ | ----------------------------- |
| id     | Primary key                   |
| chatId | Foreign key referencing chats |
| userId | Foreign key referencing users |

A unique constraint on `(chatId, userId)` prevents duplicate memberships.

### Database relationships

```text
Users
  |
  | 1
  |
  | *
ChatMembers
  |
  | *
  |
  | 1
Chats
```

A user can participate in multiple chats, and each chat can have multiple members. The current assignment uses two members per private conversation.

## Firebase Firestore Design

Firestore stores messages, read receipts, and last-seen information.

### 1. Messages

Collection structure:

```text
chats/
  {chatId}/
    messages/
      {messageId}/
```

Example document:

```json
{
  "senderId": 10,
  "text": "Hello, how are you?",
  "createdAt": "Firestore Timestamp",
  "updatedAt": null,
  "deletedAt": null
}
```

Messages use Firestore-generated document IDs.

### 2. Read Receipts

Collection structure:

```text
chats/
  {chatId}/
    readReceipts/
      {messageId}_{userId}/
```

Example document:

```json
{
  "messageId": "message_document_id",
  "userId": 20,
  "readAt": "Firestore Timestamp"
}
```

A deterministic document ID makes marking the same message as read idempotent.

### 3. Last Seen

Collection structure:

```text
chats/
  {chatId}/
    lastSeen/
      {userId}/
```

Example document:

```json
{
  "userId": 20,
  "lastSeenMessageId": "message_document_id",
  "lastSeenAt": "Firestore Timestamp"
}
```

Each user has one last-seen position per conversation.

### Why use both MySQL and Firestore?

| MySQL                  | Firestore                   |
| ---------------------- | --------------------------- |
| User management        | Message storage             |
| Chat management        | Read receipts               |
| Chat memberships       | Last-seen tracking          |
| Relational constraints | Document-based message data |

This separation keeps relational entities in MySQL and message-related documents in Firestore.

## API Documentation

Base URL:

```text
http://localhost:5000
```

### 1. Create User

**POST** `/user/create`

Creates a user. This is a supporting endpoint for creating test users.

Request:

```json
{
  "name": "Rahul",
  "email": "rahul@example.com"
}
```

Success response: `201 Created`

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "Rahul",
    "email": "rahul@example.com"
  }
}
```

### 2. Create 1:1 Chat

**POST** `/chat/create`

Creates a conversation between two users. If a conversation already exists between them, the existing chat is returned.

Request:

```json
{
  "userAId": 1,
  "userBId": 2
}
```

### 3. Send Message

**POST** `/chat/:chatId/message/send`

Sends a message to a conversation.

Request:

```text
POST /chat/1/message/send
```

Body:

```json
{
  "senderId": 1,
  "text": "Hello!"
}
```

The sender must be a member of the conversation.

### 4. Get Chat Messages

**GET** `/chat/:chatId/messages`

Retrieves messages with pagination.

Example:

```text
GET /chat/1/messages?userId=1&limit=50
```

Query parameters:

| Parameter     | Required | Description                                 |
| ------------- | -------- | ------------------------------------------- |
| userId        | Yes      | Requesting user ID                          |
| limit         | No       | Number of messages, default 50, maximum 100 |
| lastMessageId | No       | Cursor for fetching the next page           |

Messages are returned in chronological order.

The API uses cursor-based pagination rather than offset-based pagination.

A typical response contains:

```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [],
    "hasMore": true,
    "nextCursor": "message_document_id"
  }
}
```

### 5. Mark Message as Read

**POST** `/chat/:chatId/message/:messageId/read`

Marks an individual message as read.

Example:

```text
POST /chat/1/message/message_document_id/read
```

Body:

```json
{
  "userId": 2
}
```

The user must belong to the chat and cannot mark their own message as read.

### 6. Update Last Seen

**POST** `/chat/:chatId/lastseen`

Updates the last-seen message position for a user.

Body:

```json
{
  "userId": 2,
  "messageId": "message_document_id"
}
```

The user must be a member of the conversation. The last-seen position should not move backwards.

### 7. Get User Chats

**GET** `/user/:userId/chats`

Retrieves conversations belonging to a user.

Example:

```text
GET /user/1/chats
```

## Installation and Setup

### Prerequisites

Install the following:

- Node.js (LTS version recommended)
- npm
- MySQL Server
- Firebase project with Cloud Firestore enabled
- Postman or another API testing tool

### Step 1: Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd <YOUR_PROJECT_FOLDER>
```

### Step 2: Install dependencies

```bash
npm install
```

### Step 3: Configure MySQL

Create a database:

```sql
CREATE DATABASE chat_backend;
```

Make sure your MySQL server is running and that the configured database user has access to this database.

### Step 4: Configure Firebase

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a Firebase project.
3. Enable Cloud Firestore.
4. Open Project Settings.
5. Go to Service Accounts.
6. Generate a private key for Firebase Admin SDK.
7. Save the downloaded JSON credentials securely.

**Important:** Never commit Firebase service-account credentials to GitHub.

### Step 5: Configure environment variables

Create a `.env` file in the project root.

```env
PORT=5000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=chat_backend
DB_USER=root
DB_PASSWORD=your_mysql_password

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
GOOGLE_APPLICATION_CREDENTIALS=./credentials/firebase-service-account.json
```

Update the values according to your local environment.

If your Firebase initialization uses different environment variable names, adjust this example to match your implementation.

### Step 6: Configure TypeScript

The project uses strict TypeScript settings.

The relevant configuration includes:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "rootDir": "src",
    "outDir": "dist",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noImplicitReturns": true
  }
}
```

### Step 7: Run the application

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

Ensure the scripts in `package.json` match these commands.

### Step 8: Verify the server

If a health endpoint is configured:

```text
GET http://localhost:5000/health
```

Example response:

```json
{
  "success": true,
  "message": "Server is running"
}
```

## Testing Workflow

Follow this sequence when testing the APIs in Postman.

1. Create User A.
2. Create User B.
3. Create a chat between User A and User B.
4. Send a message from User A.
5. Send another message from User B.
6. Retrieve chat messages.
7. Test pagination using `nextCursor`.
8. Mark User A's message as read by User B.
9. Update User B's last-seen position.
10. Retrieve User A's chat list.
11. Try sending a message from a non-member and verify that access is rejected.
12. Try creating the same 1:1 chat again and verify that duplicate chats are not created.

## Error Handling

The application uses centralized error handling.

| HTTP Status | Description                                      |
| ----------- | ------------------------------------------------ |
| 400         | Invalid request or validation error              |
| 403         | User does not have permission to access the chat |
| 404         | Requested user, chat, or message not found       |
| 409         | Duplicate or conflicting resource                |
| 500         | Unexpected server error                          |

Zod validates incoming requests, while `AppError` handles application-specific errors.

## Important Design Decisions

### 1. Why cursor-based pagination?

Offset-based pagination becomes less suitable for frequently changing message collections.

Cursor-based pagination uses the last message document from the previous page as the starting position for the next query.

Messages are ordered using:

- `createdAt` descending
- Firestore document ID descending as a deterministic tie-breaker

The selected page is reversed before returning it, so clients receive chronological order.

### 2. Why deterministic read-receipt IDs?

A receipt ID generated from `messageId` and `userId` prevents duplicate receipt documents for the same user and message.

### 3. Why check chat membership?

Every chat operation must verify that the requesting user belongs to the conversation.

This prevents users from reading or writing messages in conversations they do not participate in.

### 4. Why separate last seen and read receipts?

They represent different concepts:

- **Read receipt:** Whether a particular message has been read by a user.
- **Last seen:** The latest message position a user has viewed in a conversation.

### 5. Cross-database consistency

MySQL and Firestore do not share a transaction.

The application checks MySQL membership before performing Firestore operations. This assignment uses that straightforward approach rather than introducing distributed transaction infrastructure.

## Security Notes

- Keep `.env` out of version control.
- Never commit Firebase service-account JSON files.
- Validate all incoming API requests.
- Verify chat membership before accessing chat data.
- Do not expose raw database or Firebase errors to API clients.
- The assignment endpoints accept user IDs in request bodies or query parameters. In a production application, authenticated user identity should come from a verified JWT rather than trusting client-supplied IDs.

## Scope and Limitations

This implementation focuses on the required interview assignment.

Not included:

- Group conversations
- Socket.IO or WebSocket-based real-time delivery
- Redis caching
- RabbitMQ or Kafka
- Message editing and deletion
- Authentication and authorization using a full login system

These features are intentionally excluded to keep the solution focused on the specified requirements.

## Future Improvements

Possible production enhancements include:

- JWT authentication and authorization.
- Real-time messaging using WebSockets.
- Message delivery status.
- Unread message counts.
- Automated unit and integration tests.
- Database migrations.
- Rate limiting and request logging.

## Author

Developed as a backend engineering assignment using Node.js, TypeScript, MySQL, Sequelize, and Firebase Firestore.
