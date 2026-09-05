import app from '../backend/src/app.js';
import { connectDB } from '../backend/src/config/db.js';

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
  } catch (err) {
    // Log serverless connection errors gracefully without breaking execution
    console.error('Serverless connection error:', err);
  }
  return app(req, res);
}
