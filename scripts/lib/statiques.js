// statiques.js -- Pages statiques : mentions légales, confirmation, admin propositions

const { BASE_URL, GA_TAG, COOKIE_BANNER } = require("./config");

function genererMentionsLegales() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Mentions légales · Base IA · Robin Dualé</title>
  <meta name="description" content="Mentions légales du site ia.duale.fr -- éditeur Robin Dualé, hébergeur GitHub Pages, propriété intellectuelle et données personnelles RGPD."/>
  <meta name="robots" content="noindex, follow"/>
  <link rel="canonical" href="${BASE_URL}/mentions-legales.html"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png"/>
  <link rel="apple-touch-icon" sizes="48x48" href="/assets/favicon-48.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
</head>
<body>
<header>
  <h1><a href="/"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:5px;opacity:0.75"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>Base <em>IA</em></a></h1>
  <a href="/" class="retour">&#8592; Retour a la base</a>
</header>

<main>
  <div class="page-simple">
    <div class="page-simple-eyebrow">Cadre legal</div>
    <h1 class="page-simple-h1">Mentions legales</h1>

    <div class="section">
      <h2>Editeur</h2>
      <p>Robin Duale<br/>
      Email : <a href="mailto:robin@duale.fr">robin@duale.fr</a><br/>
      Site : <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a></p>
    </div>

    <div class="section">
      <h2>Hebergement</h2>
      <p>GitHub Pages · GitHub, Inc.<br/>
      88 Colin P. Kelly Jr. St, San Francisco, CA 94107, Etats-Unis<br/>
      <a href="https://pages.github.com" target="_blank" rel="noopener noreferrer">pages.github.com</a></p>
    </div>

    <div class="section">
      <h2>Propriete intellectuelle</h2>
      <p>La structure, la selection et l'organisation des contenus de ce site sont la propriete de Robin Duale. Les textes descriptifs sont principalement produits avec l'assistance d'outils d'IA. Toute reproduction de la structure ou de l'organisation sans autorisation est interdite.</p>
    </div>

    <div class="section">
      <h2>Donnees personnelles &amp; RGPD</h2>
      <p>Ce site utilise Google Analytics (GA4) pour mesurer l'audience de facon anonymisee. Ce service depose des cookies de mesure d'audience sur votre appareil. Les donnees collectees (pages visitees, duree, provenance) sont transmises a Google et soumises a leur politique de confidentialite. Vous pouvez vous y opposer en installant le module de desactivation Google Analytics disponible sur <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">tools.google.com/dlpage/gaoptout</a>.</p>
      <p style="margin-top:10px;">Ce site n'utilise pas de cookies publicitaires ou de tracking commercial.</p>
      <p style="margin-top:10px;">Dans le cadre du formulaire de proposition d'outil, une adresse email est collectee uniquement pour confirmer la soumission et vous notifier de la decision. Elle n'est pas utilisee a des fins commerciales ni transmise a des tiers. Vous pouvez demander sa suppression a tout moment en ecrivant a <a href="mailto:robin@duale.fr">robin@duale.fr</a>.</p>
    </div>
  </div>
</main>
<footer>
  <div class="footer-contenu">
    <div class="footer-gauche">
      <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
    </div>
    <div class="footer-liens">
      <a href="https://www.linkedin.com/in/robinduale" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a>
      <a href="/mentions-legales.html">Mentions légales</a>
    </div>
  </div>
</footer>
${COOKIE_BANNER}
</body>
</html>`;
}

function genererPageConfirmation() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Proposition confirmée · Base IA</title>
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
</head>
<body>
<header>
  <h1><a href="/"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:5px;opacity:0.75"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>Base <em>IA</em></a></h1>
  <a class="retour" href="/">&#8592; Retour a la base</a>
</header>

<main>
  <div class="page-simple" style="text-align:center;padding-top:64px;">
    <div style="width:56px;height:56px;background:#2a7256;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:24px;font-size:1.5rem;color:#fff;font-weight:500;">&#10003;</div>
    <div class="page-simple-eyebrow">Proposition recue</div>
    <h1 class="page-simple-h1">Merci pour votre contribution&nbsp;!</h1>
    <p style="font-size:18px;line-height:1.65;color:var(--ink);max-width:480px;margin:0 auto 32px;">
      Votre adresse email a bien été confirmée. Robin va examiner votre proposition et vous recevrez un email si l'outil est validé et ajouté à la Base IA.
    </p>
    <a href="/" class="fiche-action fiche-action--primary" style="font-weight:500;">Retour à Base IA &#8594;</a>
  </div>
</main>
<footer>
  <div class="footer-contenu">
    <div class="footer-gauche">
      <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
    </div>
    <div class="footer-liens">
      <a href="https://www.linkedin.com/in/robinduale" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a>
      <a href="/mentions-legales.html">Mentions légales</a>
    </div>
  </div>
</footer>
${COOKIE_BANNER}
</body>
</html>`;
}

function genererAdminPropositions() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Propositions · Admin · Base IA</title>
  <meta name="robots" content="noindex, nofollow"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="stylesheet" href="/styles.css"/>
  ${GA_TAG}
  <style>
    .prop-table { width:100%; border-collapse:collapse; font-size:0.9rem; }
    .prop-table th { text-align:left; padding:10px 12px; border-bottom:2px solid #e5e1d8; font-weight:600; color:#555; font-size:0.8rem; text-transform:uppercase; letter-spacing:.04em; }
    .prop-table td { padding:10px 12px; border-bottom:1px solid #f0ece4; vertical-align:top; }
    .prop-table tr:hover td { background:rgba(255,255,255,0.06); }
    .statut-badge { display:inline-block; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:600; white-space:nowrap; }
    .statut-recue { background:#f3f4f6; color:#6b7280; }
    .statut-email { background:#dbeafe; color:#1d4ed8; }
    .statut-encours { background:#fef3c7; color:#92400e; }
    .statut-validee { background:#d1fae5; color:#065f46; }
    .statut-rejetee { background:#fee2e2; color:#991b1b; }
    .btn-valider { background:#22c55e; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:600; margin-right:6px; }
    .btn-rejeter { background:#ef4444; color:#fff; border:none; padding:5px 12px; border-radius:3px; cursor:pointer; font-size:0.8rem; font-weight:600; }
    .btn-valider:disabled, .btn-rejeter:disabled { opacity:.4; cursor:not-allowed; }
    .filter-tabs { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.5rem; }
    .filter-tab { padding:5px 14px; border:1px solid #d0c9bc; border-radius:20px; cursor:pointer; font-size:0.82rem; background:#fff; }
    .filter-tab.actif { background:#1a1712; color:#fff; border-color:#1a1712; }
    .prop-nom { font-weight:600; }
    .prop-url { font-size:0.8rem; word-break:break-all; }
    .prop-desc { font-size:0.82rem; color:#666; max-width:280px; line-height:1.5; }
    #loading-msg { color:#888; padding:2rem 0; text-align:center; }
    #error-msg { color:#dc2626; padding:1rem; background:#fee2e2; border-radius:4px; display:none; }
    .compteur { font-size:0.82rem; color:#888; margin-bottom:1rem; }
  </style>
</head>
<body>
<header>
  <a class="retour" href="/">← Base IA</a>
  <h1>Propositions d'outils</h1>
</header>
<main>
  <div id="admin-guard" style="display:none;max-width:480px;margin:3rem auto;text-align:center;">
    <p style="color:#dc2626;font-weight:600;">Accès réservé à l'admin.</p>
    <a href="/" style="color:#888;font-size:0.9rem;">← Retour à l'accueil</a>
  </div>

  <div id="admin-content" style="display:none;">
    <div id="error-msg"></div>

    <div class="filter-tabs">
      <button class="filter-tab actif" onclick="filtrerStatut('tous', this)">Toutes</button>
      <button class="filter-tab" onclick="filtrerStatut('Reçue', this)">Reçue</button>
      <button class="filter-tab" onclick="filtrerStatut('Email validé', this)">Email validé</button>
      <button class="filter-tab" onclick="filtrerStatut('En cours', this)">En cours</button>
      <button class="filter-tab" onclick="filtrerStatut('Validée', this)">Validée</button>
      <button class="filter-tab" onclick="filtrerStatut('Rejetée', this)">Rejetée</button>
    </div>

    <div class="compteur" id="compteur"></div>
    <div id="loading-msg">Chargement des propositions...</div>

    <div id="table-wrapper" style="display:none;overflow-x:auto;">
      <table class="prop-table">
        <thead>
          <tr>
            <th>Outil</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="tbody"></tbody>
      </table>
    </div>
  </div>
</main>
<footer>
  <div class="footer-contenu">
    <div class="footer-gauche">
      <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>
    </div>
    <div class="footer-liens">
      <a href="/">Accueil</a>
      <a href="/mentions-legales.html">Mentions légales</a>
    </div>
  </div>
</footer>
<script>
const N8N = 'https://n8n.srv1161197.hstgr.cloud/webhook';
let toutesPropositions = [];
let filtreActif = 'tous';

function isAdmin() {
  return document.cookie.split(';').some(c => c.trim() === 'admin_duale=1');
}

function statutClasse(statut) {
  if (statut === 'Reçue') return 'statut-recue';
  if (statut === 'Email validé') return 'statut-email';
  if (statut === 'En cours') return 'statut-encours';
  if (statut === 'Validée') return 'statut-validee';
  if (statut === 'Rejetée') return 'statut-rejetee';
  return 'statut-recue';
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function renderLigne(p) {
  const peutAgir = ['Email validé', 'Email valide', 'Reçue', 'En cours'].includes(p.statut);
  return \`<tr data-statut="\${p.statut}" data-id="\${p.id}">
    <td>
      <div class="prop-nom">\${escHtml(p.nom)}</div>
      <div class="prop-url">\${p.url ? \`<a href="\${escHtml(p.url)}" target="_blank" rel="noopener noreferrer">\${escHtml(p.url)}</a>\` : '-'}</div>
    </td>
    <td>\${escHtml(p.email || '-')}</td>
    <td><span class="statut-badge \${statutClasse(p.statut)}">\${escHtml(p.statut)}</span></td>
    <td style="white-space:nowrap;font-size:0.8rem;">\${formatDate(p.date)}</td>
    <td><div class="prop-desc">\${escHtml(p.description || '-')}</div></td>
    <td style="white-space:nowrap;">
      \${peutAgir ? \`
        <button class="btn-valider" onclick="agir('\${p.id}', 'valider', this)">Valider</button>
        <button class="btn-rejeter" onclick="agir('\${p.id}', 'rejeter', this)">Rejeter</button>
      \` : '-'}
    </td>
  </tr>\`;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function filtrerStatut(statut, btn) {
  filtreActif = statut;
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('actif'));
  btn.classList.add('actif');
  afficherPropositions();
}

function afficherPropositions() {
  const liste = filtreActif === 'tous' ? toutesPropositions : toutesPropositions.filter(p => p.statut === filtreActif);
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = liste.length ? liste.map(renderLigne).join('') : '<tr><td colspan="6" style="text-align:center;color:#888;padding:2rem;">Aucune proposition dans cette catégorie.</td></tr>';
  document.getElementById('compteur').textContent = liste.length + ' proposition' + (liste.length > 1 ? 's' : '') + (filtreActif !== 'tous' ? ' · ' + filtreActif : '');
}

async function chargerPropositions() {
  try {
    const res = await fetch(N8N + '/admin-proposals');
    if (!res.ok) throw new Error('Erreur ' + res.status);
    const data = await res.json();
    toutesPropositions = data.proposals || [];
    document.getElementById('loading-msg').style.display = 'none';
    document.getElementById('table-wrapper').style.display = '';
    afficherPropositions();
  } catch(e) {
    document.getElementById('loading-msg').style.display = 'none';
    const err = document.getElementById('error-msg');
    err.style.display = '';
    err.textContent = 'Impossible de charger les propositions : ' + e.message;
  }
}

async function agir(pageId, action, btn) {
  const row = btn.closest('tr');
  row.querySelectorAll('button').forEach(b => b.disabled = true);
  btn.textContent = action === 'valider' ? 'En cours...' : 'Rejet...';
  try {
    const token = localStorage.getItem('admin_token') || '';
    const res = await fetch(N8N + '/admin-validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token },
      body: JSON.stringify({ pageId, action })
    });
    if (!res.ok) throw new Error('Erreur ' + res.status);
    const data = await res.json();
    btn.textContent = action === 'valider' ? 'Validé ✓' : 'Rejeté ✓';
    btn.style.background = action === 'valider' ? '#16a34a' : '#b91c1c';
    const badge = row.querySelector('.statut-badge');
    if (badge) {
      const newStatut = action === 'valider' ? 'Validée' : 'Rejetée';
      badge.textContent = newStatut;
      badge.className = 'statut-badge ' + statutClasse(newStatut);
    }
    row.querySelectorAll('button').forEach(b => { b.disabled = true; });
    const idx = toutesPropositions.findIndex(p => p.id === pageId);
    if (idx >= 0) toutesPropositions[idx].statut = action === 'valider' ? 'Validée' : 'Rejetée';
  } catch(e) {
    alert('Erreur : ' + e.message);
    row.querySelectorAll('button').forEach(b => b.disabled = false);
    btn.textContent = action === 'valider' ? 'Valider' : 'Rejeter';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!isAdmin()) {
    document.getElementById('admin-guard').style.display = '';
  } else {
    document.getElementById('admin-content').style.display = '';
    chargerPropositions();
  }
});
</script>
${COOKIE_BANNER}
</body>
</html>`;
}

module.exports = { genererMentionsLegales, genererPageConfirmation, genererAdminPropositions };
