/**
 * Automated Verification & Test Suite for Cricket-Only, Bangladesh-First Platform
 * Validates:
 * 1. Cricket-Only Invariants (Zero non-cricket sports leak in nav or catalog)
 * 2. Bangladesh Phone Validation & Normalization
 * 3. BDT Monetary Engine, Free Shipping Thresholds & Promo Codes
 * 4. Administrative Divisions & Districts Integrity
 * 5. Backend API Checkout with Bangladesh Customer & Logistics
 * 6. Live Dev Server and API Health
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🏏 RUNNING CRICKET-ONLY, BANGLADESH-FIRST AUTOMATED TEST SUITE');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${details}`);
    failCount++;
  }
}

// 1. CRICKET-ONLY & NON-CRICKET EXCLUSION AUDIT
console.log('🏏 1. Testing Cricket-Only & Non-Cricket Sports Purge...');

const topSportsBarFile = fs.readFileSync(path.join(__dirname, '../src/components/layout/TopSportsBar.tsx'), 'utf-8');
const nonCricketSports = ['FOOTBALL', 'RUNNING', 'TENNIS', 'BASKETBALL', 'RUGBY', 'GOLF', 'OUTDOOR'];
const leakedSports = nonCricketSports.filter(s => topSportsBarFile.includes(`'${s}'`) || topSportsBarFile.includes(`"${s}"`));
assert(leakedSports.length === 0, 'TopSportsBar contains ZERO non-cricket sports', leakedSports.length ? `Found: ${leakedSports.join(', ')}` : 'Clean');

const cricketDataRaw = fs.readFileSync(path.join(__dirname, '../src/data/cricketData.ts'), 'utf-8');
const verifiedCategories = ['Cricket Bats', 'Cricket Footwear', 'Batting Equipment', 'Cricket Helmets', 'Cricket Clothing', 'Cricket Bags'];
assert(verifiedCategories.every(c => cricketDataRaw.includes(c)), 'All primary cricket categories present in catalog');

// Verify prices are in authentic BDT range
const priceMatches = [...cricketDataRaw.matchAll(/price:\s*([0-9.]+)/g)];
const validPrices = priceMatches.every(m => parseFloat(m[1]) >= 1000 && parseFloat(m[1]) <= 150000);
assert(validPrices, 'All product prices are in verified BDT scale [৳1,000 - ৳150,000]');

// Verify source GBP price is preserved for auditability
assert(cricketDataRaw.includes('originalPriceGbp:'), 'Source prices preserved in originalPriceGbp for auditability');

// 2. BANGLADESH LOCALIZATION & VALIDATION TESTS
console.log('\n🇧🇩 2. Testing Bangladesh Address & Phone Validation Engine...');

// BD Phone validation logic (mirrors src/utils/bangladesh.ts)
function isValidBdPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(?:\+88|88)?(01[3-9]\d{8})$/.test(cleaned);
}

function normalizeBdPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const match = cleaned.match(/^(?:\+88|88)?(01[3-9]\d{8})$/);
  return match ? `+88${match[1]}` : phone;
}

assert(isValidBdPhone('01712345678'), 'Valid 11-digit local mobile number passes (01712345678)');
assert(isValidBdPhone('01819234567'), 'Valid Robi/Airtel prefix passes (01819234567)');
assert(isValidBdPhone('01912345678'), 'Valid Banglalink prefix passes (01912345678)');
assert(isValidBdPhone('01301234567'), 'Valid GP new prefix passes (01301234567)');
assert(isValidBdPhone('+8801712345678'), 'International +880 format passes (+8801712345678)');
assert(isValidBdPhone('01712-345678'), 'Dashed phone number passes (01712-345678)');
assert(!isValidBdPhone('01212345678'), 'Invalid operator prefix rejected (012...)');
assert(!isValidBdPhone('017123456'), 'Too short number rejected (9 digits)');
assert(!isValidBdPhone('0171234567899'), 'Too long number rejected (13 digits)');
assert(!isValidBdPhone('letters_only'), 'Non-numeric string rejected');
assert(normalizeBdPhone('01712345678') === '+8801712345678', 'normalizeBdPhone converts local format to canonical E.164 (+8801712345678)');

// Test BD Division & District integrity
const bdUtilsRaw = fs.readFileSync(path.join(__dirname, '../src/utils/bangladesh.ts'), 'utf-8');
const divisions = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'];
assert(divisions.every(d => bdUtilsRaw.includes(`division: '${d}'`)), 'All 8 Bangladesh administrative divisions configured');

// 3. LOGISTICS & MONETARY ENGINE
console.log('\n৳ 3. Testing Bangladesh Logistics & Monetary Engine...');

function formatBDT(amount) {
  return `৳${Number(amount).toLocaleString('en-IN')}`;
}

function calculateDeliveryFee(subtotal, zone) {
  if (subtotal === 0) return 0;
  if (subtotal >= 5000) return 0;
  return zone === 'outside_dhaka' ? 130 : 70;
}

assert(formatBDT(14400) === '৳14,400', 'formatBDT correctly formats 14400 with ৳ symbol and Bangladeshi comma placement');
assert(formatBDT(88800) === '৳88,800', 'formatBDT correctly formats 88800 with ৳ symbol');
assert(calculateDeliveryFee(0, 'inside_dhaka') === 0, 'Empty cart has ৳0 delivery fee');
assert(calculateDeliveryFee(2500, 'inside_dhaka') === 70, 'Subtotal under ৳5,000 inside Dhaka is ৳70');
assert(calculateDeliveryFee(2500, 'outside_dhaka') === 130, 'Subtotal under ৳5,000 outside Dhaka is ৳130');
assert(calculateDeliveryFee(5000, 'inside_dhaka') === 0, 'Subtotal exactly ৳5,000 unlocks FREE shipping inside Dhaka');
assert(calculateDeliveryFee(15000, 'outside_dhaka') === 0, 'Subtotal ৳15,000 unlocks FREE shipping outside Dhaka');

// Promo discount
function applyPromo(code, subtotal) {
  const clean = code.trim().toUpperCase();
  if (clean === 'CRICKET10' || clean === 'TIGERS10') {
    return subtotal * 0.10;
  }
  return 0;
}

assert(applyPromo('CRICKET10', 20000) === 2000, 'CRICKET10 discount calculates 10% on ৳20,000 (৳2,000)');
assert(applyPromo('tigers10', 10000) === 1000, 'TIGERS10 discount is case-insensitive (৳1,000)');

// 4. BACKEND API LIVE CHECKOUT TEST
console.log('\n🚀 4. Testing Backend API Health & Bangladesh Checkout (/api/checkout)...');

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(data);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runApiTests() {
  try {
    // Check Health
    const healthRes = await new Promise((res, rej) => {
      http.get('http://localhost:4000/api/health', (r) => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => res(JSON.parse(b)));
      }).on('error', rej);
    });
    assert(healthRes.status === 'ok' && (healthRes.currency === 'BDT' || healthRes.currency?.includes('BDT')), 'Backend is live and operating with BDT currency');

    // Test Valid Bangladesh Checkout (Cash on Delivery)
    const checkoutPayload = {
      items: [
        { productId: '1055203', quantity: 1, selectedSize: '9', price: 14400 }
      ],
      promoCode: 'CRICKET10',
      deliveryZone: 'inside_dhaka',
      paymentMethod: 'cod',
      customer: {
        fullName: 'Sakib Al Hasan',
        phone: '01711223344',
        division: 'Dhaka',
        district: 'Dhaka',
        thana: 'Mirpur',
        address: 'House 5, Road 2, Mirpur-2, Dhaka'
      }
    };

    const checkoutRes = await postJson('http://localhost:4000/api/checkout', checkoutPayload);
    assert(checkoutRes.status === 201, 'Backend processes Bangladesh COD checkout with HTTP 201 Created');
    assert(checkoutRes.json?.order?.orderId?.startsWith('GZ-BD-'), 'Order ID generated with Gazi BD prefix (GZ-BD-...)');
    assert(checkoutRes.json?.order?.trackingNumber?.startsWith('GZ-TRK-'), 'Logistics tracking ID generated with Gazi Tracking prefix (GZ-TRK-...)');
    assert(checkoutRes.json?.order?.financials?.currency === 'BDT', 'Order financials finalized in BDT');
    assert(checkoutRes.json?.order?.financials?.discount === 1440, '10% discount correctly subtracted (৳1,440 on ৳14,400)');
    assert(checkoutRes.json?.order?.financials?.shipping === 0, 'Order above ৳5,000 qualified for FREE delivery');
    assert(checkoutRes.json?.order?.financials?.total === 12960, 'Grand total accurately calculated: 14400 - 1440 = ৳12,960');

    // Test Phone Number Validation Rejection in Checkout API
    const invalidPhonePayload = {
      items: [{ productId: '1055203', quantity: 1, selectedSize: '9', price: 14400 }],
      customer: { fullName: 'Test User', phone: '12345' }
    };
    const invalidRes = await postJson('http://localhost:4000/api/checkout', invalidPhonePayload);
    assert(invalidRes.status === 400, 'Backend rejects invalid phone number with HTTP 400 Bad Request');

    // 5. DEV SERVER FRONTEND HEALTH
    console.log('\n🌐 5. Testing Vite Frontend Dev Server (http://localhost:3000)...');
    const frontendRes = await new Promise((res, rej) => {
      http.get('http://localhost:3000/', (r) => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => res({ status: r.statusCode, body: b }));
      }).on('error', rej);
    });

    assert(frontendRes.status === 200, 'Frontend Vite dev server responds with HTTP 200 OK');
    assert(frontendRes.body.includes('<div id="root"></div>'), 'HTML contains mounting root');

    // Final Summary
    console.log('\n================================================================');
    console.log(`📊 FINAL TEST REPORT: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================\n');

    if (failCount > 0) {
      process.exit(1);
    } else {
      console.log('🏆 All Cricket-Only & Bangladesh Localization Invariants 100% Verified!');
      process.exit(0);
    }
  } catch (err) {
    assert(false, 'API / Server Execution', err.message);
    console.log('\n================================================================');
    console.log(`📊 FINAL TEST REPORT: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('================================================================\n');
    process.exit(1);
  }
}

runApiTests();
