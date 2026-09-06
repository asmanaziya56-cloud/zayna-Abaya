import dns from 'dns';
import mongoose from 'mongoose';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

const ATLAS_URI = 'mongodb+srv://asmanaziya041_db_user:qK9X1R4QMo17c5q9@zaynababya.wcakmac.mongodb.net/zayna_abaya?authSource=admin&retryWrites=true&w=majority';

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
      const conn = await mongoose.connect(ATLAS_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 1,
        socketTimeoutMS: 30000
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      cached.conn = conn;
      return conn;
    } catch (error) {
      cached.conn = null;
      cached.promise = null;
      try { await mongoose.disconnect(); } catch {}
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
