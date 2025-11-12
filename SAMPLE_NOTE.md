# Building a RESTful API with Node.js and Express

In this tutorial, we'll create a simple RESTful API for managing a todo list. This guide covers the essential components of building a production-ready API.

## Setting Up the Project

First, let's initialize our project and install the necessary dependencies:

```bash
npm init -y
npm install express dotenv cors
npm install --save-dev nodemon typescript @types/express @types/node
```

## Creating the Express Server

Here's our main server file that sets up Express with middleware:

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Todo API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

The code above creates a basic Express server with CORS enabled and JSON parsing middleware. Now let's add our todo routes.

## Defining the Data Model

We'll use a simple in-memory data structure for this example. In production, you'd use a database like MongoDB or PostgreSQL:

```javascript
let todos = [
  { id: 1, title: 'Learn Node.js', completed: false },
  { id: 2, title: 'Build an API', completed: false },
  { id: 3, title: 'Deploy to production', completed: false }
];

let nextId = 4;
```

## Implementing CRUD Operations

### Get All Todos

```javascript
app.get('/api/todos', (req, res) => {
  res.json({
    success: true,
    data: todos
  });
});
```

### Get Single Todo

```javascript
app.get('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  
  if (!todo) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  
  res.json({
    success: true,
    data: todo
  });
});
```

### Create New Todo

```javascript
app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }
  
  const newTodo = {
    id: nextId++,
    title,
    completed: false
  };
  
  todos.push(newTodo);
  
  res.status(201).json({
    success: true,
    data: newTodo
  });
});
```

### Update Todo

```javascript
app.put('/api/todos/:id', (req, res) => {
  const todo = todos.find(t => t.id === parseInt(req.params.id));
  
  if (!todo) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  
  const { title, completed } = req.body;
  
  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;
  
  res.json({
    success: true,
    data: todo
  });
});
```

### Delete Todo

```javascript
app.delete('/api/todos/:id', (req, res) => {
  const index = todos.findIndex(t => t.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Todo not found'
    });
  }
  
  todos.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Todo deleted'
  });
});
```

## Testing the API

You can test the API using curl commands:

```bash
# Get all todos
curl http://localhost:3000/api/todos

# Create a new todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"New Task"}'

# Update a todo
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a todo
curl -X DELETE http://localhost:3000/api/todos/1
```

## Adding Error Handling Middleware

It's important to handle errors gracefully. Add this middleware at the end of your routes:

```javascript
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

## Environment Configuration

Create a `.env` file for your configuration:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/todoapp
JWT_SECRET=your-secret-key-here
```

## TypeScript Version

For those who prefer TypeScript, here's the same server with type safety:

```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let todos: Todo[] = [
  { id: 1, title: 'Learn TypeScript', completed: false },
  { id: 2, title: 'Build type-safe API', completed: false }
];

let nextId = 3;

app.get('/api/todos', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: todos
  });
});

app.post('/api/todos', (req: Request, res: Response) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({
      success: false,
      message: 'Title is required'
    });
  }
  
  const newTodo: Todo = {
    id: nextId++,
    title,
    completed: false
  };
  
  todos.push(newTodo);
  
  res.status(201).json({
    success: true,
    data: newTodo
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Docker Deployment

Finally, here's a Dockerfile to containerize your application:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

And a `docker-compose.yml` for local development:

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

## Conclusion

You now have a complete RESTful API with:

✅ Full CRUD operations  
✅ Error handling  
✅ Environment configuration  
✅ TypeScript support  
✅ Docker deployment  

This API serves as a solid foundation for building more complex applications. Next steps could include:

- Adding authentication with JWT
- Connecting to a real database
- Implementing rate limiting
- Adding input validation with Joi or Zod
- Writing unit and integration tests

Happy coding! 🚀
