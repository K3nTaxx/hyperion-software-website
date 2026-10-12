# Hyperion Software — nouvelle organisation du site

Copie réorganisée du site (le site d'origine, dans « Hyperion site test », n'a pas été modifié).
Pour l'ouvrir : double-clic sur **Ouvrir le site.bat** (adresse `http://localhost:5530`).

Principe appliqué partout : **un sujet = une page de référence**. Les autres pages n'en donnent qu'un résumé court
et renvoient vers elle par un lien « En savoir plus ». Les textes restent ceux du site actuel ; les rares phrases
nouvelles sont listées plus bas.

---

## 1. Ce que l'audit a trouvé

21 pages, 775 blocs de texte analysés. Les principales redondances :

| Sujet | Où il était expliqué | Problème |
|---|---|---|
| Mode Stealth® | Accueil (×3 : frise, carrousel, bloc DataClone), Mode Stealth, Air Gap, Pourquoi nous choisir, Campus Cyber, SaaS, Rentrée 2026, Dattak | 9 pages, et les points « Stealth+ » (Kill Switch, cloisonnement, Veeam…) n'étaient **pas** sur la page Mode Stealth |
| Médias RDO® | Accueil (frise), Option RDO, Appliances, Air Gap, Pourquoi nous choisir, Cloud | 6 pages, avec des chiffres qui se contredisent (voir § 5) |
| Certification Dattak / 100 % / -15 % | Accueil, Dattak, Appliances, Air Gap, Pourquoi nous choisir (×2) | répété à chaque fois avec d'autres mots |
| Restauration (2 Clicks Restore, Instant Reboot, P2V) | Accueil (frise + carrousel), Pourquoi nous choisir | listes recopiées presque mot pour mot |
| Compatibilité (VM, OS, bases de données, cloud) | Accueil (frise), SaaS, Pourquoi nous choisir, VMware | quatre listes différentes |
| SaaS privatif | Accueil (bloc SaaS) + page SaaS | même texte |
| Option Cloud de DataClone (multi-cloud, PRA cloud…) | **seulement** dans la frise de l'accueil | contenu riche, mais caché dans un dépliant de l'accueil |
| CSIRT et Campus Cyber | deux pages | même structure, mêmes 4 avantages (alertes, réponse aux incidents, formation, sur mesure) |
| Pourquoi nous choisir et Témoignages | deux pages | deux pages « preuve et confiance », avec le même bandeau de logos que l'accueil |
| Exchange | deux listes de 9 points sur la même page | 5 points sur 9 en double |
| Mode Stealth | slogan « Votre sauvegarde en mode furtif » ×3 sur la page | bandeau final qui répète le haut de page |

L'accueil, en particulier, racontait trois fois la même chose (frise des 4 étapes, carrousel des fonctionnalités,
bloc « DataClone par Hyperion Software ») puis enchaînait avec le SaaS.

---

## 2. Nouvelle organisation

### Menu : 4 univers au lieu de « DataClone / SaaS / Matériel / Cybersécurité »

| Univers | Pages |
|---|---|
| **DataClone** (le logiciel) | DataClone : vue d'ensemble *(nouvelle)* · Sauvegarde VMware & Hyper-V · Sauvegarde Exchange & Office 365 · Image disque & P2V · Gestion centralisée |
| **Cyber-résilience** (la protection) | Mode Stealth® · Air Gap · Médias RDO® · Conformité ANSSI · Disaster Recovery Test |
| **Appliances & Cloud** (comment on le déploie) | Hyperion Appliances · DataClone SaaS · Backup Cloud Azure |
| **Hyperion** (la société, la confiance) | Pourquoi Hyperion · Cyber-assurance Dattak · Partenariats Région Sud · Actualités |

- Le RDO passe de « Matériel » à « Cyber-résilience » : c'est l'air gap physique et la règle 3-2-1, sa vraie raison d'être.
- Dattak passe dans « Hyperion » avec les autres partenaires.
- Le pied de page reprend les 4 univers (toutes les pages y sont accessibles).

### Pages renommées (nom de fichier et libellé du menu)

| Avant | Après |
|---|---|
| Sauvegarde VMware ESXi/Free, VCenter (`sauvegarde-vmware.html`) | Sauvegarde VMware & Hyper-V (`sauvegarde-vmware-hyper-v.html`) — la page couvre aussi Hyper-V |
| Sauvegarde Exchange Server / Online (Office 365) | Sauvegarde Exchange & Office 365 (`sauvegarde-exchange-office-365.html`) |
| Image Disque / Clonage de disque / P2V | Image disque & P2V (`image-disque-p2v.html`) |
| Gestion centralisée - Surveillance des sauvegardes / Infrastructures | Gestion centralisée |
| Sauvegarde AirGapped | Air Gap (`air-gap.html`) |
| Option RDO | Médias RDO® (`medias-rdo.html`) |
| Saas | DataClone SaaS (`dataclone-saas.html`) |
| Sauvegarde Cloud | Backup Cloud Azure (`backup-cloud-azure.html`) |
| Pourquoi nous choisir + Témoignages | **Pourquoi Hyperion** (`pourquoi-hyperion.html`) |
| Partenariat CSIRT + Campus Cyber | **Partenariats Région Sud** (`partenariats-region-sud.html`) |
| Rentrée 2026 | Actualités (`actualites-rentree-2026.html`) |

21 pages → **20 pages** (2 fusions, 1 création).

---

## 3. Page par page

**Accueil** — devient un sommaire, sans répétition.
Haut de page → « Testé et recommandé » (jauges + logos) → Rentrée 2026 → « Vos sauvegardes sont-elles vraiment
protégées ? » → les 4 étapes. Chaque étape garde 4 points clés et renvoie vers sa page (DataClone, Mode Stealth®,
Médias RDO®, Backup Cloud). Le carrousel des fonctionnalités et le bloc DataClone partent sur la page DataClone ;
le bloc SaaS est retiré (son texte est déjà sur la page SaaS).

**DataClone : vue d'ensemble** *(nouvelle page)* — la page qui manquait : le logiciel lui-même.
Haut de page sombre avec le tableau de bord DataClone qui s'active (venu de l'accueil) → « Un logiciel complet »
→ « Clonage de 100 % de votre IT par aspiration » avec la liste complète de ce que DataClone sauvegarde
(12 points, venus de l'étape 1) → le carrousel « Nos Fonctionnalités Clés » → les 4 modules (VMware, Exchange,
Image disque, Gestion centralisée) → déploiement en appliance ou en SaaS.

**Mode Stealth®** — devient la référence complète : nouvelle section « Le Mode Stealth+ » (Kill Switch automatique,
cloisonnement réseau, surveillance temps réel, double couche anti-ransomware, certification Dattak) et
« Stealth pour Veeam® » (venus de l'accueil et de la raison n° 7). Le bandeau final qui répétait le slogan est retiré.

**Backup Cloud Azure** — reçoit « Option Cloud pour sauvegarder tout ou partie de vos données » (15 points :
multi-cloud, souveraineté, PRA/PCA cloud…), qui n'existait que dans un dépliant de l'accueil.

**Sauvegarde Exchange & Office 365** — la liste « Caractéristiques principales » ne garde que les 4 points absents
des 9 vignettes (export PST, incrémentielle et restauration automatique, restauration vers un autre serveur,
licence perpétuelle).

**Pourquoi Hyperion** (fusion) — les 7 raisons restent (sommaire + onglets avec schéma), mais chacune se limite à son
titre, sa phrase forte, sa conclusion et un lien vers la page détaillée ; les listes à puces qui recopiaient les pages
produit sont retirées (sauf la raison 3, souveraineté, qui n'est détaillée nulle part ailleurs). Puis « La différence
Hyperion Software », puis les témoignages et les chiffres (50+, 10 ans, 98 %) venus de l'ancienne page Témoignages,
puis « Prêt à sécuriser définitivement vos données ? ». Le bandeau de logos (déjà sur l'accueil) et le second appel
« Rejoignez nos clients satisfaits » sont retirés.

**Partenariats Région Sud** (fusion) — une seule page : le réseau du Campus que Hyperion rejoint → le CSIRT
(sélection, courbe d'incident, « Pourquoi Hyperion Software a été retenu ? ») → le Campus Cyber (« Pourquoi ce
partenariat ? ») → **une seule** liste d'avantages (les 4 du CSIRT ; les 4 du Campus disaient la même chose)
→ « Ensemble pour un avenir numérique sécurisé » avec les trois logos → liens vers Dattak et AGS Next.

**Air Gap, Appliances** — leurs résumés du Stealth, du RDO et de Dattak sont gardés (ils servent leur propos) mais
renvoient maintenant vers la page de référence.

**Inchangées sur le fond** : VMware, Image disque, Gestion centralisée, Conformité ANSSI, Disaster Recovery Test,
SaaS, Dattak, Actualités, Contact, Confidentialité.

---

## 4. Textes nouveaux (à valider)

Tout le reste est repris mot pour mot du site actuel. Ont été écrits pour la navigation :

- les libellés du menu et du pied de page (« DataClone : vue d'ensemble », « Cyber-résilience », « Appliances & Cloud »,
  « Hyperion », « Partenariats Région Sud », « Actualités ») ;
- « Un logiciel *complet* » et « Les modules *DataClone* » (titres de la page DataClone) ;
- le titre de la page Partenariats : « Hyperion Software, partenaire cyber de la *Région Sud* » ;
- « Ce que nos partenariats *apportent à nos clients* » (au lieu de « ce partenariat ») ;
- les liens « Découvrir DataClone », « Découvrir le Mode Stealth® », « Découvrir les médias RDO® »,
  « Découvrir le Backup Cloud » (« En savoir plus » existait déjà sur le site).

---

## 5. Incohérences de contenu à trancher (non modifiées)

- **Capacité RDO** : médias de 30 To (accueil, Pourquoi), 32 To (page RDO), 24 To (Appliances) ;
  librairies de 20 médias / 600 To (accueil, retiré de l'accueil dans cette version), 18 médias / 576 To (RDO),
  18 médias / 432 To (Appliances).
- **Ancienneté** : « 10+ ans » (accueil), « 10 ans d'expertise » (témoignages), « 15 années de recherche » (Appliances).
- **Version du logiciel** : DataClone 18, 18.2 et 18.23 selon les pages.
- **Témoignages** : Pierre Laurent, Marie Dubois, « TechServices SA », « Retail Excellence »… ressemblent à des textes
  d'exemple. À remplacer par de vrais témoignages avant la mise en ligne (le témoignage Novelliance, lui, est réel).
- **Image disque** : le prix est vide (« Au prix de € H.T »).

---

## 6. Pistes pour la suite (non faites)

- Une page **« Qui sommes-nous »** : l'histoire, l'équipe, les bureaux (Londres, Roses) — la société n'est présentée
  nulle part, alors que la souveraineté est un argument clé.
- Des **cas clients** réels (Novelliance, et les logos affichés) à la place des témoignages génériques.
- Une **FAQ** (licence, déploiement, restauration) qui répondrait aux questions sans répéter les pages produit.
