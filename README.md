# TopoPoster Studio HD — Moteur d'Isocontours Vectoriels & Cartographie IGN

Application web monopage 100 % client (HTML5 / CSS3 moderne / JavaScript vanilla) permettant d'explorer une carte, de sélectionner précisément une zone géographique à l'aide d'un cadre de visée interactif et d'en exporter un poster topographique haute résolution :
- **Véritable calcul mathématique des courbes de niveau** (*Marching Squares* sur MNT / DEM réel).
- **Vrai rendu toponymique vectoriel dans le thème** :
  - **Villes & Communes (Studio)** : uniquement les villes et villages, sans parcs, sans limites administratives, avec typographie d'art vectorielle harmonisée avec la palette de l'affiche.
  - **Sommets & Pics réels (▲)** : recherche toponymique des vrais noms (Mont Aiguille, Grand Veymont, Barre des Écrins...) couplée à l'altitude exacte en mètres, éliminant tout libellé générique.
  - **Graduations d'altitude des lignes** : étiquetage cartographique orienté le long des courbes maîtresses avec masque de découpe (*knockout*) dans la couleur de fond de l'affiche.
- **Exportation en SVG Vectoriel pur**, **PDF Haute Définition** et **PNG jusqu'à 50 Mégapixels**.
- **Contrôle précis des calques** : courbes maîtresses, réseau routier, toponymie, ombrage 3D, cartouche d'art.
- **Mode « Lignes Topo Pures »** : exporte uniquement les courbes vectorielles sans aucun texte ni route (fond émeraude, noir, blanc ou transparent), reproduisant fidèlement l'affiche d'art de référence.
- **Mode Dalles Raster IGN** : assemblage classique des flux officiels IGN Géoplateforme (Plan v2, Orthophoto, Pentes de montagne).

---

## 🚀 Démarrage Rapide

1. **Option 1 (Le plus simple sous Windows) :**  
   Double-cliquez sur [`lancer-serveur.bat`](file:///c:/Users/jeanm/Documents/projet%20ign/lancer-serveur.bat).  
   Il démarre un serveur local HTTP léger sur `http://localhost:8000` et ouvre votre navigateur.

2. **Option 2 (VS Code Live Server) :**  
   Clic droit sur [`index.html`](file:///c:/Users/jeanm/Documents/projet%20ign/index.html) > **« Open with Live Server »**.

3. **Option 3 (Python, Node ou PHP) :**  
   - Python : `python -m http.server 8000`
   - Node : `npx serve`

---

## 🌟 Fonctionnalités du Studio

### 1. Véritable Moteur d'Isocontours Topo (Marching Squares)
- Télécharge les données d'élévation MNT (Terrain-RGB mondial) via flux ouvert compatible CORS.
- Échantillonne le modèle altimétrique en une matrice numérique d'altitudes réelles.
- Exécute l'algorithme des **Marching Squares** avec interpolation linéaire sub-cellulaire pour tracer chaque courbe de niveau.
- **Assemblage en polylignes continues** : réunit tous les segments contigus en boucles et chaînes fluides.
- **Curseur de lissage fluide (Niveaux 0 à 6)** :
  - *Niveau 0 (Brut)* : fidélité topographique stricte.
  - *Niveau 3 (Standard)* : courbes naturelles organiques idéales pour affiche d'art.
  - *Niveau 6 (Liquide Web)* : relaxation laplacienne + Chaikin d'amplitude pour de grandes ondulations artistiques épurées (parfait pour intégrations web, bannières et posters design).
- **Filtre anti-bruit / micro-points** : élimine automatiquement les artefacts et micro-points isolés causés par des anomalies de 1 pixel dans le MNT.
- **Pas d'élévation réglable** : 10 m, 20 m, 25 m, 50 m, 100 m, 150 m, 200 m, 250 m, 500 m.
- **Courbes maîtresses renforcées** : mise en valeur automatique d'un niveau sur cinq avec trait plus épais.
- **Ombrage 3D du relief (*Hillshade*)** : calcul de pente et d'azimut solaire (315° N-O) pour donner de la profondeur sous les courbes.

---

## 🔑 Clés d'API & Sécurité GitHub

L'application est conçue pour fonctionner **100 % gratuitement et sans aucune inscription** dès son ouverture :
- MNT altimétrique mondial : ouvert, gratuit, sans clé.
- Noms des lieux & toponymie : flux **ESRI ArcGIS Boundaries & Places** (100% gratuit, **SANS aucun filigrane**, sans inscription).
- Dalles raster : IGN Géoplateforme, OpenTopoMap et OpenStreetMap (libres et ouverts).

### Si vous souhaitez ajouter vos propres clés d'API gratuites :
Vous pouvez débloquer des couches HD supplémentaires (Mapbox Satellite, Carto Voyager, Stadia/Stamen) de deux façons **100 % sécurisées pour GitHub** :

1. **Directement dans l'application (Recommandé pour GitHub Pages)** :
   - Cliquez sur **`⚙️ Clés API`** dans l'en-tête de la barre latérale.
   - Collez vos clés gratuites et cliquez sur « Enregistrer ».
   - Les clés sont stockées dans le `localStorage` de votre navigateur. **Elles ne sont jamais envoyées sur GitHub.**

2. **Via fichier de configuration local (pour développeurs)** :
   - Copiez [`config.example.js`](file:///c:/Users/jeanm/Documents/projet%20ign/config.example.js) vers `config.js` ou [`.env.example`](file:///c:/Users/jeanm/Documents/projet%20ign/.env.example) vers `.env`.
   - `config.js` et `.env` sont déjà inscrits dans [`.gitignore`](file:///c:/Users/jeanm/Documents/projet%20ign/.gitignore) : vous pouvez pousser votre dépôt sur GitHub sans aucun risque de fuite de clé !

### 2. Calques Vectoriels Débrayables
- [x] **Courbes de niveau principales**
- [x] **Lignes maîtresses renforcées**
- [x] **Ombrage de relief 3D**
- [x] **Noms des lieux & sommets (Toponymie)**
- [x] **Réseau routier & voies de circulation**
- [x] **Cartouche d'art, échelle & rose des vents**
- [x] **Mode « Lignes Topo Pures »** : un simple clic masque instantanément tous les textes, routes et cartouches pour ne conserver que la géométrie pure des courbes !

### 3. Formats d'Exportation Professionnels
- **Export SVG Vectoriel Pur (.svg)** :
  - Véritable fichier SVG vectoriel avec des balises `<path d="..." />` groupées par calques (`<g id="courbes-maitresses">`, `<g id="courbes-secondaires">`).
  - Résolution infinie, éditable dans Adobe Illustrator, Inkscape, et prêt pour les découpeuses laser ou traceurs CNC.
- **Export PDF Haute Définition (.pdf)** :
  - Fichier PDF vectoriel prêt pour l'imprimeur (mise en page A4 ou sur mesure).
- **Export PNG jusqu'à 50 Mégapixels** :
  - **150 DPI Standard** (~4 Mpx)
  - **300 DPI Pro** (~9 Mpx - A4 Print)
  - **4K Ultra HD** (~16 Mpx)
  - **50 Mégapixels** (~50 Mpx : $7071 \times 7071$ px en carré ou $8420 \times 5950$ px en A4).

### 4. Thèmes & Esthétique
- **Émeraude & Vert** (fond `#14382c` et courbes blanches/menthe, fidèle au modèle *« Back to the Nature »*).
- **Ardoise & Blanc** (style minimaliste contemporain).
- **Blueprint Cyan** (plan technique d'architecte).
- **Sépia Parchemin** (carte ancienne d'explorateur).
- **Noir & Or** (charbon et or champagne).
- **Fond Transparent** (PNG et SVG avec transparence alpha pour intégration graphique directe).
