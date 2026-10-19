import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { db, createBackupSnapshot } from './db.js';
import adminAuthRouter from './routes/adminAuth.js';
import adminProductsRouter from './routes/adminProducts.js';
import adminInventoryRouter from './routes/adminInventory.js';
import adminOrdersRouter from './routes/adminOrders.js';
import adminSuppliersRouter from './routes/adminSuppliers.js';
import adminExpensesRouter from './routes/adminExpenses.js';
import adminReportsRouter from './routes/adminReports.js';
import adminAuditLogsRouter from './routes/adminAuditLogs.js';
import uploadRouter from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware: Helmet headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration: allow any origin in dev or configured frontend URL
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Rate Limiting: General API & Administrative Brute-force protection
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many administrative login attempts, please try again in 15 minutes.' },
});
app.use('/api/admin/auth/login', authLimiter);

// Initial automatic database backup snapshot
createBackupSnapshot();

// Serve static uploaded media files from public/uploads
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Subscribers persistence file
const subscribersFilePath = path.join(__dirname, 'data/subscribers.json');

// Bangladesh Phone Validation Helper
function isValidBdPhone(phone) {
  if (!phone) return false;
  const clean = phone.replace(/[\s-]/g, '');
  const regex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
  return regex.test(clean);
}

// ==============================================================
// 1. PUBLIC STOREFRONT HEALTH ENDPOINT
// ==============================================================
app.get('/api/health', (req, res) => {
  const products = db.getProducts();
  res.json({
    status: 'ok',
    service: 'Gazi Cricket Enterprise Store & Management API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    catalogSize: products.length,
    environment: 'production-ready',
    database: 'Enterprise ACID JSON Store with write locks',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
  });
});

// ==============================================================
// 2. PUBLIC STOREFRONT PRODUCTS LIST & FILTER ENDPOINT
// ==============================================================
app.get('/api/products', (req, res) => {
  const { category, vendor, search, maxPrice, sort, onlySale } = req.query;
  let results = db.getProducts().filter((p) => (p.status || 'active') !== 'archived');

  if (category && category !== 'All') {
    results = results.filter((p) => p.category.toLowerCase() === category.toLowerCase());
  }

  if (vendor && vendor !== 'All') {
    results = results.filter((p) => p.vendor.toLowerCase() === vendor.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.vendor.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.franchise && p.franchise.toLowerCase().includes(q))
    );
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      results = results.filter((p) => p.price <= max);
    }
  }

  if (onlySale === 'true') {
    results = results.filter((p) => Boolean(p.oldPrice));
  }

  if (sort === 'price-asc') {
    results.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    results.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    total: results.length,
    products: results,
  });
});

// ==============================================================
// 3. SINGLE PRODUCT ENDPOINT
// ==============================================================
app.get('/api/products/:id', (req, res) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// ==============================================================
// 4. CATEGORIES & BRANDS
// ==============================================================
app.get('/api/categories', (req, res) => {
  const products = db.getProducts().filter((p) => (p.status || 'active') !== 'archived');
  const counts = {};
  products.forEach((p) => {
    counts[p.category] = (counts[p.category] || 0) + 1;
  });
  res.json(counts);
});

app.get('/api/brands', (req, res) => {
  const products = db.getProducts().filter((p) => (p.status || 'active') !== 'archived');
  const counts = {};
  products.forEach((p) => {
    counts[p.vendor] = (counts[p.vendor] || 0) + 1;
  });
  res.json(counts);
});

// ==============================================================
// 5. PROMO CODE VALIDATION
// ==============================================================
app.post('/api/promo/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Promo code is required' });
  }

  const clean = code.trim().toUpperCase();
  if (clean === 'CRICKET10') {
    return res.json({
      valid: true,
      code: 'CRICKET10',
      discountPercent: 10,
      discountAmount: Number((subtotal * 0.10).toFixed(2)),
      description: '10% Off Your Entire Cricket Order',
    });
  } else if (clean === 'FREESHIP') {
    return res.json({
      valid: true,
      code: 'FREESHIP',
      discountPercent: 0,
      discountAmount: 70,
      freeShipping: true,
      description: 'Free Standard Bangladesh Delivery',
    });
  }

  res.status(404).json({
    valid: false,
    message: 'Invalid or expired promotional code. Try CRICKET10.',
  });
});

// ==============================================================
// 6. CHECKOUT & ATOMIC INVENTORY ORDER CREATION
// ==============================================================
app.post('/api/checkout', async (req, res) => {
  try {
    const {
      items,
      customer,
      deliveryZone = 'inside_dhaka',
      paymentMethod = 'cod',
      trxId = '',
      promoCode,
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Shopping bag is empty' });
    }

    // Customer validation for Bangladesh orders
    if (customer?.phone && !isValidBdPhone(customer.phone)) {
      return res.status(400).json({
        error: 'Please enter a valid 11-digit Bangladeshi mobile number (e.g., 017XXXXXXXX, 018XXXXXXXX).',
      });
    }

    // Calculate discount if promoCode given
    let discount = 0;
    if (promoCode && promoCode.toUpperCase() === 'CRICKET10') {
      const products = db.getProducts();
      let calculatedSubtotal = 0;
      for (const item of items) {
        const pid = item.productId || item.id;
        const prod = products.find((p) => p.id === pid || p.sku === pid);
        const price = prod ? prod.price : (item.price || 0);
        calculatedSubtotal += price * (item.quantity || 1);
      }
      discount = Number((calculatedSubtotal * 0.10).toFixed(2));
    }

    const order = await db.createOrder({
      items,
      customer,
      deliveryZone,
      paymentMethod,
      trxId,
      discount,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Immediate dispatch queued.',
      order,
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(400).json({ error: err.message || 'Error processing checkout' });
  }
});

// ==============================================================
// 7. ORDER TRACKING LOOKUP
// ==============================================================
app.get('/api/orders/:tracking', (req, res) => {
  const { tracking } = req.params;
  try {
    const order = db.getOrderById(tracking);
    if (!order) {
      return res.status(404).json({ error: 'Order reference not found' });
    }
    res.json(order);
  } catch (err) {
    console.error('Could not load orders database:', err);
    res.status(500).json({ error: 'Could not load orders database' });
  }
});

// ==============================================================
// 8. NEWSLETTER SUBSCRIPTION
// ==============================================================
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    let subs = [];
    if (fs.existsSync(subscribersFilePath)) {
      subs = JSON.parse(fs.readFileSync(subscribersFilePath, 'utf-8'));
    }
    if (!subs.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
      subs.push({ email, subscribedAt: new Date().toISOString() });
      fs.writeFileSync(subscribersFilePath, JSON.stringify(subs, null, 2));
    }
  } catch (e) {
    console.error('Newsletter error:', e);
  }

  res.json({
    success: true,
    message: 'Welcome to the Gazi Cricket Club! Voucher code: CRICKET10',
    voucherCode: 'CRICKET10',
    discountPercent: 10,
  });
});

// ==============================================================
// 9. ENTERPRISE ADMIN ROUTE MOUNTING
// ==============================================================
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/inventory', adminInventoryRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/procurement', adminSuppliersRouter);
app.use('/api/admin/suppliers', adminSuppliersRouter);
app.use('/api/admin/purchases', adminSuppliersRouter);
app.use('/api/admin/expenses', adminExpensesRouter);
app.use('/api/admin/reports', adminReportsRouter);
app.use('/api/admin/audit-logs', adminAuditLogsRouter);
app.use('/api/admin/upload', uploadRouter);

// Global Express Error Handler: prevents stack trace leaks in production
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected server error occurred. Please contact customer support.'
      : (err.message || 'Internal server error'),
  });
});

// Process crash safety
process.on('uncaughtException', (err) => {
  console.error('FATAL UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('FATAL UNHANDLED REJECTION:', reason);
});

// Start Server with Graceful Shutdown
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Gazi Cricket Enterprise Platform API Running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}/api/health`);
  console.log(`🛡️  Admin API: http://localhost:${PORT}/api/admin/auth/me`);
  console.log(`======================================================\n`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server terminated safely');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server terminated safely');
    process.exit(0);
  });
});
