import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

// Import the routes
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// TODO: Serve static files of entire client dist folder (COMPLETED)
app.use(express.static('../client/dist'));

// TODO: Implement middleware for parsing JSON and urlencoded form data (COMPLETED)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO: Implement middleware to connect the routes (COMPLETED)
app.use(routes);

// Start the server on the port
app.listen(PORT, () => console.log(`Listening on PORT: ${PORT}`));