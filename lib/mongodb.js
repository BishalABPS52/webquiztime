import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quiztime';

// Check if we have a cached connection
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using mongoose
 * This function creates a cached connection to improve performance
 */
async function connectToDatabase() {
  // If we have an existing connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no connection promise yet, create one
  if (!cached.promise) {
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('Connected to MongoDB');
        return mongoose;
      })
      .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      });
  }

  // Wait for the connection to be established
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;