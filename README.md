# topolines.tech — Moteur d'Isocontours Vectoriels & Cartographie d'Art

Application web monopage 100 % client (HTML5 / CSS3 moderne / JavaScript vanilla) permettant d'explorer une carte, de sélectionner précisément une zone géographique à l'aide d'un cadre de visée interactif et d'en exporter un poster topographique haute résolution :
- **Architecture en 2 étapes fluides** : Cadrage géographique sur carte Leaflet ➔ Page Studio plein écran de personnalisation en direct (couleurs directes, épaisseurs, calques, typographies) sans recalcul lourd du MNT.
- **Véritable calcul mathématique des courbes de niveau** (*Marching Squares* sur MNT / DEM mondial).
- **Curseur de lissage et d'arrondi poussé jusqu'au Niveau 8** (relaxation laplacienne + algorithme de Chaikin pour des vagues et courbes ultra-organiques).
- **Curseur de filtrage des micro-points résiduels (0 à 40 px)** pour éliminer les moindres artefacts et îlots isolés indésirables.
- **Format de prise custom / personnalisé** : définition libre de dimensions (ex: 50×70 cm, 40×50 cm, 16:9, 4:5...) adaptant le cadre de visée et les résolutions d'export.
- **12 Typographies prestigieuses intégrées** : Montserrat, Inter, Syne, Cormorant Garamond, Plus Jakarta Sans, Playfair Display, Bodoni Moda, Cinzel, Marcellus, Space Grotesk, Oswald, DM Mono.
- **Espacement régulier des lettres corrigé** (notamment pour les "I" et caractères étroits).
- **Export SVG vectoriel pur corrigé et complet** (courbes maîtresses, courbes secondaires, graduations d'altitude, sommets réels ▲, villes, échelle graphique et flèche du Nord).
- **Export PNG jusqu'à 50 Mégapixels et PDF Haute Résolution**.
- **Interface minimaliste, élégante et professionnelle** sans dégradés tape-à-l'œil, avec boutons de couleurs standards et transitions fluides.

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
