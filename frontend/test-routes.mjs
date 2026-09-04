async function testRoutes() {
  const routes = [
    '/',
    '/shop',
    '/cart',
    '/checkout',
    '/track',
    '/account',
    '/account/wishlist',
    '/auth/login',
    '/auth/register',
    '/admin'
  ];

  console.log('🧪 Verifying Next.js routes on http://localhost:3000...\n');
  let allPass = true;

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    try {
      const res = await fetch(url);
      console.log(`[${res.status === 200 ? 'PASS' : 'FAIL'}] ${res.status} - ${route}`);
      if (res.status !== 200) allPass = false;
    } catch (err) {
      console.log(`[FAIL] Error connecting to ${route}: ${err.message}`);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n🎉 ALL STOREFRONT ROUTES PASSED (200 OK)!');
    process.exit(0);
  } else {
    console.log('\n❌ Some routes did not return 200 OK.');
    process.exit(1);
  }
}

testRoutes();
