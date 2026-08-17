#!/usr/bin/env bash
#
# Une passe de la sonde exterieure du VPS srv1161197.hstgr.cloud.
#
# Sortie 0 : les trois hotes repondent.
# Sortie 1 : au moins un hote est muet depuis ce runner.
#
# Ce script vit dans un fichier separe parce que deux jobs l executent, chacun
# sur son propre runner. Voir .github/workflows/sonde-vps.yml.

set -u

echecs=0

verifier() {
  nom="$1"; url="$2"; attendu="$3"
  # curl ecrit deja 000 quand la connexion echoue, et sort en erreur.
  # Un `|| echo 000` ajouterait un second code au premier et afficherait
  # 000000 dans le mail d alerte, seul endroit ou Robin lit ce diagnostic.
  # Corrige le 2026-08-16.
  code=$(curl -s -o /dev/null -w '%{http_code}' \
           --max-time 20 --retry 2 --retry-delay 5 "$url") || true
  [ -n "$code" ] || code=000
  if [ "$code" = "$attendu" ]; then
    echo "OK    $nom repond $code"
  else
    echo "ECHEC $nom repond $code, attendu $attendu"
    echecs=$((echecs + 1))
  fi
}

# L adresse de sortie du runner est la seule variable qui distingue un passage
# en echec d un passage qui reussit trente minutes plus tard. La journaliser
# rend la correlation lisible dans l historique des runs, sans laquelle chaque
# incident repart d une page blanche. Purement informatif, jamais bloquant.
adresse=$(curl -s --max-time 10 https://api.ipify.org || true)
echo "Runner vu depuis internet : ${adresse:-adresse indeterminee}"
echo

# Traefik sert ces trois hotes. Si l un ne repond plus, soit la machine est
# tombee, soit le reverse proxy est casse : dans les deux cas le second cerveau
# est hors service et Robin doit le savoir.
verifier "Forgejo, depot du vault"  "https://git.duale.fr/" 200
verifier "Base IA"                  "https://ia.duale.fr/"  200
verifier "Portail Authelia"         "https://auth.srv1161197.hstgr.cloud/" 200

[ "$echecs" -eq 0 ] || exit 1
