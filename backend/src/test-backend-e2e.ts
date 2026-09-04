import http from 'http';
import app from './app.js';
import { safeCompare } from './utils/tokenCompare.js';
import { encrypt, decrypt } from './utils/encryption.js';
import { signAccessToken, verifyAccessToken } from './utils/jwt.js';

async function runTests() {
  console.log('🧪 Starting Backend Automated Verification Suite...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Test Encryption utility
  try {
    const secretMessage = 'sensitive_third_party_secret_12345';
    const encrypted = encrypt(secretMessage);
    const decrypted = decrypt(encrypted);
    assert(decrypted === secretMessage, 'AES-256-GCM Encryption / Decryption roundtrip');
  } catch (err: any) {
    assert(false, `Encryption error: ${err.message}`);
  }

  // 2. Test Timing-Safe comparison
  try {
    const tokenA = 'f9a2bc34d8e7';
    const tokenB = 'f9a2bc34d8e7';
    const tokenC = 'f9a2bc34d8e8';
    assert(safeCompare(tokenA, tokenB) === true, 'Timing-safe comparison on identical strings');
    assert(safeCompare(tokenA, tokenC) === false, 'Timing-safe comparison on non-identical strings');
    assert(safeCompare(tokenA, 'short') === false, 'Timing-safe comparison on different lengths');
  } catch (err: any) {
    assert(false, `Timing-safe error: ${err.message}`);
  }

  // 3. Test JWT signing and verification with explicit HS256 algorithm
  try {
    const payload = { _id: '64a1b2c3d4e5f6a7b8c9d0e1', email: 'test@example.com', role: 'customer' as const };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);
    assert(decoded.email === payload.email, 'JWT HS256 Signing and Verification');
    assert(decoded.role === 'customer', 'JWT payload preservation');
  } catch (err: any) {
    assert(false, `JWT error: ${err.message}`);
  }

  // 4. Start HTTP server on test port and test Express app directly
  const testPort = 5055;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(testPort, () => {
      console.log(`  📡 Test server listening on http://localhost:${testPort}`);
      resolve();
    });
  });

  try {
    // 4.1 Test Health Endpoint
    const healthRes = await fetch(`http://localhost:${testPort}/health`);
    const healthJson = await healthRes.json() as any;
    assert(healthRes.status === 200, 'GET /health returns 200 OK');
    assert(healthJson.status === 'ok', 'GET /health payload has status: "ok"');
    assert(healthRes.headers.get('x-content-type-options') === 'nosniff', 'Helmet security header nosniff present');

    // 4.2 Test 404 Route handling & envelope
    const notFoundRes = await fetch(`http://localhost:${testPort}/api/v1/nonexistent`);
    const notFoundJson = await notFoundRes.json() as any;
    assert(notFoundRes.status === 404, '404 status on unknown route');
    assert(notFoundJson.success === false, 'Standard error envelope success: false on 404');
    assert(notFoundJson.error.code === 'NOT_FOUND', 'Standard error code NOT_FOUND on 404');

    // 4.3 Test Auth Validation Error Handling
    const invalidRegisterRes = await fetch(`http://localhost:${testPort}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'weak' })
    });
    const invalidRegisterJson = await invalidRegisterRes.json() as any;
    assert(invalidRegisterRes.status === 400, 'POST /auth/register with bad body returns 400');
    assert(invalidRegisterJson.success === false, 'Standard envelope success: false on validation error');
    assert(invalidRegisterJson.error.code === 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');
    assert(invalidRegisterJson.error.fields !== undefined, 'Field-specific validation error details returned');

    // 4.4 Test Protected Route without token
    const protectedRes = await fetch(`http://localhost:${testPort}/api/v1/users/me`);
    const protectedJson = await protectedRes.json() as any;
    assert(protectedRes.status === 401, 'GET /users/me without Bearer token returns 401');
    assert(protectedJson.error.code === 'UNAUTHORIZED', 'Error code UNAUTHORIZED on missing token');

    // 4.5 Test Protected Route with valid token
    const validToken = signAccessToken({
      _id: '000000000000000000000001',
      email: 'verified@zayna.com',
      role: 'customer'
    });
    const authHeadersRes = await fetch(`http://localhost:${testPort}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${validToken}` }
    });
    // Since DB is not connected in this standalone test, it should either return 404 (user not found in DB) or DB error, but NEVER 401!
    assert(authHeadersRes.status !== 401, 'Valid Bearer token passes requireAuth middleware (status is not 401)');

    // 4.6 Test Cart with Guest Session ID
    const cartRes = await fetch(`http://localhost:${testPort}/api/v1/cart`, {
      headers: { 'x-session-id': 'guest-test-session' }
    });
    // Passes through optionalAuth and reaches controller
    assert(cartRes.status !== 401, 'Guest cart request with x-session-id allowed through optionalAuth');

  } finally {
    server.close();
  }

  console.log('\n=======================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('=======================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
