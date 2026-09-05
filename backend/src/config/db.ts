import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  try {
    // Ensure DNS SRV lookups succeed even if local ISP DNS fails on SRV records
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch {
      // Ignore if not permitted
    }

    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(env.MONGODB_URI);
    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
