# Socle epingle par empreinte le 2026-08-19, meme convention que traefik:3 et n8n
# le 2026-08-15 : sans elle, deux constructions a deux dates ne donnent pas la meme
# image. Le tag reste ecrit pour la lisibilite, c est l empreinte qui fait foi.
FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293

# Correctifs des paquets systeme au moment du build. Sans cette ligne, l image
# herite des vulnerabilites du jour ou l image de base a ete publiee, et elles
# vieillissent avec elle.
RUN apk --no-cache upgrade

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# npm est retire de l image d execution. L application demarre par
# "node server.js" et n en a plus besoin une fois les dependances installees.
# npm embarque ses propres node_modules, qui portaient CVE-2026-59873
# (critique, paquet tar 6.2.1) sur une image publiquement exposee via
# ia.duale.fr. Constat du premier rapport de l agent admin systeme VPS,
# 2026-08-15. Retirer npm supprime cette CVE et toutes celles que ses
# dependances apporteront ensuite, sans rien changer a l execution.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/bin/npm \
           /usr/local/bin/npx

COPY . .

# Le conteneur ne tourne plus en root. Arbitrage rendu le 2026-08-15 : base-ia est
# le seul service du VPS ou le geste est propre, il n ecrit dans aucun volume, son
# cache vit en memoire et le port 3000 n est pas privilegie. L utilisateur node
# (uid 1000) est fourni par l image de base.
RUN chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "server.js"]
