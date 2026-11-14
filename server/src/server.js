import './config/env.js';
import app from './app.js';
import { connectToDatabase } from './config/database.js';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.info(`API server listening on http://localhost:${port}`);
});

connectToDatabase().catch((error) => {
  console.error(`MongoDB connection failed: ${error.message}`);
});
