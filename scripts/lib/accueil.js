// accueil.js -- Génération de la page d'accueil (index.html)

const {
  BASE_URL, META_GOOGLE, META_ROBOTS_INDEX,
  OG_IMAGE, OG_IMAGE_ALT, SITE_NAME, AUTHOR_NAME,
  COULEURS_CATEGORIE, COULEURS_TAG, GA_TAG, COOKIE_BANNER,
} = require("./config");

function genererCarte(item) {
  const prefixe = item.type === "LLM" ? "llm" : "outils";
  const couleurCat = COULEURS_CATEGORIE[item.categorie] || "#6b7280";
  const tagsArray = item.tags ? item.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  const tagsBadges = tagsArray.slice(0, 3).map(t => {
    const c = COULEURS_TAG[t] || "#6b7280";
    return `<span class="carte-tag" style="color:${c}">${t}</span>`;
  }).join("");

  return `
    <a class="carte" href="${prefixe}/${item.slug}.html" data-categorie="${item.categorie}" data-tags="${item.tags || ""}" data-notion-id="${item.id}">
      <div class="carte-accent" style="background:${couleurCat}"></div>
      <div class="carte-body">
        <div class="carte-head">
          <div class="carte-cat">${item.categorie || ""}</div>
          <div class="carte-type">${item.type === "LLM" ? "LLM" : "Outil"}</div>
        </div>
        <h2 class="carte-nom">${item.nom}</h2>
        ${item.description ? `<p class="carte-description">${item.description}</p>` : ""}
        <div class="carte-foot">
          <div class="carte-tags">${tagsBadges}</div>
          <span class="carte-arrow">&#8594;</span>
        </div>
      </div>
    </a>`;
}

function genererPageAccueil(outils, llms) {
  const items = [...outils, ...llms].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  const CATS_NAVBAR = ["LLMs", "Productivité", "No-Code", "Créativité"];
  const catsDisponibles = [...new Set(items.map(i => i.categorie).filter(Boolean))];
  const hasCreativite = catsDisponibles.includes("Créativité");
  const nbLLMs = items.filter(i => i.categorie === "LLMs").length;
  const catButtons = CATS_NAVBAR
    .filter(cat => cat !== "Créativité" || hasCreativite)
    .map(cat => {
      const couleur = COULEURS_CATEGORIE[cat] || "#6b7280";
      return `<button class="onglet" data-cat="${cat}" onclick="filtrerParCategorie(this)" style="--filtre-couleur:${couleur}">${cat}</button>`;
    })
    .join("\n        ");

  const TAGS_EXCLUS = new Set(["No-Code"]);
  const allTags = [...new Set(
    items.flatMap(i => i.tags ? i.tags.split(",").map(t => t.trim()).filter(Boolean) : [])
  )].filter(t => !TAGS_EXCLUS.has(t)).sort((a, b) => a.localeCompare(b, 'fr'));

  const tagButtons = [
    `<button class="filtre-tag actif" data-tag="" onclick="filtrerParTag(this)" style="--tag-couleur:#1a1712">Tous</button>`,
    ...allTags.map(tag => {
      const couleur = COULEURS_TAG[tag] || "#6b7280";
      return `<button class="filtre-tag" data-tag="${tag}" onclick="filtrerParTag(this)" style="--tag-couleur:${couleur}">${tag}</button>`;
    })
  ].join("\n        ");

  const cartesItems = items.map(i => genererCarte(i)).join("\n");
  const hubsCategories = [
    { label: "LLMs", href: "/categories/llms.html" },
    { label: "Productivité", href: "/categories/productivite.html" },
    { label: "No-Code", href: "/categories/no-code.html" },
    ...(hasCreativite ? [{ label: "Créativité", href: "/categories/creativite.html" }] : []),
  ];
  const hubsHtml = hubsCategories
    .map((hub) => `<a href="${hub.href}">${hub.label}</a>`)
    .join("");

  const DESC_HOME = "Référence des meilleurs outils IA, No-Code et LLMs sélectionnés par Robin Dualé. Fiches détaillées, scénarios d'usage et modèles économiques.";
  const TITLE_HOME = "Base IA · Outils IA, No-Code et LLMs · Robin Dualé";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${TITLE_HOME}</title>
  <meta name="description" content="${DESC_HOME}"/>
  <meta name="author" content="${AUTHOR_NAME}"/>
${META_ROBOTS_INDEX}
${META_GOOGLE}
  <link rel="canonical" href="${BASE_URL}/"/>
  <meta property="og:title" content="${TITLE_HOME}"/>
  <meta property="og:description" content="${DESC_HOME}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:url" content="${BASE_URL}/"/>
  <meta property="og:image" content="${OG_IMAGE}"/>
  <meta property="og:image:secure_url" content="${OG_IMAGE}"/>
  <meta property="og:image:width" content="1200"/>
  <meta property="og:image:height" content="630"/>
  <meta property="og:image:alt" content="${OG_IMAGE_ALT}"/>
  <meta property="og:locale" content="fr_FR"/>
  <meta property="og:site_name" content="${SITE_NAME}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${TITLE_HOME}"/>
  <meta name="twitter:description" content="${DESC_HOME}"/>
  <meta name="twitter:image" content="${OG_IMAGE}"/>
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg"/>
  <link rel="icon" type="image/x-icon" href="/favicon.ico"/>
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png"/>
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png"/>
  <link rel="icon" type="image/png" sizes="48x48" href="/assets/favicon-48.png"/>
  <link rel="apple-touch-icon" sizes="48x48" href="/assets/favicon-48.png"/>
  <script type="application/ld+json">
  [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Base IA",
      "description": "${DESC_HOME}",
      "url": "${BASE_URL}/",
      "inLanguage": "fr",
      "image": {
        "@type": "ImageObject",
        "url": "${OG_IMAGE}",
        "width": 1200,
        "height": 630
      },
      "author": {
        "@type": "Person",
        "name": "Robin Dualé",
        "url": "https://cv-robin.duale.fr",
        "sameAs": "https://www.linkedin.com/in/robinduale"
      },
      "publisher": {
        "@type": "Person",
        "name": "Robin Dualé",
        "url": "https://cv-robin.duale.fr",
        "sameAs": "https://www.linkedin.com/in/robinduale"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Meilleurs outils IA, No-Code et LLMs",
      "description": "Sélection personnelle des outils IA, No-Code et LLMs avec fiches détaillées.",
      "url": "${BASE_URL}/",
      "numberOfItems": ${outils.length + llms.length},
      "itemListElement": [
        ${outils.map((o, i) => `{"@type":"ListItem","position":${i + 1},"name":"${o.nom}","url":"${BASE_URL}/outils/${o.slug}.html"}`).join(",\n        ")},
        ${llms.map((l, i) => `{"@type":"ListItem","position":${outils.length + i + 1},"name":"${l.nom}","url":"${BASE_URL}/llm/${l.slug}.html"}`).join(",\n        ")}
      ]
    }
  ]
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="styles.css"/>
  ${GA_TAG}
</head>
<body>
  <header>
    <h1><a href="/"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="vertical-align:-2px;margin-right:5px;opacity:0.75"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>Base <em>IA</em></a></h1>
  </header>

  <main>
    <section class="hero">
      <h2>Une bibliotheque <em>vivante</em><br/>des outils IA &amp; No-Code.</h2>
      <p class="hero-date">Mis à jour le ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <p class="hero-intro">
        Claude pour coder, Gémini pour rédiger, n8n pour automatiser, Notion pour structurer. Une référence pratique des meilleurs outils IA et No-Code.<br/>
        Points forts, gratuité, modèle économique, forces, limites, scénario et cas d'usage concrets pour choisir le bon outil au bon moment.
      </p>
      <div class="kpis">
        <div class="kpi">
          <div class="kpi-num">${items.length - nbLLMs}</div>
          <div class="kpi-label">Outils references</div>
        </div>
        <div class="kpi">
          <div class="kpi-num">${nbLLMs}</div>
          <div class="kpi-label">Grands modeles</div>
        </div>
        <div class="kpi">
          <div class="kpi-num">${catsDisponibles.length}</div>
          <div class="kpi-label">Categories</div>
        </div>
      </div>
    </section>

    <div class="controls-sticky">
      <div class="barre-recherche">
        <input type="search" id="recherche-global" class="champ-recherche" placeholder="Rechercher un outil ou un LLM..." oninput="filtrerGlobal()" autocomplete="off"/>
      </div>

      <div class="onglets" id="barre-onglets">
        <div class="onglets-gauche">
          <button class="onglet actif" data-cat="tous" onclick="filtrerParCategorie(this)">Tous</button>
          ${catButtons}
        </div>
        <button class="onglet-proposer" onclick="ouvrirModalProposition()">
          <span class="onglet-proposer-plus">+</span>
          Proposer un nouvel outil
        </button>
      </div>
    </div>

    <div class="tags-filtres" id="tags-filtres">
      ${tagButtons}
    </div>

    <div id="section-items">
      <div class="grille" id="grille">
        ${cartesItems}
      </div>
    </div>

    <section class="section voir-aussi" style="margin-top:2rem;">
      <div class="section-eyebrow">&#9679; Explorer</div>
      <h2>Parcourir par catégorie</h2>
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:8px;">
        ${hubsHtml}
      </div>
    </section>
  </main>

  <footer>
    <div class="footer-contenu">
      <div class="footer-gauche">
        <span class="footer-copy">© 2026 Robin Dualé · <a href="https://duale.fr" target="_blank" rel="noopener noreferrer">duale.fr</a></span>

      </div>
      <div class="footer-guides">
        <span class="footer-guides-label">Guides</span>
        <a href="/comparatif-llm.html">Comparatif LLMs 2026</a>
        <a href="/automatiser-avec-ia.html">Automatiser avec l'IA</a>
        <a href="/outils-no-code.html">Outils No-Code 2026</a>
        <a href="/categories/productivite.html">Productivité IA</a>
      </div>
      <div class="footer-liens">
        <a href="https://www.linkedin.com/in/robinduale" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://cv-robin.duale.fr" target="_blank" rel="noopener noreferrer">cv-robin.duale.fr</a>
        <a href="/mentions-legales.html">Mentions légales</a>
      </div>
      <button class="btn-refresh admin-zone" onclick="rafraichirSite(this)" style="display:none">Mettre à jour le site</button>
      <a class="admin-zone" href="/admin-propositions.html" style="display:none;font-size:0.82rem;color:#888;text-decoration:none;padding:4px 8px;border:1px solid #ddd;border-radius:3px;" onmouseover="this.style.color='#333'" onmouseout="this.style.color='#888'">Propositions</a>
      <button onclick="ouvrirModalAdmin()" title="Administration" aria-label="Accès administration" style="background:none;border:none;cursor:pointer;color:#bbb;font-size:17px;padding:4px 6px;line-height:1;" onmouseover="this.style.color='#555'" onmouseout="this.style.color='#bbb'">⚙</button>
    </div>
  </footer>

  <script>
    window._catActive = 'tous';
    window._tagActive = null;

    function filtrerParCategorie(btn) {
      document.querySelectorAll('.onglet').forEach(b => b.classList.remove('actif'));
      btn.classList.add('actif');
      window._catActive = btn.dataset.cat || 'tous';
      appliquerFiltres();
    }

    function filtrerParTag(btn) {
      const tag = btn.dataset.tag;
      document.querySelectorAll('.filtre-tag').forEach(b => b.classList.remove('actif'));
      if (!tag || window._tagActive === tag) {
        window._tagActive = null;
        document.querySelector('.filtre-tag[data-tag=""]').classList.add('actif');
      } else {
        window._tagActive = tag;
        btn.classList.add('actif');
      }
      appliquerFiltres();
    }

    function filtrerGlobal() {
      appliquerFiltres();
    }

    function appliquerFiltres() {
      const query = (document.getElementById('recherche-global')?.value || '').toLowerCase().trim();
      const cat = window._catActive || 'tous';
      const tag = window._tagActive || null;
      document.querySelectorAll('#grille .carte').forEach(carte => {
        const nom = (carte.querySelector('.carte-nom')?.textContent || '').toLowerCase();
        const desc = (carte.querySelector('.carte-description')?.textContent || '').toLowerCase();
        const carteTags = (carte.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        const matchQuery = !query || nom.includes(query) || desc.includes(query);
        const matchCat = cat === 'tous' || carte.dataset.categorie === cat;
        const matchTag = !tag || carteTags.includes(tag);
        carte.style.display = matchQuery && matchCat && matchTag ? '' : 'none';
      });
    }

    function rafraichirSite(btn) {
      const cliqueLe = new Date().toISOString();
      btn.disabled = true;
      btn.textContent = "Déclenchement en cours...";
      fetch("https://n8n.srv1161197.hstgr.cloud/webhook/base-ia-refresh")
        .then(() => {
          btn.textContent = "Build lancé -- vérification en cours...";
          attendreMiseAJour(btn, cliqueLe);
        })
        .catch(() => {
          btn.textContent = "Erreur -- réessaie dans un moment";
          btn.disabled = false;
        });
    }

    function attendreMiseAJour(btn, cliqueLe) {
      const TIMEOUT = 5 * 60 * 1000;
      const INTERVALLE = 10 * 1000;
      const debut = Date.now();
      const interval = setInterval(() => {
        if (Date.now() - debut > TIMEOUT) {
          clearInterval(interval);
          btn.textContent = "Délai dépassé -- réessaie";
          btn.disabled = false;
          return;
        }
        fetch(window.location.origin + "/version.json?t=" + Date.now())
          .then((r) => r.json())
          .then((data) => {
            if (data.built_at > cliqueLe) {
              clearInterval(interval);
              btn.textContent = "Site mis à jour !";
              setTimeout(() => { btn.textContent = "Mettre à jour le site"; btn.disabled = false; }, 4000);
            }
          })
          .catch(() => {});
      }, INTERVALLE);
    }
  </script>

  <script>
    function filtrerOutils() { appliquerFiltres(); }
  </script>

  <div id="modal-proposition" onclick="if(event.target===this)fermerModalProposition()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998;align-items:center;justify-content:center;">
    <div style="background:#fff;border-radius:6px;padding:32px 36px;width:100%;max-width:460px;margin:16px;position:relative;box-shadow:0 8px 24px rgba(0,0,0,.15);">
      <button onclick="fermerModalProposition()" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;line-height:1;">×</button>
      <p style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#999;margin-bottom:20px;">Proposer un outil · Base IA</p>
      <div id="prop-step1">
        <label style="display:block;font-size:13px;color:#555;margin-bottom:8px;">Quel outil souhaitez-vous ajouter ?</label>
        <input type="text" id="prop-nom" placeholder="ex: Zapier, Notion, Midjourney..." style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;" onkeydown="if(event.key==='Enter')verifierOutil()"/>
        <div id="prop-erreur1" style="display:none;color:#dc2626;font-size:12px;margin-bottom:8px;"></div>
        <button type="button" onclick="verifierOutil()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Vérifier l'outil →</button>
      </div>
      <div id="prop-loading" style="display:none;text-align:center;padding:1.5rem 0;color:#888;font-size:14px;">Vérification en cours...</div>
      <div id="prop-existe" style="display:none;">
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:14px;color:#92400e;"><strong id="prop-nom-existe"></strong> est déjà dans la base.</div>
        <button type="button" onclick="propReset()" style="width:100%;padding:9px;background:none;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;cursor:pointer;color:#555;">Proposer un autre outil</button>
      </div>
      <div id="prop-notaitool" style="display:none;">
        <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:14px;color:#92400e;">L'outil spécifié n'a pas été identifié comme un outil IA ou No-Code répertorié. Confirmer la demande ou fermer.</div>
        <div style="display:flex;gap:8px;">
          <button type="button" onclick="propConfirmerMalgre()" style="flex:1;padding:9px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;cursor:pointer;">Confirmer la demande</button>
          <button type="button" onclick="fermerModalProposition()" style="flex:1;padding:9px;background:none;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;cursor:pointer;color:#555;">Fermer</button>
        </div>
      </div>
      <div id="prop-step2" style="display:none;">
        <div id="prop-bloc-gemini" style="display:none;background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;padding:12px 16px;margin-bottom:16px;font-size:13px;color:#0c4a6e;"><strong>Outil IA/No-Code confirmé.</strong> <span id="prop-desc-gemini"></span></div>
        <input type="hidden" id="prop-nom-hidden"/>
        <input type="hidden" id="prop-desc-hidden"/>
        <label style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:5px;">URL officielle <span style="color:#ef4444">*</span></label>
        <input type="url" id="prop-url" placeholder="https://..." style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;"/>
        <label style="display:block;font-size:12px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:5px;">Votre email <span style="color:#ef4444">*</span></label>
        <input type="email" id="prop-email" placeholder="votre@email.com" style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;outline:none;margin-bottom:12px;box-sizing:border-box;"/>
        <div id="prop-erreur2" style="display:none;color:#dc2626;font-size:12px;margin-bottom:8px;"></div>
        <p style="font-size:11px;color:#aaa;margin-bottom:12px;">Un email de confirmation vous sera envoyé. Votre email n'est utilisé que pour cette proposition.</p>
        <button type="button" onclick="soumettreProposition()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Envoyer ma proposition →</button>
      </div>
      <div id="prop-succes" style="display:none;text-align:center;padding:1rem 0;">
        <div style="width:48px;height:48px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;font-size:1.5rem;color:#fff;">✓</div>
        <p style="font-weight:600;margin-bottom:0.5rem;">Proposition envoyée !</p>
        <p style="color:#888;font-size:14px;">Vérifiez votre boite mail pour confirmer votre proposition.</p>
      </div>
    </div>
  </div>
  <script>
    function ouvrirModalProposition() {
      propReset();
      document.getElementById('modal-proposition').style.display = 'flex';
      setTimeout(() => document.getElementById('prop-nom').focus(), 50);
    }
    function fermerModalProposition() { document.getElementById('modal-proposition').style.display = 'none'; }
    function propReset() {
      propShowStep('step1');
      ['prop-nom','prop-url','prop-email','prop-desc-hidden'].forEach(id => { const el = document.getElementById(id); if(el) el.value = ''; });
      document.getElementById('prop-bloc-gemini').style.display = 'none';
    }
    function propShowStep(step) {
      ['step1','loading','existe','notaitool','step2','succes'].forEach(s => {
        document.getElementById('prop-' + s).style.display = s === step ? '' : 'none';
      });
    }
    function propConfirmerMalgre() { propShowStep('step2'); }
    async function verifierOutil() {
      const nom = document.getElementById('prop-nom').value.trim();
      const errEl = document.getElementById('prop-erreur1');
      errEl.style.display = 'none';
      if (!nom) { document.getElementById('prop-nom').focus(); return; }
      propShowStep('loading');
      try {
        const r = await fetch('https://n8n.srv1161197.hstgr.cloud/webhook/check-tool', {
          method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ nom })
        });
        if (!r.ok) throw new Error('Erreur serveur ' + r.status);
        const data = await r.json();
        if (data.exists) {
          document.getElementById('prop-nom-existe').textContent = data.nomCorrige || nom;
          propShowStep('existe');
        } else {
          const nomFinal = data.nomCorrige || nom;
          document.getElementById('prop-nom-hidden').value = nomFinal;
          document.getElementById('prop-desc-hidden').value = data.description || '';
          if (data.description && data.isAiTool !== false) {
            const correctionNote = (data.nomCorrige && data.nomCorrige !== nom) ? ' (nom corrigé : ' + data.nomCorrige + ')' : '';
            document.getElementById('prop-desc-gemini').textContent = data.description + correctionNote;
            document.getElementById('prop-bloc-gemini').style.display = '';
          }
          if (data.officialUrl) document.getElementById('prop-url').value = data.officialUrl;
          if (data.isAiTool === false) {
            propShowStep('notaitool');
          } else {
            propShowStep('step2');
          }
        }
      } catch(e) {
        propShowStep('step1');
        errEl.textContent = "Impossible de vérifier l'outil. Réessayez dans un instant.";
        errEl.style.display = '';
      }
    }
    async function soumettreProposition() {
      const outil = document.getElementById('prop-nom-hidden').value;
      const url = document.getElementById('prop-url').value.trim();
      const email = document.getElementById('prop-email').value.trim();
      const description = document.getElementById('prop-desc-hidden').value || '';
      const errEl = document.getElementById('prop-erreur2');
      errEl.style.display = 'none';
      if (!url) { document.getElementById('prop-url').focus(); return; }
      if (!email) { document.getElementById('prop-email').focus(); return; }
      propShowStep('loading');
      try {
        const r = await fetch('https://n8n.srv1161197.hstgr.cloud/webhook/submit-proposal', {
          method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ outil, email, url, description })
        });
        if (!r.ok) throw new Error('Erreur serveur ' + r.status);
        propShowStep('succes');
      } catch(e) {
        propShowStep('step2');
        errEl.textContent = 'Une erreur est survenue. Réessayez dans un instant.';
        errEl.style.display = '';
      }
    }
  </script>

  <div id="modal-admin" onclick="if(event.target===this)fermerModalAdmin()" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9999;align-items:center;justify-content:center;">
    <div style="background:#fff;border-radius:6px;padding:32px 36px;width:100%;max-width:340px;margin:16px;position:relative;box-shadow:0 8px 24px rgba(0,0,0,.15);">
      <button onclick="fermerModalAdmin()" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:22px;cursor:pointer;color:#bbb;line-height:1;">×</button>
      <p style="font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#999;margin-bottom:20px;">Administration · Base IA</p>
      <div id="panel-login">
        <label style="display:block;font-size:11px;font-weight:600;text-transform:uppercase;color:#888;margin-bottom:6px;">Clé d'accès</label>
        <input type="password" id="input-cle-admin" placeholder="••••••••" style="width:100%;padding:9px 12px;border:1px solid #d0c9bc;border-radius:3px;font-size:14px;font-family:monospace;outline:none;margin-bottom:8px;box-sizing:border-box;" onkeydown="if(event.key==='Enter')connecterAdmin()"/>
        <div id="erreur-admin" style="display:none;color:#c0392b;font-size:13px;margin-bottom:8px;">Clé incorrecte.</div>
        <button onclick="connecterAdmin()" style="width:100%;padding:10px;background:#1a1712;color:#fff;border:none;border-radius:3px;font-size:14px;font-weight:500;cursor:pointer;">Accéder</button>
      </div>
      <div id="panel-admin" style="display:none">
        <p style="color:#27ae60;font-size:14px;margin-bottom:16px;">Mode admin actif.</p>
        <button onclick="deconnecterAdmin()" style="width:100%;padding:10px;background:none;border:1px solid #e0d9cc;border-radius:3px;font-size:14px;cursor:pointer;color:#c0392b;">Se déconnecter</button>
      </div>
    </div>
  </div>
  <script>
    function getAdminCookie() {
      return document.cookie.split(';').some(c => c.trim() === 'admin_duale=1');
    }
    function setAdminCookie() {
      document.cookie = 'admin_duale=1; domain=.duale.fr; path=/; max-age=86400; SameSite=Lax';
      document.cookie = 'ga_exclude=1; domain=.duale.fr; path=/; max-age=86400; SameSite=Lax';
    }
    function deleteAdminCookie() {
      document.cookie = 'admin_duale=; domain=.duale.fr; path=/; max-age=0';
      document.cookie = 'ga_exclude=; domain=.duale.fr; path=/; max-age=0';
    }
    function initAdminMode() {
      if (getAdminCookie()) activerAdmin();
    }
    function activerAdmin() {
      document.querySelectorAll('.admin-zone').forEach(el => el.style.display = '');
    }
    function ouvrirModalAdmin() {
      const estAdmin = getAdminCookie();
      document.getElementById('panel-login').style.display = estAdmin ? 'none' : '';
      document.getElementById('panel-admin').style.display = estAdmin ? '' : 'none';
      document.getElementById('erreur-admin').style.display = 'none';
      if (!estAdmin) document.getElementById('input-cle-admin').value = '';
      document.getElementById('modal-admin').style.display = 'flex';
      if (!estAdmin) setTimeout(() => document.getElementById('input-cle-admin').focus(), 50);
    }
    function fermerModalAdmin() {
      document.getElementById('modal-admin').style.display = 'none';
    }
    async function connecterAdmin() {
      const val = document.getElementById('input-cle-admin').value.trim();
      const errEl = document.getElementById('erreur-admin');
      if (!val) { errEl.style.display = 'block'; return; }
      try {
        const r = await fetch('https://api.github.com/user', {
          headers: { Authorization: 'token ' + val }
        });
        if (r.ok) { validerAdmin(val); return; }
      } catch(e) {}
      errEl.style.display = 'block';
    }
    function validerAdmin(token) {
      setAdminCookie();
      if (token) localStorage.setItem('admin_token', token);
      document.getElementById('panel-login').style.display = 'none';
      document.getElementById('panel-admin').style.display = '';
      activerAdmin();
    }
    function deconnecterAdmin() {
      deleteAdminCookie();
      localStorage.removeItem('admin_token');
      document.querySelectorAll('.admin-zone').forEach(el => el.style.display = 'none');
      fermerModalAdmin();
    }
    initAdminMode();
  </script>
${COOKIE_BANNER}
</body>
</html>`;
}

module.exports = { genererCarte, genererPageAccueil };
