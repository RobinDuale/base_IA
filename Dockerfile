FROM node:20-alpine

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

EXPOSE 3000
CMD ["node", "server.js"]
