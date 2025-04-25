import express from 'express';
import dotenv from 'dotenv';
import routes from './routes'; // Import the routes
import { testConnection } from './db'; // Import the testConnection function

// Load environment variables from the .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000; // Use PORT from .env or default to 5000

// Log the PORT value for debugging
console.log(`PORT is: ${PORT}`);

// Middleware to parse JSON request bodies
app.use(express.json());

// Use the routes under `/api`
app.use('/api', routes);

// Start the server
const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

// Add error handling for the server
server.on('error', (err) => {
  console.error('Error starting the server:', err);
});

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('PORT:', process.env.PORT);

// Test the database connection after the server starts
(async () => {
  try {
    await testConnection(); // Test the database connection
  } catch (err) {
    console.error('Error testing database connection:', err);
  }
})();