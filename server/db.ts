import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Create a new pool instance
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Reads the DATABASE_URL from the .env file
});

// Function to test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Connected to the database successfully!');
    client.release(); // Release the connection back to the pool
  } catch (err) {
    if (err instanceof Error) {
      console.error('Failed to connect to the database:', err.message);
    } else {
      console.error('Failed to connect to the database:', err);
    }
  }
}

export default pool; // Export the pool for use in other parts of your app