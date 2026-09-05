import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  if (cached.promise) {
    return cached.promise;
  }

  // Pre-emptively configure DNS for serverless environment to prevent 5s SRV lookup timeouts
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore container permissions
  }

  cached.promise = (async () => {
    try {
      mongoose.set('strictQuery', true);
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 2500,
        maxPoolSize: 10,
        minPoolSize: 1,
        socketTimeoutMS: 30000
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      cached.conn = conn;
      return conn;
    } catch (error) {
      cached.promise = null;
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  })();

  return cached.promise;
}

export async function disconnectDB(): Promise<void> {
  cached.conn = null;
  cached.promise = null;
  await mongoose.disconnect();
}
