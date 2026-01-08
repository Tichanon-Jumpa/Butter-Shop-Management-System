require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 30032;

const TABLE_NAME = 'Final_Tic_Jum_Inventory';
const COL = {
  ID: 'Tic_Jum_ID_Product',
  NAME: 'Tic_Jum_Name',
  PRICE: 'Tic_jum_Price_Unit', 
  QTY: 'Tic_Jum_Qty_Stock',
  IMG: 'Tic_Jum_Img_Path',
};

const uploadDir = '/var/www/html/std6630251296/Inventory/uploads/images';
const publicBase = 'http://nindam.sytes.net/std6630251296/Inventory/uploads/images';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use('/uploads/images', express.static(uploadDir));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = mysql.createPool({
  host: process.env.DB_HOST,          
  user: process.env.DB_USER,          
  password: process.env.DB_PASSWORD,   
  database: process.env.DB_NAME,     
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+07:00',
});

pool.getConnection()
  .then((c) => { console.log('✅ DB connected'); c.release(); })
  .catch((e) => console.error('❌ DB connect error:', e.message, e.code));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname || '').replace('.', '') || 'jpg').toLowerCase();
    cb(null, `${uuidv4()}.${ext}`);
  },
});
const upload = multer({ storage });

const uploadEitherImage = upload.fields([
  { name: 'Image', maxCount: 1 },
  { name: 'Tic_Jum_Img_Path', maxCount: 1 },
]);

function pickFields(req) {
  const b = req.body || {};
  const Name     = b.Tic_Jum_Name       ?? b.Name     ?? b.name     ?? null;
  const Price    = b.Tic_jum_Price_Unit ?? b.Price    ?? b.price    ?? null;
  const Quantity = b.Tic_Jum_Qty_Stock  ?? b.Quantity ?? b.quantity ?? null;
  return { Name, Price, Quantity };
}

function pickImageFile(req) {
  const f1 = req.files?.Image?.[0];
  const f2 = req.files?.Tic_Jum_Img_Path?.[0];
  return f1 || f2 || null;
}

function toNumberOrNull(v) {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function makePublicUrl(filename) {
  return `${publicBase}/${filename}`;
}

function tryRemoveFileByUrl(url) {
  try {
    if (!url) return;
    const oldFile = String(url).split('/').pop();
    const p = path.join(uploadDir, oldFile);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (e) {
    console.warn('⚠️ remove old file failed:', e.message);
  }
}

app.get('/api', (req, res) => res.json({ message: 'API is running (Final_Tic_Jum_Inventory)' }));

app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         \`${COL.ID}\`   AS id,
         \`${COL.NAME}\` AS name,
         \`${COL.PRICE}\` AS price,
         \`${COL.QTY}\`   AS quantity,
         \`${COL.IMG}\`   AS imageUrl
       FROM \`${TABLE_NAME}\`
       ORDER BY \`${COL.ID}\` DESC`
    );
    res.json(rows);
  } catch (e) {
    console.error('GET /products error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const [rows] = await pool.query(
      `SELECT
         \`${COL.ID}\`   AS id,
         \`${COL.NAME}\` AS name,
         \`${COL.PRICE}\` AS price,
         \`${COL.QTY}\`   AS quantity,
         \`${COL.IMG}\`   AS imageUrl
       FROM \`${TABLE_NAME}\`
       WHERE \`${COL.ID}\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error('GET /products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/products', uploadEitherImage, async (req, res) => {
  try {
    const { Name, Price, Quantity } = pickFields(req);
    if (!Name || String(Name).trim() === '') {
      return res.status(400).json({ error: 'Name is required.' });
    }

    let imageUrl = null;
    const file = pickImageFile(req);
    if (file) imageUrl = makePublicUrl(file.filename);

    const priceVal = toNumberOrNull(Price);
    const qtyVal   = toNumberOrNull(Quantity);

    const [result] = await pool.query(
      `INSERT INTO \`${TABLE_NAME}\`
        (\`${COL.NAME}\`, \`${COL.PRICE}\`, \`${COL.QTY}\`, \`${COL.IMG}\`)
       VALUES (?, ?, ?, ?)`,
      [Name, priceVal, qtyVal, imageUrl]
    );

    res.status(201).json({
      success: true,
      productId: result.insertId,
      product: {
        id: result.insertId,
        name: Name,
        price: priceVal,
        quantity: qtyVal,
        imageUrl,
      },
    });
  } catch (e) {
    console.error('POST /products error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/products/:id', uploadEitherImage, async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const [rows] = await pool.query(
      `SELECT \`${COL.NAME}\` AS name, \`${COL.PRICE}\` AS price, \`${COL.QTY}\` AS quantity, \`${COL.IMG}\` AS imageUrl
       FROM \`${TABLE_NAME}\`
       WHERE \`${COL.ID}\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    const old = rows[0];
    const { Name, Price, Quantity } = pickFields(req);

    const newName = (Name !== null && Name !== undefined) ? Name : old.name;
    const newPrice = (Price !== null && Price !== undefined && Price !== '')
      ? toNumberOrNull(Price) : old.price;
    const newQty = (Quantity !== null && Quantity !== undefined && Quantity !== '')
      ? toNumberOrNull(Quantity) : old.quantity;

    let newImageUrl = old.imageUrl;
    const file = pickImageFile(req);
    if (file) {
      newImageUrl = makePublicUrl(file.filename);
      if (old.imageUrl) tryRemoveFileByUrl(old.imageUrl);
    }

    await pool.query(
      `UPDATE \`${TABLE_NAME}\`
         SET \`${COL.NAME}\`=?, \`${COL.PRICE}\`=?, \`${COL.QTY}\`=?, \`${COL.IMG}\`=?
       WHERE \`${COL.ID}\`=?`,
      [newName, newPrice, newQty, newImageUrl, id]
    );

    res.json({
      success: true,
      product: {
        id,
        name: newName,
        price: newPrice === null || newPrice === undefined ? null : Number(newPrice),
        quantity: newQty === null || newQty === undefined ? null : Number(newQty),
        imageUrl: newImageUrl,
      },
    });
  } catch (e) {
    console.error('PUT /products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'Invalid id' });

    const [rows] = await pool.query(
      `SELECT \`${COL.IMG}\` AS imageUrl FROM \`${TABLE_NAME}\` WHERE \`${COL.ID}\` = ?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });

    if (rows[0].imageUrl) tryRemoveFileByUrl(rows[0].imageUrl);

    const [result] = await pool.query(
      `DELETE FROM \`${TABLE_NAME}\` WHERE \`${COL.ID}\` = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found or already deleted' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (e) {
    console.error('DELETE /products/:id error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
