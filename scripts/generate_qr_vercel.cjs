const QRCode = require('../portal/node_modules/qrcode');
const path = require('path');

async function run() {
  const url = process.argv[2] || 'https://speedy-emerald-48faldn.tmp.now';
  const rootDir = path.resolve(__dirname, '..');
  
  const targets = [
    path.join(rootDir, 'qr-vercel.png'),
    path.join(rootDir, 'qr-phone.png'),
    path.join(rootDir, 'assets', 'qr-vercel.png'),
    path.join(rootDir, 'assets', 'qr-phone.png'),
    path.join(rootDir, 'portal', 'public', 'qr-phone.png')
  ];

  for (const t of targets) {
    await QRCode.toFile(t, url, {
      width: 480,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' }
    });
  }

  console.log('Successfully generated QR codes for: ' + url);
}

run().catch(console.error);
