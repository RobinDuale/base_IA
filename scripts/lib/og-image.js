// og-image.js -- Génération de l'image Open Graph 1200x630

const sharp = require("sharp");
const zlib = require("zlib");

// Génère l'image OG 1200x630 qui reproduit le style hero du site
async function generateOGImage(nbOutils, nbLLMs, nbCategories) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#ffffff"/>
    <rect width="1200" height="4" fill="#2c4fb4"/>

    <!-- Logo Base IA -->
    <text x="56" y="58" font-family="Arial, Liberation Sans, sans-serif" font-size="20" font-weight="600" fill="#1a1815">Base <tspan fill="#2c4fb4" font-weight="700">IA</tspan></text>

    <!-- Ligne de séparation -->
    <line x1="56" y1="72" x2="1144" y2="72" stroke="#e7e7e3" stroke-width="1"/>

    <!-- Titre ligne 1 -->
    <text x="56" y="210" font-family="Arial, Liberation Sans, sans-serif" font-size="74" font-weight="700" fill="#1a1815">Une biblioth&#232;que <tspan fill="#2c4fb4" font-weight="800">vivante</tspan></text>

    <!-- Titre ligne 2 -->
    <text x="56" y="298" font-family="Arial, Liberation Sans, sans-serif" font-size="74" font-weight="700" fill="#1a1815">des outils IA &amp; No-Code.</text>

    <!-- Description -->
    <text x="56" y="360" font-family="Arial, Liberation Sans, sans-serif" font-size="19" fill="#75706a">R&#233;f&#233;rence pratique des meilleurs outils IA et No-Code s&#233;lectionn&#233;s par Robin Dual&#233;.</text>

    <!-- Séparateur KPIs -->
    <line x1="56" y1="420" x2="520" y2="420" stroke="#e7e7e3" stroke-width="1"/>

    <!-- KPI Outils -->
    <text x="56" y="472" font-family="Arial, Liberation Sans, sans-serif" font-size="46" font-weight="500" fill="#1a1815">${nbOutils}</text>
    <text x="56" y="500" font-family="Courier New, Liberation Mono, monospace" font-size="11" fill="#75706a">OUTILS R&#201;F&#201;RENC&#201;S</text>

    <!-- KPI LLMs -->
    <text x="220" y="472" font-family="Arial, Liberation Sans, sans-serif" font-size="46" font-weight="500" fill="#1a1815">${nbLLMs}</text>
    <text x="220" y="500" font-family="Courier New, Liberation Mono, monospace" font-size="11" fill="#75706a">GRANDS MOD&#200;LES</text>

    <!-- KPI Catégories -->
    <text x="370" y="472" font-family="Arial, Liberation Sans, sans-serif" font-size="46" font-weight="500" fill="#1a1815">${nbCategories}</text>
    <text x="370" y="500" font-family="Courier New, Liberation Mono, monospace" font-size="11" fill="#75706a">CAT&#201;GORIES</text>

    <!-- URL bas droite -->
    <text x="1144" y="608" font-family="Courier New, Liberation Mono, monospace" font-size="14" fill="#75706a" text-anchor="end">ia.duale.fr</text>
  </svg>`;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}

// Génère un PNG solide (fond uni) en pur Node.js, sans dépendance externe
function genererPNGSolide(largeur, hauteur, r, g, b) {
  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }
  function chunk(type, data) {
    const typeBuf = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largeur, 0);
  ihdr.writeUInt32BE(hauteur, 4);
  ihdr.writeUInt8(8, 8); ihdr.writeUInt8(2, 9);
  ihdr.writeUInt8(0, 10); ihdr.writeUInt8(0, 11); ihdr.writeUInt8(0, 12);
  const rowSize = largeur * 3 + 1;
  const raw = Buffer.alloc(hauteur * rowSize);
  for (let y = 0; y < hauteur; y++) {
    const off = y * rowSize;
    raw[off] = 0;
    for (let x = 0; x < largeur; x++) {
      raw[off + x * 3 + 1] = r;
      raw[off + x * 3 + 2] = g;
      raw[off + x * 3 + 3] = b;
    }
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

module.exports = { generateOGImage, genererPNGSolide };
