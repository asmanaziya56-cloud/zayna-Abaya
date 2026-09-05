import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore container permissions
}
process.env.VERCEL = '1';

let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const { connectDB } = await import('../backend/src/config/db.js');
      await connectDB();
      const appModule: any = await import('../backend/src/app.js');
      return appModule.default || appModule;
    })();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return (app as any)(req, res);
  } catch (err: any) {
    console.error('Serverless connection error:', err);
    return res.status(500).json({ error: 'Serverless execution failed', details: err?.message || String(err) });
  }
}
