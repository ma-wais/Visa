import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;

let client;
let db;

export async function connectToDatabase() {
  if (db) {
    return { db, client };
  }

  client = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
  });

  db = client.connection.db; // Get the db from mongoose connection
  console.log('MongoDB connected successfully');
  return { db, client };
}
