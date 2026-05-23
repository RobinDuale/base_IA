// config.js -- Constantes partagées entre tous les modules du build

const BASE_URL = "https://ia.duale.fr";

// Code de vérification Google Search Console
// A renseigner : GSC > Paramètres > Vérification de la propriété > Balise HTML
// Exemple : "AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
const GOOGLE_VERIFICATION = "";

// Meta tag généré uniquement si le code est renseigné
const META_GOOGLE = GOOGLE_VERIFICATION
  ? `  <meta name="google-site-verification" content="${GOOGLE_VERIFICATION}"/>`
  : "";

// Meta robots index/follow (explicite -- meilleure pratique SEO)
const META_ROBOTS_INDEX = `  <meta name="robots" content="index, follow"/>`;

const OG_IMAGE = `${BASE_URL}/assets/og-default.png`;
const OG_IMAGE_ALT = "Base IA -- Référence des outils IA et No-Code par Robin Dualé";
const SITE_NAME = "Base IA · Robin Dualé";
const AUTHOR_NAME = "Robin Dualé";
const AUTHOR_URL = "https://cv-robin.duale.fr";
const DATE_PUBLISHED = "2026-05-16T00:00:00+02:00";
const DATE_MODIFIED = new Date().toISOString().replace(/\.\d{3}Z$/, '+02:00');

const COULEURS_CATEGORIE = {
  LLMs:            "#8b5cf6",
  "No-Code":       "#22c55e",
  Productivité:    "#eab308",
  Créativité:      "#f97316",
  IA:              "#3b82f6",
  Automatisation:  "#f97316",
  "Base de données": "#8b5cf6",
  Développement:   "#ef4444",
  Scraping:        "#a16207",
  Hébergement:     "#ec4899",
};

const COULEURS_TAG = {
  CRM:             "#3b82f6",
  Veille:          "#22c55e",
  Prospection:     "#f97316",
  Workflow:        "#8b5cf6",
  Scraping:        "#d97706",
  IA:              "#ec4899",
  Hébergement:     "#14b8a6",
  Search:          "#6b7280",
  Monitoring:      "#22c55e",
  AI:              "#ec4899",
  Agentic:         "#8b5cf6",
  Research:        "#3b82f6",
  Academic:        "#6b7280",
  Image:           "#f97316",
  "Generative AI": "#ec4899",
  Video:           "#ef4444",
  Avatar:          "#6b7280",
  Automation:      "#f97316",
  "Self-hosted":   "#a16207",
  API:             "#3b82f6",
  Data:            "#6b7280",
  "App Builder":   "#8b5cf6",
  Dev:             "#ef4444",
  Database:        "#8b5cf6",
  Backend:         "#6b7280",
  Hosting:         "#14b8a6",
  Deployment:      "#6b7280",
  Website:         "#3b82f6",
  Email:           "#3b82f6",
  "Lead Gen":      "#f97316",
  Enrichment:      "#eab308",
  Collaboration:   "#22c55e",
  Chat:            "#3b82f6",
  Workspace:       "#8b5cf6",
  Docs:            "#6b7280",
  Repository:      "#a16207",
  Apple:           "#6b7280",
  "No-Code":       "#22c55e",
};

const GA_TAG = `<script>
  function loadGA() {
    if (window._gaLoaded) return;
    if (document.cookie.split(';').some(function(c){return c.trim().startsWith('ga_exclude=1');})) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-61ZR41S7J7';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-61ZR41S7J7');
  }
  function acceptCookies() {
    localStorage.setItem('cookie_consent', 'accepted');
    var b = document.getElementById('cookie-banner');
    if (b) b.style.display = 'none';
    loadGA();
  }
  function refuseCookies() {
    localStorage.setItem('cookie_consent', 'refused');
    var b = document.getElementById('cookie-banner');
    if (b) b.style.display = 'none';
  }
  (function() {
    var consent = localStorage.getItem('cookie_consent');
    if (consent === 'accepted') {
      loadGA();
    } else if (consent === null) {
      document.addEventListener('DOMContentLoaded', function() {
        var b = document.getElementById('cookie-banner');
        if (b) b.style.display = 'flex';
      });
    }
  })();
</script>`;

const COOKIE_BANNER = `<div id="cookie-banner" style="display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:1200px;z-index:9999;background:var(--ink);padding:20px 56px;display:none;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;box-shadow:0 -4px 24px rgba(26,23,18,0.2);">
  <p style="font-family:var(--font-body);font-size:13px;color:rgba(255,255,255,0.8);line-height:1.6;flex:1;margin:0;">Ce site utilise Google Analytics pour mesurer son audience de facon anonymisee. Acceptez-vous le depot de cookies analytiques ? <a href="/mentions-legales.html" style="color:#fff;text-decoration:underline;">En savoir plus</a></p>
  <div style="display:flex;gap:10px;flex-shrink:0;">
    <button onclick="acceptCookies()" style="padding:9px 22px;background:var(--accent);color:#fff;font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:0.12em;border:none;border-radius:var(--rayon-pill);cursor:pointer;">Accepter</button>
    <button onclick="refuseCookies()" style="padding:9px 22px;background:transparent;color:rgba(255,255,255,0.6);font-family:var(--font-mono);font-size:12px;text-transform:uppercase;letter-spacing:0.12em;border:1px solid rgba(255,255,255,0.25);border-radius:var(--rayon-pill);cursor:pointer;">Refuser</button>
  </div>
</div>`;

module.exports = {
  BASE_URL,
  GOOGLE_VERIFICATION,
  META_GOOGLE,
  META_ROBOTS_INDEX,
  OG_IMAGE,
  OG_IMAGE_ALT,
  SITE_NAME,
  AUTHOR_NAME,
  AUTHOR_URL,
  DATE_PUBLISHED,
  DATE_MODIFIED,
  COULEURS_CATEGORIE,
  COULEURS_TAG,
  GA_TAG,
  COOKIE_BANNER,
};
