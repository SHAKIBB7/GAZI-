import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authenticateAdmin } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, '../../public/uploads');

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `cricket_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype;
    if (allowed.test(ext) && mime.startsWith('image/') && mime !== 'image/svg+xml') {
      return cb(null, true);
    }
    cb(new Error('Only standard secure raster image files (JPG, PNG, WebP, GIF) are permitted. SVG is disabled for security.'));
  },
});

const router = express.Router();

// Upload single or multiple images
router.post('/', authenticateAdmin, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);

    res.json({
      success: true,
      message: `${req.files.length} image(s) uploaded successfully`,
      urls: fileUrls,
      primaryUrl: fileUrls[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
