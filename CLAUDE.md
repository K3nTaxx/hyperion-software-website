# Site Hyperion Software (refonte locale)

Pages (nouvelle organisation, voir `REORGANISATION.md`) : `index.html` (accueil), `dataclone.html`,
`sauvegarde-vmware-hyper-v.html`, `sauvegarde-exchange-office-365.html`, `image-disque-p2v.html`, `gestion-centralisee.html`,
`mode-stealth.html`, `air-gap.html`, `medias-rdo.html`, `conformite-anssi.html`, `disaster-recovery-test.html`,
`appliances.html`, `dataclone-saas.html`, `backup-cloud-azure.html`, `pourquoi-hyperion.html`, `cyber-assurance-dattak.html`,
`partenariats-region-sud.html`, `actualites-rentree-2026.html`, `contact.html`, `confidentialite.html`.
Menu en 4 univers : DataClone / Cyber-résilience / Appliances & Cloud / Hyperion. Un sujet = une page de référence ;
les autres pages en donnent un résumé court et renvoient vers elle (« En savoir plus »).
Elles sont générées : modifier `src/*.html` et `src/partials/` puis lancer `python tools/build.py`
(il ajoute `?v=` aux liens CSS/JS pour que le navigateur prenne toujours la dernière version).
Style et script partagés : `css/style.css`, `js/app.js` (+ `js/contact-config.js` : envoi des formulaires de contact,
`js/intro3d.js` : intro 3D jouée à chaque arrivée sur le site, quelle que soit la page d'entrée (et au rechargement) ;
entre deux pages du site, intro courte classique ; Three.js préchargé seulement dans ce cas ; `?intro=3d` pour la forcer).
Le même bouclier 3D (`HyperionIntro3D.mount`) termine l'accueil ; il se charge seulement à l'approche de ce bloc.
Logo d'origine (vectoriel, police Fontastique) : dossier `Logos/` ; bouclier extrait dans `assets/brand/hyperion-shield.svg`.

Avant toute création ou modification de page, charger le skill **hyperion-design** (`.claude/skills/hyperion-design/SKILL.md`) :
texte repris mot pour mot du site existant, titres avec du caractère (Inter Tight + un mot en italique Instrument Serif
coloré), de la couleur, une idée visuelle par bloc, et aucun motif "qui fait IA" (sur-titres, pastilles, icônes dans des
carrés, textes géants, halos, sections épinglées).

`Ouvrir le site.bat` : double-clic pour régénérer les pages et ouvrir le site en local (petit serveur Python, port 5530).

## GitHub et Netlify
Dépôt public `K3nTaxx/hyperion-software-website`, branche `main` ; chaque envoi republie le site sur Netlify.
`netlify.toml` : Netlify lance `python3 tools/publish.py` (construction depuis `src/`, copie dans `dist/` des seules
pages + `css/` + `js/` + `assets/`, puis vérification de chaque fichier appelé avec la casse exacte : Netlify est sous Linux)
et publie `dist/`. Les pages générées à la racine, `dist/` et le kit `Logos/` (police achetée) ne sont pas versionnés.
Avant d'envoyer : `python tools/publish.py` doit finir sans fichier manquant. Tout nouveau fichier du site va dans
`assets/`, `css/` ou `js/` (sinon il ne sera pas publié).
