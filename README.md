# Site Hyperion Software

Refonte du site [hyperion-soft.eu](https://www.hyperion-soft.eu/) : sauvegarde cybersécurisée DataClone,
Mode Stealth®, médias RDO®, partenariat Dattak.

## Publication (Netlify)

Tout est déjà réglé dans `netlify.toml`. Sur Netlify : *Add new project* → *Import an existing project* →
GitHub → `hyperion-software-website`. Laisser les réglages proposés (ils viennent du fichier) et lancer.

- Commande de construction : `python3 tools/publish.py` (pages construites depuis `src/`, puis vérification
  que chaque image, police et script existe bien).
- Dossier publié : `dist/` (uniquement les pages, `css/`, `js/` et `assets/`).
- Chaque envoi sur la branche `main` republie le site automatiquement.

## Travailler sur le site

- Les pages se modifient dans `src/` (une page = un fichier) ; le menu, le pied de page, l'en-tête et les icônes
  sont partagés dans `src/partials/`.
- Style : `css/style.css`. Animations : `js/app.js`. Intro 3D : `js/intro3d.js`.
  Formulaire de contact : `js/contact-config.js`.
- `python tools/build.py` régénère les pages (à la racine) ; `Ouvrir le site.bat` le fait puis ouvre le site
  en local sur http://localhost:5520.
- Les règles de design (texte repris du site d'origine, titres, couleurs, ce qu'il ne faut jamais faire) sont
  dans `.claude/skills/hyperion-design/SKILL.md`.

## Pages

Accueil · Mode Stealth · Conformité ANSSI · Cyber-assurance Dattak · Contact · Gestion centralisée · Image disque ·
Appliances · Option RDO · Rentrée 2026 · Sauvegarde VMware · Sauvegarde Exchange · Sauvegarde Cloud · SaaS ·
Disaster Recovery Test · Sauvegarde Air Gap · Partenariat CSIRT · Partenariat Campus Cyber · Pourquoi nous choisir ·
Témoignages · Confidentialité.
