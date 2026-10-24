/**
 * ==============================================================================
 * TOPOPOSTER STUDIO PRO — MOTEUR APPLICATIF & CARTOGRAPHIQUE
 * Architecture Vanilla JS Modulaire, Sans Dépendance Backend
 * ==============================================================================
 */

/**
 * ------------------------------------------------------------------------------
 * 1. CONSTANTES & PROVIDERS CARTOGRAPHIQUES
 * ------------------------------------------------------------------------------
 */

// Endpoint mondial DEM Terrain-RGB ouvert avec CORS actif
const DEM_ELEVATION_URL = 'https://terrain.reearth.land/mapbox/elevation/{z}/{x}/{y}.png';

// Flux cartographiques officiels
const TILE_PROVIDERS = {
    openTopo: {
        name: 'OpenTopoMap (Relief & Courbes)',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 17,
        attribution: '&copy; OpenTopoMap & MNT'
    },
    ignPlan: {
        name: 'IGN — Plan IGN V2',
        url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
        subdomains: [],
        maxZoom: 18,
        attribution: '&copy; IGN Géoplateforme'
    },
    ignOrtho: {
        name: 'IGN — Photographies Aériennes',
        url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
        subdomains: [],
        maxZoom: 19,
        attribution: '&copy; IGN Orthophoto'
    },
    ignSlopes: {
        name: 'IGN — Pentes & Relief Montagne',
        url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.SLOPES.MOUNTAIN&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
        subdomains: [],
        maxZoom: 17,
        attribution: '&copy; IGN Relief'
    },
    osm: {
        name: 'OpenStreetMap Standard',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    },
    cartoDark: {
        name: 'CARTO — Dark Matter',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        maxZoom: 19,
        attribution: '&copy; CARTO'
    }
};

// Formats et résolutions d'exportation (jusqu'à 50 Mégapixels)
const POSTER_FORMATS = {
    'a4-portrait': {
        name: 'A4 Portrait',
        ratio: 210 / 297,
        sd: { width: 1240, height: 1754 },      // ~2.2 Mpx
        hd: { width: 2480, height: 3508 },      // ~8.7 Mpx (300 DPI)
        '4k': { width: 3500, height: 4950 },    // ~17 Mpx
        '50mp': { width: 5950, height: 8420 }   // ~50.1 Mégapixels
    },
    'a4-landscape': {
        name: 'A4 Paysage',
        ratio: 297 / 210,
        sd: { width: 1754, height: 1240 },
        hd: { width: 3508, height: 2480 },
        '4k': { width: 4950, height: 3500 },
        '50mp': { width: 8420, height: 5950 }   // ~50.1 Mégapixels
    },
    'square': {
        name: 'Format Carré',
        ratio: 1.0,
        sd: { width: 1400, height: 1400 },
        hd: { width: 2800, height: 2800 },
        '4k': { width: 4200, height: 4200 },
        '50mp': { width: 7071, height: 7071 }   // ~50.0 Mégapixels
    },
    'panorama': {
        name: 'Panorama 21:9',
        ratio: 21 / 9,
        sd: { width: 1920, height: 823 },
        hd: { width: 3840, height: 1645 },
        '4k': { width: 5760, height: 2468 },
        '50mp': { width: 10800, height: 4628 }  // ~50.0 Mégapixels
    }
};

// Lieux remarquables préconfigurés
const PRESET_PLACES = {
    vercors: {
        name: 'Massif du Vercors',
        title: 'MASSIF DU VERCORS',
        subtitle: '45.034° N, 5.512° E — ALPES FRANÇAISES',
        coords: [44.975, 5.485],
        zoom: 12
    },
    chamonix: {
        name: 'Mont Blanc / Chamonix',
        title: 'MASSIF DU MONT-BLANC',
        subtitle: '45.832° N, 6.865° E — HAUTE-SAVOIE',
        coords: [45.882, 6.877],
        zoom: 12
    },
    gavarnie: {
        name: 'Cirque de Gavarnie',
        title: 'CIRQUE DE GAVARNIE',
        subtitle: '42.695° N, 0.007° O — HAUTES-PYRÉNÉES',
        coords: [42.697, -0.005],
        zoom: 13
    },
    calanques: {
        name: 'Calanques de Marseille',
        title: 'CALANQUES DE MARSEILLE',
        subtitle: '43.208° N, 5.438° E — MÉDITERRANÉE',
        coords: [43.212, 5.435],
        zoom: 13
    },
    verdon: {
        name: 'Gorges du Verdon',
        title: 'GORGES DU VERDON',
        subtitle: '43.742° N, 6.368° E — PROVENCE',
        coords: [43.742, 6.368],
        zoom: 13
    },
    puydedome: {
        name: 'Puy de Dôme',
        title: 'CHAÎNE DES PUYS',
        subtitle: '45.772° N, 2.964° E — AUVERGNE',
        coords: [45.772, 2.964],
        zoom: 13
    },
    etretat: {
        name: 'Falaises d\'Étretat',
        title: 'FALAISES D\'ÉTRETAT',
        subtitle: '49.707° N, 0.203° E — NORMANDIE',
        coords: [49.707, 0.203],
        zoom: 14
    },
    bavella: {
        name: 'Aiguilles de Bavella',
        title: 'AIGUILLES DE BAVELLA',
        subtitle: '41.796° N, 9.224° E — CORSE-DU-SUD',
        coords: [41.796, 9.224],
        zoom: 13
    }
};

// Base toponymique des sommets majeurs pour étiquetage cartographique et fallback
const KNOWN_SUMMITS_CATALOG = [
    // Massif du Mont-Blanc & Alpes du Nord
    { name: 'Mont Blanc', alt: 4810, lat: 45.8326, lng: 6.8652 },
    { name: 'Mont Maudit', alt: 4465, lat: 45.8478, lng: 6.8786 },
    { name: 'Dôme du Goûter', alt: 4304, lat: 45.8533, lng: 6.8519 },
    { name: 'Aiguille Verte', alt: 4122, lat: 45.9358, lng: 6.9708 },
    { name: 'Grandes Jorasses', alt: 4208, lat: 45.8672, lng: 6.9889 },
    { name: 'Aiguille du Midi', alt: 3842, lat: 45.8794, lng: 6.8875 },
    { name: 'Aiguille de Bionnassay', alt: 4052, lat: 45.8369, lng: 6.7861 },
    { name: 'Dent du Géant', alt: 4013, lat: 45.8631, lng: 6.9531 },
    { name: 'Aiguille du Chardonnet', alt: 3824, lat: 45.9689, lng: 7.0019 },
    { name: 'Mont Dolent', alt: 3820, lat: 45.9217, lng: 7.0461 },
    { name: 'Aiguille du Tour', alt: 3544, lat: 45.9961, lng: 7.0069 },
    { name: 'Le Buet', alt: 3096, lat: 46.0222, lng: 6.8508 },
    { name: 'Le Brévent', alt: 2525, lat: 45.9339, lng: 6.8375 },
    { name: 'Pointe Percée', alt: 2750, lat: 45.9575, lng: 6.5542 },
    { name: 'Mont Charvin', alt: 2409, lat: 45.8039, lng: 6.4186 },
    { name: 'La Tournette', alt: 2351, lat: 45.8258, lng: 6.2558 },
    { name: 'Arcalod', alt: 2217, lat: 45.6806, lng: 6.2239 },
    { name: 'Trélod', alt: 2181, lat: 45.7194, lng: 6.2089 },

    // Massif du Vercors
    { name: 'Grand Veymont', alt: 2341, lat: 44.8703, lng: 5.5256 },
    { name: 'Mont Aiguille', alt: 2087, lat: 44.8489, lng: 5.5539 },
    { name: 'Grande Moucherolle', alt: 2284, lat: 45.0044, lng: 5.5647 },
    { name: 'Petite Moucherolle', alt: 2156, lat: 44.9961, lng: 5.5658 },
    { name: 'Roc Cornafion', alt: 2049, lat: 45.0347, lng: 5.5978 },
    { name: 'Le Moucherotte', alt: 1901, lat: 45.1486, lng: 5.6372 },
    { name: 'Sommet du Gerbier', alt: 2109, lat: 45.0189, lng: 5.5861 },
    { name: 'Roc de Toulau', alt: 1581, lat: 44.9458, lng: 5.3181 },
    { name: 'Pierre Chauve', alt: 1308, lat: 44.9317, lng: 5.1611 },
    { name: 'Bec de l\'Orient', alt: 1554, lat: 45.2289, lng: 5.5392 },
    { name: 'Signal de Nave', alt: 1609, lat: 45.2103, lng: 5.5489 },

    // Chartreuse
    { name: 'Chamechaude', alt: 2082, lat: 45.2878, lng: 5.7903 },
    { name: 'Dent de Crolles', alt: 2062, lat: 45.3025, lng: 5.8547 },
    { name: 'Grand Som', alt: 2026, lat: 45.3642, lng: 5.8117 },
    { name: 'Charmant Som', alt: 1867, lat: 45.2972, lng: 5.7647 },
    { name: 'Mont Granier', alt: 1933, lat: 45.4642, lng: 5.9281 },
    { name: 'La Pinéa', alt: 1771, lat: 45.2736, lng: 5.7486 },

    // Belledonne
    { name: 'Grand Pic de Belledonne', alt: 2977, lat: 45.1725, lng: 5.9903 },
    { name: 'Croix de Belledonne', alt: 2926, lat: 45.1764, lng: 5.9869 },
    { name: 'Rocher Blanc', alt: 2928, lat: 45.2417, lng: 6.0658 },
    { name: 'Pic du Grand Doménon', alt: 2802, lat: 45.1561, lng: 5.9789 },
    { name: 'Le Grand Colon', alt: 2394, lat: 45.1528, lng: 5.9189 },

    // Écrins & Oisans
    { name: 'Barre des Écrins', alt: 4102, lat: 44.9228, lng: 6.3589 },
    { name: 'Dôme des Écrins', alt: 4015, lat: 44.9264, lng: 6.3556 },
    { name: 'La Meije', alt: 3984, lat: 45.0061, lng: 6.3131 },
    { name: 'Ailefroide', alt: 3954, lat: 44.8967, lng: 6.3567 },
    { name: 'Mont Pelvoux', alt: 3946, lat: 44.9128, lng: 6.3908 },
    { name: 'Pic Sans Nom', alt: 3913, lat: 44.9083, lng: 6.3639 },
    { name: 'Le Râteau', alt: 3809, lat: 45.0133, lng: 6.2758 },
    { name: 'La Grande Ruine', alt: 3765, lat: 44.9789, lng: 6.3331 },
    { name: 'Pic Coolidge', alt: 3775, lat: 44.9167, lng: 6.3556 },
    { name: 'Roche Faurio', alt: 3730, lat: 44.9458, lng: 6.3667 },
    { name: 'Les Bans', alt: 3669, lat: 44.8686, lng: 6.3353 },
    { name: 'Roche de la Muzelle', alt: 3465, lat: 44.9589, lng: 6.1139 },
    { name: 'Le Taillefer', alt: 2857, lat: 45.0389, lng: 5.9239 },
    { name: 'Pic de l\'Étendard', alt: 3464, lat: 45.1833, lng: 6.1833 },

    // Vanoise
    { name: 'Grande Casse', alt: 3855, lat: 45.4217, lng: 6.7831 },
    { name: 'Mont Pourri', alt: 3779, lat: 45.5333, lng: 6.8589 },
    { name: 'Dent Parrachée', alt: 3697, lat: 45.2958, lng: 6.7458 },
    { name: 'Grande Motte', alt: 3653, lat: 45.4117, lng: 6.8722 },

    // Dévoluy & Alpes du Sud
    { name: 'Grande Tête de l\'Obiou', alt: 2789, lat: 44.7778, lng: 5.8361 },
    { name: 'Grand Ferrand', alt: 2758, lat: 44.7333, lng: 5.8167 },
    { name: 'Pic de Bure', alt: 2709, lat: 44.6278, lng: 5.9333 },
    { name: 'Mont Viso', alt: 3841, lat: 44.6672, lng: 7.0906 },
    { name: 'Cime du Gélas', alt: 3143, lat: 44.1250, lng: 7.3833 },
    { name: 'Mont Argentera', alt: 3297, lat: 44.1789, lng: 7.3117 },
    { name: 'Mont Pelat', alt: 3051, lat: 44.2611, lng: 6.7028 },

    // Pyrénées
    { name: 'Pic d\'Aneto', alt: 3404, lat: 42.6322, lng: 0.6578 },
    { name: 'Mont Perdu', alt: 3355, lat: 42.6756, lng: 0.0339 },
    { name: 'Vignemale', alt: 3298, lat: 42.7739, lng: -0.1472 },
    { name: 'Pic du Taillon', alt: 3144, lat: 42.6925, lng: -0.0508 },
    { name: 'Pic Long', alt: 3192, lat: 42.8033, lng: 0.1008 },
    { name: 'Pic de Néouvielle', alt: 3091, lat: 42.8361, lng: 0.1167 },
    { name: 'Pic du Midi d\'Ossau', alt: 2884, lat: 42.8428, lng: -0.4286 },
    { name: 'Pic du Midi de Bigorre', alt: 2877, lat: 42.9367, lng: 0.1411 },
    { name: 'Pic du Canigou', alt: 2784, lat: 42.5189, lng: 2.4567 },
    { name: 'Pic du Carlit', alt: 2921, lat: 42.5703, lng: 1.9317 },

    // Massif Central & Volcans
    { name: 'Puy de Sancy', alt: 1885, lat: 45.5294, lng: 2.8156 },
    { name: 'Plomb du Cantal', alt: 1855, lat: 45.0600, lng: 2.7600 },
    { name: 'Puy Mary', alt: 1783, lat: 45.1189, lng: 2.6778 },
    { name: 'Mont Mézenc', alt: 1753, lat: 44.9125, lng: 4.1542 },
    { name: 'Mont Lozère', alt: 1699, lat: 44.4258, lng: 3.7389 },
    { name: 'Mont Aigoual', alt: 1565, lat: 44.1219, lng: 3.5794 },
    { name: 'Puy de Dôme', alt: 1465, lat: 45.7725, lng: 2.9642 },

    // Jura
    { name: 'Crêt de la Neige', alt: 1720, lat: 46.2731, lng: 5.9431 },
    { name: 'Le Reculet', alt: 1718, lat: 46.2575, lng: 5.9292 },
    { name: 'La Dôle', alt: 1677, lat: 46.4258, lng: 6.1006 },
    { name: 'Mont d\'Or', alt: 1463, lat: 46.7333, lng: 6.3500 },

    // Vosges
    { name: 'Grand Ballon', alt: 1424, lat: 47.9019, lng: 7.1003 },
    { name: 'Le Hohneck', alt: 1363, lat: 48.0378, lng: 7.0164 },
    { name: 'Ballon d\'Alsace', alt: 1247, lat: 47.8189, lng: 6.8406 },

    // Corse
    { name: 'Monte Cinto', alt: 2706, lat: 42.3789, lng: 8.9467 },
    { name: 'Monte Rotondo', alt: 2622, lat: 42.2158, lng: 9.0589 },
    { name: 'Paglia Orba', alt: 2525, lat: 42.3428, lng: 8.8833 },
    { name: 'Aiguilles de Bavella', alt: 1899, lat: 41.7961, lng: 9.2247 }
];

// Base toponymique des villes & communes pour étiquetage vectoriel épuré
const KNOWN_CITIES_CATALOG = [
    { name: 'Grenoble', lat: 45.1885, lng: 5.7245, type: 'city', population: 158000 },
    { name: 'Lyon', lat: 45.7640, lng: 4.8357, type: 'city', population: 522000 },
    { name: 'Valence', lat: 44.9333, lng: 4.8917, type: 'city', population: 64000 },
    { name: 'Chambéry', lat: 45.5646, lng: 5.9178, type: 'city', population: 59000 },
    { name: 'Annecy', lat: 45.8992, lng: 6.1294, type: 'city', population: 131000 },
    { name: 'Genève', lat: 46.2044, lng: 6.1432, type: 'city', population: 203000 },
    { name: 'Chamonix-Mont-Blanc', lat: 45.9237, lng: 6.8694, type: 'town', population: 8600 },
    { name: 'Villard-de-Lans', lat: 45.0706, lng: 5.5513, type: 'town', population: 4200 },
    { name: 'Autrans', lat: 45.1760, lng: 5.5442, type: 'village', population: 3000 },
    { name: 'Saint-Marcellin', lat: 45.1539, lng: 5.3203, type: 'town', population: 7800 },
    { name: 'Saint-Martin-en-Vercors', lat: 45.0216, lng: 5.4428, type: 'village', population: 400 },
    { name: 'Vassieux-en-Vercors', lat: 44.8961, lng: 5.3708, type: 'village', population: 330 },
    { name: 'Die', lat: 44.7544, lng: 5.3719, type: 'town', population: 4700 },
    { name: 'Briançon', lat: 44.8994, lng: 6.6433, type: 'town', population: 11000 },
    { name: 'Gap', lat: 44.5594, lng: 6.0797, type: 'city', population: 41000 },
    { name: 'Albertville', lat: 45.6756, lng: 6.3928, type: 'city', population: 20000 },
    { name: 'Bourg-Saint-Maurice', lat: 45.6178, lng: 6.7686, type: 'town', population: 7200 },
    { name: 'Saint-Jean-de-Maurienne', lat: 45.2764, lng: 6.3458, type: 'town', population: 7700 },
    { name: 'Voiron', lat: 45.3653, lng: 5.5897, type: 'city', population: 20000 },
    { name: 'Romans-sur-Isère', lat: 45.0461, lng: 5.0506, type: 'city', population: 33000 },
    { name: 'Crest', lat: 44.7289, lng: 5.0217, type: 'town', population: 8700 },
    { name: 'Nyons', lat: 44.3606, lng: 5.1408, type: 'town', population: 6800 },
    { name: 'Digne-les-Bains', lat: 44.0928, lng: 6.2361, type: 'town', population: 16000 },
    { name: 'Sisteron', lat: 44.1958, lng: 5.9431, type: 'town', population: 7600 },
    { name: 'Manosque', lat: 43.8333, lng: 5.7833, type: 'city', population: 23000 },
    { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474, type: 'city', population: 147000 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698, type: 'city', population: 873000 },
    { name: 'Nice', lat: 43.7102, lng: 7.2620, type: 'city', population: 343000 },
    { name: 'Cannes', lat: 43.5528, lng: 7.0174, type: 'city', population: 74000 },
    { name: 'Toulon', lat: 43.1242, lng: 5.9280, type: 'city', population: 180000 },
    { name: 'Montpellier', lat: 43.6108, lng: 3.8767, type: 'city', population: 300000 },
    { name: 'Nîmes', lat: 43.8367, lng: 4.3601, type: 'city', population: 148000 },
    { name: 'Avignon', lat: 43.9493, lng: 4.8055, type: 'city', population: 92000 },
    { name: 'Alès', lat: 44.1281, lng: 4.0817, type: 'city', population: 42000 },
    { name: 'Mende', lat: 44.5181, lng: 3.5008, type: 'town', population: 12000 },
    { name: 'Millau', lat: 44.0986, lng: 3.0783, type: 'town', population: 22000 },
    { name: 'Rodez', lat: 44.3517, lng: 2.5758, type: 'city', population: 24000 },
    { name: 'Aurillac', lat: 44.9283, lng: 2.4456, type: 'city', population: 25000 },
    { name: 'Clermont-Ferrand', lat: 45.7772, lng: 3.0870, type: 'city', population: 147000 },
    { name: 'Le Puy-en-Velay', lat: 45.0433, lng: 3.8853, type: 'city', population: 19000 },
    { name: 'Saint-Étienne', lat: 45.4397, lng: 4.3872, type: 'city', population: 174000 },
    { name: 'Pau', lat: 43.2951, lng: -0.3708, type: 'city', population: 77000 },
    { name: 'Tarbes', lat: 43.2328, lng: 0.0781, type: 'city', population: 43000 },
    { name: 'Lourdes', lat: 43.0947, lng: -0.0458, type: 'town', population: 13000 },
    { name: 'Cauterets', lat: 42.8889, lng: -0.1139, type: 'village', population: 900 },
    { name: 'Saint-Lary-Soulan', lat: 42.8167, lng: 0.3167, type: 'village', population: 850 },
    { name: 'Bagnères-de-Luchon', lat: 42.7917, lng: 0.5944, type: 'town', population: 2200 },
    { name: 'Foix', lat: 42.9658, lng: 1.6067, type: 'town', population: 9600 },
    { name: 'Perpignan', lat: 42.6986, lng: 2.8956, type: 'city', population: 120000 },
    { name: 'Toulouse', lat: 43.6047, lng: 1.4442, type: 'city', population: 498000 },
    { name: 'Besançon', lat: 47.2378, lng: 6.0244, type: 'city', population: 118000 },
    { name: 'Pontarlier', lat: 46.9067, lng: 6.3550, type: 'town', population: 18000 },
    { name: 'Saint-Claude', lat: 46.3889, lng: 5.8642, type: 'town', population: 9000 },
    { name: 'Mulhouse', lat: 47.7508, lng: 7.3359, type: 'city', population: 108000 },
    { name: 'Colmar', lat: 48.0794, lng: 7.3582, type: 'city', population: 69000 },
    { name: 'Strasbourg', lat: 48.5734, lng: 7.7521, type: 'city', population: 290000 },
    { name: 'Gérardmer', lat: 48.0717, lng: 6.8789, type: 'town', population: 8000 },
    { name: 'Bastia', lat: 42.7028, lng: 9.4500, type: 'city', population: 48000 },
    { name: 'Ajaccio', lat: 41.9267, lng: 8.7369, type: 'city', population: 73000 },
    { name: 'Corte', lat: 42.3061, lng: 9.1508, type: 'town', population: 7500 },
    { name: 'Porto-Vecchio', lat: 41.5917, lng: 9.2792, type: 'town', population: 11000 }
];

// Miroirs Overpass API pour requêtes toponymiques rapides & fiables
const OVERPASS_MIRRORS = [
    'https://overpass.openstreetmap.fr/api/interpreter',
    'https://overpass.osm.ch/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter'
];

async function queryOverpassWithFallback(query, timeoutMs = 3800) {
    for (const url of OVERPASS_MIRRORS) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: 'data=' + encodeURIComponent(query),
                signal: controller.signal
            });
            clearTimeout(timer);
            if (res.ok) {
                const data = await res.json();
                if (data && data.elements) return data.elements;
            }
        } catch (e) {
            // Continuer vers le miroir suivant sans bloquer l'utilisateur
        }
    }
    return null;
}

// Palettes et Thèmes Artistiques
const POSTER_THEMES = {
    emerald: {
        name: 'Émeraude & Blanc',
        bg: '#14382c',
        isDark: true,
        minorColor: 'rgba(255, 255, 255, 0.65)',
        majorColor: '#ffffff',
        peakColor: '#ffffff',
        textColor: '#f0fdf4',
        subtleLine: 'rgba(255, 255, 255, 0.25)',
        cardClass: 'theme-emerald'
    },
    dark: {
        name: 'Ardoise & Blanc',
        bg: '#0f172a',
        isDark: true,
        minorColor: 'rgba(255, 255, 255, 0.55)',
        majorColor: '#ffffff',
        peakColor: '#ffffff',
        textColor: '#f8fafc',
        subtleLine: 'rgba(255, 255, 255, 0.20)',
        cardClass: 'theme-dark'
    },
    blueprint: {
        name: 'Blueprint Cyan',
        bg: '#0d223a',
        isDark: true,
        minorColor: 'rgba(56, 189, 248, 0.60)',
        majorColor: '#e0f2fe',
        peakColor: '#38bdf8',
        textColor: '#e0f2fe',
        subtleLine: 'rgba(56, 189, 248, 0.30)',
        cardClass: 'theme-blueprint'
    },
    sepia: {
        name: 'Sépia Parchemin',
        bg: '#f5eedc',
        isDark: false,
        minorColor: 'rgba(62, 39, 23, 0.55)',
        majorColor: '#3e2723',
        peakColor: '#3e2723',
        textColor: '#3e2723',
        subtleLine: 'rgba(62, 39, 23, 0.22)',
        cardClass: 'theme-sepia'
    },
    gold: {
        name: 'Noir & Or',
        bg: '#18181b',
        isDark: true,
        minorColor: 'rgba(254, 240, 138, 0.55)',
        majorColor: '#fef08a',
        peakColor: '#fef08a',
        textColor: '#fef08a',
        subtleLine: 'rgba(254, 240, 138, 0.30)',
        cardClass: 'theme-gold'
    },
    transparent: {
        name: 'Fond Transparent',
        bg: 'transparent',
        isDark: true,
        minorColor: 'rgba(255, 255, 255, 0.70)',
        majorColor: '#ffffff',
        peakColor: '#ffffff',
        textColor: '#ffffff',
        subtleLine: 'rgba(255, 255, 255, 0.30)',
        cardClass: 'theme-dark'
    }
};

/**
 * ------------------------------------------------------------------------------
 * 2. GESTION DES CLÉS D'API & FLUX SÉCURISÉS (LOCALSTORAGE)
 * ------------------------------------------------------------------------------
 */
function getApiKeys() {
    const local = {
        mapbox: localStorage.getItem('topo_mapbox_token') || '',
        stadia: localStorage.getItem('topo_stadia_key') || '',
        carto: localStorage.getItem('topo_carto_key') || ''
    };
    const file = window.TOPO_CONFIG || {};
    return {
        mapbox: local.mapbox || file.MAPBOX_TOKEN || '',
        stadia: local.stadia || file.STADIA_KEY || '',
        carto: local.carto || file.CARTO_KEY || ''
    };
}

function getLabelsTileUrl() {
    const keys = getApiKeys();
    if (keys.carto) {
        return `https://a.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png?api_key=${encodeURIComponent(keys.carto)}`;
    }
    if (keys.stadia) {
        return `https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}.png?api_key=${encodeURIComponent(keys.stadia)}`;
    }
    // Par défaut (100% gratuit, sans filigrane, sans inscription, CORS *)
    return 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
}

/**
 * ------------------------------------------------------------------------------
 * 3. ÉTAT GLOBAL DE L'APPLICATION (APP STATE)
 * ------------------------------------------------------------------------------
 */
const appState = {
    // Mode d'action principal : 'vector' (Courbes DEM) ou 'raster' (Dalles IGN)
    activeMode: 'vector',
    navBasemapKey: 'openTopo', // Fond de carte interactif actif pour naviguer

    // Mise en page texte : 'poster' (Cartouche & Cadre), 'minimal' (Éditorial bas), 'pure' (0 texte)
    layoutMode: 'poster',

    map: null,
    baseLayer: null,
    rasterLayerKey: 'openTopo',
    formatKey: 'a4-portrait',
    themeKey: 'emerald',
    resolutionKey: 'hd',
    fontFamily: 'Montserrat',
    titleText: 'MASSIF DU VERCORS',
    subtitleText: '45.034° N, 5.512° E — ALPES FRANÇAISES',

    // Paramètres du Moteur Vectoriel
    contourStep: 50,
    smoothingLevel: 3, // 0 = Brut, 3 = Fluide Affiche, 6 = Liquide Web
    filterNoise: true,  // Élimine les micro-points isolés (artefacts DEM)
    showContours: true,
    showMajorContours: true,
    showPeaks: true,           // NOUVEAUTÉ : Affichage des sommets & altitudes (▲)
    showContourLabels: true,   // Graduations d'altitude sur les courbes maîtresses (ex: 1500m)
    showHillshade: true,
    showLabels: false,
    showScaleNorth: true,

    sidebarCollapsed: false,
    currentBBox: null,
    currentCenter: null
};

/**
 * ------------------------------------------------------------------------------
 * 4. THÈME DE L'INTERFACE UTILISATEUR (LIGHT / DARK MODE)
 * ------------------------------------------------------------------------------
 */
function initUiTheme() {
    const savedTheme = localStorage.getItem('topo_ui_theme') || 'dark';
    setUiTheme(savedTheme);
}

function setUiTheme(theme) {
    document.documentElement.setAttribute('data-ui-theme', theme);
    localStorage.setItem('topo_ui_theme', theme);

    const iconDark = document.getElementById('theme-icon-dark');
    const iconLight = document.getElementById('theme-icon-light');
    if (theme === 'light') {
        if (iconDark) iconDark.style.display = 'none';
        if (iconLight) iconLight.style.display = 'block';
    } else {
        if (iconDark) iconDark.style.display = 'block';
        if (iconLight) iconLight.style.display = 'none';
    }
}

function toggleUiTheme() {
    const current = document.documentElement.getAttribute('data-ui-theme') || 'dark';
    setUiTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * ------------------------------------------------------------------------------
 * 5. INITIALISATION DE LA CARTE LEAFLET & GESTION DES COUCHES
 * ------------------------------------------------------------------------------
 */
function initMap() {
    const initialSpot = PRESET_PLACES.vercors;

    appState.map = L.map('map', {
        center: initialSpot.coords,
        zoom: initialSpot.zoom,
        zoomControl: true,
        attributionControl: true
    });

    appState.map.zoomControl.setPosition('topright');

    updateInteractiveMapDisplay();

    appState.map.on('move', updateBoundingBox);
    appState.map.on('zoomend', updateBoundingBox);
    appState.map.on('resize', updateBoundingBox);

    updateFrameDimensions();
    updateBoundingBox();
}

/**
 * Met à jour le fond de carte Leaflet sous le cadre de recadrage
 */
function updateInteractiveMapDisplay() {
    if (appState.baseLayer) {
        appState.map.removeLayer(appState.baseLayer);
    }

    const providerKey = (appState.activeMode === 'vector') ? appState.navBasemapKey : appState.rasterLayerKey;
    const prov = TILE_PROVIDERS[providerKey] || TILE_PROVIDERS.openTopo;

    appState.baseLayer = L.tileLayer(prov.url, {
        subdomains: prov.subdomains,
        maxZoom: prov.maxZoom,
        crossOrigin: 'anonymous',
        attribution: prov.attribution
    }).addTo(appState.map);

    const mapContainer = document.getElementById('map');
    const tilePane = document.querySelector('.leaflet-tile-pane');
    if (!mapContainer || !tilePane) return;

    // Filtre thématique élégant et non-agressif
    if (appState.activeMode === 'vector') {
        if (appState.navBasemapKey === 'cartoDark') {
            mapContainer.style.backgroundColor = '#0b0f17';
            tilePane.style.filter = 'none';
        } else if (appState.navBasemapKey === 'ignOrtho') {
            mapContainer.style.backgroundColor = '#0b0f17';
            tilePane.style.filter = 'brightness(90%) contrast(105%)';
        } else {
            // Relief OpenTopo ou Plan standard avec teinte thématique douce
            applySubtleThemeFilter(appState.themeKey);
        }
    } else {
        mapContainer.style.backgroundColor = '#0f172a';
        tilePane.style.filter = 'none';
    }
}

function applySubtleThemeFilter(themeKey) {
    const mapContainer = document.getElementById('map');
    const tilePane = document.querySelector('.leaflet-tile-pane');
    if (!tilePane || !mapContainer) return;

    if (themeKey === 'emerald') {
        mapContainer.style.backgroundColor = '#14382c';
        tilePane.style.filter = 'grayscale(80%) contrast(140%) brightness(95%) sepia(20%) hue-rotate(90deg)';
    } else if (themeKey === 'dark' || themeKey === 'transparent') {
        mapContainer.style.backgroundColor = '#0f172a';
        tilePane.style.filter = 'grayscale(100%) contrast(130%) brightness(95%)';
    } else if (themeKey === 'blueprint') {
        mapContainer.style.backgroundColor = '#0d223a';
        tilePane.style.filter = 'grayscale(100%) contrast(140%) invert(100%) sepia(100%) hue-rotate(170deg) saturate(300%)';
    } else if (themeKey === 'sepia') {
        mapContainer.style.backgroundColor = '#f5eedc';
        tilePane.style.filter = 'grayscale(70%) sepia(75%) contrast(120%)';
    } else if (themeKey === 'gold') {
        mapContainer.style.backgroundColor = '#18181b';
        tilePane.style.filter = 'grayscale(100%) contrast(150%) brightness(90%)';
    }
}

/**
 * ------------------------------------------------------------------------------
 * 6. CADRE DE VISÉE & CALCULS GÉODÉSIQUES EN DIRECT
 * ------------------------------------------------------------------------------
 */
function updateFrameDimensions() {
    const frame = document.getElementById('crop-frame');
    const overlay = document.getElementById('crop-overlay');
    const format = POSTER_FORMATS[appState.formatKey];
    if (!frame || !format || !overlay) return;

    const overlayW = overlay.clientWidth;
    const overlayH = overlay.clientHeight;

    const maxFrameW = Math.min(overlayW * 0.82, overlayW - 60);
    const maxFrameH = Math.min(overlayH * 0.82, overlayH - 60);

    let frameW, frameH;
    const targetRatio = format.ratio;

    if (targetRatio <= 1.0) {
        frameH = maxFrameH;
        frameW = frameH * targetRatio;
        if (frameW > maxFrameW) {
            frameW = maxFrameW;
            frameH = frameW / targetRatio;
        }
    } else {
        frameW = maxFrameW;
        frameH = frameW / targetRatio;
        if (frameH > maxFrameH) {
            frameH = maxFrameH;
            frameW = frameH * targetRatio;
        }
    }

    frame.style.width = `${Math.round(frameW)}px`;
    frame.style.height = `${Math.round(frameH)}px`;

    const dim = format[appState.resolutionKey];
    document.getElementById('frame-ratio-label').innerText = `${format.name} (${dim.width} × ${dim.height} px)`;

    setTimeout(updateBoundingBox, 50);
}

function updateBoundingBox() {
    if (!appState.map) return;

    const mapElem = document.getElementById('map');
    const frameElem = document.getElementById('crop-frame');
    if (!frameElem || !mapElem) return;

    const mapRect = mapElem.getBoundingClientRect();
    const frameRect = frameElem.getBoundingClientRect();

    const nwPoint = L.point(frameRect.left - mapRect.left, frameRect.top - mapRect.top);
    const sePoint = L.point(frameRect.right - mapRect.left, frameRect.bottom - mapRect.top);

    const nwLatLng = appState.map.containerPointToLatLng(nwPoint);
    const seLatLng = appState.map.containerPointToLatLng(sePoint);

    const north = Math.max(nwLatLng.lat, seLatLng.lat);
    const south = Math.min(nwLatLng.lat, seLatLng.lat);
    const west = Math.min(nwLatLng.lng, seLatLng.lng);
    const east = Math.max(nwLatLng.lng, seLatLng.lng);

    appState.currentBBox = { north, south, east, west };
    appState.currentCenter = {
        lat: (north + south) / 2,
        lng: (east + west) / 2
    };

    document.getElementById('bbox-values').innerText = 
        `N: ${north.toFixed(4)}° | S: ${south.toFixed(4)}° | O: ${west.toFixed(4)}° | E: ${east.toFixed(4)}°`;

    updateLivePreview();
}

function formatToDMS(lat, lng) {
    function convert(coord, posChar, negChar) {
        const char = coord >= 0 ? posChar : negChar;
        const val = Math.abs(coord);
        const d = Math.floor(val);
        const mFloat = (val - d) * 60;
        const m = Math.floor(mFloat);
        const s = Math.round((mFloat - m) * 60);
        return `${d}° ${String(m).padStart(2, '0')}' ${String(s).padStart(2, '0')}" ${char}`;
    }
    return `${convert(lat, 'N', 'S')}  •  ${convert(lng, 'E', 'O')}`;
}

function updateLivePreview() {
    const previewBox = document.getElementById('live-cartouche-preview');
    if (!previewBox) return;

    // Mode "Lignes Pures" : cacher tout le texte
    if (appState.layoutMode === 'pure') {
        previewBox.classList.add('hidden');
        return;
    }
    previewBox.classList.remove('hidden');

    const theme = POSTER_THEMES[appState.themeKey];
    previewBox.className = '';
    if (theme && theme.cardClass) {
        previewBox.classList.add(theme.cardClass);
    }
    if (appState.layoutMode === 'minimal') {
        previewBox.classList.add('layout-minimal');
    }

    previewBox.style.fontFamily = `'${appState.fontFamily}', sans-serif`;

    document.getElementById('preview-title-text').innerText = appState.titleText || '';
    document.getElementById('preview-subtitle-text').innerText = appState.subtitleText || '';

    if (appState.currentCenter) {
        const dmsText = formatToDMS(appState.currentCenter.lat, appState.currentCenter.lng);
        document.getElementById('preview-coords-text').innerText = dmsText;
    }

    if (appState.currentBBox && appState.map) {
        const lat = appState.currentCenter.lat;
        const pLeft = L.latLng(lat, appState.currentBBox.west);
        const pRight = L.latLng(lat, appState.currentBBox.east);
        const meters = pLeft.distanceTo(pRight);
        const scaleKm = (meters / 1000).toFixed(1);
        document.getElementById('preview-scale-text').innerText = `ENVERGURE ~ ${scaleKm} KM`;
    }
}

/**
 * ------------------------------------------------------------------------------
 * 7. MOTEUR DEM & CALCUL DES ISOCONTOURS (512px NATIVE RESOLUTION)
 * ------------------------------------------------------------------------------
 */
function fetchTile(url, retries = 2) {
    return new Promise((resolve) => {
        function attempt(n) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => {
                if (n > 0) {
                    setTimeout(() => attempt(n - 1), 300);
                } else {
                    console.warn(`[TopoPoster] Échec chargement tuile: ${url}`);
                    resolve(null);
                }
            };
            img.src = url;
        }
        attempt(retries);
    });
}

/**
 * Décode la grille altimétrique 2D depuis les dalles Terrain-RGB (512×512 natif)
 */
async function fetchElevationGrid(bbox, targetZoom, sampleSize = 650) {
    const nwMercator = appState.map.project(L.latLng(bbox.north, bbox.west), targetZoom);
    const seMercator = appState.map.project(L.latLng(bbox.south, bbox.east), targetZoom);

    const minTileX = Math.floor(nwMercator.x / 256);
    const maxTileX = Math.floor(seMercator.x / 256);
    const minTileY = Math.floor(nwMercator.y / 256);
    const maxTileY = Math.floor(seMercator.y / 256);

    const tilePromises = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
        for (let ty = minTileY; ty <= maxTileY; ty++) {
            const url = DEM_ELEVATION_URL
                .replace('{z}', targetZoom)
                .replace('{x}', tx)
                .replace('{y}', ty);
            tilePromises.push({ tx, ty, promise: fetchTile(url) });
        }
    }

    const loadedTiles = await Promise.all(tilePromises.map(async t => ({
        tx: t.tx,
        ty: t.ty,
        img: await t.promise
    })));

    let nativeTileW = 512;
    let nativeTileH = 512;
    for (const t of loadedTiles) {
        if (t.img && t.img.naturalWidth) {
            nativeTileW = t.img.naturalWidth;
            nativeTileH = t.img.naturalHeight;
            break;
        }
    }
    const scaleFactor = nativeTileW / 256;

    const tilesCols = maxTileX - minTileX + 1;
    const tilesRows = maxTileY - minTileY + 1;
    const tilesCanvas = document.createElement('canvas');
    tilesCanvas.width = tilesCols * nativeTileW;
    tilesCanvas.height = tilesRows * nativeTileH;
    const tCtx = tilesCanvas.getContext('2d', { willReadFrequently: true });

    for (const t of loadedTiles) {
        const dx = (t.tx - minTileX) * nativeTileW;
        const dy = (t.ty - minTileY) * nativeTileH;
        if (t.img) {
            tCtx.drawImage(t.img, dx, dy, nativeTileW, nativeTileH);
        }
    }

    const cropX = (nwMercator.x - (minTileX * 256)) * scaleFactor;
    const cropY = (nwMercator.y - (minTileY * 256)) * scaleFactor;
    const cropW = (seMercator.x - nwMercator.x) * scaleFactor;
    const cropH = (seMercator.y - nwMercator.y) * scaleFactor;

    const gridW = sampleSize;
    const gridH = Math.max(10, Math.round(sampleSize * (cropH / cropW)));
    const gridCanvas = document.createElement('canvas');
    gridCanvas.width = gridW;
    gridCanvas.height = gridH;
    const gCtx = gridCanvas.getContext('2d', { willReadFrequently: true });

    gCtx.imageSmoothingEnabled = true;
    gCtx.imageSmoothingQuality = 'high';
    gCtx.drawImage(tilesCanvas, cropX, cropY, cropW, cropH, 0, 0, gridW, gridH);
    const imgData = gCtx.getImageData(0, 0, gridW, gridH).data;

    // Décodage des altitudes Mapbox Terrain-RGB en mètres
    const grid = new Float32Array(gridW * gridH);
    let minH = Infinity;
    let maxH = -Infinity;

    for (let i = 0; i < gridW * gridH; i++) {
        const a = imgData[i * 4 + 3];
        if (a === 0) {
            grid[i] = NaN;
            continue;
        }
        const r = imgData[i * 4];
        const g = imgData[i * 4 + 1];
        const b = imgData[i * 4 + 2];
        const alt = -10000 + ((r * 65536 + g * 256 + b) * 0.1);
        grid[i] = alt;
        if (alt < minH) minH = alt;
        if (alt > maxH) maxH = alt;
    }

    if (minH === Infinity) { minH = 0; maxH = 1000; }
    const defaultAlt = (minH + maxH) / 2;
    for (let i = 0; i < gridW * gridH; i++) {
        if (isNaN(grid[i])) {
            grid[i] = defaultAlt;
        }
    }

    console.log(`[TopoPoster] Grille DEM prête : ${gridW}×${gridH} points, de ${Math.round(minH)}m à ${Math.round(maxH)}m`);
    return { grid, gridW, gridH, minH, maxH };
}

/**
 * Algorithme Marching Squares avec assemblage en polylignes et filtre anti-bruit
 */
function computeMarchingSquaresContours(grid, gridW, gridH, step) {
    let minH = Infinity;
    let maxH = -Infinity;
    for (let i = 0; i < grid.length; i++) {
        const v = grid[i];
        if (v < minH) minH = v;
        if (v > maxH) maxH = v;
    }

    const startH = Math.ceil(minH / step) * step;
    const endH = Math.floor(maxH / step) * step;
    const contours = [];

    for (let h = startH; h <= endH; h += step) {
        const segments = [];
        const isMajor = (h % (step * 5) === 0);

        for (let y = 0; y < gridH - 1; y++) {
            const row0 = y * gridW;
            const row1 = (y + 1) * gridW;

            for (let x = 0; x < gridW - 1; x++) {
                const v0 = grid[row0 + x];
                const v1 = grid[row0 + x + 1];
                const v2 = grid[row1 + x + 1];
                const v3 = grid[row1 + x];

                const b0 = v0 >= h ? 8 : 0;
                const b1 = v1 >= h ? 4 : 0;
                const b2 = v2 >= h ? 2 : 0;
                const b3 = v3 >= h ? 1 : 0;
                const cellCase = b0 | b1 | b2 | b3;

                if (cellCase === 0 || cellCase === 15) continue;

                const topX = x + (h - v0) / (v1 - v0);
                const topY = y;
                const rightX = x + 1;
                const rightY = y + (h - v1) / (v2 - v1);
                const bottomX = x + (h - v3) / (v2 - v3);
                const bottomY = y + 1;
                const leftX = x;
                const leftY = y + (h - v0) / (v3 - v0);

                switch (cellCase) {
                    case 1:  segments.push([[leftX, leftY], [bottomX, bottomY]]); break;
                    case 2:  segments.push([[bottomX, bottomY], [rightX, rightY]]); break;
                    case 3:  segments.push([[leftX, leftY], [rightX, rightY]]); break;
                    case 4:  segments.push([[topX, topY], [rightX, rightY]]); break;
                    case 5:
                        segments.push([[topX, topY], [rightX, rightY]]);
                        segments.push([[leftX, leftY], [bottomX, bottomY]]);
                        break;
                    case 6:  segments.push([[topX, topY], [bottomX, bottomY]]); break;
                    case 7:  segments.push([[topX, topY], [leftX, leftY]]); break;
                    case 8:  segments.push([[topX, topY], [leftX, leftY]]); break;
                    case 9:  segments.push([[topX, topY], [bottomX, bottomY]]); break;
                    case 10:
                        segments.push([[topX, topY], [leftX, leftY]]);
                        segments.push([[bottomX, bottomY], [rightX, rightY]]);
                        break;
                    case 11: segments.push([[topX, topY], [rightX, rightY]]); break;
                    case 12: segments.push([[leftX, leftY], [rightX, rightY]]); break;
                    case 13: segments.push([[bottomX, bottomY], [rightX, rightY]]); break;
                    case 14: segments.push([[leftX, leftY], [bottomX, bottomY]]); break;
                }
            }
        }

        if (segments.length > 0) {
            let polylines = joinSegmentsIntoPolylines(segments);

            // Filtrage des micro-points et bruit (artefacts de 1-2 pixels)
            if (appState.filterNoise) {
                const minLengthThreshold = appState.smoothingLevel >= 4 ? 4.5 : 2.8;
                polylines = polylines.filter(p => {
                    if (!p || p.length < 2) return false;
                    let totalLen = 0;
                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                    for (let i = 0; i < p.length; i++) {
                        const pt = p[i];
                        if (pt[0] < minX) minX = pt[0];
                        if (pt[0] > maxX) maxX = pt[0];
                        if (pt[1] < minY) minY = pt[1];
                        if (pt[1] > maxY) maxY = pt[1];
                        if (i > 0) {
                            totalLen += Math.hypot(pt[0] - p[i - 1][0], pt[1] - p[i - 1][1]);
                        }
                    }
                    const bboxSpan = Math.max(maxX - minX, maxY - minY);
                    if (bboxSpan < 1.4 && totalLen < minLengthThreshold) {
                        return false;
                    }
                    return totalLen >= minLengthThreshold;
                });
            }

            if (polylines.length > 0) {
                contours.push({
                    elevation: h,
                    isMajor,
                    polylines
                });
            }
        }
    }

    return contours;
}

function joinSegmentsIntoPolylines(segments) {
    if (segments.length === 0) return [];

    const PRECISION = 10000;
    function hashPt(p) {
        return `${Math.round(p[0] * PRECISION)},${Math.round(p[1] * PRECISION)}`;
    }

    const endpointIndex = new Map();
    const used = new Uint8Array(segments.length);

    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const h0 = hashPt(seg[0]);
        const h1 = hashPt(seg[1]);

        if (!endpointIndex.has(h0)) endpointIndex.set(h0, []);
        endpointIndex.get(h0).push(i);

        if (!endpointIndex.has(h1)) endpointIndex.set(h1, []);
        endpointIndex.get(h1).push(i);
    }

    const polylines = [];

    for (let startIdx = 0; startIdx < segments.length; startIdx++) {
        if (used[startIdx]) continue;
        used[startIdx] = 1;

        const chain = [segments[startIdx][0], segments[startIdx][1]];

        let extended = true;
        while (extended) {
            extended = false;
            const tailHash = hashPt(chain[chain.length - 1]);
            const candidates = endpointIndex.get(tailHash);
            if (candidates) {
                for (let ci = 0; ci < candidates.length; ci++) {
                    const idx = candidates[ci];
                    if (used[idx]) continue;
                    const seg = segments[idx];
                    const h0 = hashPt(seg[0]);
                    const h1 = hashPt(seg[1]);

                    if (h0 === tailHash) {
                        chain.push(seg[1]);
                        used[idx] = 1;
                        extended = true;
                        break;
                    } else if (h1 === tailHash) {
                        chain.push(seg[0]);
                        used[idx] = 1;
                        extended = true;
                        break;
                    }
                }
            }
        }

        extended = true;
        while (extended) {
            extended = false;
            const headHash = hashPt(chain[0]);
            const candidates = endpointIndex.get(headHash);
            if (candidates) {
                for (let ci = 0; ci < candidates.length; ci++) {
                    const idx = candidates[ci];
                    if (used[idx]) continue;
                    const seg = segments[idx];
                    const h0 = hashPt(seg[0]);
                    const h1 = hashPt(seg[1]);

                    if (h1 === headHash) {
                        chain.unshift(seg[0]);
                        used[idx] = 1;
                        extended = true;
                        break;
                    } else if (h0 === headHash) {
                        chain.unshift(seg[1]);
                        used[idx] = 1;
                        extended = true;
                        break;
                    }
                }
            }
        }

        polylines.push(chain);
    }

    return polylines;
}

/**
 * ------------------------------------------------------------------------------
 * 8. LISSAGE MULTI-NIVEAUX (CHAIKIN + RELAXATION LAPLACIENNE)
 * ------------------------------------------------------------------------------
 */
function chaikinSmooth(points, iterations) {
    if (!points || points.length < 3 || iterations <= 0) return points;

    const pStart = points[0];
    const pEnd = points[points.length - 1];
    const isClosed = Math.hypot(pStart[0] - pEnd[0], pStart[1] - pEnd[1]) < 0.001;

    let current = points;
    for (let iter = 0; iter < iterations; iter++) {
        const smoothed = [];
        const count = isClosed ? current.length - 1 : current.length;

        if (!isClosed) {
            smoothed.push(current[0]);
        }

        for (let i = 0; i < count - (isClosed ? 0 : 1); i++) {
            const p0 = current[i];
            const p1 = current[(i + 1) % (isClosed ? count : current.length)];
            smoothed.push([
                p0[0] * 0.75 + p1[0] * 0.25,
                p0[1] * 0.75 + p1[1] * 0.25
            ]);
            smoothed.push([
                p0[0] * 0.25 + p1[0] * 0.75,
                p0[1] * 0.25 + p1[1] * 0.75
            ]);
        }

        if (!isClosed) {
            smoothed.push(current[current.length - 1]);
        } else {
            smoothed.push([smoothed[0][0], smoothed[0][1]]);
        }
        current = smoothed;
    }
    return current;
}

function relaxPolyline(points, passes = 1, weight = 0.5) {
    if (!points || points.length < 4 || passes <= 0) return points;
    const pStart = points[0];
    const pEnd = points[points.length - 1];
    const isClosed = Math.hypot(pStart[0] - pEnd[0], pStart[1] - pEnd[1]) < 0.001;

    let current = points;
    for (let p = 0; p < passes; p++) {
        const next = [];
        const n = isClosed ? current.length - 1 : current.length;
        if (!isClosed) next.push(current[0]);

        for (let i = isClosed ? 0 : 1; i < (isClosed ? n : n - 1); i++) {
            const prev = current[(i - 1 + n) % n];
            const curr = current[i];
            const fwd = current[(i + 1) % n];
            const avgX = (prev[0] + fwd[0]) * 0.5;
            const avgY = (prev[1] + fwd[1]) * 0.5;
            next.push([
                curr[0] * (1 - weight) + avgX * weight,
                curr[1] * (1 - weight) + avgY * weight
            ]);
        }

        if (!isClosed) {
            next.push(current[current.length - 1]);
        } else {
            next.push([next[0][0], next[0][1]]);
        }
        current = next;
    }
    return current;
}

function smoothPolyline(points, level) {
    if (!points || points.length < 3 || level <= 0) return points;
    let pts = points;
    switch (level) {
        case 1:
            return chaikinSmooth(pts, 1);
        case 2:
            return chaikinSmooth(pts, 2);
        case 3: // Fluide & Naturel Affiche d'art
            pts = relaxPolyline(pts, 1, 0.25);
            return chaikinSmooth(pts, 3);
        case 4: // Très Lisse
            pts = relaxPolyline(pts, 2, 0.40);
            return chaikinSmooth(pts, 3);
        case 5: // Ultra Lisse
            pts = relaxPolyline(pts, 3, 0.55);
            return chaikinSmooth(pts, 4);
        case 6: // Artistique Liquide Web (style minimaliste moderne)
            pts = relaxPolyline(pts, 5, 0.70);
            return chaikinSmooth(pts, 4);
        default:
            return pts;
    }
}

/**
 * ------------------------------------------------------------------------------
 * 9. DÉTECTION DES SOMMETS & POINTS CULMINANTS (OVERPASS + DEM + CATALOGUE)
 * ------------------------------------------------------------------------------
 */
async function extractMountainPeaks(grid, gridW, gridH, bbox, minAltitude = 300) {
    const radius = Math.max(14, Math.round(gridW * 0.04));
    const peaks = [];

    // 1. Tenter la recherche OSM Overpass pour les vrais sommets toponymiques
    try {
        const query = `[out:json][timeout:4];(node["natural"="peak"]["name"](${bbox.south.toFixed(4)},${bbox.west.toFixed(4)},${bbox.north.toFixed(4)},${bbox.east.toFixed(4)}););out body 50;`;
        const osmElements = await queryOverpassWithFallback(query, 3500);

        if (osmElements && osmElements.length > 0) {
            for (const el of osmElements) {
                if (!el.tags || !el.tags.name) continue;
                const normX = (el.lon - bbox.west) / (bbox.east - bbox.west);
                const normY = (bbox.north - el.lat) / (bbox.north - bbox.south);
                if (normX < 0.02 || normX > 0.98 || normY < 0.02 || normY > 0.98) continue;

                const gx = normX * (gridW - 1);
                const gy = normY * (gridH - 1);
                let alt = el.tags.ele ? parseInt(el.tags.ele, 10) : 0;
                if (!alt || isNaN(alt) || alt <= 0) {
                    // Altitude interpolée directement depuis notre DEM
                    const ix = Math.min(gridW - 1, Math.max(0, Math.round(gx)));
                    const iy = Math.min(gridH - 1, Math.max(0, Math.round(gy)));
                    alt = Math.round(grid[iy * gridW + ix]);
                }
                if (alt >= minAltitude) {
                    peaks.push({
                        gridX: gx,
                        gridY: gy,
                        lat: el.lat,
                        lng: el.lon,
                        alt,
                        name: el.tags.name,
                        isNamed: true
                    });
                }
            }
        }
    } catch (err) {
        console.warn("Échec requête Overpass sommets, passage au catalogue :", err);
    }

    // 2. Compléter avec le catalogue intégré si des sommets majeurs manquent
    for (const cat of KNOWN_SUMMITS_CATALOG) {
        if (cat.lat <= bbox.north && cat.lat >= bbox.south &&
            cat.lng >= bbox.west && cat.lng <= bbox.east) {
            const alreadyPresent = peaks.some(p => Math.abs(p.lat - cat.lat) < 0.015 && Math.abs(p.lng - cat.lng) < 0.015);
            if (!alreadyPresent) {
                const normX = (cat.lng - bbox.west) / (bbox.east - bbox.west);
                const normY = (bbox.north - cat.lat) / (bbox.north - bbox.south);
                peaks.push({
                    gridX: normX * (gridW - 1),
                    gridY: normY * (gridH - 1),
                    lat: cat.lat,
                    lng: cat.lng,
                    alt: cat.alt,
                    name: cat.name,
                    isNamed: true
                });
            }
        }
    }

    // 3. Détection des maxima locaux DEM pour compléter les zones sauvages
    for (let y = radius; y < gridH - radius; y += 4) {
        for (let x = radius; x < gridW - radius; x += 4) {
            const val = grid[y * gridW + x];
            if (val < minAltitude) continue;

            let isMax = true;
            for (let dy = -radius; dy <= radius && isMax; dy += 3) {
                for (let dx = -radius; dx <= radius; dx += 3) {
                    if (dx === 0 && dy === 0) continue;
                    if (grid[(y + dy) * gridW + (x + dx)] >= val) {
                        isMax = false;
                        break;
                    }
                }
            }

            if (isMax) {
                const normX = x / (gridW - 1);
                const normY = y / (gridH - 1);
                const lat = bbox.north - normY * (bbox.north - bbox.south);
                const lng = bbox.west + normX * (bbox.east - bbox.west);
                // Si aucun sommet nommé n'est proche
                const tooClose = peaks.some(p => Math.hypot(p.gridX - x, p.gridY - y) < radius * 1.5);
                if (!tooClose) {
                    peaks.push({
                        gridX: x,
                        gridY: y,
                        lat,
                        lng,
                        alt: Math.round(val),
                        name: '', // Jamais "SOMMET" sans nom : vide pour afficher proprement l'altitude "2 450 m"
                        isNamed: false
                    });
                }
            }
        }
    }

    // 4. Tri par altitude décroissante et élimination des doublons spatiaux
    peaks.sort((a, b) => b.alt - a.alt);
    const finalPeaks = [];
    for (const p of peaks) {
        const tooClose = finalPeaks.some(fp => Math.hypot(fp.gridX - p.gridX, fp.gridY - p.gridY) < radius * 1.4);
        if (!tooClose && finalPeaks.length < 10) {
            finalPeaks.push(p);
        }
    }

    return finalPeaks;
}

/**
 * Recherche vectorielle des villes & villages (sans parcs, sans limites administratives, sans tracés)
 */
async function fetchCitiesAndVillages(bbox, gridW, gridH) {
    const cities = [];

    try {
        const query = `[out:json][timeout:4];(node["place"~"city|town|village"]["name"](${bbox.south.toFixed(4)},${bbox.west.toFixed(4)},${bbox.north.toFixed(4)},${bbox.east.toFixed(4)}););out body 50;`;
        const osmElements = await queryOverpassWithFallback(query, 3500);

        if (osmElements && osmElements.length > 0) {
            for (const el of osmElements) {
                if (!el.tags || !el.tags.name) continue;
                const normX = (el.lon - bbox.west) / (bbox.east - bbox.west);
                const normY = (bbox.north - el.lat) / (bbox.north - bbox.south);
                if (normX < 0.02 || normX > 0.98 || normY < 0.02 || normY > 0.98) continue;

                const placeType = el.tags.place || 'village';
                const pop = el.tags.population ? parseInt(el.tags.population, 10) : 0;
                const score = placeType === 'city' ? 3 : (placeType === 'town' ? 2 : 1);

                cities.push({
                    gridX: normX * (gridW - 1),
                    gridY: normY * (gridH - 1),
                    lat: el.lat,
                    lng: el.lon,
                    name: el.tags.name,
                    type: placeType,
                    score,
                    population: pop
                });
            }
        }
    } catch (err) {
        console.warn("Échec requête Overpass villes, passage au catalogue :", err);
    }

    // Compléter ou secourir avec KNOWN_CITIES_CATALOG
    for (const cat of KNOWN_CITIES_CATALOG) {
        if (cat.lat <= bbox.north && cat.lat >= bbox.south &&
            cat.lng >= bbox.west && cat.lng <= bbox.east) {
            const alreadyPresent = cities.some(c => Math.abs(c.lat - cat.lat) < 0.02 && Math.abs(c.lng - cat.lng) < 0.02);
            if (!alreadyPresent) {
                const normX = (cat.lng - bbox.west) / (bbox.east - bbox.west);
                const normY = (bbox.north - cat.lat) / (bbox.north - bbox.south);
                const score = cat.type === 'city' ? 3 : (cat.type === 'town' ? 2 : 1);
                cities.push({
                    gridX: normX * (gridW - 1),
                    gridY: normY * (gridH - 1),
                    lat: cat.lat,
                    lng: cat.lng,
                    name: cat.name,
                    type: cat.type,
                    score,
                    population: cat.population || 0
                });
            }
        }
    }

    // Tri par importance (villes > bourgs > villages) puis population
    cities.sort((a, b) => b.score - a.score || b.population - a.population);

    // Éviter les chevauchements visuels (espacement spatial strict)
    const minSpacing = Math.max(30, Math.round(gridW * 0.085));
    const decluttered = [];
    for (const c of cities) {
        const tooClose = decluttered.some(dc => Math.hypot(dc.gridX - c.gridX, dc.gridY - c.gridY) < minSpacing);
        if (!tooClose && decluttered.length < 14) {
            decluttered.push(c);
        }
    }

    return decluttered;
}

/**
 * ------------------------------------------------------------------------------
 * 10. OMBRAGE 3D DU RELIEF (HILLSHADING)
 * ------------------------------------------------------------------------------
 */
function generateHillshadeCanvas(grid, gridW, gridH) {
    const hsCanvas = document.createElement('canvas');
    hsCanvas.width = gridW;
    hsCanvas.height = gridH;
    const hsCtx = hsCanvas.getContext('2d');
    const imgData = hsCtx.createImageData(gridW, gridH);
    const data = imgData.data;

    const zenith = 45 * Math.PI / 180;
    const azimuth = 315 * Math.PI / 180;

    for (let y = 1; y < gridH - 1; y++) {
        const rowM1 = (y - 1) * gridW;
        const row = y * gridW;
        const rowP1 = (y + 1) * gridW;

        for (let x = 1; x < gridW - 1; x++) {
            const dzdx = ((grid[row + x + 1] - grid[row + x - 1]) * 2) / 8;
            const dzdy = ((grid[rowP1 + x] - grid[rowM1 + x]) * 2) / 8;

            const slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy) * 0.005);
            const aspect = Math.atan2(dzdy, -dzdx);

            const shade = Math.cos(zenith) * Math.cos(slope) + 
                          Math.sin(zenith) * Math.sin(slope) * Math.cos(azimuth - aspect);

            const val = Math.max(0, Math.min(255, Math.round(shade * 255)));
            const idx = (y * gridW + x) * 4;

            data[idx] = val;
            data[idx + 1] = val;
            data[idx + 2] = val;
            data[idx + 3] = 255;
        }
    }

    // Remplir les bordures pour éviter un liseré transparent
    for (let x = 0; x < gridW; x++) {
        const topIdx = x * 4;
        const topSrc = (gridW + x) * 4;
        data[topIdx] = data[topSrc]; data[topIdx + 1] = data[topSrc + 1]; data[topIdx + 2] = data[topSrc + 2]; data[topIdx + 3] = data[topSrc + 3];
        const botIdx = ((gridH - 1) * gridW + x) * 4;
        const botSrc = ((gridH - 2) * gridW + x) * 4;
        data[botIdx] = data[botSrc]; data[botIdx + 1] = data[botSrc + 1]; data[botIdx + 2] = data[botSrc + 2]; data[botIdx + 3] = data[botSrc + 3];
    }
    for (let y = 0; y < gridH; y++) {
        const lIdx = (y * gridW) * 4;
        const lSrc = (y * gridW + 1) * 4;
        data[lIdx] = data[lSrc]; data[lIdx + 1] = data[lSrc + 1]; data[lIdx + 2] = data[lSrc + 2]; data[lIdx + 3] = data[lSrc + 3];
        const rIdx = (y * gridW + gridW - 1) * 4;
        const rSrc = (y * gridW + gridW - 2) * 4;
        data[rIdx] = data[rSrc]; data[rIdx + 1] = data[rSrc + 1]; data[rIdx + 2] = data[rSrc + 2]; data[rIdx + 3] = data[rSrc + 3];
    }

    hsCtx.putImageData(imgData, 0, 0);
    return hsCanvas;
}

/**
 * ------------------------------------------------------------------------------
 * 11. MOTEUR D'ASSEMBLAGE ET EXPORTATION (PNG, SVG, PDF)
 * ------------------------------------------------------------------------------
 */
async function runPosterGeneration(exportType = 'png') {
    if (!appState.currentBBox) {
        alert('Veuillez patienter pendant la détection de la zone géographique.');
        return;
    }

    await document.fonts.ready;

    const modal = document.getElementById('progress-modal');
    const stepTitle = document.getElementById('progress-step-title');
    const stepDetail = document.getElementById('progress-step-detail');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressCount = document.getElementById('progress-count-label');

    modal.classList.add('show');
    stepTitle.innerText = "Initialisation du Studio Topo Pro...";
    stepDetail.innerText = "Préparation des données géographiques et de la Bounding Box.";
    progressBar.style.width = '10%';
    progressCount.innerText = "10%";

    try {
        const format = POSTER_FORMATS[appState.formatKey];
        const dim = format[appState.resolutionKey];
        const canvasW = dim.width;
        const canvasH = dim.height;
        const theme = POSTER_THEMES[appState.themeKey];

        // Calcul de mise en page selon le mode choisi (Affiche d'Art vs Minimal Éditorial vs Lignes Pures)
        let marginX = 0;
        let marginY = 0;
        let cartoucheH = 0;
        let mapX = 0;
        let mapY = 0;
        let mapW = canvasW;
        let mapH = canvasH;

        const layout = appState.layoutMode; // 'poster', 'minimal', ou 'pure'

        if (layout === 'poster') {
            // Affiche d'art classique avec cartouche encadré blanc
            marginX = Math.round(canvasW * 0.045);
            marginY = Math.round(canvasH * 0.045);
            cartoucheH = Math.round(canvasH * 0.165);
            mapX = marginX;
            mapY = marginY;
            mapW = canvasW - (marginX * 2);
            mapH = canvasH - (marginY * 2) - cartoucheH;
        } else if (layout === 'minimal') {
            // Minimal Éditorial : les courbes remplissent l'affiche, textes fins en bas
            marginX = Math.round(canvasW * 0.035);
            marginY = Math.round(canvasH * 0.035);
            mapX = 0;
            mapY = 0;
            mapW = canvasW;
            mapH = canvasH;
        } else {
            // Mode Lignes Pures : 100% de la surface pour les lignes
            mapX = 0;
            mapY = 0;
            mapW = canvasW;
            mapH = canvasH;
        }

        // Initialisation du Canvas principal
        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');

        // Fond
        if (theme.bg !== 'transparent') {
            ctx.fillStyle = theme.bg;
            ctx.fillRect(0, 0, canvasW, canvasH);
        }

        let vectorSvgData = null;

        if (appState.activeMode === 'vector') {
            // --- MODE 1 : CALCUL MATHÉMATIQUE DES COURBES DE NIVEAU (DEM) ---
            stepTitle.innerText = "Extraction du Modèle Numérique de Terrain (MNT)...";
            stepDetail.innerText = "Téléchargement des dalles altimétriques haute résolution (512px).";
            progressBar.style.width = '25%';
            progressCount.innerText = "25%";

            const targetZoom = Math.min(14, appState.map.getZoom() + 1);
            const demSampleSize = appState.resolutionKey === '50mp' ? 850 : 
                                  appState.resolutionKey === '4k' ? 750 : 650;
            const { grid, gridW, gridH, minH, maxH } = await fetchElevationGrid(appState.currentBBox, targetZoom, demSampleSize);

            stepTitle.innerText = "Vectorisation des Isocontours (Marching Squares)...";
            stepDetail.innerText = `Calcul des courbes de niveau entre ${Math.round(minH)}m et ${Math.round(maxH)}m (Pas de ${appState.contourStep}m).`;
            progressBar.style.width = '55%';
            progressCount.innerText = "55%";

            await new Promise(r => setTimeout(r, 60));

            // 1. Ombrage 3D optionnel sous les courbes
            if (appState.showHillshade && layout !== 'pure' && theme.bg !== 'transparent') {
                const hsCanvas = generateHillshadeCanvas(grid, gridW, gridH);
                ctx.save();
                ctx.beginPath();
                ctx.rect(mapX, mapY, mapW, mapH);
                ctx.clip();
                ctx.globalAlpha = 0.26;
                ctx.globalCompositeOperation = theme.isDark ? 'screen' : 'multiply';
                ctx.drawImage(hsCanvas, mapX, mapY, mapW, mapH);
                ctx.restore();
            }

            // 2. Calcul et tracé des isocontours
            const contours = computeMarchingSquaresContours(grid, gridW, gridH, appState.contourStep);
            
            // 3. Détection et toponymie des sommets (Overpass + DEM)
            let peaks = [];
            if (appState.showPeaks) {
                stepTitle.innerText = "Identification des sommets réels & toponymie...";
                progressBar.style.width = '65%';
                peaks = await extractMountainPeaks(grid, gridW, gridH, appState.currentBBox, Math.max(150, minH + (maxH - minH) * 0.4));
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapW, mapH);
            ctx.clip();

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            const scaleX = mapW / (gridW - 1);
            const scaleY = mapH / (gridH - 1);

            // Tracé des courbes secondaires
            if (appState.showContours) {
                ctx.beginPath();
                ctx.strokeStyle = theme.minorColor;
                ctx.lineWidth = Math.max(1.2, Math.round(canvasW * 0.001));

                for (const c of contours) {
                    if (!c.isMajor) {
                        for (const polyline of c.polylines) {
                            const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
                            if (smoothed.length < 2) continue;
                            ctx.moveTo(mapX + smoothed[0][0] * scaleX, mapY + smoothed[0][1] * scaleY);
                            for (let i = 1; i < smoothed.length; i++) {
                                ctx.lineTo(mapX + smoothed[i][0] * scaleX, mapY + smoothed[i][1] * scaleY);
                            }
                        }
                    }
                }
                ctx.stroke();
            }

            // Tracé des courbes maîtresses (renforcées ×5)
            if (appState.showMajorContours) {
                ctx.beginPath();
                ctx.strokeStyle = theme.majorColor;
                ctx.lineWidth = Math.max(2, Math.round(canvasW * 0.002));

                for (const c of contours) {
                    if (c.isMajor) {
                        for (const polyline of c.polylines) {
                            const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
                            if (smoothed.length < 2) continue;
                            ctx.moveTo(mapX + smoothed[0][0] * scaleX, mapY + smoothed[0][1] * scaleY);
                            for (let i = 1; i < smoothed.length; i++) {
                                ctx.lineTo(mapX + smoothed[i][0] * scaleX, mapY + smoothed[i][1] * scaleY);
                            }
                        }
                    }
                }
                ctx.stroke();
            }

            // Tracé des Sommets & Altitudes (▲)
            if (appState.showPeaks && peaks.length > 0) {
                drawMountainPeaksOnCanvas(ctx, peaks, mapX, mapY, scaleX, scaleY, canvasW, theme);
            }

            // Tracé des Graduations d'altitude sur les courbes maîtresses
            let contourLabels = [];
            if (appState.showContourLabels) {
                contourLabels = drawContourLabelsOnCanvas(ctx, contours, mapX, mapY, scaleX, scaleY, canvasW, theme);
            }

            ctx.restore();

            // Calque optionnel Villes & Communes (Vectoriel & dans le thème, sans parcs ni tracés)
            let cities = [];
            if (appState.showLabels && layout !== 'pure') {
                stepTitle.innerText = "Tracé des villes & communes (Typo Studio)...";
                progressBar.style.width = '80%';
                cities = await fetchCitiesAndVillages(appState.currentBBox, gridW, gridH);
                drawCitiesOnCanvas(ctx, cities, mapX, mapY, scaleX, scaleY, canvasW, theme);
            }

            vectorSvgData = { contours, peaks, cities, contourLabels, gridW, gridH };

        } else {
            // --- MODE 2 : DALLES RASTER (IGN / OPENTOPO) ---
            stepTitle.innerText = "Assemblage des tuiles cartographiques...";
            progressBar.style.width = '45%';
            await renderRasterTilesEngine(ctx, mapX, mapY, mapW, mapH, canvasW);

            if (appState.showLabels && layout !== 'pure') {
                stepTitle.innerText = "Intégration des villes & communes...";
                const cities = await fetchCitiesAndVillages(appState.currentBBox, 600, 600);
                drawCitiesOnCanvas(ctx, cities, mapX, mapY, mapW / 599, mapH / 599, canvasW, theme);
            }
        }

        // 4. Dessin de l'habillage texte selon le mode
        if (layout === 'poster') {
            drawPosterArtCartouche(ctx, mapX, mapY, mapW, mapH, marginX, marginY, cartoucheH, canvasW, canvasH, theme);
        } else if (layout === 'minimal') {
            drawMinimalEditorialLayout(ctx, marginX, marginY, canvasW, canvasH, theme);
        }

        // 5. Finalisation du téléchargement
        stepTitle.innerText = "Exportation du fichier final...";
        progressBar.style.width = '95%';
        progressCount.innerText = "95%";
        await new Promise(r => setTimeout(r, 80));

        const cleanTitle = (appState.titleText || 'poster-topographique')
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (exportType === 'svg') {
            const svgData = generatePureSVG(vectorSvgData, mapW, mapH, mapX, mapY, canvasW, canvasH, theme);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            downloadBlob(blob, `topo-vectoriel-${cleanTitle}.svg`);
        } else if (exportType === 'pdf') {
            const { jsPDF } = window.jspdf;
            const isLandscape = canvasW > canvasH;
            const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: appState.formatKey === 'square' ? [210, 210] : (appState.formatKey === 'panorama' ? [420, 180] : 'a4')
            });
            const pdfW = pdf.internal.pageSize.getWidth();
            const pdfH = pdf.internal.pageSize.getHeight();
            const imgData = canvas.toDataURL('image/jpeg', 0.96);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
            pdf.save(`affiche-topo-${cleanTitle}.pdf`);
        } else {
            canvas.toBlob((blob) => {
                if (blob) {
                    downloadBlob(blob, `carte-topo-${cleanTitle}.png`);
                }
            }, 'image/png');
        }

        progressBar.style.width = '100%';
        progressCount.innerText = "Terminé !";
        setTimeout(() => modal.classList.remove('show'), 600);

    } catch (err) {
        console.error("Erreur durant la génération :", err);
        alert(`Une erreur est survenue : ${err.message}`);
        modal.classList.remove('show');
    }
}

/**
 * Dessine les sommets remarquables sur le Canvas (nom réel + altitude, dans le thème)
 */
function drawMountainPeaksOnCanvas(ctx, peaks, mapX, mapY, scaleX, scaleY, canvasW, theme) {
    if (!peaks || peaks.length === 0) return;

    ctx.save();
    ctx.fillStyle = theme.peakColor || '#ffffff';
    ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0,0,0,0.85)' : theme.bg;
    ctx.lineWidth = Math.max(2, Math.round(canvasW * 0.0012));

    const symbolSize = Math.max(6, Math.round(canvasW * 0.0052));
    const fontSize = Math.max(8.5, Math.round(canvasW * 0.0075));
    ctx.font = `700 ${fontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    for (const p of peaks) {
        const px = mapX + p.gridX * scaleX;
        const py = mapY + p.gridY * scaleY;

        // Symbole triangle ▲
        ctx.beginPath();
        ctx.moveTo(px, py - symbolSize);
        ctx.lineTo(px - symbolSize * 0.75, py + symbolSize * 0.5);
        ctx.lineTo(px + symbolSize * 0.75, py + symbolSize * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Texte : Vrai nom et altitude (ex: "MONT AIGUILLE · 2 087 m", ou "2 087 m" si anonyme, JAMAIS "SOMMET")
        const labelText = (p.name && p.name.trim() !== '') 
            ? `${p.name} · ${p.alt} m`.toUpperCase() 
            : `${p.alt} m`;

        ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0,0,0,0.85)' : theme.bg;
        ctx.lineWidth = Math.max(3, Math.round(canvasW * 0.002));
        ctx.lineJoin = 'round';
        ctx.strokeText(labelText, px, py - symbolSize - 4);
        ctx.fillStyle = theme.peakColor || theme.textColor;
        ctx.fillText(labelText, px, py - symbolSize - 4);
    }
    ctx.restore();
}

/**
 * Dessine les villes & villages sur le Canvas (Vectoriel, dans le thème, sans parcs ni tracés)
 */
function drawCitiesOnCanvas(ctx, cities, mapX, mapY, scaleX, scaleY, canvasW, theme) {
    if (!cities || cities.length === 0) return;

    ctx.save();
    for (const c of cities) {
        const px = mapX + c.gridX * scaleX;
        const py = mapY + c.gridY * scaleY;

        const isCity = c.type === 'city';
        const isTown = c.type === 'town';
        const dotRadius = Math.max(3, Math.round(canvasW * (isCity ? 0.0028 : isTown ? 0.0022 : 0.0018)));
        const fontSize = Math.max(8, Math.round(canvasW * (isCity ? 0.0088 : isTown ? 0.0076 : 0.0068)));
        const fontWeight = isCity ? '700' : (isTown ? '600' : '500');

        // 1. Point / Marqueur cartographique
        ctx.beginPath();
        ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = theme.textColor;
        ctx.fill();

        ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0, 0, 0, 0.75)' : theme.bg;
        ctx.lineWidth = Math.max(1.5, Math.round(canvasW * 0.001));
        ctx.stroke();

        // 2. Nom de la ville
        ctx.font = `${fontWeight} ${fontSize}px '${appState.fontFamily}', sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const labelText = c.name.toUpperCase();
        const textX = px + dotRadius + Math.max(4, Math.round(canvasW * 0.0035));
        const textY = py;

        // Halo dans le thème pour garantir la lisibilité
        ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0, 0, 0, 0.85)' : theme.bg;
        ctx.lineWidth = Math.max(3, Math.round(canvasW * 0.002));
        ctx.lineJoin = 'round';
        ctx.strokeText(labelText, textX, textY);

        ctx.fillStyle = theme.textColor;
        ctx.fillText(labelText, textX, textY);
    }
    ctx.restore();
}

/**
 * Dessine les graduations d'altitude sur les courbes maîtresses (Graduations orientées)
 */
function drawContourLabelsOnCanvas(ctx, contours, mapX, mapY, scaleX, scaleY, canvasW, theme) {
    if (!contours || contours.length === 0) return [];

    ctx.save();
    const fontSize = Math.max(8, Math.round(canvasW * 0.0062));
    ctx.font = `600 ${fontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const placedLabels = [];
    const minDistance = Math.max(100, canvasW * 0.08);

    for (const c of contours) {
        if (!c.isMajor) continue;
        const altText = `${c.level} m`;

        for (const polyline of (c.polylines || [])) {
            const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
            if (smoothed.length < 24) continue;

            const sampleIndices = [];
            if (smoothed.length > 80) {
                sampleIndices.push(Math.floor(smoothed.length * 0.3));
                sampleIndices.push(Math.floor(smoothed.length * 0.7));
            } else {
                sampleIndices.push(Math.floor(smoothed.length * 0.5));
            }

            for (const idx of sampleIndices) {
                const pPrev = smoothed[Math.max(0, idx - 2)];
                const pNext = smoothed[Math.min(smoothed.length - 1, idx + 2)];
                const pCurr = smoothed[idx];

                const px = mapX + pCurr[0] * scaleX;
                const py = mapY + pCurr[1] * scaleY;

                const isTooClose = placedLabels.some(pl => Math.hypot(pl.x - px, pl.y - py) < minDistance);
                if (isTooClose) continue;

                const dx = (pNext[0] - pPrev[0]) * scaleX;
                const dy = (pNext[1] - pPrev[1]) * scaleY;
                let angle = Math.atan2(dy, dx);

                // Garder le texte orienté de gauche à droite
                if (angle > Math.PI / 2) angle -= Math.PI;
                if (angle < -Math.PI / 2) angle += Math.PI;

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(angle);

                const tw = ctx.measureText(altText).width;

                // Masque / Pillule dans la couleur de fond du thème pour que la courbe ne traverse pas le texte
                if (theme.bg !== 'transparent') {
                    ctx.fillStyle = theme.bg;
                    ctx.fillRect(-tw / 2 - 4, -fontSize / 2 - 2, tw + 8, fontSize + 4);
                } else {
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
                    ctx.lineWidth = 4;
                    ctx.strokeText(altText, 0, 0);
                }

                ctx.fillStyle = theme.majorColor || theme.textColor;
                ctx.fillText(altText, 0, 0);
                ctx.restore();

                placedLabels.push({ x: px, y: py, altText, angle, level: c.level });
            }
        }
    }
    ctx.restore();
    return placedLabels;
}

/**
 * Dessine le cartouche d'art complet (Mode Affiche d'Art)
 */
function drawPosterArtCartouche(ctx, mapX, mapY, mapW, mapH, marginX, marginY, cartoucheH, canvasW, canvasH, theme) {
    ctx.strokeStyle = theme.subtleLine;
    ctx.lineWidth = Math.max(1, Math.round(canvasW * 0.0008));
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    const cartoucheY = mapY + mapH + Math.round(marginY * 0.4);
    const cartoucheW = mapW;
    const centerX = canvasW / 2;

    // Titre Principal
    const titleFontSize = Math.round(canvasW * 0.038);
    ctx.font = `800 ${titleFontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const mainTitle = (appState.titleText || 'TITRE DE L\'AFFICHE').toUpperCase();
    drawSpacedText(ctx, mainTitle, centerX, cartoucheY + Math.round(canvasH * 0.015), Math.round(titleFontSize * 0.22));

    // Sous-titre
    if (appState.subtitleText) {
        const subFontSize = Math.round(canvasW * 0.0135);
        ctx.font = `500 ${subFontSize}px '${appState.fontFamily}', sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.globalAlpha = 0.85;
        const subText = appState.subtitleText.toUpperCase();
        drawSpacedText(ctx, subText, centerX, cartoucheY + Math.round(canvasH * 0.062), Math.round(subFontSize * 0.16));
        ctx.globalAlpha = 1.0;
    }

    // Ligne séparatrice
    const sepY = cartoucheY + Math.round(canvasH * 0.095);
    ctx.beginPath();
    ctx.moveTo(centerX - Math.round(cartoucheW * 0.35), sepY);
    ctx.lineTo(centerX + Math.round(cartoucheW * 0.35), sepY);
    ctx.strokeStyle = theme.subtleLine;
    ctx.lineWidth = Math.max(1, Math.round(canvasW * 0.0006));
    ctx.stroke();

    // Coordonnées, Échelle, Nord
    const metaY = sepY + Math.round(canvasH * 0.022);
    const metaFontSize = Math.round(canvasW * 0.010);
    ctx.font = `600 ${metaFontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.fillStyle = theme.textColor;

    if (appState.currentCenter) {
        const dms = formatToDMS(appState.currentCenter.lat, appState.currentCenter.lng);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 0.78;
        drawSpacedText(ctx, dms, mapX + Math.round(canvasW * 0.01), metaY, Math.round(metaFontSize * 0.08));
        ctx.globalAlpha = 1.0;
    }

    if (appState.showScaleNorth && appState.currentBBox) {
        const lat = appState.currentCenter.lat;
        const pt1 = L.latLng(lat, appState.currentBBox.west);
        const pt2 = L.latLng(lat, appState.currentBBox.east);
        const totalMeters = pt1.distanceTo(pt2);
        const metersPerPixel = totalMeters / mapW;

        drawGraphicalScaleBar(ctx, centerX, metaY, metersPerPixel, canvasW, theme);

        const northX = mapX + mapW - Math.round(canvasW * 0.025);
        drawMinimalNorthArrow(ctx, northX, metaY - 2, Math.round(canvasW * 0.022), theme);
    }
}

/**
 * Dessine l'habillage sobre et contemporain (Mode Minimal Éditorial)
 */
function drawMinimalEditorialLayout(ctx, marginX, marginY, canvasW, canvasH, theme) {
    const bottomY = canvasH - Math.round(marginY * 0.85);

    // Titre et Sous-titre en bas à gauche
    const titleFontSize = Math.round(canvasW * 0.022);
    ctx.font = `800 ${titleFontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';

    const mainTitle = (appState.titleText || '').toUpperCase();
    drawSpacedText(ctx, mainTitle, marginX, bottomY - Math.round(canvasH * 0.018), Math.round(titleFontSize * 0.16));

    if (appState.subtitleText) {
        const subFontSize = Math.round(canvasW * 0.0095);
        ctx.font = `500 ${subFontSize}px '${appState.fontFamily}', sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.globalAlpha = 0.75;
        drawSpacedText(ctx, appState.subtitleText.toUpperCase(), marginX, bottomY, Math.round(subFontSize * 0.12));
        ctx.globalAlpha = 1.0;
    }

    // Coordonnées GPS et Échelle en bas à droite
    if (appState.currentCenter) {
        const dms = formatToDMS(appState.currentCenter.lat, appState.currentCenter.lng);
        const metaFontSize = Math.round(canvasW * 0.0095);
        ctx.font = `600 ${metaFontSize}px '${appState.fontFamily}', sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.textAlign = 'right';
        ctx.globalAlpha = 0.78;
        drawSpacedText(ctx, dms, canvasW - marginX, bottomY, Math.round(metaFontSize * 0.08));
        ctx.globalAlpha = 1.0;
    }
}

function drawSpacedText(ctx, text, x, y, letterSpacing) {
    if (!text) return;
    const characters = text.split('');
    const totalWidth = characters.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + (characters.length - 1) * letterSpacing;

    let startX = x;
    if (ctx.textAlign === 'center') {
        startX = x - totalWidth / 2;
    } else if (ctx.textAlign === 'right') {
        startX = x - totalWidth;
    }

    let currentX = startX;
    for (let i = 0; i < characters.length; i++) {
        ctx.fillText(characters[i], currentX, y);
        currentX += ctx.measureText(characters[i]).width + letterSpacing;
    }
}

function drawGraphicalScaleBar(ctx, centerX, y, metersPerPixel, canvasW, theme) {
    const targetPixelWidth = canvasW * 0.12;
    const rawMeters = targetPixelWidth * metersPerPixel;

    const roundedDistances = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000];
    let chosenDistance = roundedDistances[0];
    for (const d of roundedDistances) {
        if (d <= rawMeters) chosenDistance = d;
    }

    const barPixelWidth = chosenDistance / metersPerPixel;
    const startX = centerX - barPixelWidth / 2;
    const endX = centerX + barPixelWidth / 2;

    ctx.save();
    ctx.strokeStyle = theme.textColor;
    ctx.fillStyle = theme.textColor;
    ctx.lineWidth = Math.max(1, Math.round(canvasW * 0.0006));
    ctx.globalAlpha = 0.85;

    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    const tickH = Math.round(canvasW * 0.0035);
    ctx.moveTo(startX, y - tickH);
    ctx.lineTo(startX, y + tickH);
    ctx.moveTo(endX, y - tickH);
    ctx.lineTo(endX, y + tickH);
    ctx.stroke();

    const label = chosenDistance >= 1000 ? `${chosenDistance / 1000} KM` : `${chosenDistance} M`;
    ctx.font = `600 ${Math.round(canvasW * 0.0085)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(label, centerX, y - Math.round(canvasW * 0.004));

    ctx.restore();
}

function drawMinimalNorthArrow(ctx, x, y, size, theme) {
    ctx.save();
    ctx.fillStyle = theme.textColor;
    ctx.strokeStyle = theme.textColor;
    ctx.lineWidth = Math.max(1, Math.round(size * 0.06));

    const nSize = Math.round(size * 0.45);
    ctx.font = `700 ${nSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('N', x, y - Math.round(size * 0.35));

    const arrowH = size;
    const halfW = Math.round(size * 0.32);

    ctx.beginPath();
    ctx.moveTo(x, y - Math.round(arrowH * 0.3));
    ctx.lineTo(x - halfW, y + Math.round(arrowH * 0.5));
    ctx.lineTo(x, y + Math.round(arrowH * 0.25));
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y - Math.round(arrowH * 0.3));
    ctx.lineTo(x + halfW, y + Math.round(arrowH * 0.5));
    ctx.lineTo(x, y + Math.round(arrowH * 0.25));
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
}

async function overlayTransparentLayer(ctx, urlPattern, bbox, zoom, mapX, mapY, mapW, mapH, theme) {
    const nwMerc = appState.map.project(L.latLng(bbox.north, bbox.west), zoom);
    const seMerc = appState.map.project(L.latLng(bbox.south, bbox.east), zoom);

    const minX = Math.floor(nwMerc.x / 256);
    const maxX = Math.floor(seMerc.x / 256);
    const minY = Math.floor(nwMerc.y / 256);
    const maxY = Math.floor(seMerc.y / 256);

    const tilePromises = [];
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const url = urlPattern
                .replace('{z}', zoom)
                .replace('{x}', x)
                .replace('{y}', y)
                .replace('{s}', 'a');
            tilePromises.push({ x, y, p: fetchTile(url) });
        }
    }

    const tiles = await Promise.all(tilePromises.map(async t => ({ ...t, img: await t.p })));
    const scaleX = mapW / (seMerc.x - nwMerc.x);
    const scaleY = mapH / (seMerc.y - nwMerc.y);

    ctx.save();
    ctx.beginPath();
    ctx.rect(mapX, mapY, mapW, mapH);
    ctx.clip();

    if (theme.isDark) {
        ctx.filter = 'invert(100%) brightness(130%)';
    }

    for (const t of tiles) {
        if (t.img) {
            const dx = mapX + (t.x * 256 - nwMerc.x) * scaleX;
            const dy = mapY + (t.y * 256 - nwMerc.y) * scaleY;
            const dw = Math.ceil(256 * scaleX) + 1;
            const dh = Math.ceil(256 * scaleY) + 1;
            ctx.drawImage(t.img, dx, dy, dw, dh);
        }
    }
    ctx.restore();
}

async function renderRasterTilesEngine(ctx, mapX, mapY, mapW, mapH, canvasW) {
    const provider = TILE_PROVIDERS[appState.rasterLayerKey] || TILE_PROVIDERS.openTopo;
    const screenFrameElem = document.getElementById('crop-frame');
    const screenW = screenFrameElem.offsetWidth;
    const screenZoom = appState.map.getZoom();

    const scaleBoost = Math.max(1, mapW / screenW);
    const zoomLevelOffset = Math.round(Math.log2(scaleBoost));
    let targetZoom = Math.min(provider.maxZoom, screenZoom + zoomLevelOffset);
    targetZoom = Math.max(2, targetZoom);

    const bbox = appState.currentBBox;
    const nwMercator = appState.map.project(L.latLng(bbox.north, bbox.west), targetZoom);
    const seMercator = appState.map.project(L.latLng(bbox.south, bbox.east), targetZoom);

    const minTileX = Math.floor(nwMercator.x / 256);
    const maxTileX = Math.floor(seMercator.x / 256);
    const minTileY = Math.floor(nwMercator.y / 256);
    const maxTileY = Math.floor(seMercator.y / 256);

    const tileList = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
        for (let ty = minTileY; ty <= maxTileY; ty++) {
            const sub = provider.subdomains && provider.subdomains.length > 0 
                ? provider.subdomains[Math.floor(Math.random() * provider.subdomains.length)] : '';
            const url = provider.url
                .replace('{z}', targetZoom)
                .replace('{x}', tx)
                .replace('{y}', ty)
                .replace('{s}', sub);
            tileList.push({ tx, ty, url });
        }
    }

    const tiles = await Promise.all(tileList.map(async t => ({ ...t, img: await fetchTile(t.url) })));

    ctx.save();
    ctx.beginPath();
    ctx.rect(mapX, mapY, mapW, mapH);
    ctx.clip();

    const spanX = seMercator.x - nwMercator.x;
    const spanY = seMercator.y - nwMercator.y;
    const scaleRatio = Math.max(mapW / spanX, mapH / spanY);

    const renderOffsetX = mapX + (mapW - spanX * scaleRatio) / 2;
    const renderOffsetY = mapY + (mapH - spanY * scaleRatio) / 2;

    for (const tile of tiles) {
        if (tile.img) {
            const destX = renderOffsetX + (tile.tx * 256 - nwMercator.x) * scaleRatio;
            const destY = renderOffsetY + (tile.ty * 256 - nwMercator.y) * scaleRatio;
            const destW = Math.ceil(256 * scaleRatio) + 1;
            const destH = Math.ceil(256 * scaleRatio) + 1;
            ctx.drawImage(tile.img, destX, destY, destW, destH);
        }
    }
    ctx.restore();
}

function generatePureSVG(vectorData, mapW, mapH, mapX, mapY, canvasW, canvasH, theme) {
    const contours = (vectorData && vectorData.contours) ? vectorData.contours : [];
    const peaks = (vectorData && vectorData.peaks) ? vectorData.peaks : [];
    const cities = (vectorData && vectorData.cities) ? vectorData.cities : [];
    const contourLabels = (vectorData && vectorData.contourLabels) ? vectorData.contourLabels : [];
    const gridW = (vectorData && vectorData.gridW) ? vectorData.gridW : 650;
    const gridH = (vectorData && vectorData.gridH) ? vectorData.gridH : Math.round(gridW * (mapH / mapW));

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW} ${canvasH}" width="${canvasW}" height="${canvasH}">\n`;
    
    if (theme.bg !== 'transparent') {
        svg += `  <rect width="${canvasW}" height="${canvasH}" fill="${theme.bg}"/>\n`;
    }

    svg += `  <g id="courbes-de-niveau" transform="translate(${mapX}, ${mapY})">\n`;

    const scaleX = mapW / (gridW - 1);
    const scaleY = mapH / (gridH - 1);

    if (contours && contours.length > 0) {
        // Courbes secondaires
        if (appState.showContours) {
            const minorWidth = Math.max(1, (canvasW * 0.001).toFixed(2));
            svg += `    <g id="courbes-secondaires" fill="none" stroke="${theme.minorColor}" stroke-width="${minorWidth}" stroke-linecap="round" stroke-linejoin="round">\n`;
            for (const c of contours) {
                if (!c.isMajor) {
                    for (const polyline of (c.polylines || [])) {
                        const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
                        if (smoothed.length < 2) continue;
                        let d = `M ${(smoothed[0][0] * scaleX).toFixed(1)} ${(smoothed[0][1] * scaleY).toFixed(1)}`;
                        for (let i = 1; i < smoothed.length; i++) {
                            d += ` L ${(smoothed[i][0] * scaleX).toFixed(1)} ${(smoothed[i][1] * scaleY).toFixed(1)}`;
                        }
                        svg += `      <path d="${d}"/>\n`;
                    }
                }
            }
            svg += `    </g>\n`;
        }

        // Courbes maîtresses
        if (appState.showMajorContours) {
            const majorWidth = Math.max(1.8, (canvasW * 0.002).toFixed(2));
            svg += `    <g id="courbes-maitresses" fill="none" stroke="${theme.majorColor}" stroke-width="${majorWidth}" stroke-linecap="round" stroke-linejoin="round">\n`;
            for (const c of contours) {
                if (c.isMajor) {
                    for (const polyline of (c.polylines || [])) {
                        const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
                        if (smoothed.length < 2) continue;
                        let d = `M ${(smoothed[0][0] * scaleX).toFixed(1)} ${(smoothed[0][1] * scaleY).toFixed(1)}`;
                        for (let i = 1; i < smoothed.length; i++) {
                            d += ` L ${(smoothed[i][0] * scaleX).toFixed(1)} ${(smoothed[i][1] * scaleY).toFixed(1)}`;
                        }
                        svg += `      <path d="${d}"/>\n`;
                    }
                }
            }
            svg += `    </g>\n`;
        }
    }

    // Graduations d'altitudes sur les courbes maîtresses dans le SVG
    if (appState.showContourLabels && contourLabels.length > 0) {
        const labelSize = Math.max(8, Math.round(canvasW * 0.0062));
        svg += `    <g id="graduations-altitudes" fill="${theme.majorColor || theme.textColor}" font-family="${appState.fontFamily}, sans-serif" font-weight="600" font-size="${labelSize}" text-anchor="middle">\n`;
        for (const l of contourLabels) {
            const deg = (l.angle * 180 / Math.PI).toFixed(1);
            const rx = (l.x - mapX).toFixed(1);
            const ry = (l.y - mapY).toFixed(1);
            if (theme.bg !== 'transparent') {
                svg += `      <rect x="${(parseFloat(rx) - 20).toFixed(1)}" y="${(parseFloat(ry) - 8).toFixed(1)}" width="40" height="16" fill="${theme.bg}" transform="rotate(${deg}, ${rx}, ${ry})"/>\n`;
            }
            svg += `      <text x="${rx}" y="${(parseFloat(ry) + 3).toFixed(1)}" transform="rotate(${deg}, ${rx}, ${ry})">${escapeXml(l.altText)}</text>\n`;
        }
        svg += `    </g>\n`;
    }

    // Villes & Communes dans le SVG
    if (appState.showLabels && cities.length > 0) {
        svg += `    <g id="villes-communes" font-family="${appState.fontFamily}, sans-serif">\n`;
        for (const c of cities) {
            const px = (c.gridX * scaleX).toFixed(1);
            const py = (c.gridY * scaleY).toFixed(1);
            const dotR = c.type === 'city' ? 3.5 : (c.type === 'town' ? 2.5 : 2);
            const fSize = c.type === 'city' ? Math.round(canvasW * 0.0088) : Math.round(canvasW * 0.0074);
            const fWeight = c.type === 'city' ? '700' : '600';
            svg += `      <circle cx="${px}" cy="${py}" r="${dotR}" fill="${theme.textColor}"/>\n`;
            svg += `      <text x="${(parseFloat(px) + dotR + 5).toFixed(1)}" y="${py}" font-size="${fSize}" font-weight="${fWeight}" fill="${theme.textColor}" dominant-baseline="central">${escapeXml(c.name.toUpperCase())}</text>\n`;
        }
        svg += `    </g>\n`;
    }

    // Sommets et pics dans le SVG
    if (appState.showPeaks && peaks.length > 0) {
        const peakFontSize = Math.max(9, Math.round(canvasW * 0.0075));
        svg += `    <g id="sommets" fill="${theme.peakColor || '#ffffff'}" font-family="${appState.fontFamily}, sans-serif" font-weight="700" font-size="${peakFontSize}" text-anchor="middle">\n`;
        for (const p of peaks) {
            const px = (p.gridX * scaleX).toFixed(1);
            const py = (p.gridY * scaleY).toFixed(1);
            const labelText = (p.name && p.name.trim() !== '') ? `${p.name} · ${p.alt} m`.toUpperCase() : `${p.alt} m`;
            svg += `      <polygon points="${px},${(py - 7).toFixed(1)} ${(px - 5).toFixed(1)},${(py + 4).toFixed(1)} ${(px + 5).toFixed(1)},${(py + 4).toFixed(1)}"/>\n`;
            svg += `      <text x="${px}" y="${(py - 10).toFixed(1)}">${escapeXml(labelText)}</text>\n`;
        }
        svg += `    </g>\n`;
    }

    svg += `  </g>\n`;

    // Cartouche ou pied de page selon le mode
    if (appState.layoutMode === 'poster') {
        const centerX = canvasW / 2;
        const cartY = mapY + mapH + Math.round(canvasH * 0.035);
        const titleSize = Math.round(canvasW * 0.038);
        const subSize = Math.round(canvasW * 0.0135);

        svg += `  <g id="cartouche-texte" fill="${theme.textColor}" font-family="${appState.fontFamily}, sans-serif" text-anchor="middle">\n`;
        svg += `    <text x="${centerX}" y="${cartY}" font-size="${titleSize}" font-weight="800" letter-spacing="0.2em">${escapeXml(appState.titleText || '')}</text>\n`;
        if (appState.subtitleText) {
            svg += `    <text x="${centerX}" y="${cartY + Math.round(canvasH * 0.045)}" font-size="${subSize}" font-weight="500" letter-spacing="0.14em" fill-opacity="0.85">${escapeXml(appState.subtitleText)}</text>\n`;
        }
        svg += `    <line x1="${centerX - mapW * 0.35}" y1="${cartY + Math.round(canvasH * 0.075)}" x2="${centerX + mapW * 0.35}" y2="${cartY + Math.round(canvasH * 0.075)}" stroke="${theme.subtleLine}" stroke-width="1.5" />\n`;
        svg += `  </g>\n`;
    } else if (appState.layoutMode === 'minimal') {
        const marginX = Math.round(canvasW * 0.035);
        const textY = canvasH - Math.round(canvasH * 0.035);
        const coordsSize = Math.max(9, Math.round(canvasW * 0.009));
        const subSize = Math.max(9, Math.round(canvasW * 0.0085));

        const coordsText = appState.currentCenter 
            ? `${formatDMS(appState.currentCenter.lat, 'lat')}  ·  ${formatDMS(appState.currentCenter.lng, 'lng')}`
            : '';

        svg += `  <g id="cartouche-minimal" fill="${theme.textColor}" font-family="${appState.fontFamily}, sans-serif">\n`;
        svg += `    <text x="${marginX}" y="${textY}" font-size="${coordsSize}" font-weight="700" letter-spacing="0.12em">${escapeXml(coordsText)}</text>\n`;
        if (appState.subtitleText) {
            svg += `    <text x="${canvasW - marginX}" y="${textY}" font-size="${subSize}" font-weight="500" letter-spacing="0.08em" text-anchor="end" fill-opacity="0.85">${escapeXml(appState.subtitleText)}</text>\n`;
        }
        svg += `  </g>\n`;
    }

    svg += `</svg>`;
    return svg;
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * ------------------------------------------------------------------------------
 * 12. RECHERCHE GÉOGRAPHIQUE PAR NOMINATIM
 * ------------------------------------------------------------------------------
 */
async function searchLocation(query) {
    if (!query || query.trim().length === 0) return;
    const cleanQuery = query.trim();

    const searchBtn = document.getElementById('btn-search');
    searchBtn.disabled = true;
    searchBtn.style.opacity = '0.5';

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanQuery)}&limit=1`);
        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);

            appState.map.flyTo([lat, lon], 13, {
                duration: 1.8,
                easeLinearity: 0.25
            });

            const titleParts = result.display_name.split(',');
            const mainPlace = titleParts[0].trim().toUpperCase();
            const subRegion = (titleParts[1] ? titleParts[1].trim() : '') + (titleParts[titleParts.length - 1] ? ' — ' + titleParts[titleParts.length - 1].trim() : '');

            document.getElementById('input-title').value = mainPlace;
            appState.titleText = mainPlace;

            const gpsString = `${lat.toFixed(3)}° N, ${lon.toFixed(3)}° E ${subRegion ? '— ' + subRegion.toUpperCase() : ''}`;
            document.getElementById('input-subtitle').value = gpsString;
            appState.subtitleText = gpsString;

            updateLivePreview();
        } else {
            alert(`Lieu non trouvé pour : "${cleanQuery}".`);
        }
    } catch (err) {
        console.error("Erreur de recherche :", err);
    } finally {
        searchBtn.disabled = false;
        searchBtn.style.opacity = '1';
    }
}

/**
 * ------------------------------------------------------------------------------
 * 13. GESTION DES ÉVÉNEMENTS INTERFACE UTILISATEUR
 * ------------------------------------------------------------------------------
 */
function setupEventListeners() {
    // 1. Bascule Thème Clair / Sombre de l'interface
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    if (btnThemeToggle) {
        btnThemeToggle.addEventListener('click', toggleUiTheme);
    }

    // 2. Barre flottante de navigation du fond de carte (Relief / Plan / Vue Aérienne / Sombre)
    document.querySelectorAll('.map-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.map-nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.navBasemapKey = btn.dataset.navLayer;
            updateInteractiveMapDisplay();
        });
    });

    // 3. Bascule Mode Vectoriel vs Mode Raster
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.activeMode = btn.dataset.mode;

            const secVector = document.getElementById('section-vector-settings');
            const secRaster = document.getElementById('section-raster-settings');

            if (appState.activeMode === 'vector') {
                secVector.style.display = 'flex';
                secRaster.style.display = 'none';
                document.getElementById('btn-main-label').innerText = "Générer & Télécharger (PNG HD)";
            } else {
                secVector.style.display = 'none';
                secRaster.style.display = 'flex';
                document.getElementById('btn-main-label').innerText = "Assembler & Télécharger Dalles";
            }
            updateInteractiveMapDisplay();
        });
    });

    // 4. Barre latérale rétractable
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const iconCollapse = document.getElementById('toggle-icon-collapse');
    const iconExpand = document.getElementById('toggle-icon-expand');
    const cropOverlay = document.getElementById('crop-overlay');

    toggleBtn.addEventListener('click', () => {
        appState.sidebarCollapsed = !appState.sidebarCollapsed;
        if (appState.sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            iconCollapse.style.display = 'none';
            iconExpand.style.display = 'block';
            cropOverlay.classList.add('fullscreen-overlay');
        } else {
            sidebar.classList.remove('collapsed');
            iconCollapse.style.display = 'block';
            iconExpand.style.display = 'none';
            cropOverlay.classList.remove('fullscreen-overlay');
        }
        setTimeout(() => {
            appState.map.invalidateSize();
            updateFrameDimensions();
        }, 350);
    });

    // 5. Recherche géographique
    const searchInput = document.getElementById('input-search');
    document.getElementById('btn-search').addEventListener('click', () => searchLocation(searchInput.value));
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') searchLocation(searchInput.value);
    });

    // 6. Pas des courbes de niveau
    document.getElementById('select-contour-interval').addEventListener('change', (e) => {
        appState.contourStep = parseInt(e.target.value, 10);
        document.getElementById('contour-interval-label').innerText = `${appState.contourStep} mètres`;
    });

    // 7. Curseur de Lissage Fluide (0 à 6)
    const smoothingSlider = document.getElementById('input-smoothing');
    const smoothingLabel = document.getElementById('smoothing-level-label');
    const smoothingDescriptions = [
        "Niveau 0 — Brut (Strict Topo)",
        "Niveau 1 — Léger (Fidèle)",
        "Niveau 2 — Modéré (Équilibré)",
        "Niveau 3 — Fluide & Naturel (Affiche)",
        "Niveau 4 — Très Lisse (Moderne)",
        "Niveau 5 — Ultra Lisse (Grandes Courbes)",
        "Niveau 6 — Liquide Web (Style Minimaliste)"
    ];

    smoothingSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        appState.smoothingLevel = val;
        smoothingLabel.innerText = smoothingDescriptions[val] || `Niveau ${val}`;
    });

    // 8. Filtre de bruit / micro-points
    const noiseToggle = document.getElementById('toggle-filter-noise');
    noiseToggle.addEventListener('change', (e) => {
        appState.filterNoise = e.target.checked;
    });

    // 9. Style de mise en page du texte (Affiche d'Art / Minimal Édito / Lignes Pures)
    document.querySelectorAll('.text-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.text-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.layoutMode = btn.dataset.textMode;

            const textSec = document.getElementById('section-text-customization');
            if (appState.layoutMode === 'pure') {
                textSec.style.display = 'none';
            } else {
                textSec.style.display = 'flex';
            }
            updateLivePreview();
        });
    });

    // 10. Dalles Raster (IGN / Ortho)
    document.getElementById('tile-layer-select').addEventListener('change', (e) => {
        appState.rasterLayerKey = e.target.value;
        updateInteractiveMapDisplay();
    });

    // 11. Sélecteur de format
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.formatKey = btn.dataset.format;
            updateFrameDimensions();
        });
    });

    // 12. Sélecteur de thème artistique
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            appState.themeKey = card.dataset.theme;
            updateInteractiveMapDisplay();
            updateLivePreview();
        });
    });

    // 13. Calques vectoriels débrayables
    document.getElementById('toggle-contours').addEventListener('change', (e) => appState.showContours = e.target.checked);
    document.getElementById('toggle-major-contours').addEventListener('change', (e) => appState.showMajorContours = e.target.checked);
    document.getElementById('toggle-peaks').addEventListener('change', (e) => appState.showPeaks = e.target.checked);
    document.getElementById('toggle-contour-labels').addEventListener('change', (e) => appState.showContourLabels = e.target.checked);
    document.getElementById('toggle-hillshade').addEventListener('change', (e) => appState.showHillshade = e.target.checked);
    document.getElementById('toggle-labels').addEventListener('change', (e) => appState.showLabels = e.target.checked);
    document.getElementById('toggle-scale-north').addEventListener('change', (e) => appState.showScaleNorth = e.target.checked);

    // 14. Résolutions d'exportation
    document.querySelectorAll('.res-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.res-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            appState.resolutionKey = card.dataset.res;
            updateFrameDimensions();
        });
    });

    // 15. Titre & Sous-titre
    const titleInput = document.getElementById('input-title');
    titleInput.addEventListener('input', (e) => {
        appState.titleText = e.target.value;
        updateLivePreview();
    });
    const subtitleInput = document.getElementById('input-subtitle');
    subtitleInput.addEventListener('input', (e) => {
        appState.subtitleText = e.target.value;
        updateLivePreview();
    });

    // 16. Police
    document.getElementById('select-font').addEventListener('change', (e) => {
        appState.fontFamily = e.target.value;
        updateLivePreview();
    });

    // 17. Synchronisation GPS Auto
    document.getElementById('btn-sync-coords').addEventListener('click', () => {
        if (appState.currentCenter) {
            const latStr = `${appState.currentCenter.lat.toFixed(3)}° N`;
            const lngStr = `${appState.currentCenter.lng.toFixed(3)}° E`;
            const newSub = `${latStr}, ${lngStr} — FRANCE`;
            subtitleInput.value = newSub;
            appState.subtitleText = newSub;
            updateLivePreview();
        }
    });

    // 18. Spots remarquables préconfigurés
    document.getElementById('preset-places-select').addEventListener('change', (e) => {
        const key = e.target.value;
        if (!key || !PRESET_PLACES[key]) return;
        const spot = PRESET_PLACES[key];

        titleInput.value = spot.title;
        appState.titleText = spot.title;
        subtitleInput.value = spot.subtitle;
        appState.subtitleText = spot.subtitle;

        appState.map.flyTo(spot.coords, spot.zoom, { duration: 1.5 });
        updateLivePreview();
    });

    // 19. Modale Clés d'API
    const apiModal = document.getElementById('api-modal');
    const btnOpenApiModal = document.getElementById('btn-open-api-modal');
    const btnCloseApiModal = document.getElementById('btn-close-api-modal');
    const btnSaveApiKeys = document.getElementById('btn-save-api-keys');
    const btnClearApiKeys = document.getElementById('btn-clear-api-keys');
    const inputMapbox = document.getElementById('api-key-mapbox');
    const inputStadia = document.getElementById('api-key-stadia');
    const inputCarto = document.getElementById('api-key-carto');

    function populateApiModalInputs() {
        inputMapbox.value = localStorage.getItem('topo_mapbox_token') || '';
        inputStadia.value = localStorage.getItem('topo_stadia_key') || '';
        inputCarto.value = localStorage.getItem('topo_carto_key') || '';
    }

    btnOpenApiModal.addEventListener('click', () => {
        populateApiModalInputs();
        apiModal.classList.add('show');
    });

    btnCloseApiModal.addEventListener('click', () => {
        apiModal.classList.remove('show');
    });

    apiModal.addEventListener('click', (e) => {
        if (e.target === apiModal) apiModal.classList.remove('show');
    });

    btnSaveApiKeys.addEventListener('click', () => {
        if (inputMapbox.value.trim()) localStorage.setItem('topo_mapbox_token', inputMapbox.value.trim());
        else localStorage.removeItem('topo_mapbox_token');

        if (inputStadia.value.trim()) localStorage.setItem('topo_stadia_key', inputStadia.value.trim());
        else localStorage.removeItem('topo_stadia_key');

        if (inputCarto.value.trim()) localStorage.setItem('topo_carto_key', inputCarto.value.trim());
        else localStorage.removeItem('topo_carto_key');

        apiModal.classList.remove('show');
        alert("Vos clés d'API ont été enregistrées localement dans votre navigateur.");
    });

    btnClearApiKeys.addEventListener('click', () => {
        localStorage.removeItem('topo_mapbox_token');
        localStorage.removeItem('topo_stadia_key');
        localStorage.removeItem('topo_carto_key');
        populateApiModalInputs();
        alert("Toutes les clés d'API ont été effacées.");
    });

    // 20. Boutons d'exportation
    document.getElementById('btn-export-png').addEventListener('click', () => runPosterGeneration('png'));
    document.getElementById('btn-export-svg').addEventListener('click', () => runPosterGeneration('svg'));
    document.getElementById('btn-export-pdf').addEventListener('click', () => runPosterGeneration('pdf'));

    window.addEventListener('resize', updateFrameDimensions);
}

/**
 * ------------------------------------------------------------------------------
 * 14. INITIALISATION AU CHARGEMENT DE LA PAGE
 * ------------------------------------------------------------------------------
 */
window.addEventListener('DOMContentLoaded', () => {
    initUiTheme();
    initMap();
    setupEventListeners();
});
