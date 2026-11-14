import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Copy server/.env.example to server/.env.');
  }

  await mongoose.connect(uri);
  console.info('Connected to MongoDB.');
}
