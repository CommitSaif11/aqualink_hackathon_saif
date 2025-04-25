import express from 'express';
import dotenv from 'dotenv';
import routes from './routes'; // Import the routes
import { testConnection } from './db'; // Import the testConnection function

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Root Route (Default endpoint)
app.get('/', (req, res) => {
  // res.send('Welcome to the Aqualink API!');
  console.log('server is running');
   // Replace with your preferred message
});

// Use the routes under `/api`
app.use('/api', routes);

// Start the server
const server = app.listen(PORT, () => {  // Remove the '127.0.0.1' parameter
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Add error handling for the server
server.on('error', (err) => {
  console.error('Error starting the server:', err);
});

// Test the database connection after the server starts
(async () => {
  try {
    await testConnection(); // Test the database connection
  } catch (err) {
    console.error('Error testing database connection:', err);
  }
})();