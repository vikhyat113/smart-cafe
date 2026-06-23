/**
 * Generates static QR code PNG images for every table, pointing at
 * <FRONTEND_URL>/table/<n>. Run with: npm run generate-qr
 *
 * Tables are fixed (default 30), so this only needs to be re-run if the
 * number of tables or the frontend domain changes.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const TOTAL_TABLES = parseInt(process.env.TOTAL_TABLES, 10) || 30;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const outDir = path.join(__dirname, '..', 'public', 'qrcodes');

async function run() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Generating QR codes for ${TOTAL_TABLES} tables -> ${outDir}`);

  for (let table = 1; table <= TOTAL_TABLES; table += 1) {
    const url = `${FRONTEND_URL}/table/${table}`;
    const filePath = path.join(outDir, `table-${table}.png`);
    await QRCode.toFile(filePath, url, {
      width: 500,
      margin: 2,
      color: { dark: '#1c1917', light: '#ffffff' },
    });
    console.log(`  table ${table}: ${url} -> table-${table}.png`);
  }

  console.log('Done. QR codes are served at /qrcodes/table-<n>.png');
  process.exit(0);
}

run().catch((err) => {
  console.error('Failed to generate QR codes:', err);
  process.exit(1);
});
