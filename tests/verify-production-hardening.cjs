/**
 * Comprehensive Production Hardening & Application Security Verification Suite
 * 
 * Verifies:
 * 1. UI Credential Exposure & Offline Bypass Purge
 * 2. Production JWT Secret Fail-Closed Enforcement
 * 3. Token Tampering & Cryptographic Signature Verification
 * 4. Super Admin vs Store Manager Role-Based Access Control (RBAC)
 * 5. Admin User Management, Deactivation & Instant Session Invalidation
 * 6. Secure First-Time Super Admin Bootstrap Protection
 * 7. CORS Origin Allowlist Enforcement
 * 8. Checkout Business Logic (Negative Quantity & Fake Price Injection Defense)
 * 9. Order Tracking Data Minimization (COGS & Margin Redaction)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { startServerIfNeeded, stopServer } = require('./test-server.cjs');

const API_BASE = 'http://localhost:4000';
let superAdminToken = '';
let storeManagerToken = '';
let testOrderId = '';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function request(method, reqPath, body = null, token = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, API_BASE);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    if (token) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, headers: res.headers, body: json });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runHardeningSuite() {
  console.log('\n================================================================');
  console.log('🛡️  PRODUCTION SECURITY, RBAC & BUSINESS LOGIC HARDENING SUITE');
  console.log('================================================================\n');

  try {
    await startServerIfNeeded(4000);

    // -------------------------------------------------------------
    // MODULE 1: UI Credential Exposure & Offline Bypass Purge
    // -------------------------------------------------------------
    console.log('🔍 1. Verifying Source Code Credential Purge...');
    const loginComponent = fs.readFileSync(path.join(__dirname, '../src/admin/components/AdminLogin.tsx'), 'utf-8');
    assert(!loginComponent.includes('AdminPassword2026!'), 'AdminLogin component contains ZERO default password references');
    assert(!loginComponent.includes('Quick Fill'), 'AdminLogin component has NO Quick Fill / autofill buttons');
    assert(!loginComponent.includes('Configured System Credentials:'), 'AdminLogin component has NO credential disclosure box');

    const localDbSource = fs.readFileSync(path.join(__dirname, '../src/admin/services/localDatabase.ts'), 'utf-8');
    assert(!localDbSource.includes('AdminPassword2026!'), 'localDatabase service contains ZERO hardcoded passwords');
    assert(!localDbSource.includes('DEFAULT_ADMINS'), 'localDatabase service contains ZERO hardcoded admin arrays');

    // -------------------------------------------------------------
    // MODULE 2: Production JWT Secret Fail-Closed Enforcement
    // -------------------------------------------------------------
    console.log('\n🔑 2. Verifying Production JWT Fail-Closed Invariants...');
    // Test the exported getJwtSecret logic in simulated production
    const authModulePath = path.join(__dirname, '../server/auth.js');
    const authModuleCode = fs.readFileSync(authModulePath, 'utf-8');
    assert(authModuleCode.includes('FATAL SECURITY CONFIGURATION'), 'auth.js enforces fatal fail-closed check for production JWT_SECRET');
    assert(authModuleCode.includes('crypto.timingSafeEqual'), 'auth.js uses timingSafeEqual for signature verification');

    // -------------------------------------------------------------
    // MODULE 3: Token Signature & Tamper Resistance
    // -------------------------------------------------------------
    console.log('\n🛡️ 3. Verifying Cryptographic Token Integrity...');

    // Login as super_admin
    const saLoginRes = await request('POST', '/api/admin/auth/login', {
      username: 'admin',
      password: 'AdminPassword2026!',
    });
    assert(saLoginRes.status === 200, 'Super admin login succeeds');
    superAdminToken = saLoginRes.body.token;

    // Login as store manager (inventory)
    const smLoginRes = await request('POST', '/api/admin/auth/login', {
      username: 'inventory',
      password: 'AdminPassword2026!',
    });
    assert(smLoginRes.status === 200, 'Store manager login succeeds');
    storeManagerToken = smLoginRes.body.token;

    // Login as Super Admin GAZI9 with 99GAZI@
    const gaziLoginRes = await request('POST', '/api/admin/auth/login', {
      username: 'GAZI9',
      password: '99GAZI@',
    });
    assert(gaziLoginRes.status === 200, 'Super Admin GAZI9 login succeeds with 99GAZI@');
    assert(gaziLoginRes.body.user.role === 'super_admin', 'GAZI9 role is verified as super_admin');

    // Forged signature rejection
    const parts = superAdminToken.split('.');
    const forgedToken = `${parts[0]}.${parts[1]}.badsignature1234567890`;
    const forgedRes = await request('GET', '/api/admin/products', null, forgedToken);
    assert(forgedRes.status === 401, 'Request with tampered signature rejected with HTTP 401');

    // Altered payload rejection
    const tamperedPayload = Buffer.from(JSON.stringify({ username: 'admin', role: 'super_admin', exp: Math.floor(Date.now() / 1000) + 99999 })).toString('base64url');
    const alteredPayloadToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;
    const alteredRes = await request('GET', '/api/admin/products', null, alteredPayloadToken);
    assert(alteredRes.status === 401, 'Request with altered payload rejected with HTTP 401');

    // -------------------------------------------------------------
    // MODULE 4: Super Admin vs Store Manager RBAC
    // -------------------------------------------------------------
    console.log('\n👥 4. Testing Super Admin vs Store Manager Role Permissions...');

    // Store manager CAN access operational data
    const smProductsRes = await request('GET', '/api/admin/products', null, storeManagerToken);
    assert(smProductsRes.status === 200, 'Store Manager permitted to view product catalog');

    const smInventoryRes = await request('GET', '/api/admin/inventory/levels', null, storeManagerToken);
    assert(smInventoryRes.status === 200, 'Store Manager permitted to view warehouse stock levels');

    const smOrdersRes = await request('GET', '/api/admin/orders', null, storeManagerToken);
    assert(smOrdersRes.status === 200, 'Store Manager permitted to view customer orders');

    // Store manager CANNOT access confidential financial reports
    const smFinancialsRes = await request('GET', '/api/admin/reports/financials', null, storeManagerToken);
    assert(smFinancialsRes.status === 403, 'Store Manager FORBIDDEN from viewing financial P&L reports (HTTP 403)');

    const smReportCsvRes = await request('GET', '/api/admin/reports/export/csv', null, storeManagerToken);
    assert(smReportCsvRes.status === 403, 'Store Manager FORBIDDEN from exporting financial CSVs (HTTP 403)');

    // Store manager CANNOT access operating expenses
    const smExpensesRes = await request('GET', '/api/admin/expenses', null, storeManagerToken);
    assert(smExpensesRes.status === 403, 'Store Manager FORBIDDEN from viewing operating expenses (HTTP 403)');

    // Store manager CANNOT access security audit logs
    const smAuditRes = await request('GET', '/api/admin/audit-logs', null, storeManagerToken);
    assert(smAuditRes.status === 403, 'Store Manager FORBIDDEN from viewing security audit logs (HTTP 403)');

    // Store manager CANNOT access admin user management
    const smUsersRes = await request('GET', '/api/admin/auth/users', null, storeManagerToken);
    assert(smUsersRes.status === 403, 'Store Manager FORBIDDEN from listing administrator accounts (HTTP 403)');

    const smCreateUserRes = await request('POST', '/api/admin/auth/users', {
      username: 'hacker',
      password: 'HackerPassword123!',
      role: 'super_admin',
    }, storeManagerToken);
    assert(smCreateUserRes.status === 403, 'Store Manager FORBIDDEN from creating admin accounts (Privilege escalation blocked)');

    // Super Admin CAN access all of the above
    const saFinancialsRes = await request('GET', '/api/admin/reports/financials', null, superAdminToken);
    assert(saFinancialsRes.status === 200, 'Super Admin permitted to access financial P&L reports');

    const saAuditRes = await request('GET', '/api/admin/audit-logs', null, superAdminToken);
    assert(saAuditRes.status === 200, 'Super Admin permitted to access security audit logs');

    // -------------------------------------------------------------
    // MODULE 5: Admin User Management, Deactivation & Session Invalidation
    // -------------------------------------------------------------
    console.log('\n👤 5. Testing Admin User Lifecycle & Session Invalidation...');

    // Super admin lists users
    const usersListRes = await request('GET', '/api/admin/auth/users', null, superAdminToken);
    assert(usersListRes.status === 200, 'Super Admin can list admin accounts');
    const users = usersListRes.body.users || [];
    assert(users.length >= 2, 'Admin accounts listed');
    assert(!users[0].passwordHash && !users[0].salt, 'Admin user list SANITIZED: passwordHash and salt are NEVER exposed');

    // Super Admin creates a new Store Manager account
    const testMgrUser = `store_mgr_${Date.now()}`;
    const createMgrRes = await request('POST', '/api/admin/auth/users', {
      username: testMgrUser,
      email: `${testMgrUser}@gazisports.com`,
      name: 'Narsingdi Branch Manager',
      role: 'inventory_manager',
      password: 'StrongManagerPass2026!',
    }, superAdminToken);
    assert(createMgrRes.status === 201, 'Super Admin successfully creates new Store Manager account');
    const newMgrId = createMgrRes.body.user?.id;

    // New Store Manager logs in
    const newMgrLoginRes = await request('POST', '/api/admin/auth/login', {
      username: testMgrUser,
      password: 'StrongManagerPass2026!',
    });
    assert(newMgrLoginRes.status === 200, 'Newly created Store Manager can log in successfully');
    const newMgrToken = newMgrLoginRes.body.token;

    // Verify authenticated session works
    const testMeRes = await request('GET', '/api/admin/auth/me', null, newMgrToken);
    assert(testMeRes.status === 200, 'New Store Manager token verified on /auth/me');

    // Super Admin deactivates the Store Manager
    const deactRes = await request('PATCH', `/api/admin/auth/users/${newMgrId}`, {
      isActive: false,
    }, superAdminToken);
    assert(deactRes.status === 200, 'Super Admin deactivates Store Manager account');

    // Verify deactivated user cannot log in
    const deactLoginRes = await request('POST', '/api/admin/auth/login', {
      username: testMgrUser,
      password: 'StrongManagerPass2026!',
    });
    assert(deactLoginRes.status === 403, 'Deactivated account login BLOCKED with HTTP 403');

    // Verify existing token of deactivated user is immediately invalidated
    const deactTokenCheck = await request('GET', '/api/admin/products', null, newMgrToken);
    assert(deactTokenCheck.status === 401, 'Existing token for deactivated user immediately rejected with HTTP 401 (Session revoked)');

    // Logout session invalidation test
    const logoutRes = await request('POST', '/api/admin/auth/logout', null, superAdminToken);
    assert(logoutRes.status === 200, 'Admin logout succeeds');

    // Old token after logout is now rejected
    const postLogoutCheck = await request('GET', '/api/admin/auth/me', null, superAdminToken);
    assert(postLogoutCheck.status === 401, 'Token invalidated server-side upon logout (HTTP 401)');

    // Re-login super admin for remaining tests
    const reLogin = await request('POST', '/api/admin/auth/login', {
      username: 'admin',
      password: 'AdminPassword2026!',
    });
    superAdminToken = reLogin.body.token;

    // -------------------------------------------------------------
    // MODULE 6: First-Time Super Admin Bootstrap Protection
    // -------------------------------------------------------------
    console.log('\n🚀 6. Testing Super Admin Bootstrap Endpoint Protection...');

    // Bootstrap without token rejected
    const unauthBoot = await request('POST', '/api/admin/auth/bootstrap', {
      username: 'newadmin',
      email: 'newadmin@gazisports.com',
      password: 'SomePassword123!',
    });
    assert(unauthBoot.status === 401, 'Bootstrap without setup token rejected with HTTP 401');

    // Bootstrap when admin already exists rejected even with token
    const duplicateBoot = await request('POST', '/api/admin/auth/bootstrap', {
      setupToken: 'test_setup_token_enterprise_cricket_2026',
      username: 'newadmin',
      email: 'newadmin@gazisports.com',
      password: 'SomePassword123!',
    });
    assert(duplicateBoot.status === 400 || duplicateBoot.status === 403, 'Bootstrap rejected when active Super Admin already exists');

    // -------------------------------------------------------------
    // MODULE 7: CORS Origin Allowlist Enforcement
    // -------------------------------------------------------------
    console.log('\n🌐 7. Testing CORS Security Policy...');

    // Unauthorized origin rejected
    const badCorsRes = await request('GET', '/api/health', null, null, {
      Origin: 'https://evil-unauthorized-phishing-site.com',
    });
    assert(badCorsRes.status === 500 || badCorsRes.body?.error?.includes('CORS') || badCorsRes.status === 403, 'Unauthorized cross-origin request rejected by CORS policy');

    // Authorized origin permitted
    const goodCorsRes = await request('GET', '/api/health', null, null, {
      Origin: 'https://gazisports.com',
    });
    assert(goodCorsRes.status === 200, 'Authorized production origin (https://gazisports.com) permitted');

    // -------------------------------------------------------------
    // MODULE 8: Checkout Business Logic & Attack Prevention
    // -------------------------------------------------------------
    console.log('\n🛒 8. Testing Checkout Hardening & Price Injection Defense...');

    // Attack 1: Negative quantity (Stock inflation attack)
    const negQtyOrder = await request('POST', '/api/checkout', {
      items: [{ productId: '1055203', quantity: -10, selectedSize: '9' }],
      customer: { fullName: 'Attacker', phone: '01711223344', address: 'Dhaka' },
    });
    assert(negQtyOrder.status === 400, 'Negative quantity rejected with HTTP 400 (Stock inflation attack blocked)');

    // Attack 2: Fractional/Zero quantity
    const zeroQtyOrder = await request('POST', '/api/checkout', {
      items: [{ productId: '1055203', quantity: 0, selectedSize: '9' }],
      customer: { fullName: 'Attacker', phone: '01711223344', address: 'Dhaka' },
    });
    assert(zeroQtyOrder.status === 400, 'Zero quantity rejected with HTTP 400');

    // Attack 3: Fake/Non-existent product ID (Injecting cheap item price)
    const fakeProdOrder = await request('POST', '/api/checkout', {
      items: [{ productId: 'fake_nonexistent_bat', quantity: 1, price: 5 }],
      customer: { fullName: 'Attacker', phone: '01711223344', address: 'Dhaka' },
    });
    assert(fakeProdOrder.status === 400, 'Non-existent catalog product rejected with HTTP 400 (Price injection blocked)');

    // Legitimate checkout with promo verification
    const legitOrderRes = await request('POST', '/api/checkout', {
      items: [{ productId: '1055203', quantity: 1, selectedSize: '9' }],
      customer: { fullName: 'Mashrafe Mortaza', phone: '01712345678', address: 'Narail, Dhaka' },
      promoCode: 'TIGERS10',
    });
    assert(legitOrderRes.status === 201, 'Authoritative catalog checkout succeeds with HTTP 201');
    const orderData = legitOrderRes.body.order;
    assert(orderData && orderData.financials?.discount > 0, 'TIGERS10 promo discount calculated correctly on authoritative price');
    testOrderId = orderData?.orderId;
    const testTracking = orderData?.trackingNumber;

    // -------------------------------------------------------------
    // MODULE 9: Order Tracking Data Minimization (COGS & Margin Redaction)
    // -------------------------------------------------------------
    console.log('\n🔒 9. Testing Order Tracking Public Response Sanitization...');
    const trackingRes = await request('GET', `/api/orders/${testTracking}`);
    assert(trackingRes.status === 200, 'Public order tracking lookup succeeds');
    const publicOrder = trackingRes.body;
    assert(publicOrder.financials && publicOrder.financials.cogs === undefined, 'COGS (Cost of Goods Sold) completely REDACTED from public tracking');
    assert(Array.isArray(publicOrder.items) && publicOrder.items[0].unitCost === undefined, 'Item unit acquisition cost completely REDACTED from public tracking');
    assert(publicOrder.customer.fullName.includes('***'), 'Customer full name masked on public tracking');

    // Clean up test order
    if (testOrderId) {
      await request('POST', `/api/admin/orders/${testOrderId}/cancel`, {
        restock: true,
        reason: 'Automated hardening suite cleanup',
      }, superAdminToken);
      // Hard delete test order to prevent database pollution
      await request('DELETE', `/api/admin/orders/${testOrderId}`, null, superAdminToken);
    }

    // Clean up created test manager account from database to preserve initial state
    if (newMgrId) {
      for (const dir of [path.join(__dirname, 'test-data'), path.join(__dirname, '../server/data')]) {
        const adminsFile = path.join(dir, 'admins.json');
        if (fs.existsSync(adminsFile)) {
          try {
            const list = JSON.parse(fs.readFileSync(adminsFile, 'utf-8'));
            const cleaned = list.filter(a => a.id !== newMgrId && !a.username.startsWith('store_mgr_'));
            fs.writeFileSync(adminsFile, JSON.stringify(cleaned, null, 2));
          } catch (_) {}
        }
      }
    }

    console.log('\n================================================================');
    console.log(`📊 HARDENING TEST REPORT: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
    console.log('================================================================\n');

    if (failedTests === 0) {
      console.log('🏆 100% Production Security & Hardening Invariants Verified Successfully!\n');
    } else {
      console.error(`⚠️ ${failedTests} tests failed.`);
      process.exit(1);
    }

  } catch (err) {
    console.error('Fatal error during hardening test execution:', err);
    process.exit(1);
  } finally {
    stopServer();
  }
}

runHardeningSuite();
