# Site Hyperion Software (refonte locale)

Pages : `index.html` (accueil), `mode-stealth.html`, `conformite-anssi.html`, `cyber-assurance-dattak.html`, `contact.html`,
`gestion-centralisee.html`, `image-disque.html`, `appliances.html`, `option-rdo.html`, `rentree-2026.html`,
`sauvegarde-vmware.html`, `sauvegarde-exchange.html`, `sauvegarde-cloud.html`, `saas.html`, `disaster-recovery-test.html`,
`sauvegarde-air-gap.html`, `partenariat-csirt.html`, `partenariat-campus-cyber.html`, `pourquoi-nous-choisir.html`,
`temoignages.html`, `confidentialite.html` (toutes les pages du site d'origine sont refaites).
Elles sont générées : modifier `src/*.html` et `src/partials/` puis lancer `python tools/build.py`
(il ajoute `?v=` aux liens CSS/JS pour que le navigateur prenne toujours la dernière version).
Style et script partagés : `css/style.css`, `js/app.js` (+ `js/contact-config.js` : envoi des formulaires de contact,
`js/intro3d.js` : intro 3D jouée à chaque arrivée sur le site, quelle que soit la page d'entrée (et au rechargement) ;
entre deux pages du site, intro courte classique ; Three.js préchargé seulement dans ce cas ; `?intro=3d` pour la forcer).
Logo d'origine (vectoriel, police Fontastique) : dossier `Logos/` ; bouclier extrait dans `assets/brand/hyperion-shield.svg`.

Avant toute création ou modification de page, charger le skill **hyperion-design** (`.claude/skills/hyperion-design/SKILL.md`) :
texte repris mot pour mot du site existant, titres avec du caractère (Inter Tight + un mot en italique Instrument Serif
coloré), de la couleur, une idée visuelle par bloc, et aucun motif "qui fait IA" (sur-titres, pastilles, icônes dans des
carrés, textes géants, halos, sections épinglées).

Les anciennes versions sont dans `_archive/` (référence uniquement, pas sur GitHub).
`Ouvrir le site.bat` : double-clic pour régénérer les pages et ouvrir le site en local (petit serveur Python, port 5520).

## GitHub et Netlify
Dépôt public `K3nTaxx/hyperion-software-website`, branche `main` ; chaque envoi republie le site sur Netlify.
`netlify.toml` : Netlify lance `python3 tools/publish.py` (construction depuis `src/`, copie dans `dist/` des seules
pages + `css/` + `js/` + `assets/`, puis vérification de chaque fichier appelé avec la casse exacte : Netlify est sous Linux)
et publie `dist/`. Les pages générées à la racine, `dist/`, `_archive/` et le kit `Logos/` (police achetée) ne sont pas
versionnés. Avant d'envoyer : `python tools/publish.py` doit finir sans fichier manquant. Tout nouveau fichier du site
va dans `assets/`, `css/` ou `js/` (sinon il ne sera pas publié).
L'historique Git garde aussi l'ancienne « nouvelle version » réorganisée (premier commit `f5654c6`), supprimée du PC.
