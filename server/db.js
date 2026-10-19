import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { AsyncLocalStorage } from 'async_hooks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure uploads dir
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Re-entrant FIFO Promise Queue Mutex per collection for atomic concurrency
const lockQueues = new Map();
const lockContext = new AsyncLocalStorage();

export async function withLock(collectionName, callback) {
  const currentLocks = lockContext.getStore() || new Set();
  if (currentLocks.has(collectionName)) {
    // Re-entrant: lock already held in this async execution context
    return await callback();
  }

  const prevPromise = lockQueues.get(collectionName) || Promise.resolve();
  let release;
  const currentPromise = new Promise((resolve) => {
    release = resolve;
  });
  lockQueues.set(collectionName, prevPromise.then(() => currentPromise).catch(() => currentPromise));
  await prevPromise;

  const nextLocks = new Set(currentLocks);
  nextLocks.add(collectionName);

  try {
    return await lockContext.run(nextLocks, () => callback());
  } finally {
    release();
  }
}

// Multi-collection lock with alphabetical sorting to guarantee deadlock freedom
export async function withLocks(collectionNames, callback) {
  const sorted = [...new Set(collectionNames)].sort();
  async function acquireNext(index) {
    if (index >= sorted.length) {
      return await callback();
    }
    return await withLock(sorted[index], () => acquireNext(index + 1));
  }
  return await acquireNext(0);
}

// Atomic file writer: writes to a temp file and renames it atomically
function writeAtomicJson(filePath, data) {
  const tempPath = `${filePath}.tmp.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  try {
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    // Fallback on Windows if rename encounters lock
    fs.copyFileSync(tempPath, filePath);
    try {
      fs.unlinkSync(tempPath);
    } catch (_) {}
  }
}

// Safe non-destructive JSON reader: NEVER returns fallback [] when reading an existing file fails!
function readJsonSafe(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) {
    writeAtomicJson(filePath, defaultValue);
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`FATAL ERROR reading database file ${filePath}:`, err);
    throw new Error(`Database read failure for ${path.basename(filePath)}: ${err.message}. Aborting operation to prevent data loss.`);
  }
}

// Automated backup directory and snapshot rotation
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

export function createBackupSnapshot() {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotDir = path.join(backupDir, `snapshot-${timestamp}`);
    fs.mkdirSync(snapshotDir, { recursive: true });
    for (const [key, p] of Object.entries(filePaths)) {
      if (fs.existsSync(p)) {
        fs.copyFileSync(p, path.join(snapshotDir, path.basename(p)));
      }
    }
    // Prune older snapshots if more than 10 exist
    const all = fs.readdirSync(backupDir).filter((f) => f.startsWith('snapshot-'));
    if (all.length > 10) {
      all.sort();
      for (const old of all.slice(0, all.length - 10)) {
        fs.rmSync(path.join(backupDir, old), { recursive: true, force: true });
      }
    }
    return snapshotDir;
  } catch (err) {
    console.error('Backup creation failed:', err);
    return null;
  }
}

const filePaths = {
  products: path.join(dataDir, 'products.json'),
  inventoryLedger: path.join(dataDir, 'inventory_ledger.json'),
  suppliers: path.join(dataDir, 'suppliers.json'),
  purchases: path.join(dataDir, 'purchases.json'),
  expenses: path.join(dataDir, 'expenses.json'),
  orders: path.join(dataDir, 'orders.json'),
  admins: path.join(dataDir, 'admins.json'),
  auditLogs: path.join(dataDir, 'audit_logs.json'),
  subscribers: path.join(dataDir, 'subscribers.json'),
};

// Password helper for admin accounts
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, salt, storedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === storedHash;
}

// -------------------------------------------------------------
// INITIAL SEEDING & DATA MIGRATION
// -------------------------------------------------------------
function initializeSeeds() {
  // 1. Admins
  let admins = readJsonSafe(filePaths.admins, []);
  if (admins.length === 0) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword2026!';
    const { hash, salt } = hashPassword(defaultPassword);
    admins = [
      {
        id: 'adm-001',
        username: 'admin',
        email: 'admin@gazisports.com',
        name: 'Chief Cricket Administrator',
        role: 'super_admin',
        permissions: ['*'],
        passwordHash: hash,
        salt,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'adm-002',
        username: 'inventory',
        email: 'inventory@gazisports.com',
        name: 'Dhaka Warehouse Manager',
        role: 'inventory_manager',
        permissions: ['inventory:*', 'products:read', 'orders:read'],
        passwordHash: hash,
        salt,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    writeAtomicJson(filePaths.admins, admins);
  }

  // 2. Suppliers
  let suppliers = readJsonSafe(filePaths.suppliers, []);
  if (suppliers.length === 0) {
    suppliers = [
      {
        id: 'sup-001',
        name: 'Unicorn Products Ltd (Gunn & Moore)',
        contactPerson: 'David Roberts',
        phone: '+44 115 985 7777',
        email: 'sales@unicornsports.co.uk',
        address: 'Trent Bridge, Nottingham, United Kingdom',
        categoriesSupplied: ['Cricket Bats', 'Batting Equipment', 'Cricket Luggage'],
        totalPurchases: 2850000,
        balanceOwed: 320000,
        notes: 'Official UK master distributor for Ben Stokes Diamond Series & English Willow clefts.',
        createdAt: '2026-01-10T10:00:00.000Z',
      },
      {
        id: 'sup-002',
        name: 'Delux Sports Company (DSC)',
        contactPerson: 'Sanjiv Sanan',
        phone: '+91 181 260 2261',
        email: 'exports@dsc-cricket.com',
        address: 'Sports Goods Complex, Jalandhar, Punjab, India',
        categoriesSupplied: ['Cricket Bats', 'Batting Equipment', 'Cricket Protection'],
        totalPurchases: 1450000,
        balanceOwed: 0,
        notes: 'Top tier English & Kashmir willow manufacturer, Pearla & Krunch ranges.',
        createdAt: '2026-01-15T10:00:00.000Z',
      },
      {
        id: 'sup-003',
        name: 'Pro:Direct Global Direct Wholesale',
        contactPerson: 'Mark Harrison',
        phone: '+44 1626 363232',
        email: 'b2b-trade@prodirectsport.com',
        address: 'Torquay, Devon, United Kingdom',
        categoriesSupplied: ['Cricket Footwear', 'Cricket Clothing', 'Cricket Protection'],
        totalPurchases: 3200000,
        balanceOwed: 180000,
        notes: 'Primary supplier for Castore England Kits, adidas 22YDS & Payntr spikes.',
        createdAt: '2026-01-20T10:00:00.000Z',
      },
      {
        id: 'sup-004',
        name: 'Kookaburra Sport Pty Ltd',
        contactPerson: 'Liam Murphy',
        phone: '+61 3 8552 1111',
        email: 'asia-trade@kookaburra.com.au',
        address: 'Moorabbin, Victoria, Australia',
        categoriesSupplied: ['Batting Equipment', 'Cricket Balls & Accessories'],
        totalPurchases: 980000,
        balanceOwed: 50000,
        notes: 'Official manufacturer of Kookaburra Turf balls and T20 protective gear.',
        createdAt: '2026-02-01T10:00:00.000Z',
      },
    ];
    writeAtomicJson(filePaths.suppliers, suppliers);
  }

  // 3. Products & Stock
  let products = readJsonSafe(filePaths.products, []);
  if (products.length === 0) {
    const rawCatalog = [
      {
        id: '1055203',
        sku: 'CRK-SHOE-AD-22YDS',
        title: 'adidas 22YDS Training Bowling Cricket Shoe',
        vendor: 'adidas',
        category: 'Cricket Footwear',
        department: 'Footwear',
        handle: 'adidas-22yds-training-bowling-cricket-shoe',
        costPrice: 9500,
        price: 14400,
        oldPrice: 16000,
        stock: 24,
        lowStockThreshold: 5,
        status: 'active',
        sizes: ['7', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
        color: 'White/Aurora Onix/Core Black',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1055203_main.jpg?v=1792326199&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1055203_gallery_1.jpg?v=1792326199&width=800',
        ],
        description: 'Designed primarily for hard training surfaces and artificial turf, this edition of the 22YDS lets you steam into the crease with confidence.',
        franchise: 'Cricket Footwear',
        isNew: true,
        rating: 4.9,
        reviewsCount: 38,
        specs: {
          'Surface': 'Indoor & Artificial Turf',
          'Outsole': 'Herringbone Grip Rubber',
          'Midsole': 'Cushioned EVA + Torsion Stabilizer',
          'Fastening': 'Laces with Midfoot Lock Strap',
        },
      },
      {
        id: '1045195',
        sku: 'CRK-SHOE-NB-CK4030',
        title: 'New Balance CK4030 Cricket Shoe',
        vendor: 'New Balance',
        category: 'Cricket Footwear',
        department: 'Footwear',
        handle: 'new-balance-ck4030-cricket-shoe',
        costPrice: 10800,
        price: 16000,
        oldPrice: 21600,
        stock: 18,
        lowStockThreshold: 5,
        status: 'active',
        sizes: ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '12'],
        color: 'White/Red/Black',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1045195_main.jpg?v=1791977292&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1045195_gallery_1.jpg?v=1791977292&width=800',
        ],
        description: 'With a new moulded heel overlay, the New Balance CK4030 V6 Cricket Shoe offers a stable, secure fit that wraps the rear of the foot.',
        franchise: 'Cricket Footwear',
        isExclusive: true,
        rating: 4.8,
        reviewsCount: 29,
        specs: {
          'Spike Configuration': '7/4 Metal Spikes with TPU Plate',
          'Cushioning': 'FuelCell Ultra Rebound Foam',
          'Upper': 'Engineered Mesh with Protective PU Film',
        },
      },
      {
        id: '4004056',
        sku: 'CRK-SHOE-PU-EVO24',
        title: 'Puma evoSPEED 24.1 Cricket Shoe',
        vendor: 'Puma',
        category: 'Cricket Footwear',
        department: 'Footwear',
        handle: 'puma-evospeed-241-cricket-shoe',
        costPrice: 10500,
        price: 16000,
        oldPrice: 17920,
        stock: 20,
        lowStockThreshold: 5,
        status: 'active',
        sizes: ['7', '8', '9', '10', '11', '12'],
        color: 'White/Speed Blue/Fizzy Light',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/4004056_main.jpg?v=1791068918&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/4004056_gallery_1.jpg?v=1791068918&width=800',
        ],
        description: 'Upgraded for the next generation of cricket, the 24.1 edition features a cross-over mesh tongue for a snug, distraction-free fit.',
        franchise: 'Cricket Footwear',
        rating: 4.7,
        reviewsCount: 19,
        specs: {
          'Midsole': 'ProFoamLite High-Rebound EVA',
          'Flex': 'Forefoot Articulated Flex Grooves',
        },
      },
      {
        id: '1031064',
        sku: 'CRK-SHOE-PY-PROX',
        title: 'Payntr Pro-X Club Cricket Shoe',
        vendor: 'Payntr',
        category: 'Cricket Footwear',
        department: 'Footwear',
        handle: 'payntr-pro-x-club-cricket-shoe',
        costPrice: 8600,
        price: 13200,
        oldPrice: 17600,
        stock: 16,
        lowStockThreshold: 4,
        status: 'active',
        sizes: ['6', '7', '8', '9', '10', '11', '12'],
        color: 'White/Blue/Yellow',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1031064_main.jpg?v=1792172869&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1031064_gallery_1.jpg?v=1792172869&width=800',
        ],
        description: 'Modern cricket shoe built to withstand the rigours of turf and hard wickets.',
        franchise: 'Cricket Footwear',
        rating: 4.6,
        reviewsCount: 15,
        specs: {
          'Insole': 'Memory Foam Footbed',
          'Toe Protection': 'Reinforced Rubber Scuff Guard',
        },
      },
      {
        id: '1028799',
        sku: 'CRK-BAT-GM-VERVA404',
        title: 'Gunn & Moore Verva 404 Cricket Bat',
        vendor: 'Gunn & Moore',
        category: 'Cricket Bats',
        department: 'Bats',
        handle: 'gunn-moore-verva-404-cricket-bat',
        costPrice: 12000,
        price: 19200,
        oldPrice: 25600,
        stock: 14,
        lowStockThreshold: 4,
        status: 'active',
        sizes: ['Short Handle (Light)', 'Short Handle (Med)', 'Harrow'],
        color: 'Green/Black',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1028799_main.jpg?v=1789136779&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1028799_gallery_1.jpg?v=1789136779&width=800',
        ],
        description: 'Crafted for confident, attacking cricket with extra willow towards the toe.',
        franchise: 'Cricket Bats',
        isNew: true,
        rating: 4.9,
        reviewsCount: 42,
        specs: {
          'Willow Grade': 'Seasoned Grade 4 English Willow',
          'Blade Length': 'Shorter L540 Blade for Rapid Hand Speed',
        },
      },
      {
        id: '4001355',
        sku: 'CRK-BAT-AD-INCURZA',
        title: 'adidas Incurza Heat Pro Cricket Bat',
        vendor: 'adidas',
        category: 'Cricket Bats',
        department: 'Bats',
        handle: 'adidas-incurza-heat-pro-cricket-bat',
        costPrice: 28000,
        price: 44800,
        oldPrice: 56000,
        stock: 8,
        lowStockThreshold: 3,
        status: 'active',
        sizes: ['Short Handle (Light)', 'Short Handle (Med)'],
        color: 'Black/Lucid Tangerine',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/4001355_main.jpg?v=1791246572&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/4001355_gallery_1.jpg?v=1791246572&width=800',
        ],
        description: 'Bold styling and aggressive attitude with a mid-low sweetspot.',
        franchise: 'Cricket Bats',
        isExclusive: true,
        rating: 5.0,
        reviewsCount: 56,
        specs: {
          'Willow Grade': 'Selected Grade 1 English Willow',
          'Edges': 'Massive 38-40mm Full Power Contours',
        },
      },
      {
        id: '1050005',
        sku: 'CRK-BAT-DSC-PEARLA',
        title: 'DSC Pearla X4 Cricket Bat',
        vendor: 'DSC',
        category: 'Cricket Bats',
        department: 'Bats',
        handle: 'dsc-pearla-x4-cricket-bat',
        costPrice: 16500,
        price: 25600,
        oldPrice: 32800,
        stock: 15,
        lowStockThreshold: 4,
        status: 'active',
        sizes: ['Short Handle', 'Harrow', 'Size 6'],
        color: 'White/Black',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1050005_main.jpg?v=1789155996&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1050005_gallery_1.jpg?v=1789155996&width=800',
        ],
        description: 'With massive edges throughout the middle of the bat, Pearla gives power and control.',
        franchise: 'Cricket Bats',
        rating: 4.8,
        reviewsCount: 21,
        specs: {
          'Willow Grade': 'Premium Grade 3 English Willow',
          'Handle': 'Multi-Piece Round Cane Handle',
        },
      },
      {
        id: '4012944',
        sku: 'CRK-BAT-GM-STOKES55',
        title: 'Gunn & Moore Diamond Ben Stokes 55 Cricket Bat',
        vendor: 'Gunn & Moore',
        category: 'Cricket Bats',
        department: 'Bats',
        handle: 'gm-diamond-ben-stokes-55-cricket-bat',
        costPrice: 58000,
        price: 88800,
        oldPrice: null,
        stock: 4,
        lowStockThreshold: 2,
        status: 'active',
        sizes: ['Short Handle (2lb 9oz)', 'Short Handle (2lb 10oz)'],
        color: 'White/Electric Blue/Navy',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/4012944_main.jpg?v=1789300399&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/4012944_gallery_1.jpg?v=1789300399&width=800',
        ],
        description: 'Trusted and wielded by England Captain Ben Stokes. Crafted in Nottingham from unbleached Grade 1+ English Willow.',
        franchise: 'Ben Stokes Collection',
        isExclusive: true,
        isNew: true,
        rating: 5.0,
        reviewsCount: 88,
        specs: {
          'Willow Grade': 'Limited Edition Unbleached Grade 1+ English Willow',
          'Crafted in': 'Nottingham, England (GM DXM Precision Machined)',
        },
      },
      {
        id: '4012945',
        sku: 'CRK-BAT-GM-DIA808',
        title: 'Gunn & Moore Diamond 808 Cricket Bat',
        vendor: 'Gunn & Moore',
        category: 'Cricket Bats',
        department: 'Bats',
        handle: 'gm-diamond-808-cricket-bat',
        costPrice: 27000,
        price: 42000,
        oldPrice: 56000,
        stock: 10,
        lowStockThreshold: 3,
        status: 'active',
        sizes: ['Short Handle (Light)', 'Short Handle (Medium)'],
        color: 'White/Cyan/Black',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/4012944_main.jpg?v=1789300399&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1050203_thumbnail.jpg?v=1791973772&width=800',
        ],
        description: 'Diamond silhouette designed with Ben Stokes, Grade 2 English Willow.',
        franchise: 'Ben Stokes Collection',
        rating: 4.8,
        reviewsCount: 34,
        specs: {
          'Willow Grade': 'Superior Seasoned Grade 2 English Willow',
          'Edges': '38mm contoured side walls',
        },
      },
      {
        id: '1011063',
        sku: 'CRK-PAD-KB-T20',
        title: 'Kookaburra T20 6.1 Ambi Batting Pads',
        vendor: 'Kookaburra',
        category: 'Batting Equipment',
        department: 'Equipment',
        handle: 'kookaburra-t20-61-ambi-batting-pads',
        costPrice: 3800,
        price: 5920,
        oldPrice: 8000,
        stock: 35,
        lowStockThreshold: 6,
        status: 'active',
        sizes: ['Adults', 'Youth', 'Junior'],
        color: 'Black/White',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1011063_main.jpg?v=1791785380&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1011063_gallery_1.jpg?v=1791785380&width=800',
        ],
        description: 'High-density shock foam with cane rods and grain PVC face.',
        franchise: 'Batting Equipment',
        rating: 4.7,
        reviewsCount: 18,
        specs: {
          'Handedness': 'Ambidextrous (Left or Right Handed)',
          'Shin Bolster': 'Breathable Mesh Bolster',
        },
      },
      {
        id: '198547',
        sku: 'CRK-PAD-CH-FLC',
        title: 'Chase FLC RH Batting Pads',
        vendor: 'Chase',
        category: 'Batting Equipment',
        department: 'Equipment',
        handle: 'chase-flc-rh-batting-pads',
        costPrice: 13000,
        price: 19840,
        oldPrice: 24800,
        stock: 12,
        lowStockThreshold: 3,
        status: 'active',
        sizes: ['Adults RH', 'Mens RH'],
        color: 'White/Silver',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/198547_main.jpg?v=1790847345&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/198547_gallery_1.jpg?v=1790847345&width=800',
        ],
        description: 'Test-grade ultra-dense polymer foam protection with sleek silver badging.',
        franchise: 'Batting Equipment',
        isExclusive: true,
        rating: 5.0,
        reviewsCount: 16,
        specs: {
          'Protection Standard': 'Test Match Protection Grade',
          'Weight': 'Featherlight High-Density Polymer Core',
        },
      },
      {
        id: '4012946',
        sku: 'CRK-PAD-GM-DIA404',
        title: 'Gunn & Moore Diamond 404 RH Batting Pads',
        vendor: 'Gunn & Moore',
        category: 'Batting Equipment',
        department: 'Equipment',
        handle: 'gm-diamond-404-rh-batting-pads',
        costPrice: 4200,
        price: 6720,
        oldPrice: 11200,
        stock: 22,
        lowStockThreshold: 5,
        status: 'active',
        sizes: ['Adults RH', 'Youth RH'],
        color: 'White/Blue',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1011063_main.jpg?v=1791785380&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1045106_thumbnail.jpg?v=1792172006&width=800',
        ],
        description: 'Ben Stokes signature Diamond collection leg guards with sculpted knee rolls.',
        franchise: 'Ben Stokes Collection',
        rating: 4.8,
        reviewsCount: 22,
        specs: {
          'Bolsters': 'Tri-fold Low Density Foam',
          'Facing': 'Heavy Duty PVC Facing',
        },
      },
      {
        id: '4003032',
        sku: 'CRK-APP-CS-ENGT20LS',
        title: 'Castore England T20 Replica Long Sleeve Shirt',
        vendor: 'Castore',
        category: 'Cricket Clothing',
        department: 'Clothing',
        handle: 'castore-england-t20-replica-long-sleeve-shirt',
        costPrice: 6200,
        price: 10240,
        oldPrice: 12800,
        stock: 25,
        lowStockThreshold: 5,
        status: 'active',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        color: 'Fiery Red/Princess Blue',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/4003032_main.jpg?v=1790171500&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/4003032_gallery_1.jpg?v=1790171500&width=800',
        ],
        description: 'High-performance breathable fabric with official England Cricket Board insignia.',
        franchise: 'England Cricket Store',
        isNew: true,
        rating: 4.9,
        reviewsCount: 45,
        specs: {
          'Material': '100% Lightweight Aerodynamic Poly',
          'Official Team': 'England Cricket Board (ECB)',
        },
      },
      {
        id: '4003042',
        sku: 'CRK-APP-CS-POLO',
        title: 'Castore England Training Poly Polo',
        vendor: 'Castore',
        category: 'Cricket Clothing',
        department: 'Clothing',
        handle: 'castore-england-training-poly-polo',
        costPrice: 3900,
        price: 6144,
        oldPrice: 7680,
        stock: 20,
        lowStockThreshold: 5,
        status: 'active',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        color: 'Ensign Blue/Airy Blue',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/4003042_main.jpg?v=1790531503&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/4003042_gallery_1.jpg?v=1790531503&width=800',
        ],
        description: 'Warmup and net practice training polo with articulated raglan sleeves.',
        franchise: 'England Cricket Store',
        rating: 4.6,
        reviewsCount: 14,
        specs: {
          'Fit': 'Slim Athletic Match Fit',
          'Fabric': 'Breathable Micro Pique',
        },
      },
      {
        id: '4012947',
        sku: 'CRK-BAG-GM-WHEELIE',
        title: 'Gunn & Moore Diamond Wheelie Bag',
        vendor: 'Gunn & Moore',
        category: 'Cricket Luggage',
        department: 'Luggage',
        handle: 'gm-diamond-wheelie-bag',
        costPrice: 3700,
        price: 5920,
        oldPrice: 7360,
        stock: 14,
        lowStockThreshold: 3,
        status: 'active',
        sizes: ['Standard (90L)'],
        color: 'Black/Teal/White',
        images: [
          'https://www.prodirectsport.com/cdn/shop/files/1044249_thumbnail.jpg?v=1789911455&width=800',
          'https://www.prodirectsport.com/cdn/shop/files/1048935_thumbnail.jpg?v=1791735551&width=800',
        ],
        description: 'Spacious 90-litre cricket bag with rugged all-terrain wheels and internal bat holster.',
        franchise: 'Ben Stokes Collection',
        rating: 4.7,
        reviewsCount: 28,
        specs: {
          'Volume': '90 Litres Storage',
          'Wheels': 'Heavy-Duty Ball Bearing Wheels',
        },
      },
    ];

    const now = new Date().toISOString();
    products = rawCatalog.map((p) => ({
      ...p,
      createdAt: now,
      updatedAt: now,
    }));
    writeAtomicJson(filePaths.products, products);

    // Initial Inventory Ledger entries for each seeded product
    const ledger = products.map((p) => ({
      movementId: `MV-INIT-${p.id}`,
      productId: p.id,
      sku: p.sku,
      productTitle: p.title,
      type: 'initial',
      quantityDelta: p.stock,
      unitCost: p.costPrice,
      totalCost: p.costPrice * p.stock,
      balanceAfter: p.stock,
      referenceType: 'initial_stock_entry',
      referenceId: 'MIGRATION-2026',
      reason: 'Initial physical inventory opening balance at Dhaka Central Hub',
      actor: 'System Administrator',
      timestamp: '2026-01-01T00:00:00.000Z',
    }));
    writeAtomicJson(filePaths.inventoryLedger, ledger);
  }

  // 4. Purchases
  let purchases = readJsonSafe(filePaths.purchases, []);
  if (purchases.length === 0) {
    purchases = [
      {
        id: 'po-101',
        poNumber: 'PO-2026-001',
        supplierId: 'sup-001',
        supplierName: 'Unicorn Products Ltd (Gunn & Moore)',
        date: '2026-01-12T10:00:00.000Z',
        status: 'received',
        items: [
          { productId: '4012944', sku: 'CRK-BAT-GM-STOKES55', title: 'GM Diamond Ben Stokes 55', quantity: 5, unitCost: 58000, totalCost: 290000 },
          { productId: '4012945', sku: 'CRK-BAT-GM-DIA808', title: 'GM Diamond 808 Bat', quantity: 10, unitCost: 27000, totalCost: 270000 },
          { productId: '1028799', sku: 'CRK-BAT-GM-VERVA404', title: 'GM Verva 404 Bat', quantity: 15, unitCost: 12000, totalCost: 180000 },
        ],
        additionalCosts: 45000, // UK air freight and customs clearance
        totalAmount: 785000,
        paymentStatus: 'paid',
        amountPaid: 785000,
        balanceDue: 0,
        paymentReference: 'SWIFT-SCB-UK-98214',
        notes: 'Cleared Chittagong Port customs smoothly.',
        receivedBy: 'Dhaka Warehouse Manager',
        createdAt: '2026-01-12T10:00:00.000Z',
      },
      {
        id: 'po-102',
        poNumber: 'PO-2026-002',
        supplierId: 'sup-003',
        supplierName: 'Pro:Direct Global Direct Wholesale',
        date: '2026-01-22T14:30:00.000Z',
        status: 'received',
        items: [
          { productId: '1055203', sku: 'CRK-SHOE-AD-22YDS', title: 'adidas 22YDS Shoes', quantity: 25, unitCost: 9500, totalCost: 237500 },
          { productId: '1045195', sku: 'CRK-SHOE-NB-CK4030', title: 'New Balance CK4030 Shoes', quantity: 20, unitCost: 10800, totalCost: 216000 },
          { productId: '4003032', sku: 'CRK-APP-CS-ENGT20LS', title: 'Castore England T20 Shirt', quantity: 30, unitCost: 6200, totalCost: 186000 },
        ],
        additionalCosts: 32000,
        totalAmount: 671500,
        paymentStatus: 'partial',
        amountPaid: 491500,
        balanceDue: 180000,
        paymentReference: 'EBL-FX-TRANS-4410',
        notes: 'Balance payable within 30 days net terms.',
        receivedBy: 'Dhaka Warehouse Manager',
        createdAt: '2026-01-22T14:30:00.000Z',
      },
    ];
    writeAtomicJson(filePaths.purchases, purchases);
  }

  // 5. Operating Expenses
  let expenses = readJsonSafe(filePaths.expenses, []);
  if (expenses.length === 0) {
    expenses = [
      {
        id: 'exp-101',
        category: 'warehouse_rent',
        amount: 45000,
        date: '2026-01-05',
        description: 'Monthly Warehouse Lease for Mirpur Cricket Distribution Facility',
        paymentMethod: 'bank_transfer',
        recordedBy: 'admin',
        receiptRef: 'RENT-MIRPUR-JAN2026',
        createdAt: '2026-01-05T09:00:00.000Z',
      },
      {
        id: 'exp-102',
        category: 'courier_shipping',
        amount: 14500,
        date: '2026-01-18',
        description: 'Steadfast Courier Advance Parcel Delivery Contract Top-up',
        paymentMethod: 'bkash',
        recordedBy: 'admin',
        receiptRef: 'STEADFAST-DEP-8841',
        createdAt: '2026-01-18T11:00:00.000Z',
      },
      {
        id: 'exp-103',
        category: 'packaging_materials',
        amount: 8200,
        date: '2026-01-20',
        description: 'Heavy duty padded corrugated bat boxes and bubble roll wrap',
        paymentMethod: 'cash',
        recordedBy: 'inventory',
        receiptRef: 'PKG-DHAKA-551',
        createdAt: '2026-01-20T14:00:00.000Z',
      },
      {
        id: 'exp-104',
        category: 'marketing_ads',
        amount: 22000,
        date: '2026-02-02',
        description: 'Facebook & Google Display Ads Campaign - BPL Cricket Season Promotion',
        paymentMethod: 'bank_transfer',
        recordedBy: 'admin',
        receiptRef: 'META-ADS-INV-9901',
        createdAt: '2026-02-02T16:00:00.000Z',
      },
      {
        id: 'exp-105',
        category: 'utilities',
        amount: 6800,
        date: '2026-02-08',
        description: 'Electricity & High-Speed Optical Fiber Internet (Warehouse & Office)',
        paymentMethod: 'bkash',
        recordedBy: 'admin',
        receiptRef: 'DESCO-FEB-2026',
        createdAt: '2026-02-08T10:00:00.000Z',
      },
    ];
    writeAtomicJson(filePaths.expenses, expenses);
  }

  // 6. Orders Migration & Validation
  let orders = readJsonSafe(filePaths.orders, []);
  let ordersUpdated = false;
  if (orders.length > 0) {
    orders = orders.map((o) => {
      // Normalize currency to BDT if GBP or missing
      if (o.financials && (o.financials.currency === 'GBP' || !o.financials.currency)) {
        ordersUpdated = true;
        const rate = 160;
        return {
          ...o,
          orderId: o.orderId.startsWith('PDC-ORD') ? o.orderId.replace('PDC-ORD', 'GZ-BD') : o.orderId,
          trackingNumber: o.trackingNumber.startsWith('PDC-GB') ? o.trackingNumber.replace('PDC-GB', 'GZ-TRK') : o.trackingNumber,
          fulfillmentStatus: o.fulfillmentStatus || 'delivered',
          paymentMethod: o.paymentMethod || 'cod',
          paymentStatus: o.paymentStatus || 'paid', // Mark legacy order as collected
          courier: o.courier && o.courier.includes('Royal Mail') ? 'Steadfast Courier' : (o.courier || 'Steadfast Courier'),
          deliveryZone: o.deliveryZone || 'inside_dhaka',
          customer: {
            fullName: o.customer?.name || 'Mahmudul Hasan',
            phone: o.customer?.phone || '01711223344',
            email: o.customer?.email || 'mahmudul@gmail.com',
            division: 'Dhaka',
            district: 'Dhaka',
            thana: 'Mirpur',
            address: 'House 14, Road 5, Block B, Mirpur-12, Dhaka',
          },
          items: (o.items || []).map((it) => {
            const prod = products.find((p) => p.id === it.productId);
            const unitPrice = prod ? prod.price : Number(it.price || 14400);
            const unitCost = prod ? prod.costPrice : Math.round(unitPrice * 0.65);
            return {
              productId: it.productId,
              sku: prod ? prod.sku : `CRK-ITEM-${it.productId}`,
              title: prod ? prod.title : 'Cricket Gear',
              selectedSize: it.selectedSize || '9',
              quantity: it.quantity || 1,
              unitPrice,
              unitCost,
              totalPrice: unitPrice * (it.quantity || 1),
            };
          }),
          financials: {
            currency: 'BDT',
            subtotal: o.financials.subtotal > 2000 ? o.financials.subtotal : Math.round(o.financials.subtotal * rate),
            discount: o.financials.discount > 2000 ? o.financials.discount : Math.round(o.financials.discount * rate),
            shipping: 70,
            total: o.financials.total > 2000 ? o.financials.total : Math.round(o.financials.total * rate),
            cogs: 9500,
          },
          history: o.history || [
            {
              timestamp: o.date || new Date().toISOString(),
              actor: 'System',
              action: 'Order Placed & Confirmed',
            },
          ],
        };
      }
      return o;
    });

    if (ordersUpdated) {
      writeAtomicJson(filePaths.orders, orders);
    }
  }

  // If no orders or only 1 legacy order, add realistic Bangladesh cricket orders for comprehensive reports!
  if (orders.length <= 1) {
    const sampleOrders = [
      {
        orderId: 'GZ-BD-179241001',
        trackingNumber: 'GZ-TRK-781290',
        date: '2026-02-10T11:20:00.000Z',
        status: 'delivered',
        fulfillmentStatus: 'delivered',
        paymentMethod: 'cod',
        paymentStatus: 'paid', // Cash collected by Steadfast and remitted
        paymentDetails: { settledAt: '2026-02-12T15:00:00.000Z', settledBy: 'admin', paymentChannel: 'Steadfast Remittance' },
        courier: 'Steadfast Courier',
        deliveryZone: 'inside_dhaka',
        estimatedDelivery: 'Wednesday 11 February',
        customer: {
          fullName: 'Tanzid Hasan Tamim',
          phone: '01711998877',
          email: 'tanzid.cricket@gmail.com',
          division: 'Dhaka',
          district: 'Dhaka',
          thana: 'Uttara',
          address: 'Sector 4, Road 7, House 22, Uttara, Dhaka',
        },
        items: [
          {
            productId: '1055203',
            sku: 'CRK-SHOE-AD-22YDS',
            title: 'adidas 22YDS Training Bowling Cricket Shoe',
            selectedSize: '9.5',
            quantity: 1,
            unitPrice: 14400,
            unitCost: 9500,
            totalPrice: 14400,
          },
          {
            productId: '1011063',
            sku: 'CRK-PAD-KB-T20',
            title: 'Kookaburra T20 6.1 Ambi Batting Pads',
            selectedSize: 'Adults',
            quantity: 1,
            unitPrice: 5920,
            unitCost: 3800,
            totalPrice: 5920,
          },
        ],
        financials: {
          currency: 'BDT',
          subtotal: 20320,
          discount: 2032, // CRICKET10 applied
          shipping: 0, // Free delivery > 5000
          total: 18288,
          cogs: 13300,
        },
        history: [
          { timestamp: '2026-02-10T11:20:00.000Z', actor: 'Customer', action: 'Order Placed (Online)' },
          { timestamp: '2026-02-10T14:00:00.000Z', actor: 'admin', action: 'Order Confirmed by Phone Verification' },
          { timestamp: '2026-02-11T09:30:00.000Z', actor: 'inventory', action: 'Dispatched via Steadfast Courier' },
          { timestamp: '2026-02-12T14:15:00.000Z', actor: 'Steadfast Courier', action: 'Delivered to Customer' },
          { timestamp: '2026-02-12T15:00:00.000Z', actor: 'admin', action: 'COD Cash Remittance Reconciled & Marked Paid' },
        ],
      },
      {
        orderId: 'GZ-BD-179241002',
        trackingNumber: 'GZ-TRK-781291',
        date: '2026-02-12T14:45:00.000Z',
        status: 'shipped',
        fulfillmentStatus: 'shipped',
        paymentMethod: 'cod',
        paymentStatus: 'pending', // In transit, cash NOT collected yet! Outstanding COD.
        paymentDetails: {},
        courier: 'Pathao Courier',
        deliveryZone: 'outside_dhaka',
        estimatedDelivery: 'Saturday 15 February',
        customer: {
          fullName: 'Saifuddin Ahmed',
          phone: '01819554433',
          email: 'saif.ctg@yahoo.com',
          division: 'Chattogram',
          district: 'Chattogram',
          thana: 'Panchlaish',
          address: 'GEC Circle, Nasirabad Housing Society, Chattogram',
        },
        items: [
          {
            productId: '4012945',
            sku: 'CRK-BAT-GM-DIA808',
            title: 'Gunn & Moore Diamond 808 Cricket Bat',
            selectedSize: 'Short Handle (Medium)',
            quantity: 1,
            unitPrice: 42000,
            unitCost: 27000,
            totalPrice: 42000,
          },
        ],
        financials: {
          currency: 'BDT',
          subtotal: 42000,
          discount: 0,
          shipping: 0,
          total: 42000,
          cogs: 27000,
        },
        history: [
          { timestamp: '2026-02-12T14:45:00.000Z', actor: 'Customer', action: 'Order Placed (COD)' },
          { timestamp: '2026-02-13T10:00:00.000Z', actor: 'admin', action: 'Verified with Customer' },
          { timestamp: '2026-02-13T16:00:00.000Z', actor: 'inventory', action: 'Handed over to Pathao Courier' },
        ],
      },
      {
        orderId: 'GZ-BD-179241003',
        trackingNumber: 'GZ-TRK-781292',
        date: '2026-02-14T09:15:00.000Z',
        status: 'confirmed',
        fulfillmentStatus: 'confirmed',
        paymentMethod: 'bkash',
        paymentStatus: 'paid', // bKash paid online upfront
        paymentDetails: { trxId: 'BK994827164', paymentChannel: 'bKash Merchant' },
        courier: 'Steadfast Courier',
        deliveryZone: 'inside_dhaka',
        estimatedDelivery: 'Sunday 16 February',
        customer: {
          fullName: 'Kazi Ashraful Islam',
          phone: '01912345678',
          email: 'kazi.ashraf@gmail.com',
          division: 'Dhaka',
          district: 'Gazipur',
          thana: 'Tongi',
          address: 'Station Road, Cherag Ali, Tongi, Gazipur',
        },
        items: [
          {
            productId: '4003032',
            sku: 'CRK-APP-CS-ENGT20LS',
            title: 'Castore England T20 Replica Long Sleeve Shirt',
            selectedSize: 'L',
            quantity: 2,
            unitPrice: 10240,
            unitCost: 6200,
            totalPrice: 20480,
          },
        ],
        financials: {
          currency: 'BDT',
          subtotal: 20480,
          discount: 2048,
          shipping: 0,
          total: 18432,
          cogs: 12400,
        },
        history: [
          { timestamp: '2026-02-14T09:15:00.000Z', actor: 'Customer', action: 'Order Placed & bKash TrxID BK994827164 Verified' },
          { timestamp: '2026-02-14T11:00:00.000Z', actor: 'admin', action: 'Packaging Queued' },
        ],
      },
    ];

    orders = [...orders, ...sampleOrders];
    writeAtomicJson(filePaths.orders, orders);
  }

  // 7. Audit Logs
  let auditLogs = readJsonSafe(filePaths.auditLogs, []);
  if (auditLogs.length === 0) {
    auditLogs = [
      {
        id: `LOG-001`,
        timestamp: '2026-01-01T00:00:00.000Z',
        actor: 'System',
        role: 'system',
        action: 'SYSTEM_INITIALIZATION',
        entity: 'system',
        entityId: 'gazi-sports-v1',
        details: { message: 'Enterprise database schema and Dhaka hub inventory initialized' },
        ip: '127.0.0.1',
      },
    ];
    writeAtomicJson(filePaths.auditLogs, auditLogs);
  }
}

// Run seed check on module load
initializeSeeds();

// -------------------------------------------------------------
// EXPORTED REPOSITORY INTERFACE
// -------------------------------------------------------------
export const db = {
  // --- Products ---
  getProducts() {
    return readJsonSafe(filePaths.products, []);
  },
  getProductById(id) {
    const products = readJsonSafe(filePaths.products, []);
    return products.find((p) => p.id === id || p.sku === id);
  },
  async saveProduct(productData, actor = 'admin') {
    return withLock('products', async () => {
      const products = readJsonSafe(filePaths.products, []);
      const now = new Date().toISOString();

      // Check unique SKU
      const existingSkuIndex = products.findIndex(
        (p) => p.sku && p.sku.toUpperCase() === productData.sku.toUpperCase() && p.id !== productData.id
      );
      if (existingSkuIndex !== -1) {
        throw new Error(`SKU '${productData.sku}' is already assigned to '${products[existingSkuIndex].title}'`);
      }

      let savedProduct;
      const index = products.findIndex((p) => p.id === productData.id);

      if (index !== -1) {
        // Edit existing
        const oldProduct = products[index];
        savedProduct = {
          ...oldProduct,
          ...productData,
          price: Number(productData.price),
          costPrice: Number(productData.costPrice || oldProduct.costPrice || 0),
          stock: Number(productData.stock ?? oldProduct.stock ?? 0),
          lowStockThreshold: Number(productData.lowStockThreshold || oldProduct.lowStockThreshold || 5),
          updatedAt: now,
        };
        products[index] = savedProduct;

        // Log audit
        await db.addAuditLog({
          actor,
          action: 'PRODUCT_UPDATED',
          entity: 'product',
          entityId: savedProduct.id,
          details: { sku: savedProduct.sku, title: savedProduct.title, price: savedProduct.price },
        });
      } else {
        // Create new product
        const newId = productData.id || `PRD-${Date.now()}`;
        const newSku = (productData.sku || `CRK-${Date.now().toString().slice(-6)}`).toUpperCase();

        savedProduct = {
          ...productData,
          id: newId,
          sku: newSku,
          price: Number(productData.price),
          costPrice: Number(productData.costPrice || 0),
          stock: Number(productData.stock || 0),
          lowStockThreshold: Number(productData.lowStockThreshold || 5),
          status: productData.status || 'active',
          images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'],
          sizes: productData.sizes || ['Standard'],
          rating: productData.rating || 5.0,
          reviewsCount: productData.reviewsCount || 0,
          createdAt: now,
          updatedAt: now,
        };
        products.unshift(savedProduct);

        // Record initial ledger entry if stock > 0
        if (savedProduct.stock > 0) {
          await db.addLedgerEntry({
            productId: savedProduct.id,
            sku: savedProduct.sku,
            productTitle: savedProduct.title,
            type: 'initial',
            quantityDelta: savedProduct.stock,
            unitCost: savedProduct.costPrice,
            totalCost: savedProduct.costPrice * savedProduct.stock,
            balanceAfter: savedProduct.stock,
            referenceType: 'new_product_creation',
            referenceId: savedProduct.id,
            reason: 'Opening stock for newly added cricket equipment',
            actor,
          });
        }

        await db.addAuditLog({
          actor,
          action: 'PRODUCT_CREATED',
          entity: 'product',
          entityId: savedProduct.id,
          details: { sku: savedProduct.sku, title: savedProduct.title, price: savedProduct.price, stock: savedProduct.stock },
        });
      }

      writeAtomicJson(filePaths.products, products);
      return savedProduct;
    });
  },
  async archiveProduct(id, actor = 'admin') {
    return withLock('products', async () => {
      const products = readJsonSafe(filePaths.products, []);
      const p = products.find((x) => x.id === id);
      if (!p) throw new Error('Product not found');
      p.status = p.status === 'archived' ? 'active' : 'archived';
      p.updatedAt = new Date().toISOString();
      writeAtomicJson(filePaths.products, products);

      await db.addAuditLog({
        actor,
        action: p.status === 'archived' ? 'PRODUCT_ARCHIVED' : 'PRODUCT_RESTORED',
        entity: 'product',
        entityId: id,
        details: { sku: p.sku, title: p.title, status: p.status },
      });
      return p;
    });
  },
  async deleteProduct(id, actor = 'admin') {
    return withLock('products', async () => {
      const products = readJsonSafe(filePaths.products, []);
      const index = products.findIndex((x) => x.id === id);
      if (index === -1) throw new Error('Product not found');
      const [deleted] = products.splice(index, 1);
      writeAtomicJson(filePaths.products, products);

      await db.addAuditLog({
        actor,
        action: 'PRODUCT_DELETED',
        entity: 'product',
        entityId: id,
        details: { sku: deleted.sku, title: deleted.title },
      });
      return deleted;
    });
  },

  // --- Inventory & Ledger ---
  getInventoryLedger() {
    return readJsonSafe(filePaths.inventoryLedger, []);
  },
  async addLedgerEntry(entryData) {
    return withLock('inventoryLedger', async () => {
      const ledger = readJsonSafe(filePaths.inventoryLedger, []);
      const q = entryData.quantityDelta !== undefined ? entryData.quantityDelta : (entryData.quantity !== undefined ? entryData.quantity : 0);
      const entry = {
        movementId: `MV-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        quantity: q,
        quantityDelta: q,
        ...entryData,
      };
      ledger.unshift(entry);
      writeAtomicJson(filePaths.inventoryLedger, ledger);
      return entry;
    });
  },
  async adjustStock(productId, { quantityDelta, reason, type = 'adjustment', referenceType = 'manual_adjustment', referenceId = '', actor = 'admin' }) {
    return withLock('products', async () => {
      const products = readJsonSafe(filePaths.products, []);
      const product = products.find((p) => p.id === productId);
      if (!product) throw new Error('Product not found');

      const currentStock = Number(product.stock || 0);
      const newStock = currentStock + Number(quantityDelta);
      if (newStock < 0) {
        throw new Error(`Insufficient stock. Current stock is ${currentStock}, adjustment of ${quantityDelta} is not possible.`);
      }

      product.stock = newStock;
      product.updatedAt = new Date().toISOString();
      writeAtomicJson(filePaths.products, products);

      // Record in ledger
      await db.addLedgerEntry({
        productId: product.id,
        sku: product.sku,
        productTitle: product.title,
        type,
        quantityDelta: Number(quantityDelta),
        unitCost: product.costPrice || 0,
        totalCost: Math.abs(Number(quantityDelta)) * (product.costPrice || 0),
        balanceAfter: newStock,
        referenceType,
        referenceId,
        reason: reason || `Manual adjustment by ${actor}`,
        actor,
      });

      await db.addAuditLog({
        actor,
        action: 'STOCK_ADJUSTED',
        entity: 'inventory',
        entityId: product.id,
        details: { sku: product.sku, delta: quantityDelta, oldStock: currentStock, newStock, reason },
      });

      return product;
    });
  },
  async reconcilePhysicalStock(productId, physicalCount, discrepancyReason, actor = 'admin') {
    const products = readJsonSafe(filePaths.products, []);
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const systemStock = Number(product.stock || 0);
    const delta = Number(physicalCount) - systemStock;

    if (delta === 0) {
      return { message: 'Physical stock matches recorded balance exactly. No adjustment needed.', product };
    }

    const updated = await db.adjustStock(productId, {
      quantityDelta: delta,
      type: 'reconciliation',
      referenceType: 'physical_audit',
      referenceId: `RECON-${Date.now()}`,
      reason: `Physical count reconciliation. Recorded: ${systemStock}, Counted: ${physicalCount}. Reason: ${discrepancyReason || 'Periodic warehouse stocktake'}`,
      actor,
    });

    return {
      message: `Stock reconciled from ${systemStock} to ${physicalCount} (difference: ${delta > 0 ? '+' : ''}${delta})`,
      product: updated,
      adjustment: delta,
    };
  },

  // --- Orders ---
  getOrders() {
    return readJsonSafe(filePaths.orders, []);
  },
  getOrderById(id) {
    const orders = readJsonSafe(filePaths.orders, []);
    return orders.find(
      (o) =>
        (o.id && o.id.toLowerCase() === id.toLowerCase()) ||
        o.orderId.toLowerCase() === id.toLowerCase() ||
        o.trackingNumber.toLowerCase() === id.toLowerCase() ||
        (o.customer?.phone && o.customer.phone.includes(id))
    );
  },
  async createOrder(orderPayload) {
    return withLocks(['products', 'orders', 'inventoryLedger'], async () => {
      // 1. Concurrency safety: check stock for every item before deducting
      const products = readJsonSafe(filePaths.products, []);

      for (const item of orderPayload.items) {
        const pid = item.productId || item.id;
        const prod = products.find((p) => p.id === pid || p.sku === pid);
        if (prod) {
          const reqQty = Number(item.quantity || 1);
          if (prod.stock < reqQty) {
            throw new Error(`Insufficient stock for "${prod.title}". Only ${prod.stock} unit(s) available.`);
          }
        }
      }

      // 2. Decrement stock atomically and prepare item snapshots
      let calculatedSubtotal = 0;
      let calculatedCogs = 0;
      const orderItems = [];

      for (const item of orderPayload.items) {
        const pid = item.productId || item.id;
        const prod = products.find((p) => p.id === pid || p.sku === pid);
        const qty = Number(item.quantity || 1);
        const unitPrice = prod ? Number(prod.price) : Number(item.price || 0);
        const unitCost = prod ? Number(prod.costPrice || 0) : Math.round(unitPrice * 0.65);
        calculatedSubtotal += unitPrice * qty;
        calculatedCogs += unitCost * qty;

        if (prod) {
          prod.stock -= qty;
          prod.updatedAt = new Date().toISOString();
        }

        orderItems.push({
          productId: prod ? prod.id : pid,
          sku: prod ? prod.sku : `CRK-${pid}`,
          title: prod ? prod.title : item.name || item.title || 'Cricket Product',
          name: prod ? prod.title : item.name || item.title || 'Cricket Product',
          selectedSize: item.selectedSize || 'Standard',
          quantity: qty,
          unitPrice,
          unitCost,
          totalPrice: unitPrice * qty,
          image: prod?.images?.[0] || item.image || '',
        });
      }

      writeAtomicJson(filePaths.products, products);

      // 3. Financial calculations
      const discount = Number(orderPayload.discount || 0);
      const deliveryZone = orderPayload.deliveryZone || 'inside_dhaka';
      const freeShipping = (calculatedSubtotal - discount) >= 5000;
      const shipping = freeShipping ? 0 : (deliveryZone === 'inside_dhaka' ? 70 : 130);
      const total = Number((calculatedSubtotal - discount + shipping).toFixed(2));

      const now = new Date().toISOString();
      const orderId = `GZ-BD-${Date.now()}`;
      const trackingNumber = `GZ-TRK-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder = {
        id: orderId,
        orderId,
        trackingNumber,
        date: now,
        status: 'pending',
        fulfillmentStatus: 'pending',
        paymentMethod: orderPayload.paymentMethod || 'cod',
        paymentStatus: orderPayload.paymentMethod === 'cod' ? 'pending' : (orderPayload.trxId ? 'pending_verification' : 'pending'),
        paymentDetails: orderPayload.trxId ? { trxId: orderPayload.trxId, paymentChannel: orderPayload.paymentMethod, verificationStatus: 'pending_accounts_check' } : {},
        courier: orderPayload.courier || (deliveryZone === 'inside_dhaka' ? 'Steadfast Courier' : 'Pathao Courier'),
        deliveryZone,
        estimatedDelivery: deliveryZone === 'inside_dhaka' ? '24–48 Hours' : '2–4 Business Days',
        customer: {
          fullName: orderPayload.customer?.fullName || orderPayload.customer?.name || 'Cricket Customer',
          phone: orderPayload.customer?.phone || '01700000000',
          email: orderPayload.customer?.email || '',
          division: orderPayload.customer?.division || 'Dhaka',
          district: orderPayload.customer?.district || 'Dhaka',
          thana: orderPayload.customer?.thana || '',
          address: orderPayload.customer?.address || 'Dhaka, Bangladesh',
          postalCode: orderPayload.customer?.postalCode || '',
          notes: orderPayload.customer?.notes || '',
        },
        items: orderItems,
        financials: {
          currency: 'BDT',
          subtotal: calculatedSubtotal,
          discount,
          shipping,
          total,
          cogs: calculatedCogs,
        },
        history: [
          {
            timestamp: now,
            actor: 'Customer Checkout',
            action: 'Order Placed (Online)',
            note: `Payment Method: ${orderPayload.paymentMethod || 'COD'}`,
          },
        ],
      };

      // 4. Save order
      const orders = readJsonSafe(filePaths.orders, []);
      orders.unshift(newOrder);
      writeAtomicJson(filePaths.orders, orders);

      // 5. Record stock movement ledger entries
      for (const item of orderItems) {
        const prod = products.find((p) => p.id === item.productId);
        await db.addLedgerEntry({
          productId: item.productId,
          sku: item.sku,
          productTitle: item.title,
          type: 'order_deduction',
          quantity: -item.quantity,
          quantityDelta: -item.quantity,
          unitCost: item.unitCost,
          totalCost: item.unitCost * item.quantity,
          balanceAfter: prod ? prod.stock : 0,
          referenceType: 'order',
          referenceId: orderId,
          reason: `Sold via Order #${orderId}`,
          actor: 'Customer Checkout',
        });
      }

      await db.addAuditLog({
        actor: 'Customer Checkout',
        action: 'ORDER_PLACED',
        entity: 'order',
        entityId: orderId,
        details: { total, itemsCount: orderItems.length, paymentMethod: newOrder.paymentMethod },
      });

      return newOrder;
    });
  },
  async updateOrderStatus(orderId, { fulfillmentStatus, courier, trackingNumber, note, actor = 'admin' }) {
    return withLock('orders', async () => {
      const orders = readJsonSafe(filePaths.orders, []);
      const order = orders.find((o) => o.orderId === orderId);
      if (!order) throw new Error('Order not found');

      const oldStatus = order.fulfillmentStatus;
      if (fulfillmentStatus) {
        order.fulfillmentStatus = fulfillmentStatus;
        order.status = fulfillmentStatus;
      }
      if (courier) order.courier = courier;
      if (trackingNumber) order.trackingNumber = trackingNumber;

      const now = new Date().toISOString();
      order.history.unshift({
        timestamp: now,
        actor,
        action: `Status changed: ${oldStatus} ➔ ${fulfillmentStatus || oldStatus}`,
        note: note || '',
      });

      writeAtomicJson(filePaths.orders, orders);

      await db.addAuditLog({
        actor,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'order',
        entityId: orderId,
        details: { oldStatus, newStatus: fulfillmentStatus, note },
      });

      return order;
    });
  },
  async updatePaymentStatus(orderId, { paymentStatus, trxId, paymentChannel, note, actor = 'admin' }) {
    return withLock('orders', async () => {
      const orders = readJsonSafe(filePaths.orders, []);
      const order = orders.find((o) => o.orderId === orderId);
      if (!order) throw new Error('Order not found');

      const oldStatus = order.paymentStatus;
      order.paymentStatus = paymentStatus;
      if (!order.paymentDetails) order.paymentDetails = {};
      if (trxId) order.paymentDetails.trxId = trxId;
      if (paymentChannel) order.paymentDetails.paymentChannel = paymentChannel;

      if (paymentStatus === 'paid') {
        const settledTimestamp = new Date().toISOString();
        order.paymentDetails.settledAt = settledTimestamp;
        order.paymentDetails.settledBy = actor;
        order.codSettledAt = settledTimestamp;
      }

      const now = new Date().toISOString();
      order.history.unshift({
        timestamp: now,
        actor,
        action: `Payment status updated: ${oldStatus} ➔ ${paymentStatus}`,
        note: note || (paymentStatus === 'paid' ? 'Marked as collected / settled cash' : ''),
      });

      writeAtomicJson(filePaths.orders, orders);

      await db.addAuditLog({
        actor,
        action: 'ORDER_PAYMENT_UPDATED',
        entity: 'order',
        entityId: orderId,
        details: { oldStatus, newStatus: paymentStatus, amount: order.financials.total, trxId },
      });

      return order;
    });
  },
  async cancelOrder(orderId, { restock = true, reason = '', actor = 'admin' }) {
    return withLocks(['orders', 'products', 'inventoryLedger'], async () => {
      const orders = readJsonSafe(filePaths.orders, []);
      const order = orders.find((o) => o.orderId === orderId || o.id === orderId);
      if (!order) throw new Error('Order not found');

      if (order.fulfillmentStatus === 'cancelled' || order.status === 'cancelled') {
        throw new Error('Order is already cancelled');
      }

      // Restore stock if requested
      if (restock && order.items && order.items.length > 0) {
        for (const item of order.items) {
          await db.adjustStock(item.productId, {
            quantityDelta: item.quantity,
            type: 'cancellation_restock',
            referenceType: 'order_cancellation',
            referenceId: order.orderId || orderId,
            reason: `Restock due to order cancellation: ${reason || 'Customer request'}`,
            actor,
          });
        }
      }

      return await db.updateOrderStatus(orderId, {
        fulfillmentStatus: 'cancelled',
        note: `Order cancelled by ${actor}. ${restock ? 'Inventory restored to Dhaka warehouse.' : 'Inventory not restored.'} Reason: ${reason}`,
        actor,
      });
    });
  },
  async deleteOrder(id, actor = 'admin') {
    return withLock('orders', async () => {
      const orders = readJsonSafe(filePaths.orders, []);
      const index = orders.findIndex((o) => o.id === id || o.orderId === id);
      if (index === -1) throw new Error('Order not found');
      const [deleted] = orders.splice(index, 1);
      writeAtomicJson(filePaths.orders, orders);
      await db.addAuditLog({
        actor,
        action: 'ORDER_DELETED',
        entity: 'order',
        entityId: deleted.orderId || id,
        details: { total: deleted.financials?.total },
      });
      return deleted;
    });
  },

  // --- Suppliers & Purchases ---
  getSuppliers() {
    return readJsonSafe(filePaths.suppliers, []);
  },
  async saveSupplier(supplierData, actor = 'admin') {
    return withLock('suppliers', async () => {
      const suppliers = readJsonSafe(filePaths.suppliers, []);
      let saved;
      const index = suppliers.findIndex((s) => s.id === supplierData.id);

      if (index !== -1) {
        saved = { ...suppliers[index], ...supplierData, id: suppliers[index].id, updatedAt: new Date().toISOString() };
        suppliers[index] = saved;
      } else {
        const generatedId = supplierData.id || `sup-${Date.now().toString().slice(-4)}`;
        saved = {
          totalPurchases: 0,
          balanceOwed: 0,
          createdAt: new Date().toISOString(),
          ...supplierData,
          id: generatedId,
        };
        suppliers.unshift(saved);
      }

      writeAtomicJson(filePaths.suppliers, suppliers);
      await db.addAuditLog({
        actor,
        action: index !== -1 ? 'SUPPLIER_UPDATED' : 'SUPPLIER_CREATED',
        entity: 'supplier',
        entityId: saved.id,
        details: { name: saved.name },
      });
      return saved;
    });
  },
  async deleteSupplier(id, actor = 'admin') {
    return withLock('suppliers', async () => {
      const suppliers = readJsonSafe(filePaths.suppliers, []);
      const index = suppliers.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Supplier not found');
      const [deleted] = suppliers.splice(index, 1);
      writeAtomicJson(filePaths.suppliers, suppliers);
      await db.addAuditLog({
        actor,
        action: 'SUPPLIER_DELETED',
        entity: 'supplier',
        entityId: id,
        details: { name: deleted.name },
      });
      return deleted;
    });
  },
  getPurchases() {
    return readJsonSafe(filePaths.purchases, []);
  },
  async createPurchaseOrder(poData, actor = 'admin') {
    return withLock('purchases', async () => {
      const purchases = readJsonSafe(filePaths.purchases, []);
      const poNumber = poData.poNumber || `PO-2026-${String(purchases.length + 1).padStart(3, '0')}`;
      const id = poData.id || `po-${Date.now()}`;
      const now = new Date().toISOString();

      let itemsTotal = 0;
      const items = (poData.items || []).map((it) => {
        const qty = Number(it.quantity || 0);
        const cost = Number(it.unitCost || 0);
        const lineTotal = qty * cost;
        itemsTotal += lineTotal;
        return {
          productId: it.productId,
          sku: it.sku,
          title: it.title,
          quantity: qty,
          unitCost: cost,
          totalCost: lineTotal,
        };
      });

      const additionalCosts = Number(poData.additionalCosts || 0);
      const totalAmount = itemsTotal + additionalCosts;
      const amountPaid = Number(poData.amountPaid || 0);
      const balanceDue = Math.max(0, totalAmount - amountPaid);
      const paymentStatus = amountPaid >= totalAmount ? 'paid' : (amountPaid > 0 ? 'partial' : 'unpaid');

      const po = {
        id,
        poNumber,
        supplierId: poData.supplierId,
        supplierName: poData.supplierName,
        date: poData.date || now,
        status: poData.status || 'received',
        items,
        additionalCosts,
        totalAmount,
        paymentStatus,
        amountPaid,
        balanceDue,
        paymentReference: poData.paymentReference || '',
        notes: poData.notes || '',
        receivedBy: poData.receivedBy || actor,
        createdAt: now,
      };

      purchases.unshift(po);
      writeAtomicJson(filePaths.purchases, purchases);

      // If status is received, perform automatic stock-in and update weighted average cost!
      if (po.status === 'received') {
        const products = readJsonSafe(filePaths.products, []);
        for (const it of items) {
          const prod = products.find((p) => p.id === it.productId);
          if (prod) {
            const oldStock = Number(prod.stock || 0);
            const oldCost = Number(prod.costPrice || 0);
            const incomingQty = Number(it.quantity);
            const incomingCost = Number(it.unitCost);

            // Documented Weighted Average Cost calculation:
            const newStock = oldStock + incomingQty;
            const newWeightedCost = newStock > 0
              ? Math.round(((oldStock * oldCost) + (incomingQty * incomingCost)) / newStock)
              : incomingCost;

            prod.stock = newStock;
            prod.costPrice = newWeightedCost;
            prod.updatedAt = now;

            // Add ledger entry
            await db.addLedgerEntry({
              productId: prod.id,
              sku: prod.sku,
              productTitle: prod.title,
              type: 'purchase',
              quantityDelta: incomingQty,
              unitCost: incomingCost,
              totalCost: it.totalCost,
              balanceAfter: newStock,
              referenceType: 'purchase_order',
              referenceId: po.poNumber,
              reason: `Stock receipt from ${po.supplierName} (PO #${po.poNumber})`,
              actor,
            });
          }
        }
        writeAtomicJson(filePaths.products, products);

        // Update supplier balance
        const suppliers = readJsonSafe(filePaths.suppliers, []);
        const sup = suppliers.find((s) => s.id === po.supplierId);
        if (sup) {
          sup.totalPurchases = (sup.totalPurchases || 0) + totalAmount;
          sup.balanceOwed = (sup.balanceOwed || 0) + balanceDue;
          writeAtomicJson(filePaths.suppliers, suppliers);
        }
      }

      await db.addAuditLog({
        actor,
        action: 'PURCHASE_ORDER_CREATED',
        entity: 'purchase',
        entityId: po.poNumber,
        details: { supplier: po.supplierName, total: totalAmount, itemsCount: items.length },
      });

      return po;
    });
  },
  async receivePurchaseOrder(poId, actor = 'admin') {
    return withLocks(['purchases', 'products', 'inventoryLedger'], async () => {
      const purchases = readJsonSafe(filePaths.purchases, []);
      const po = purchases.find((p) => p.id === poId || p.poNumber === poId || p.referenceNo === poId);
      if (!po) throw new Error('Purchase order not found');
      if (po.status === 'received') return po;

      po.status = 'received';
      po.receivedAt = new Date().toISOString();
      po.receivedBy = actor;

      const products = readJsonSafe(filePaths.products, []);
      for (const it of po.items || []) {
        const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
        if (prod) {
          const oldStock = Number(prod.stock || 0);
          const oldCost = Number(prod.costPrice || 0);
          const incomingQty = Number(it.quantity);
          const incomingCost = Number(it.unitCost);

          const newStock = oldStock + incomingQty;
          const newWeightedCost = newStock > 0
            ? Math.round(((oldStock * oldCost) + (incomingQty * incomingCost)) / newStock)
            : incomingCost;

          prod.stock = newStock;
          prod.costPrice = newWeightedCost;
          prod.updatedAt = new Date().toISOString();

          await db.addLedgerEntry({
            productId: prod.id,
            sku: prod.sku,
            productTitle: prod.title,
            type: 'purchase_receive',
            quantity: incomingQty,
            quantityDelta: incomingQty,
            unitCost: incomingCost,
            totalCost: incomingQty * incomingCost,
            balanceAfter: newStock,
            referenceType: 'purchase_order',
            referenceId: po.poNumber || po.id,
            reason: `Stock receipt from ${po.supplierName || 'supplier'} (PO #${po.poNumber || po.id})`,
            actor,
          });
        }
      }
      writeAtomicJson(filePaths.products, products);
      writeAtomicJson(filePaths.purchases, purchases);

      await db.addAuditLog({
        actor,
        action: 'PURCHASE_ORDER_RECEIVED',
        entity: 'purchase',
        entityId: po.poNumber || po.id,
        details: { supplier: po.supplierName, total: po.totalAmount },
      });

      return po;
    });
  },
  async deletePurchase(id, actor = 'admin') {
    return withLock('purchases', async () => {
      const purchases = readJsonSafe(filePaths.purchases, []);
      const index = purchases.findIndex((p) => p.id === id);
      if (index === -1) throw new Error('Purchase order not found');
      const [deleted] = purchases.splice(index, 1);
      writeAtomicJson(filePaths.purchases, purchases);
      await db.addAuditLog({
        actor,
        action: 'PURCHASE_DELETED',
        entity: 'purchase',
        entityId: id,
        details: { poNumber: deleted.poNumber },
      });
      return deleted;
    });
  },

  // --- Expenses ---
  getExpenses() {
    return readJsonSafe(filePaths.expenses, []);
  },
  async createExpense(expenseData, actor = 'admin') {
    return withLock('expenses', async () => {
      const expenses = readJsonSafe(filePaths.expenses, []);
      const newExpense = {
        id: `EXP-${Date.now()}`,
        category: expenseData.category || 'other',
        amount: Number(expenseData.amount || 0),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        description: expenseData.description || 'General operating expense',
        paymentMethod: expenseData.paymentMethod || 'cash',
        recordedBy: actor,
        receiptRef: expenseData.receiptRef || '',
        createdAt: new Date().toISOString(),
      };
      expenses.unshift(newExpense);
      writeAtomicJson(filePaths.expenses, expenses);

      await db.addAuditLog({
        actor,
        action: 'EXPENSE_RECORDED',
        entity: 'expense',
        entityId: newExpense.id,
        details: { category: newExpense.category, amount: newExpense.amount, description: newExpense.description },
      });

      return newExpense;
    });
  },
  async deleteExpense(id, actor = 'admin') {
    return withLock('expenses', async () => {
      const expenses = readJsonSafe(filePaths.expenses, []);
      const index = expenses.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Expense not found');
      const [deleted] = expenses.splice(index, 1);
      writeAtomicJson(filePaths.expenses, expenses);
      await db.addAuditLog({
        actor,
        action: 'EXPENSE_DELETED',
        entity: 'expense',
        entityId: id,
        details: { category: deleted.category, amount: deleted.amount },
      });
      return deleted;
    });
  },

  // --- Audit Logs ---
  getAuditLogs() {
    return readJsonSafe(filePaths.auditLogs, []);
  },
  async addAuditLog({ actor, action, entity, entityId, details = {}, ip = '127.0.0.1', role = 'admin' }) {
    const logs = readJsonSafe(filePaths.auditLogs, []);
    const entry = {
      id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      entity,
      entityId,
      details,
      ip,
    };
    logs.unshift(entry);
    if (logs.length > 500) logs.pop(); // Keep recent 500 audit logs
    writeAtomicJson(filePaths.auditLogs, logs);
    return entry;
  },

  // --- Admin Auth ---
  getAdmins() {
    return readJsonSafe(filePaths.admins, []);
  },
  getAdminByUsernameOrEmail(identifier) {
    const admins = readJsonSafe(filePaths.admins, []);
    const lower = identifier.toLowerCase().trim();
    return admins.find((a) => a.username.toLowerCase() === lower || a.email.toLowerCase() === lower);
  },
  async changeAdminPassword(username, currentPassword, newPassword) {
    return withLock('admins', async () => {
      const admins = readJsonSafe(filePaths.admins, []);
      const lower = username.toLowerCase().trim();
      const admin = admins.find((a) => a.username.toLowerCase() === lower || a.email.toLowerCase() === lower);
      if (!admin) return false;
      const isValid = verifyPassword(currentPassword, admin.salt, admin.passwordHash);
      if (!isValid) return false;
      const { hash, salt } = hashPassword(newPassword);
      admin.passwordHash = hash;
      admin.salt = salt;
      admin.updatedAt = new Date().toISOString();
      writeAtomicJson(filePaths.admins, admins);
      await db.addAuditLog({
        actor: admin.username,
        role: admin.role,
        action: 'PASSWORD_CHANGED',
        entity: 'admin',
        entityId: admin.id,
        details: { message: 'Administrative password updated successfully' },
      });
      return true;
    });
  },
};
