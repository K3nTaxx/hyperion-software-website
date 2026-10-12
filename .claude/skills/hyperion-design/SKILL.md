---
name: hyperion-design
description: Moteur graphique du site Hyperion Software. À charger AVANT de créer ou modifier une page du site (accueil, Mode Stealth, Conformité ANSSI, Cyber Assurance Dattak, toute nouvelle page). Définit le contenu autorisé, l'identité typographique, les motifs "qui font IA" à ne jamais produire, et ce que veut dire "designer une page".
---

# Moteur graphique Hyperion — du caractère, sans "look IA"

Le client rejette deux choses : ce qui ressemble à un site généré par une IA, ET un site fade
("tous les titres sont devenus basiques, il n'y a plus de couleurs, plus de police").
Enlever les tics d'IA ne veut pas dire tout aplatir : chaque page doit rester spectaculaire.

## 1. Contenu

- Le texte vient **mot pour mot** de la page d'origine sur hyperion-soft.eu. On ne rédige pas de copy.
  - Récupérer la page dans le navigateur (`get_page_text`), plus les mots en gras (`main strong`), les liens
    et les encadrés latéraux. Vérifier les onglets / accordéons masqués (compteurs à 0) : les vraies valeurs
    sont dans le bundle `assets/index-*.js` du site.
- On peut réorganiser, découper un paragraphe en titre + texte, réutiliser un fragment exact comme libellé
  d'un schéma ("partie donnée", "« en ligne »", "protection 360°"). Pas inventer.
- Coquilles d'origine conservées (le client décide s'il veut les corriger).
- Images : uniquement les vrais visuels (captures DataClone, appliances, cartouche RDO, logos clients et
  partenaires, icônes d'origine) dans `assets/img/`. Pas d'images générées.

## 2. "Designer" une page

- **Ne pas recopier la mise en page d'origine** (le client l'a reproché sur la 1re version ANSSI).
  On recompose le contenu comme le meilleur site possible.
- Chaque bloc important reçoit **une idée visuelle propre qui explique le texte** : un graphique qui se
  remplit / se coche / se trace tout seul. Référence validée par le client : la fiche ANSSI en 3D qui se coche
  point par point + tampon, et les 75 points sur 100. Pas de photos de machines pour "meubler" : si l'image
  n'apporte rien, on fait un graphique.
- Deux colonnes mises en regard (duo, comparatif) : rangées partagées (`grid-template-rows: subgrid`), titres,
  textes et avantages à la même hauteur, séparateur fixe, le tout visible sans défiler.
  - ANSSI : fiche PDF en 3D qui se coche point par point + tampon ; barres "partie donnée / partie système"
    qui se remplissent ; semaine perdue entre le week-end et le vendredi ; RDO qui se déconnecte ; phrase
    chiffrée en AES ; 12 étoiles RGPD ; 75 points sur 100.
  - Dattak : deux cercles Hyperion / Dattak qui se rejoignent → "360°" ; carte DataClone × Dattak avec le
    graphique Mode Stealth (malwares, sauvegardes invisibles, restauration instantanée) ; chiffres 3x / +40 /
    <2 min ; coupons 15 % / 10 %.
  - Gestion centralisée : vraie console DataClone redessinée qui se remplit (100 % réussies, 84 % de
    capacité, sauvegardes VM-APPLI / VM-AD qui arrivent en continu), mini-graphiques par pilier, réseau
    "ordinateurs surveillés → console" avec connexion à distance "d'un simple clic", 6 cartes animées.
  - Image disque : titre à gauche sur 3 lignes, à droite une fenêtre "Image disque" où les partitions se
    recopient dans le VHDX de 0 à 100 % (refusé avant : dessins de disques durs),
    frise de compatibilité Windows, atouts (∞, prix/fonctionnalités, assistance), table de partitions qui
    se remplit avec la liste des 11 caractéristiques, 4 blocs en onglets avec un schéma chacun.
  - Appliances : vraie photo produit sur fond studio, 3 piliers animés, 4 gammes avec capacité 8 → 500 To,
    18 médias qui s'allument jusqu'à 432 To, scénario PRA 14h00 → 20h00 rejoué sur une frise, tableau
    des spécifications avec coches.
  - Option RDO : page produit "à la Apple" (titre centré, cartouche qui glisse, 3 chiffres), tableau
    bande / disque / RDO qui se coche, parcours vers "lieu sûr", "Exit les LTO" barré, 576 To.
  - Accueil (version "monumentale", nouvelle version du site) : titre "Sauvegarde Cybersécurisée Anti-Ransomware"
    et scène produits (validés) → "3 dates vont changer la sauvegarde." : circuits temporels en LED à points (idée du
    client sur son site), une ligne cliquée = la date se règle et l'annonce s'ouvre → "Hyperion Software en 20
    secondes" (phrase qui se colore + 4 petits schémas) → jauges circulaires ("des ronds") + logos → néons blancs des
    risques → 4 étapes : UN schéma collant qui se construit pendant la lecture (aspiration, Stealth, RDO, cloud,
    sceau 100 %) → "Enfin une Solution de Sauvegarde agréée par votre Assureur Cyber !" avec le bouclier 3D qui
    s'assemble et coche les 5 points. Les blocs sombres s'ouvrent en grand au défilement (carte arrondie → plein écran).
    Bloc "Protection garantie" retiré à sa demande ; carrousel et bloc DataClone déplacés sur dataclone.html.
  - Intro 3D : assemblage, un tour complet, puis éclatement immédiat ("boum, ça s'ouvre"). Refusé : le balayage de
    lumière sur la face du logo avant l'ouverture.
  - "Vos sauvegardes sont-elles vraiment protégées" : NÉONS BLANCS (adorés) mais 4 formes différentes — 100 points
    dont 93 s'allument, tube qui se remplit à 94 %, niveau en lignes à 46 %, escalier des jours "5+". Refusé : la même
    forme répétée (4 ronds d'affilée).
  - Rentrée 2026 : haut de page "keynote" sombre et centré + 3 cartes logo vers les chapitres ; AGS (jaune
    #f9b700) avec les lignes "Des grands comptes → aux PME", réseau Hyperion → AGS → 25 → entreprises, rôles
    du VAD qui se cochent ; DataClone 2.0 (ancien code effacé → nouvelle architecture) ; DataClone 365 (cloud
    qui s'arrête / données disponibles, cadenas Stealth, restauration) ; chiffres qui grandissent.
  - Carrousel des fonctionnalités : une "roue" infinie, carte principale AU CENTRE (comme le site actuel), on la
    fait tourner en glissant (avec élan) ou au trackpad ; en bas : flèche, points (un par carte), flèche. Pas de barre
    de progression.
  - Sauvegarde VMware : carte "DataClone" où 1 machine se divise en 4, 16, 64, 256 → ∞ (licence unique), copies
    automatiques vers réseau / NAS / bandes, réplication ESXi Free source ⇄ destination (les rôles s'échangent),
    grille de blocs CBT (seuls les blocs modifiés partent), pré-gel / au repos / post-dégel, caractéristiques en
    interrupteurs qui s'allument, mode « thick » (la sauvegarde occupe tout l'espace alloué), mots barrés.
  - Exchange : boîte aux lettres Microsoft Exchange en direct (un e-mail arrive, se coche, part dans le fichier PST),
    4 vignettes animées, cartes bleu nuit (compteur 1 licence → ∞ boîtes aux lettres, tableau d'affichage des
    destinations NAS / FTP / Google Drive…, clic de restauration Kroll Ontrack), 9 points qui se cochent,
    9 mini-graphiques (versions 2010→2019, troncature du journal, AES qui se chiffre…), onglets Ontrack PowerControls.
  - Backup Cloud : trois plateaux en perspective (Infrastructure Locale, medias extractibles, puis le Cloud bleu qui
    se pose : "3ème niveau"), hexagone de points (l'une des très rares sociétés françaises certifiées), schéma
    réseau → appliance → Azure → restauration avec 3 étapes à cliquer.
  - SaaS : un canal privé par client vers son "serveur Windows dédié", ressources mutualisées qui se séparent en
    "isolation totale", pyramide de supervision (3 rôles à cliquer, ce que chacun voit du parc), simulateur d'utilisateurs.
  - Disaster Recovery Test : banc "Service de validation de backups" (VM, images, fichiers) puis certificat de validité,
    parcours du média en 5 étapes, témoignage Novelliance avec "moins d'une heure".
  - Air Gap : les attaques tombent dans le "mur d'air", câble débranché vs requêtes qui rebondissent, double barrière
    Stealth + RDO, comparatif avec course de restauration (minutes vs heures).
  - CSIRT : courbe incident → "retour rapide à la normale", flux d'alertes traitées. Campus Cyber : Hyperion rejoint le
    réseau du campus. Pourquoi nous choisir : sommaire des 7 raisons + onglets avec schéma, promesses barrées / garanties.
  - Intro 3D à chaque arrivée sur le site (toute page d'entrée, rechargement ; pas entre deux pages) : bouclier vectoriel extrudé en 3D. Aimé : les 4 pièces qui arrivent et
    s'assemblent. Refusé : points blancs (nœuds, champ d'étoiles) et "icône qui part à gauche + nom" (jugé bateau).
    Version actuelle : assemblage → impact (arêtes qui flashent, trait de lumière) → un tour complet sous une lumière
    qui tourne → reflet sur la face → le bouclier éclate vers la caméra et révèle le site. Tout est préparé (shaders,
    environnement) avant la première image ; bibliothèques préchargées dès le <head>.
- Noms de classes : toujours préfixer par la page (ex. `ft-sw`, pas `sw`) — `.sw` est utilisé par les phrases qui se
  colorent au défilement ; un nom générique a déjà cassé tous les textes animés du site.
  - Contact : formulaire par profil avec anneau qui se remplit champ par champ, horloges en direct de
    Londres et Roses ; le formulaire entier doit tenir dans le premier écran.
- Fonds : pas de grain (refusé). Chaque page a SON motif de haut de page dans `.bgfx` (dégradés de marque qui
  s'estompent + un motif unique) : accueil `--horizon`, Stealth `--dots`, ANSSI `--ruled`, Dattak `--coral`,
  contact `--sky`, Gestion centralisée `--chart`, Image disque `--mirror`, Appliances `--studio`, Option RDO `--halo`, Rentrée 2026 `--keynote` (haut de page sombre, logo blanc via `body.nav-dark`), Sauvegarde VMware `--mosaic` (carrés qui se divisent), Exchange `--flap` (lignes d'une grande enveloppe), Backup Cloud `--stream` (flux de données qui montent), SaaS `--pyramid`,
  Disaster Recovery `--pulse` (électrocardiogramme), Air Gap `--gap` (traînées d'air), CSIRT `--signal` (barres de signal),
  Campus Cyber `--campus` (blocs isométriques), Pourquoi nous choisir `--rays` (7 rayons), Témoignages `--quote` (bulles),
  Confidentialité `--lock` (serrure). Jamais deux pages avec le même motif,
  jamais un panneau coloré coupé net.
- Varier la mise en page des titres d'une section à l'autre et d'une page à l'autre : titre à gauche + texte à
  droite, titre centré + deux colonnes, titre aligné à droite au-dessus d'un graphique, titre éclaté sur un
  visuel, titre intégré à une phrase qui se colore… (refusé : titre de haut de page à droite). Pas toujours
  "grand titre à gauche + sous-titre". Varier la FORME, jamais supprimer le titre : chaque page garde un H1
  lisible d'un coup d'œil (refusé : titre éclaté en libellés au-dessus d'un schéma).
- Visuel de haut de page : UNE idée simple, peu d'éléments, compréhensible en 2 secondes (refusé : chaîne
  disque → fichier → clone → VM jugée brouillonne ; validé : un disque et sa copie qui se remplit).
- Pas de bandeau d'appel à l'action systématique en fin de page : une page peut finir sur son dernier contenu.
- Pied de page : sans la bande "©… Tous droits réservés" en dessous (retirée à la demande du client).
- Les blocs "cartes" (bento, avantages) doivent tenir dans un écran d'ordinateur classique (1536×864).
- Beaucoup de texte : le répartir en onglets cliquables (jamais automatiques), chacun avec son schéma.
- Couleur : bleu cobalt de la marque partout, bleu nuit pour les sections fortes, bleu ciel sur fond sombre,
  corail Dattak (`--coral`) pour le partenaire ou l'alerte. Fonds teintés bleu clair (`--blue-soft`).

## 3. Identité typographique (obligatoire)

- Titres : **Inter Tight** 600, interlettrage serré (-0.04em), interlignage ~1.04.
- Dans chaque titre, **un mot ou groupe clé en italique Instrument Serif, en bleu** (`<em>` dans `.h1/.h2/.h3`,
  bleu ciel sur fond sombre, corail pour Dattak). C'est la voix de la marque, le client y tient.
- Unités des chiffres (`%`, `jours`, `x`, `+ To`) en italique sérif colorée.
- JetBrains Mono seulement pour du contenu technique (chiffrement, code), jamais en sur-titre.
- Tailles : H1 ≤ ~78 px, H2 ≤ ~56 px, chiffres clés ≤ ~70 px. Pas de titre plein écran.
- Espace insécable avant `: ! ? »` dans les titres et légendes. Dans un script Python, l'insérer avec une
  fonction de remplacement (lambda qui renvoie le caractère U+00A0 + le signe), jamais avec une chaîne
  "\1" passée par le shell (elle est devenue le caractère U+0001 et a effacé la ponctuation).

## 4. Liste noire — motifs "qui font IA" (ne jamais produire)

1. **Sur-titres / eyebrows** : petit texte au-dessus d'un titre ("• RENTRÉE 2026", "Concept breveté",
   "Mode de protection avancé", "01 — 04").
2. **Pastilles, badges, chips** : bulles arrondies avec un libellé, surtout flottantes autour d'une image
   ("Anti Ransomwares", "Protection active", "Technologie brevetée"…).
3. **Icônes dans des carrés** : pas de tuile arrondie / dégradée autour d'une icône. Icônes seules, 24–40 px.
4. **Textes géants** (voir tailles section 3).
5. **Hero centré type template** : pastille + titre géant + sous-titre + 2 boutons centrés.
6. Glassmorphism, halos flous, grilles de fond masquées, bruit, blobs.
7. Numérotation décorative ("01", "02") quand le contenu n'est pas numéroté à l'origine ; loaders à %.
8. Coins très arrondis partout (> 16 px sur les cartes), ombres sur tout.
9. Sections épinglées / scrollytelling qui bloquent la page, carrousels qui tournent seuls.

## 5. Composants (dans `css/style.css`)

| Composant | Classe | Usage |
|---|---|---|
| Barre de navigation (validée) | `.nav`, `.nav-pill`, `.mega` | identique partout ; logo sans bulle |
| Boutons (validés, "incroyables") | `.btn .btn--ink/--blue/--white/--coral`, `.link-u` | 1 bouton + 1 lien max |
| Hero accueil | `.home-hero` | "Hyperion Software" + phrase + scène produits + logos clients qui défilent |
| Hero de page | `.ax-hero`, `.dk-hero`, `.page-hero` | titre à gauche, objet visuel animé à droite |
| Chapitres numérotés + rail | `.ax-wrap`, `.ax-rail`, `.ax-ch` | rail collant qui se coche, visuel collant |
| Réponse chiffrée | `.ax-ans`, `.ax-val` | filet épais, grand chiffre + unité sérif |
| Phrase qui se colore au scroll | `.statement`, `--md`, `--dark`, `.accent(--coral)` | moments forts |
| Chiffres clés | `.figures`, `.dk-figs` | fond bleu nuit, compteurs + jauges |
| Duo partenaire | `.dk-duo` | une carte en deux moitiés (subgrid), × fixe au centre |
| Formulaire de contact | `.ct-panel`, `.ct-prof`, `.ct-form` | profils, anneau de progression, envoi Supabase (`js/contact-config.js`) |
| Coupons | `.dk-ticket` | remises, encoches + pointillés |
| Frise / cartes / rangées | `.tl`, `.fx`, `.nrow`, `.num-list` | accueil |
| Bandeau CTA | `.cta-band` | fond bleu, titre + bouton blanc |

## 6. Mouvement

- Les animations **se lancent seules** à l'apparition (compteurs, tracés, remplissages, 3D au survol).
- Bouton à disque : la taille du remplissage est calculée selon la largeur (`--fs`, `initButtons`).
- Pas d'animation de remplissage pilotée par le scroll qui se recalcule pendant qu'on ouvre un élément
  (la ligne de la frise sautait) : suivre l'état actif avec une transition CSS.
- Objets en perspective qui suivent la souris (`tilt()` dans `js/app.js`).
- Pas de section épinglée. Défilement doux Lenis. Intro : logo puis rideau, < 1,5 s.

## 6 bis. Organisation du site (nouvelle version)

- Voir `REORGANISATION.md`. Menu en 4 univers : DataClone / Cyber-résilience / Appliances & Cloud / Hyperion.
- Un sujet = une page de référence (Stealth → mode-stealth.html, RDO → medias-rdo.html, Dattak → cyber-assurance-dattak.html,
  compatibilité et fonctionnalités → dataclone.html, option cloud → backup-cloud-azure.html). Ailleurs : résumé court +
  lien « En savoir plus ». Ne jamais recopier une liste d'une page à l'autre.

## 7. Créer une nouvelle page

1. Créer `src/ma-page.html` avec `<!--@page cle-->` et les marqueurs `@head @sprite @intro @nav @footer`
   (copier `src/cyber-assurance-dattak.html`).
2. Ajouter la clé dans `PAGES` de `tools/build.py` (+ placeholder `{{CUR_...}}` dans `src/partials/nav.html` si la page
   est dans un menu),
   remplacer le lien hyperion-soft.eu par la page locale dans nav, menu mobile et pied de page.
3. Récupérer le texte d'origine (section 1), designer (section 2), titres avec accent (section 3).
4. `python tools/build.py`, puis vérifier : liste noire, 1280×800, mobile 375 px sans débordement,
   console sans erreur.
