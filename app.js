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
        name: 'OpenTopoMap (Randonnée, Courbes & Relief)',
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 17,
        attribution: '&copy; OpenTopoMap & MNT'
    },
    ignTop25: {
        name: 'IGN — Cartes Rando Topo (TOP 25 / SCAN 25)',
        url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/jpeg',
        subdomains: [],
        maxZoom: 18,
        attribution: '&copy; IGN Géoplateforme (Cartes TOP 25)'
    },
    ignPlan: {
        name: 'IGN — Plan IGN V2 (Sentiers balisés)',
        url: 'https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png',
        subdomains: [],
        maxZoom: 18,
        attribution: '&copy; IGN Géoplateforme'
    },
    waymarkedTrails: {
        name: 'Waymarked Trails (Sentiers & GR de randonnée)',
        url: 'https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png',
        subdomains: [],
        maxZoom: 18,
        attribution: '&copy; Waymarked Trails'
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
    },
    'custom': {
        name: 'Format Personnalisé',
        get ratio() {
            const w = (appState && appState.customFormat && appState.customFormat.w) || 50;
            const h = (appState && appState.customFormat && appState.customFormat.h) || 70;
            return w / h;
        },
        get sd() {
            const r = this.ratio;
            const h = Math.round(Math.sqrt(2500000 / r));
            return { width: Math.round(h * r), height: h };
        },
        get hd() {
            const r = this.ratio;
            const h = Math.round(Math.sqrt(9000000 / r));
            return { width: Math.round(h * r), height: h };
        },
        get '4k'() {
            const r = this.ratio;
            const h = Math.round(Math.sqrt(17000000 / r));
            return { width: Math.round(h * r), height: h };
        },
        get '50mp'() {
            const r = this.ratio;
            const h = Math.round(Math.sqrt(50000000 / r));
            return { width: Math.round(h * r), height: h };
        }
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

/**
 * ==============================================================================
 * MODULE DE RECHERCHE & CATALOGUE : SOMMETS & VILLES (TOPOPOSTER)
 * ==============================================================================
 */

// Decodeur de cle pour injection securisee et masquee
function _unmaskKey(str) {
    if (!str) return '';
    try {
        return atob(str);
    } catch (e) {
        return str;
    }
}

// Cles d'API publiques integrees (masquees et invisibles dans les formulaires de l'interface)
const EMBEDDED_PUBLIC_KEYS = {
    geoapify: _unmaskKey(''),
    mapbox: _unmaskKey('')
};

// Distance orthodromique en metres entre deux points geographiques (Haversine)
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// 0. REQUETE OVERPASS AVEC MIROIRS ROBUSTES & PROXY CORS DE SECOURS (Requete GET simple, sans preflight OPTIONS)
async function queryOverpassMirror(query, timeoutMs = 4000) {
    const mirrors = [
        'https://overpass-api.de/api/interpreter',
        'https://lz4.overpass-api.de/api/interpreter',
        'https://z.overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter'
    ];
    for (const url of mirrors) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            const getUrl = `${url}?data=${encodeURIComponent(query)}`;
            const res = await fetch(getUrl, { signal: controller.signal });
            clearTimeout(timer);
            if (res.ok) {
                const data = await res.json();
                if (data && data.elements && data.elements.length > 0) return data.elements;
            }
        } catch (e) {
            // Continuer vers le miroir suivant sans bloquer
        }
    }

    // Proxy CORS de secours si tous les serveurs directs sont satures
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs + 1500);
        const target = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;
        const res = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
            const data = await res.json();
            if (data && data.elements && data.elements.length > 0) return data.elements;
        }
    } catch (e) {}

    return null;
}

// 1. GEOAPIFY PLACES API (Natif Front-end, rapide, gere nativement le CORS)
async function fetchPlacesFromGeoapify(bbox, category = 'natural.mountain', timeoutMs = 3500) {
    const keys = getApiKeys();
    if (!keys.geoapify) return [];
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const url = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(category)}&filter=rect:${bbox.west.toFixed(4)},${bbox.south.toFixed(4)},${bbox.east.toFixed(4)},${bbox.north.toFixed(4)}&limit=60&apiKey=${encodeURIComponent(keys.geoapify)}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
            const data = await res.json();
            if (data && data.features) {
                return data.features.map(f => {
                    const props = f.properties || {};
                    const coords = f.geometry && f.geometry.coordinates ? f.geometry.coordinates : [props.lon, props.lat];
                    return {
                        name: props.name || '',
                        lat: coords[1],
                        lng: coords[0],
                        alt: props.elevation || props.ele || 0,
                        population: props.population || 0,
                        type: props.category || category
                    };
                }).filter(p => p.name && !isNaN(p.lat) && !isNaN(p.lng));
            }
        }
    } catch (e) {
        console.warn("Geoapify Places API:", e);
    }
    return [];
}

// 2. NOMINATIM API (OpenStreetMap Search - 100% gratuit, officiel OSM, CORS natif)
async function fetchPlacesFromNominatim(bbox, queryTerm = 'peak', timeoutMs = 3500) {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&viewbox=${bbox.west.toFixed(4)},${bbox.north.toFixed(4)},${bbox.east.toFixed(4)},${bbox.south.toFixed(4)}&bounded=1&q=${encodeURIComponent(queryTerm)}&limit=50&extratags=1`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list) && list.length > 0) {
                return list.map(item => {
                    const tags = item.extratags || {};
                    let cleanName = item.name;
                    if (!cleanName && item.display_name) {
                        cleanName = item.display_name.split(',')[0].trim();
                    }
                    const alt = tags.ele ? parseInt(tags.ele, 10) : 0;
                    const pop = tags.population ? parseInt(tags.population, 10) : 0;
                    return {
                        name: cleanName || '',
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                        alt: isNaN(alt) ? 0 : alt,
                        population: isNaN(pop) ? 0 : pop,
                        type: item.type || item.category || queryTerm
                    };
                }).filter(p => p.name && !isNaN(p.lat) && !isNaN(p.lng));
            }
        }
    } catch (e) {
        console.warn("Nominatim API:", e);
    }
    return [];
}

// 3. MAPBOX TILEQUERY API (Vectoriel officiel Mapbox Streets & Terrain, CORS natif)
async function fetchPlacesFromMapboxTilequery(bbox, layer = 'mountain_peak', timeoutMs = 3500) {
    const keys = getApiKeys();
    if (!keys.mapbox) return [];
    try {
        const centerLat = (bbox.north + bbox.south) / 2;
        const centerLng = (bbox.west + bbox.east) / 2;
        const radius = Math.min(100000, Math.round(haversineDistanceMeters(bbox.south, bbox.west, bbox.north, bbox.east) / 2));
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8,mapbox.mapbox-terrain-v2/tilequery/${centerLng.toFixed(5)},${centerLat.toFixed(5)}.json?radius=${radius}&limit=50&layers=${layer}&access_token=${encodeURIComponent(keys.mapbox)}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (res.ok) {
            const data = await res.json();
            if (data && data.features) {
                return data.features.map(f => {
                    const props = f.properties || {};
                    const coords = f.geometry && f.geometry.coordinates ? f.geometry.coordinates : [centerLng, centerLat];
                    return {
                        name: props.name_fr || props.name || props.name_en || '',
                        lat: coords[1],
                        lng: coords[0],
                        alt: props.elevation_m || props.ele || 0,
                        population: props.population || 0,
                        type: props.class || props.type || layer
                    };
                }).filter(p => p.name && !isNaN(p.lat) && !isNaN(p.lng));
            }
        }
    } catch (e) {
        console.warn("Mapbox Tilequery API:", e);
    }
    return [];
}

// 2. Base toponymique des sommets majeurs
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
    { name: 'Pic Saint-Michel', alt: 1966, lat: 45.1017, lng: 5.6139 },
    { name: 'Le Moucherotte', alt: 1901, lat: 45.1486, lng: 5.6372 },
    { name: 'Sommet du Gerbier', alt: 2109, lat: 45.0189, lng: 5.5861 },
    { name: 'Montagne du Glandasse', alt: 2041, lat: 44.7500, lng: 5.4667 },
    { name: 'Le Jocou', alt: 2051, lat: 44.7214, lng: 5.6375 },
    { name: 'Roc de Toulau', alt: 1581, lat: 44.9458, lng: 5.3181 },
    { name: 'Pierre Chauve', alt: 1308, lat: 44.9317, lng: 5.1611 },
    { name: 'Bec de l\'Orient', alt: 1554, lat: 45.2289, lng: 5.5392 },
    { name: 'Signal de Nave', alt: 1609, lat: 45.2103, lng: 5.5489 },

    // Chartreuse
    { name: 'Chamechaude', alt: 2082, lat: 45.2878, lng: 5.7903 },
    { name: 'Dent de Crolles', alt: 2062, lat: 45.3025, lng: 5.8547 },
    { name: 'Grand Som', alt: 2026, lat: 45.3642, lng: 5.8117 },
    { name: 'Grande Sure', alt: 1924, lat: 45.3375, lng: 5.7008 },
    { name: 'Charmant Som', alt: 1867, lat: 45.2972, lng: 5.7647 },
    { name: 'Mont Granier', alt: 1933, lat: 45.4642, lng: 5.9281 },
    { name: 'L\'Aulp du Seuil', alt: 1860, lat: 45.3472, lng: 5.8858 },
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

// 3. Base toponymique des villes & communes
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
    { name: 'Porto-Vecchio', lat: 41.5917, lng: 9.2792, type: 'town', population: 11000 },

    // Vercors, Chartreuse, Belledonne & Oisans
    { name: 'Lans-en-Vercors', lat: 45.1278, lng: 5.5878, type: 'town', population: 2700 },
    { name: 'Méaudre', lat: 45.1667, lng: 5.5250, type: 'village', population: 1400 },
    { name: 'La Chapelle-en-Vercors', lat: 44.9678, lng: 5.4167, type: 'village', population: 750 },
    { name: 'Pont-en-Royans', lat: 45.0628, lng: 5.3433, type: 'village', population: 800 },
    { name: 'Saint-Laurent-en-Royans', lat: 45.0278, lng: 5.3267, type: 'village', population: 1400 },
    { name: 'Mens', lat: 44.8167, lng: 5.7500, type: 'village', population: 1400 },
    { name: 'Clelles', lat: 44.8278, lng: 5.6222, type: 'village', population: 550 },
    { name: 'Monestier-de-Clermont', lat: 44.9167, lng: 5.6333, type: 'town', population: 1400 },
    { name: 'La Mure', lat: 44.9056, lng: 5.7878, type: 'town', population: 5000 },
    { name: 'Vizille', lat: 45.0750, lng: 5.7722, type: 'town', population: 7400 },
    { name: 'Crolles', lat: 45.2861, lng: 5.8833, type: 'town', population: 8300 },
    { name: 'Le Touvet', lat: 45.3583, lng: 5.9472, type: 'town', population: 3100 },
    { name: 'Saint-Pierre-de-Chartreuse', lat: 45.3428, lng: 5.8156, type: 'village', population: 1000 },
    { name: 'Le Bourg-d\'Oisans', lat: 45.0542, lng: 6.0306, type: 'town', population: 3300 },
    { name: 'Alpe d\'Huez', lat: 45.0903, lng: 6.0689, type: 'village', population: 1400 },
    { name: 'Les Deux Alpes', lat: 45.0083, lng: 6.1222, type: 'village', population: 1900 },
    { name: 'Allevard', lat: 45.3933, lng: 6.0744, type: 'town', population: 4100 },

    // Savoie & Haute-Savoie
    { name: 'Sallanches', lat: 45.9367, lng: 6.6306, type: 'town', population: 17000 },
    { name: 'Saint-Gervais-les-Bains', lat: 45.8917, lng: 6.7117, type: 'town', population: 5600 },
    { name: 'Megève', lat: 45.8567, lng: 6.6178, type: 'town', population: 3000 },
    { name: 'Les Houches', lat: 45.8906, lng: 6.7978, type: 'town', population: 3000 },
    { name: 'Morzine', lat: 46.1792, lng: 6.7089, type: 'town', population: 2800 },
    { name: 'Les Gets', lat: 46.1583, lng: 6.6694, type: 'village', population: 1250 },
    { name: 'Samoëns', lat: 46.0833, lng: 6.7278, type: 'village', population: 2400 },
    { name: 'Cluses', lat: 46.0600, lng: 6.5789, type: 'town', population: 17000 },
    { name: 'Bonneville', lat: 46.0783, lng: 6.4083, type: 'town', population: 13000 },
    { name: 'Thonon-les-Bains', lat: 46.3708, lng: 6.4789, type: 'city', population: 36000 },
    { name: 'Évian-les-Bains', lat: 46.4000, lng: 6.5861, type: 'town', population: 9100 },
    { name: 'Moûtiers', lat: 45.4833, lng: 6.5333, type: 'town', population: 3500 },
    { name: 'Modane', lat: 45.2000, lng: 6.6700, type: 'town', population: 3100 },
    { name: 'Courchevel', lat: 45.4144, lng: 6.6342, type: 'village', population: 2300 },
    { name: 'Méribel', lat: 45.3967, lng: 6.5656, type: 'village', population: 2000 },
    { name: 'Val-d\'Isère', lat: 45.4478, lng: 6.9806, type: 'village', population: 1600 },
    { name: 'Tignes', lat: 45.4683, lng: 6.9083, type: 'village', population: 2000 },
    { name: 'Beaufort', lat: 45.7178, lng: 6.5744, type: 'village', population: 2000 },

    // Pyrénées
    { name: 'Argelès-Gazost', lat: 43.0039, lng: -0.0989, type: 'town', population: 2900 },
    { name: 'Luz-Saint-Sauveur', lat: 42.8717, lng: -0.0017, type: 'village', population: 950 },
    { name: 'Barèges', lat: 42.8917, lng: 0.0650, type: 'village', population: 160 },
    { name: 'Bagnères-de-Bigorre', lat: 43.0644, lng: 0.1492, type: 'town', population: 7100 },
    { name: 'Arreau', lat: 42.9056, lng: 0.3589, type: 'village', population: 800 },
    { name: 'Font-Romeu', lat: 42.5028, lng: 2.0408, type: 'village', population: 1900 },
    { name: 'Ax-les-Thermes', lat: 42.7203, lng: 1.8389, type: 'village', population: 1300 },
    { name: 'Tarascon-sur-Ariège', lat: 42.8458, lng: 1.6067, type: 'town', population: 3100 },
    { name: 'Saint-Girons', lat: 42.9833, lng: 1.1444, type: 'town', population: 6400 },
    { name: 'Oloron-Sainte-Marie', lat: 43.1939, lng: -0.6083, type: 'town', population: 10600 },
    { name: 'Laruns', lat: 42.9878, lng: -0.4264, type: 'village', population: 1200 }
];

// 4. Extraction des sommets (Overpass + Geoapify + Mapbox + Catalogue + Affinage DEM)
async function extractMountainPeaks(grid, gridW, gridH, bbox, minAltitude = 100) {
    const radius = Math.max(12, Math.round(gridW * 0.035));
    const peaks = [];

    function addPeakCandidate(lat, lng, name, altitude, isNamed = true) {
        if (!name || isNaN(lat) || isNaN(lng)) return;
        const cleanName = name.replace(/^Sommet$/i, '').trim();
        // Exclusion stricte de toute cote anonyme type PT.803M ou Point cote
        if (!cleanName || cleanName.toUpperCase().startsWith('PT.') || cleanName.toUpperCase().startsWith('POINT ') || cleanName.toUpperCase().startsWith('COTE ')) return;

        const normX = (lng - bbox.west) / (bbox.east - bbox.west);
        const normY = (bbox.north - lat) / (bbox.north - bbox.south);
        if (normX < 0.02 || normX > 0.98 || normY < 0.02 || normY > 0.98) return;

        const gx = normX * (gridW - 1);
        const gy = normY * (gridH - 1);

        let alt = altitude;
        if (!alt || isNaN(alt) || alt <= 0) {
            const ix = Math.min(gridW - 1, Math.max(0, Math.round(gx)));
            const iy = Math.min(gridH - 1, Math.max(0, Math.round(gy)));
            alt = Math.round(grid[iy * gridW + ix]);
        }

        if (alt < minAltitude) return;

        // Deduplication geographique immediate (meme sommet < 1.2km)
        const dup = peaks.find(p => Math.abs(p.lat - lat) < 0.012 && Math.abs(p.lng - lng) < 0.012);
        if (dup) {
            if (alt > dup.alt) dup.alt = alt;
            return;
        }

        peaks.push({
            gridX: gx,
            gridY: gy,
            lat,
            lng,
            alt,
            name: cleanName,
            isNamed: true
        });
    }

    // 1. Requetes d'API sans blocage CORS (Overpass mirrors, Geoapify, Mapbox Tilequery, Nominatim)
    try {
        const overpassPeakQuery = `[out:json][timeout:6];(node["natural"~"peak|volcano"]["name"](${bbox.south.toFixed(4)},${bbox.west.toFixed(4)},${bbox.north.toFixed(4)},${bbox.east.toFixed(4)}););out body 120;`;
        const apiCalls = [
            queryOverpassMirror(overpassPeakQuery, 3500),
            fetchPlacesFromGeoapify(bbox, 'natural.mountain', 3500),
            fetchPlacesFromMapboxTilequery(bbox, 'mountain_peak', 3500),
            fetchPlacesFromNominatim(bbox, 'peak', 3500)
        ];
        const results = await Promise.allSettled(apiCalls);
        
        // Traitement Overpass
        if (results[0].status === 'fulfilled' && Array.isArray(results[0].value)) {
            for (const el of results[0].value) {
                if (el.tags && el.tags.name) {
                    const alt = el.tags.ele ? parseInt(el.tags.ele, 10) : 0;
                    addPeakCandidate(el.lat, el.lon, el.tags.name, alt, true);
                }
            }
        }
        // Traitement Geoapify, Mapbox, Nominatim
        for (let i = 1; i < results.length; i++) {
            const res = results[i];
            if (res.status === 'fulfilled' && Array.isArray(res.value)) {
                for (const p of res.value) {
                    addPeakCandidate(p.lat, p.lng, p.name, p.alt, true);
                }
            }
        }
    } catch (err) {
        console.warn("Requete APIs sommets :", err);
    }

    // 2. Base de sommets remarquables integree (hors ligne, garanti)
    for (const cat of KNOWN_SUMMITS_CATALOG) {
        if (cat.lat <= bbox.north && cat.lat >= bbox.south &&
            cat.lng >= bbox.west && cat.lng <= bbox.east) {
            addPeakCandidate(cat.lat, cat.lng, cat.name, cat.alt, true);
        }
    }

    // 3. Affinage altimetrique sur la matrice DEM (uniquement pour ameliorer les sommets reels connus)
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
                // Si un sommet nomme est present a proximite, affiner son altitude vers le pic reel du DEM
                const nearbyNamed = peaks.find(p => Math.hypot(p.gridX - x, p.gridY - y) < radius * 0.9);
                if (nearbyNamed && val > nearbyNamed.alt) {
                    nearbyNamed.alt = Math.round(val);
                }
                // AUCUN sommet anonyme "Pt. XXX" n'est ajoute
            }
        }
    }

    // 4. Filtrage strict : sommets avec noms reels uniquement
    const validNamedPeaks = peaks.filter(p => p.isNamed && p.name && !p.name.toUpperCase().startsWith('PT.') && p.name !== 'Sommet');

    // 5. Tri d'excellence par altitude decroissante
    validNamedPeaks.sort((a, b) => b.alt - a.alt);

    // 6. Deduplication spatiale et selection harmonieuse
    const finalPeaks = [];
    for (const p of validNamedPeaks) {
        const tooClose = finalPeaks.some(fp => Math.hypot(fp.gridX - p.gridX, fp.gridY - p.gridY) < radius * 1.15);
        if (!tooClose && finalPeaks.length < 22) {
            finalPeaks.push(p);
        }
    }

    return finalPeaks;
}

// 5. Recherche vectorielle des villes & villages (geo.api.gouv departements + Overpass + Geoapify + Mapbox + Catalogue)
async function fetchCitiesAndVillages(bbox, gridW, gridH) {
    const rawPlaces = [];

    function addCityCandidate(lat, lng, name, type = 'village', population = 0, score = 1) {
        if (!name || isNaN(lat) || isNaN(lng)) return;
        const cleanName = name.trim();
        if (!cleanName) return;

        const normX = (lng - bbox.west) / (bbox.east - bbox.west);
        const normY = (bbox.north - lat) / (bbox.north - bbox.south);
        if (normX < 0.02 || normX > 0.98 || normY < 0.02 || normY > 0.98) return;

        const gx = normX * (gridW - 1);
        const gy = normY * (gridH - 1);

        // Deduplication geographique immediate (meme nom ou meme endroit < 2km)
        const existing = rawPlaces.find(c => 
            (Math.abs(c.lat - lat) < 0.018 && Math.abs(c.lng - lng) < 0.018) ||
            (c.name.toLowerCase() === cleanName.toLowerCase() && Math.abs(c.lat - lat) < 0.04)
        );

        if (existing) {
            if (population > existing.population) existing.population = population;
            if (score > existing.score) {
                existing.score = score;
                existing.type = type;
            }
            return;
        }

        rawPlaces.push({
            gridX: gx,
            gridY: gy,
            lat,
            lng,
            name: cleanName,
            type,
            score,
            population
        });
    }

    // 1. En France : Recuperation officielle de toutes les communes des departements intersectes (geo.api.gouv.fr)
    const inFrance = (bbox.north <= 51.5 && bbox.south >= 41.0 && bbox.west >= -5.5 && bbox.east <= 10.0);
    if (inFrance) {
        try {
            const sampleCoords = [
                [(bbox.north + bbox.south) / 2, (bbox.west + bbox.east) / 2],
                [bbox.north * 0.8 + bbox.south * 0.2, bbox.west * 0.8 + bbox.east * 0.2],
                [bbox.north * 0.2 + bbox.south * 0.8, bbox.west * 0.2 + bbox.east * 0.8],
                [bbox.north * 0.8 + bbox.south * 0.2, bbox.west * 0.2 + bbox.east * 0.8],
                [bbox.north * 0.2 + bbox.south * 0.8, bbox.west * 0.8 + bbox.east * 0.2]
            ];
            const deptCodes = new Set();
            await Promise.allSettled(sampleCoords.map(async ([lat, lon]) => {
                try {
                    const ctrl = new AbortController();
                    const tid = setTimeout(() => ctrl.abort(), 2000);
                    const r = await fetch(`https://geo.api.gouv.fr/communes?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}&fields=codeDepartement`, { signal: ctrl.signal });
                    clearTimeout(tid);
                    if (r.ok) {
                        const d = await r.json();
                        if (Array.isArray(d)) {
                            for (const it of d) if (it.codeDepartement) deptCodes.add(it.codeDepartement);
                        }
                    }
                } catch (e) {}
            }));

            // Interroger la liste complete des communes de chaque departement
            for (const dept of deptCodes) {
                try {
                    const ctrl = new AbortController();
                    const tid = setTimeout(() => ctrl.abort(), 3500);
                    const res = await fetch(`https://geo.api.gouv.fr/departements/${dept}/communes?fields=nom,centre,population`, { signal: ctrl.signal });
                    clearTimeout(tid);
                    if (res.ok) {
                        const list = await res.json();
                        if (Array.isArray(list)) {
                            for (const c of list) {
                                if (!c.centre || !c.centre.coordinates) continue;
                                const lon = c.centre.coordinates[0];
                                const lat = c.centre.coordinates[1];
                                if (lon < bbox.west || lon > bbox.east || lat < bbox.south || lat > bbox.north) continue;
                                const pop = c.population || 0;
                                const placeType = pop >= 25000 ? 'city' : (pop >= 3500 ? 'town' : 'village');
                                const score = pop >= 50000 ? 4 : (pop >= 15000 ? 3 : (pop >= 3000 ? 2 : 1));
                                addCityCandidate(lat, lon, c.nom, placeType, pop, score);
                            }
                        }
                    }
                } catch (e) {}
            }
        } catch (err) {
            console.warn("geo.api.gouv communes:", err);
        }
    }

    // 2. Requete OpenStreetMap via les miroirs Overpass fiables (mondial, villes & communes)
    try {
        const overpassCities = `[out:json][timeout:6];(node["place"~"city|town|village"]["name"](${bbox.south.toFixed(4)},${bbox.west.toFixed(4)},${bbox.north.toFixed(4)},${bbox.east.toFixed(4)}););out body 150;`;
        const osmPlaces = await queryOverpassMirror(overpassCities, 3500);
        if (osmPlaces && Array.isArray(osmPlaces)) {
            for (const el of osmPlaces) {
                if (el.tags && el.tags.name) {
                    const pType = el.tags.place || 'village';
                    const pop = el.tags.population ? parseInt(el.tags.population, 10) : 0;
                    const score = pType === 'city' ? 4 : (pType === 'town' ? 3 : (pop >= 1500 ? 2 : 1));
                    addCityCandidate(el.lat, el.lon, el.tags.name, pType, pop, score);
                }
            }
        }
    } catch (e) {
        console.warn("Overpass villes:", e);
    }

    // 3. Requetes alternatives (Geoapify, Mapbox Tilequery)
    try {
        const apiCalls = [
            fetchPlacesFromMapboxTilequery(bbox, 'place_label', 3500),
            fetchPlacesFromGeoapify(bbox, 'populated_place', 3500)
        ];
        const results = await Promise.allSettled(apiCalls);
        for (const r of results) {
            if (r.status === 'fulfilled' && Array.isArray(r.value)) {
                for (const item of r.value) {
                    const pop = item.population || 0;
                    let score = 1;
                    let type = 'village';
                    if (item.type === 'city' || pop >= 25000) { score = 4; type = 'city'; }
                    else if (item.type === 'town' || pop >= 3500) { score = 3; type = 'town'; }
                    else { score = 2; type = 'village'; }
                    addCityCandidate(item.lat, item.lng, item.name, type, pop, score);
                }
            }
        }
    } catch (err) {
        console.warn("APIs alternatives villes:", err);
    }

    // 4. Completer avec le catalogue integre des villes et bourgs majeurs
    for (const cat of KNOWN_CITIES_CATALOG) {
        if (cat.lat <= bbox.north && cat.lat >= bbox.south &&
            cat.lng >= bbox.west && cat.lng <= bbox.east) {
            const pop = cat.population || 0;
            const score = cat.type === 'city' ? 4 : (cat.type === 'town' ? 3 : 2);
            addCityCandidate(cat.lat, cat.lng, cat.name, cat.type, pop, score);
        }
    }

    // 5. Distribution spatiale equilibree en 3 passes (grandes villes + villes moyennes + bourgs)
    const selected = [];
    const minSpacingLarge = Math.max(26, Math.round(gridW * 0.05));
    const minSpacingMedium = Math.max(18, Math.round(gridW * 0.035));
    const minSpacingSmall = Math.max(14, Math.round(gridW * 0.025));

    // Passe 1 : Grandes villes (score >= 4)
    const largeCities = rawPlaces.filter(c => c.score >= 4).sort((a, b) => b.population - a.population);
    for (const c of largeCities) {
        const tooClose = selected.some(sc => Math.hypot(sc.gridX - c.gridX, sc.gridY - c.gridY) < minSpacingLarge);
        if (!tooClose && selected.length < 8) {
            selected.push(c);
        }
    }

    // Passe 2 : Villes moyennes (score 2 ou 3, population entre 2500 et 30000) - Priorite garantie
    const mediumCities = rawPlaces.filter(c => (c.score === 3 || c.score === 2) && !selected.includes(c))
                                   .sort((a, b) => b.population - a.population);
    for (const c of mediumCities) {
        const tooClose = selected.some(sc => Math.hypot(sc.gridX - c.gridX, sc.gridY - c.gridY) < minSpacingMedium);
        if (!tooClose && selected.length < 22) {
            selected.push(c);
        }
    }

    // Passe 3 : Bourgs et villages pour combler harmonieusement les vallees et reliefs
    const remaining = rawPlaces.filter(c => !selected.includes(c)).sort((a, b) => b.population - a.population);
    for (const c of remaining) {
        const tooClose = selected.some(sc => Math.hypot(sc.gridX - c.gridX, sc.gridY - c.gridY) < minSpacingSmall);
        if (!tooClose && selected.length < 28) {
            selected.push(c);
        }
    }

    return selected;
}

/**
 * Détermine dynamiquement si une courbe de niveau est maîtresse (renforcée)
 * selon le pas et le multiplicateur choisi (×2, ×3, ×4, ×5, ×10, ou 1 pour tout, 0 pour aucune)
 */
function isContourMajor(c, step = 50, multiplier = 4) {
    if (multiplier === 1 || multiplier === '1') return true; // Toutes renforcées
    if (multiplier <= 0 || multiplier === 'none' || multiplier === '0') return false; // Aucune maîtresse (toutes fines)
    const m = Math.max(1, Math.round(Number(multiplier) || 4));
    const s = Math.max(1, Math.round(Number(step) || 50));
    const ele = Math.round(c.elevation !== undefined ? c.elevation : 0);
    return (ele % (s * m) === 0);
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
        carto: localStorage.getItem('topo_carto_key') || '',
        geoapify: localStorage.getItem('topo_geoapify_key') || ''
    };
    const file = window.TOPO_CONFIG || {};
    return {
        mapbox: local.mapbox || file.MAPBOX_TOKEN || EMBEDDED_PUBLIC_KEYS.mapbox || '',
        stadia: local.stadia || file.STADIA_KEY || '',
        carto: local.carto || file.CARTO_KEY || '',
        geoapify: local.geoapify || file.GEOAPIFY_KEY || EMBEDDED_PUBLIC_KEYS.geoapify || ''
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
    customFormat: { w: 50, h: 70, unit: 'cm' },
    themeKey: 'emerald',
    resolutionKey: 'hd',
    fontFamily: 'Montserrat',
    titleText: 'MASSIF DU VERCORS',
    subtitleText: '45.034° N, 5.512° E — ALPES FRANÇAISES',

    // Paramètres du Moteur Vectoriel
    contourStep: 50,
    majorMultiplier: 4, // Multiplicateur de fréquence des courbes maîtresses (×2, ×3, ×4, ×5, ×10, ou 1)
    smoothingLevel: 3, // 0 à 8 (8 = arrondi maximal)
    noiseThreshold: 8,  // Curseur de filtrage des micro-points résiduels (0 à 40)
    filterNoise: true,
    showContours: true,
    showMajorContours: true,
    showPeaks: true,           // Affichage des sommets & altitudes (▲)
    showContourLabels: false,  // Graduations d'altitude sur les courbes (désactivées par défaut)
    showHillshade: false,      // Désactivé par défaut
    showLabels: true,          // Villes & Communes (activées par défaut)
    showScaleNorth: true,
    highlightTrails: true,     // Mode raster rando : faire ressortir les sentiers balisés

    // Couleurs personnalisées en direct dans la page studio
    customColors: {
        bg: '#14382c',          // Fond de l'affiche (bords, cartouche, texte)
        mapBg: '#14382c',       // Fond de la carte sous les lignes
        linkBgs: true,          // Si true, les deux fonds sont liés
        isTransparent: false,
        isMapTransparent: false,
        majorColor: '#ffffff',
        minorColor: '#a7f3d0',
        citiesColor: '#ffffff',
        peaksColor: '#ffffff',
        textColor: '#ffffff',
        majorWidth: 1.8,
        minorWidth: 0.9
    },

    // Cache des données vectorielles compilées
    compiledData: null,
    studioZoom: 'fit',

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
    if (appState.formatKey === 'custom') {
        const u = appState.customFormat.unit || 'cm';
        document.getElementById('frame-ratio-label').innerText = `Format Custom (${appState.customFormat.w} × ${appState.customFormat.h} ${u} — ${dim.width} × ${dim.height} px)`;
    } else {
        document.getElementById('frame-ratio-label').innerText = `${format.name} (${dim.width} × ${dim.height} px)`;
    }

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
 * Récupération résiliente d'une tuile altimétrique MNT avec bascule multi-sources
 * (Mapbox -> ReEarth Terrain-RGB -> AWS Open Data Terrarium S3)
 */
async function fetchDemTileWithFallback(targetZoom, tx, ty) {
    const keys = getApiKeys();
    const candidates = [];
    if (keys.mapbox) {
        candidates.push({
            url: `https://api.mapbox.com/v4/mapbox.terrain-rgb/${targetZoom}/${tx}/${ty}.pngraw?access_token=${encodeURIComponent(keys.mapbox)}`,
            format: 'terrain-rgb'
        });
    }
    // Source 1 : ReEarth Terrain-RGB
    candidates.push({
        url: DEM_ELEVATION_URL.replace('{z}', targetZoom).replace('{x}', tx).replace('{y}', ty),
        format: 'terrain-rgb'
    });
    // Source 2 : AWS S3 Open Data Terrarium (haute résilience infrastructure Amazon mondiale)
    candidates.push({
        url: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${targetZoom}/${tx}/${ty}.png`,
        format: 'terrarium'
    });

    for (const cand of candidates) {
        const img = await fetchTile(cand.url, 1);
        if (img && img.naturalWidth) {
            return { img, format: cand.format };
        }
    }
    return { img: null, format: 'terrain-rgb' };
}

/**
 * Décode la grille altimétrique 2D depuis les dalles altimétriques
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
            tilePromises.push({ tx, ty, promise: fetchDemTileWithFallback(targetZoom, tx, ty) });
        }
    }

    const loadedTiles = await Promise.all(tilePromises.map(async t => {
        const res = await t.promise;
        return {
            tx: t.tx,
            ty: t.ty,
            img: res.img,
            format: res.format
        };
    }));

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
            if (t.format === 'terrarium') {
                // Conversion Terrarium -> Terrain-RGB standardisée
                const tempC = document.createElement('canvas');
                tempC.width = nativeTileW;
                tempC.height = nativeTileH;
                const tempCtx = tempC.getContext('2d');
                tempCtx.drawImage(t.img, 0, 0, nativeTileW, nativeTileH);
                const idata = tempCtx.getImageData(0, 0, nativeTileW, nativeTileH);
                const d = idata.data;
                for (let i = 0; i < d.length; i += 4) {
                    const r = d[i], g = d[i + 1], b = d[i + 2];
                    const elev = (r * 256 + g + b / 256) - 32768;
                    const val = Math.max(0, Math.round((elev + 10000) * 10));
                    d[i] = (val >> 16) & 255;
                    d[i + 1] = (val >> 8) & 255;
                    d[i + 2] = val & 255;
                }
                tempCtx.putImageData(idata, 0, 0);
                tCtx.drawImage(tempC, dx, dy, nativeTileW, nativeTileH);
            } else {
                tCtx.drawImage(t.img, dx, dy, nativeTileW, nativeTileH);
            }
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
        const isMajor = isContourMajor({ elevation: h }, step, appState.majorMultiplier);

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

            // Filtrage précis des micro-points et bruit (artefacts et petits îlots isolés)
            if (appState.noiseThreshold > 0) {
                const thresh = appState.noiseThreshold;
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
                    if (totalLen < thresh || bboxSpan < (thresh * 0.45)) {
                        return false;
                    }
                    return true;
                });
            }

            if (polylines.length > 0) {
                contours.push({
                    elevation: h,
                    level: h,
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
            pts = relaxPolyline(pts, 4, 0.70);
            return chaikinSmooth(pts, 4);
        case 7: // Ondulations Larges & Douces
            pts = relaxPolyline(pts, 6, 0.80);
            return chaikinSmooth(pts, 4);
        case 8: // Courbes Maximales / Ultra Arrondi (Vagues Organiques)
            pts = relaxPolyline(pts, 8, 0.88);
            return chaikinSmooth(pts, 4);
        default:
            return pts;
    }
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
        } else if (layout === 'poster-fullbleed') {
            cartoucheH = Math.round(canvasH * 0.165);
            mapX = 0;
            mapY = 0;
            mapW = canvasW;
            mapH = canvasH - cartoucheH;
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
                peaks = await extractMountainPeaks(grid, gridW, gridH, appState.currentBBox, Math.max(40, minH + (maxH - minH) * 0.12));
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

                const multiplier = appState.majorMultiplier !== undefined ? appState.majorMultiplier : 4;
                const step = appState.contourStep || 50;

                for (const c of contours) {
                    if (!isContourMajor(c, step, multiplier)) {
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

            // Tracé des courbes maîtresses (renforcées)
            if (appState.showMajorContours) {
                ctx.beginPath();
                ctx.strokeStyle = theme.majorColor;
                ctx.lineWidth = Math.max(2, Math.round(canvasW * 0.002));

                const multiplier = appState.majorMultiplier !== undefined ? appState.majorMultiplier : 4;
                const step = appState.contourStep || 50;

                for (const c of contours) {
                    if (isContourMajor(c, step, multiplier)) {
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
        } else if (layout === 'poster-fullbleed') {
            drawPosterFullbleedCartouche(ctx, mapX, mapY, mapW, mapH, cartoucheH, canvasW, canvasH, theme);
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
function drawMountainPeaksOnCanvas(ctx, peaks, mapX, mapY, scaleX, scaleY, canvasW, theme, mapW = 0, mapH = 0) {
    if (!peaks || peaks.length === 0) return;

    ctx.save();
    if (mapW > 0 && mapH > 0) {
        ctx.beginPath();
        ctx.rect(mapX, mapY, mapW, mapH);
        ctx.clip();
    }

    ctx.fillStyle = theme.peakColor || '#ffffff';
    ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0,0,0,0.85)' : theme.bg;
    ctx.lineWidth = Math.max(2, Math.round(canvasW * 0.0012));

    const symbolSize = Math.max(6, Math.round(canvasW * 0.0052));
    const fontSize = Math.max(8.5, Math.round(canvasW * 0.0075));
    ctx.font = `700 ${fontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.textAlign = 'center';

    for (const p of peaks) {
        const px = mapX + p.gridX * scaleX;
        const py = mapY + p.gridY * scaleY;

        // Masquer si le sommet sort du cadre de la carte
        if (mapW > 0 && (px < mapX - 5 || px > mapX + mapW + 5 || py < mapY - 5 || py > mapY + mapH + 5)) {
            continue;
        }

        // Symbole triangle
        ctx.beginPath();
        ctx.moveTo(px, py - symbolSize);
        ctx.lineTo(px - symbolSize * 0.75, py + symbolSize * 0.5);
        ctx.lineTo(px + symbolSize * 0.75, py + symbolSize * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        // Texte : Vrai nom et altitude (ex: "MONT AIGUILLE · 2 087 m", ou "2 087 m" si anonyme)
        const labelText = (p.name && p.name.trim() !== '') 
            ? `${p.name} · ${p.alt} m`.toUpperCase() 
            : `${p.alt} m`;

        // Si le sommet est proche du bord superieur, placer le texte en dessous pour eviter le debordement
        const isNearTop = mapH > 0 && (py - symbolSize - fontSize - 6 < mapY);
        const textY = isNearTop ? (py + symbolSize + 4) : (py - symbolSize - 4);
        ctx.textBaseline = isNearTop ? 'top' : 'bottom';

        ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0,0,0,0.85)' : theme.bg;
        ctx.lineWidth = Math.max(3, Math.round(canvasW * 0.002));
        ctx.lineJoin = 'round';
        ctx.strokeText(labelText, px, textY);
        ctx.fillStyle = theme.peakColor || theme.textColor;
        ctx.fillText(labelText, px, textY);
    }
    ctx.restore();
}

/**
 * Dessine les villes & villages sur le Canvas (Vectoriel, dans le theme, sans debordement)
 */
function drawCitiesOnCanvas(ctx, cities, mapX, mapY, scaleX, scaleY, canvasW, theme, mapW = 0, mapH = 0) {
    if (!cities || cities.length === 0) return;

    ctx.save();
    if (mapW > 0 && mapH > 0) {
        ctx.beginPath();
        ctx.rect(mapX, mapY, mapW, mapH);
        ctx.clip();
    }

    for (const c of cities) {
        const px = mapX + c.gridX * scaleX;
        const py = mapY + c.gridY * scaleY;

        // Masquer si la ville sort du cadre de la carte
        if (mapW > 0 && (px < mapX - 5 || px > mapX + mapW + 5 || py < mapY - 5 || py > mapY + mapH + 5)) {
            continue;
        }

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
        ctx.textBaseline = 'middle';

        const labelText = c.name.toUpperCase();
        const textOffset = Math.max(4, Math.round(canvasW * 0.0035));
        const estimatedTextW = ctx.measureText(labelText).width;

        // Si le nom depasse a droite du cadre, l'aligner a gauche du point pour rester a l'interieur
        const isNearRight = mapW > 0 && (px + dotRadius + textOffset + estimatedTextW > mapX + mapW - 4);
        const textX = isNearRight ? (px - dotRadius - textOffset) : (px + dotRadius + textOffset);
        ctx.textAlign = isNearRight ? 'right' : 'left';

        // Halo dans le theme pour garantir la lisibilite
        ctx.strokeStyle = theme.bg === 'transparent' ? 'rgba(0, 0, 0, 0.85)' : theme.bg;
        ctx.lineWidth = Math.max(3, Math.round(canvasW * 0.002));
        ctx.lineJoin = 'round';
        ctx.strokeText(labelText, textX, py);

        ctx.fillStyle = theme.textColor;
        ctx.fillText(labelText, textX, py);
    }
    ctx.restore();
}

/**
 * Dessine les graduations d'altitude sur les courbes maitresses (Graduations orientees)
 */
function drawContourLabelsOnCanvas(ctx, contours, mapX, mapY, scaleX, scaleY, canvasW, theme, mapW = 0, mapH = 0) {
    if (!contours || contours.length === 0) return [];

    ctx.save();
    if (mapW > 0 && mapH > 0) {
        ctx.beginPath();
        ctx.rect(mapX, mapY, mapW, mapH);
        ctx.clip();
    }

    const fontSize = Math.max(8, Math.round(canvasW * 0.0062));
    ctx.font = `600 ${fontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const placedLabels = [];
    const minDistance = Math.max(100, canvasW * 0.08);

    for (const c of contours) {
        if (!c.isMajor) continue;
        const eleValue = c.elevation !== undefined ? c.elevation : (c.level !== undefined ? c.level : 0);
        const altText = `${eleValue} m`;

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
 * Dessine le cartouche d'art en mode Plein Bord (Lignes 100% jusqu'aux bords)
 */
function drawPosterFullbleedCartouche(ctx, mapX, mapY, mapW, mapH, cartoucheH, canvasW, canvasH, theme) {
    // Fond plein du cartouche sous la carte
    if (theme.bg && theme.bg !== 'transparent') {
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, mapH, canvasW, cartoucheH);
    }

    // Ligne fine séparatrice entre la carte plein bord et le cartouche
    ctx.beginPath();
    ctx.moveTo(0, mapH);
    ctx.lineTo(canvasW, mapH);
    ctx.strokeStyle = theme.subtleLine || 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = Math.max(1, Math.round(canvasW * 0.0008));
    ctx.stroke();

    const cartoucheY = mapH + Math.round(canvasH * 0.015);
    const centerX = canvasW / 2;

    // Titre Principal
    const titleFontSize = Math.round(canvasW * 0.038);
    ctx.font = `800 ${titleFontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.fillStyle = theme.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const mainTitle = (appState.titleText || 'TITRE DE L\'AFFICHE').toUpperCase();
    drawSpacedText(ctx, mainTitle, centerX, cartoucheY + Math.round(canvasH * 0.012), Math.round(titleFontSize * 0.22));

    // Sous-titre
    if (appState.subtitleText) {
        const subFontSize = Math.round(canvasW * 0.0135);
        ctx.font = `500 ${subFontSize}px '${appState.fontFamily}', sans-serif`;
        ctx.fillStyle = theme.textColor;
        ctx.globalAlpha = 0.85;
        const subText = appState.subtitleText.toUpperCase();
        drawSpacedText(ctx, subText, centerX, cartoucheY + Math.round(canvasH * 0.058), Math.round(subFontSize * 0.16));
        ctx.globalAlpha = 1.0;
    }

    // Ligne séparatrice intérieure
    const sepY = cartoucheY + Math.round(canvasH * 0.088);
    ctx.beginPath();
    ctx.moveTo(centerX - Math.round(canvasW * 0.35), sepY);
    ctx.lineTo(centerX + Math.round(canvasW * 0.35), sepY);
    ctx.strokeStyle = theme.subtleLine;
    ctx.lineWidth = Math.max(1, Math.round(canvasW * 0.0006));
    ctx.stroke();

    // Coordonnées, Échelle, Nord
    const metaY = sepY + Math.round(canvasH * 0.020);
    const metaFontSize = Math.round(canvasW * 0.010);
    ctx.font = `600 ${metaFontSize}px '${appState.fontFamily}', sans-serif`;
    ctx.fillStyle = theme.textColor;

    const center = (appState.compiledData && appState.compiledData.center) || appState.currentCenter;
    if (center) {
        const dms = formatToDMS(center.lat, center.lng);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 0.78;
        drawSpacedText(ctx, dms, Math.round(canvasW * 0.04), metaY, Math.round(metaFontSize * 0.08));
        ctx.globalAlpha = 1.0;
    }

    if (appState.showScaleNorth && appState.currentBBox) {
        const centerLat = center ? center.lat : ((appState.currentBBox.north + appState.currentBBox.south) / 2);
        const pt1 = L.latLng(centerLat, appState.currentBBox.west);
        const pt2 = L.latLng(centerLat, appState.currentBBox.east);
        const totalMeters = pt1.distanceTo(pt2);
        const metersPerPixel = totalMeters / canvasW;

        drawGraphicalScaleBar(ctx, centerX, metaY, metersPerPixel, canvasW, theme);

        const northX = canvasW - Math.round(canvasW * 0.05);
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
    const characters = Array.from(text);
    const prevAlign = ctx.textAlign;
    ctx.textAlign = 'left';

    const charWidths = characters.map(ch => ctx.measureText(ch).width);
    const totalWidth = charWidths.reduce((sum, w) => sum + w, 0) + (characters.length - 1) * letterSpacing;

    let startX = x;
    if (prevAlign === 'center') {
        startX = x - totalWidth / 2;
    } else if (prevAlign === 'right') {
        startX = x - totalWidth;
    }

    let currentX = startX;
    for (let i = 0; i < characters.length; i++) {
        ctx.fillText(characters[i], currentX, y);
        currentX += charWidths[i] + letterSpacing;
    }

    ctx.textAlign = prevAlign;
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
    const screenW = screenFrameElem ? screenFrameElem.offsetWidth : 800;
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

    // Si highlightTrails est active, rehausser le contraste pour faire ressortir les chemins
    if (appState.highlightTrails) {
        ctx.filter = 'contrast(106%) saturate(110%)';
    }

    for (const tile of tiles) {
        if (tile.img) {
            const destX = renderOffsetX + (tile.tx * 256 - nwMercator.x) * scaleRatio;
            const destY = renderOffsetY + (tile.ty * 256 - nwMercator.y) * scaleRatio;
            const destW = Math.ceil(256 * scaleRatio) + 1;
            const destH = Math.ceil(256 * scaleRatio) + 1;
            ctx.drawImage(tile.img, destX, destY, destW, destH);
        }
    }
    ctx.filter = 'none';

    // Superposition des sentiers et GR de randonnee (Waymarked Trails)
    if (appState.highlightTrails) {
        const trailsProvider = TILE_PROVIDERS.waymarkedTrails;
        if (trailsProvider) {
            const trailZoom = Math.min(trailsProvider.maxZoom, targetZoom);
            const nwMercTrails = appState.map.project(L.latLng(bbox.north, bbox.west), trailZoom);
            const seMercTrails = appState.map.project(L.latLng(bbox.south, bbox.east), trailZoom);

            const tMinX = Math.floor(nwMercTrails.x / 256);
            const tMaxX = Math.floor(seMercTrails.x / 256);
            const tMinY = Math.floor(nwMercTrails.y / 256);
            const tMaxY = Math.floor(seMercTrails.y / 256);

            const trailList = [];
            for (let tx = tMinX; tx <= tMaxX; tx++) {
                for (let ty = tMinY; ty <= tMaxY; ty++) {
                    const url = trailsProvider.url
                        .replace('{z}', trailZoom)
                        .replace('{x}', tx)
                        .replace('{y}', ty);
                    trailList.push({ tx, ty, url });
                }
            }

            const trailTiles = await Promise.all(trailList.map(async t => ({ ...t, img: await fetchTile(t.url) })));
            const tSpanX = seMercTrails.x - nwMercTrails.x;
            const tSpanY = seMercTrails.y - nwMercTrails.y;
            const tScaleRatio = Math.max(mapW / tSpanX, mapH / tSpanY);
            const tOffsetX = mapX + (mapW - tSpanX * tScaleRatio) / 2;
            const tOffsetY = mapY + (mapH - tSpanY * tScaleRatio) / 2;

            ctx.globalAlpha = 0.92;
            for (const tile of trailTiles) {
                if (tile.img) {
                    const destX = tOffsetX + (tile.tx * 256 - nwMercTrails.x) * tScaleRatio;
                    const destY = tOffsetY + (tile.ty * 256 - nwMercTrails.y) * tScaleRatio;
                    const destW = Math.ceil(256 * tScaleRatio) + 1;
                    const destH = Math.ceil(256 * tScaleRatio) + 1;
                    ctx.drawImage(tile.img, destX, destY, destW, destH);
                }
            }
            ctx.globalAlpha = 1.0;
        }
    }

    ctx.restore();
}

function generatePureSVG(vectorData, mapW, mapH, mapX, mapY, canvasW, canvasH, colorsInput, fontInput) {
    const isRaster = vectorData && vectorData.mode === 'raster';
    const contours = (vectorData && vectorData.contours) ? vectorData.contours : [];
    const peaks = (vectorData && vectorData.peaks) ? vectorData.peaks : [];
    const cities = (vectorData && vectorData.cities) ? vectorData.cities : [];
    const contourLabels = (vectorData && vectorData.contourLabels) ? vectorData.contourLabels : [];
    const gridW = (vectorData && vectorData.gridW) ? vectorData.gridW : 650;
    const gridH = (vectorData && vectorData.gridH) ? vectorData.gridH : Math.max(10, Math.round(gridW * (mapH / Math.max(1, mapW))));

    const colors = colorsInput || appState.customColors || {};
    const font = fontInput || appState.fontFamily || 'Montserrat';
    const format = POSTER_FORMATS[appState.formatKey] || POSTER_FORMATS['a4-portrait'];

    const previewBaseW = (format.ratio >= 1 ? 1800 : Math.round(1800 * format.ratio));
    const scaleRatio = canvasW / previewBaseW;

    const bgColor = colors.bg || '#14382c';
    const mapBgColor = colors.mapBg || bgColor;
    const isTransparent = colors.isTransparent || bgColor === 'transparent';
    const isMapTransparent = colors.isMapTransparent || mapBgColor === 'transparent';
    const majorColor = colors.majorColor || '#ffffff';
    const minorColor = colors.minorColor || '#a7f3d0';
    const citiesColor = colors.citiesColor || colors.textColor || '#ffffff';
    const peaksColor = colors.peaksColor || colors.textColor || '#ffffff';
    const textColor = colors.textColor || '#ffffff';
    const minorWidth = (Math.max(0.5, (colors.minorWidth !== undefined ? colors.minorWidth : 0.8) * scaleRatio)).toFixed(2);
    const majorWidth = (Math.max(1.2, (colors.majorWidth !== undefined ? colors.majorWidth : 1.8) * scaleRatio)).toFixed(2);

    let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW} ${canvasH}" width="${canvasW}" height="${canvasH}">\n`;
    svg += `  <defs>\n`;
    svg += `    <style>\n`;
    svg += `      text { font-family: '${font}', 'Inter', sans-serif; }\n`;
    svg += `    </style>\n`;
    svg += `    <clipPath id="map-frame-clip">\n`;
    svg += `      <rect x="0" y="0" width="${mapW}" height="${mapH}"/>\n`;
    svg += `    </clipPath>\n`;
    svg += `  </defs>\n`;
    
    // Fond 1 : Fond global de l'affiche
    if (!isTransparent) {
        svg += `  <rect id="fond-affiche" width="${canvasW}" height="${canvasH}" fill="${escapeXmlAttr(bgColor)}"/>\n`;
    }

    // Fond 2 : Fond de la carte sous les lignes (si dissocie ou couleur differente)
    if (!isMapTransparent && (mapBgColor !== bgColor || isTransparent)) {
        svg += `  <rect id="fond-lignes" x="${mapX}" y="${mapY}" width="${mapW}" height="${mapH}" fill="${escapeXmlAttr(mapBgColor)}"/>\n`;
    }

    svg += `  <g id="zone-carte" transform="translate(${mapX}, ${mapY})" clip-path="url(#map-frame-clip)">\n`;

    if (isRaster && vectorData.rasterCanvas) {
        // Mode Dalles Raster : integration de la carte haute definition
        const rasterDataUrl = vectorData.rasterCanvas.toDataURL('image/jpeg', 0.92);
        svg += `    <image href="${rasterDataUrl}" x="0" y="0" width="${mapW}" height="${mapH}" preserveAspectRatio="none"/>\n`;
    } else {
        // Mode Vectoriel : Courbes de niveau, cotes, villes et sommets
        const scaleX = mapW / Math.max(1, gridW - 1);
        const scaleY = mapH / Math.max(1, gridH - 1);

        const multiplier = appState.majorMultiplier !== undefined ? appState.majorMultiplier : 4;
        const step = appState.contourStep || 50;

        if (contours && contours.length > 0) {
            // Courbes secondaires
            if (appState.showContours) {
                svg += `    <g id="courbes-secondaires" fill="none" stroke="${escapeXmlAttr(minorColor)}" stroke-width="${minorWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.75">\n`;
                for (const c of contours) {
                    if (!isContourMajor(c, step, multiplier)) {
                        for (const polyline of (c.polylines || [])) {
                            const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
                            if (!smoothed || smoothed.length < 2) continue;
                            let d = '';
                            for (let i = 0; i < smoothed.length; i++) {
                                const pt = smoothed[i];
                                if (!pt || isNaN(pt[0]) || isNaN(pt[1])) continue;
                                const sx = (pt[0] * scaleX).toFixed(1);
                                const sy = (pt[1] * scaleY).toFixed(1);
                                d += (d === '' ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`);
                            }
                            if (d.length > 0) {
                                svg += `      <path d="${d}"/>\n`;
                            }
                        }
                    }
                }
                svg += `    </g>\n`;
            }

            // Courbes maitresses (renforcees)
            if (appState.showMajorContours) {
                svg += `    <g id="courbes-maitresses" fill="none" stroke="${escapeXmlAttr(majorColor)}" stroke-width="${majorWidth}" stroke-linecap="round" stroke-linejoin="round">\n`;
                for (const c of contours) {
                    if (isContourMajor(c, step, multiplier)) {
                        for (const polyline of (c.polylines || [])) {
                            const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
                            if (!smoothed || smoothed.length < 2) continue;
                            let d = '';
                            for (let i = 0; i < smoothed.length; i++) {
                                const pt = smoothed[i];
                                if (!pt || isNaN(pt[0]) || isNaN(pt[1])) continue;
                                const sx = (pt[0] * scaleX).toFixed(1);
                                const sy = (pt[1] * scaleY).toFixed(1);
                                d += (d === '' ? `M ${sx} ${sy}` : ` L ${sx} ${sy}`);
                            }
                            if (d.length > 0) {
                                svg += `      <path d="${d}"/>\n`;
                            }
                        }
                    }
                }
                svg += `    </g>\n`;
            }
        }

        // Graduations d'altitudes sur les courbes maitresses dans le SVG
        if (appState.showContourLabels && contourLabels.length > 0) {
            const labelSize = Math.max(8, Math.round(canvasW * 0.0062));
            svg += `    <g id="graduations-altitudes" fill="${escapeXmlAttr(majorColor)}" font-weight="600" font-size="${labelSize}" text-anchor="middle">\n`;
            for (const l of contourLabels) {
                if (!l || isNaN(l.angle)) continue;
                const deg = ((l.angle || 0) * 180 / Math.PI).toFixed(1);
                const rx = (l.gridX !== undefined ? (l.gridX * scaleX) : (l.x - mapX)).toFixed(1);
                const ry = (l.gridY !== undefined ? (l.gridY * scaleY) : (l.y - mapY)).toFixed(1);
                if (parseFloat(rx) < -5 || parseFloat(rx) > mapW + 5 || parseFloat(ry) < -5 || parseFloat(ry) > mapH + 5) continue;
                if (!isTransparent) {
                    svg += `      <rect x="${(parseFloat(rx) - 20).toFixed(1)}" y="${(parseFloat(ry) - 8).toFixed(1)}" width="40" height="16" fill="${escapeXmlAttr(bgColor)}" transform="rotate(${deg}, ${rx}, ${ry})"/>\n`;
                }
                svg += `      <text x="${rx}" y="${(parseFloat(ry) + 3).toFixed(1)}" transform="rotate(${deg}, ${rx}, ${ry})">${escapeXmlText(l.altText || '')}</text>\n`;
            }
            svg += `    </g>\n`;
        }

        // Villes & Communes dans le SVG (avec masque bord droit)
        if (appState.showLabels && cities.length > 0) {
            svg += `    <g id="villes-communes" fill="${escapeXmlAttr(citiesColor)}">\n`;
            for (const c of cities) {
                if (!c || isNaN(c.gridX) || isNaN(c.gridY)) continue;
                const px = c.gridX * scaleX;
                const py = c.gridY * scaleY;
                if (px < -5 || px > mapW + 5 || py < -5 || py > mapH + 5) continue;
                const isCity = c.type === 'city';
                const isTown = c.type === 'town';
                const dotR = isCity ? 3.5 : (isTown ? 2.5 : 2);
                const fSize = isCity ? Math.round(canvasW * 0.0088) : Math.round(canvasW * 0.0074);
                const fWeight = isCity ? '700' : '600';
                const cityName = (c.name || '').toUpperCase();
                if (!cityName) continue;

                const isNearRight = (px + dotR + 80 > mapW);
                const textAnchor = isNearRight ? 'end' : 'start';
                const textX = isNearRight ? (px - dotR - 5).toFixed(1) : (px + dotR + 5).toFixed(1);

                svg += `      <circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${dotR}"/>\n`;
                svg += `      <text x="${textX}" y="${py.toFixed(1)}" font-size="${fSize}" font-weight="${fWeight}" text-anchor="${textAnchor}" dominant-baseline="central">${escapeXmlText(cityName)}</text>\n`;
            }
            svg += `    </g>\n`;
        }

        // Sommets et pics dans le SVG (avec masque bord haut)
        if (appState.showPeaks && peaks.length > 0) {
            const peakFontSize = Math.max(9, Math.round(canvasW * 0.0075));
            svg += `    <g id="sommets" fill="${escapeXmlAttr(peaksColor)}" font-weight="700" font-size="${peakFontSize}" text-anchor="middle">\n`;
            for (const p of peaks) {
                if (!p || isNaN(p.gridX) || isNaN(p.gridY)) continue;
                const px = p.gridX * scaleX;
                const py = p.gridY * scaleY;
                if (px < -5 || px > mapW + 5 || py < -5 || py > mapH + 5) continue;
                const name = (p.name || '').trim();
                const alt = p.alt ? Math.round(p.alt) : 0;
                const labelText = name !== '' ? `${name} · ${alt} m`.toUpperCase() : `${alt} m`;

                const isNearTop = (py - 16 < 0);
                const textY = isNearTop ? (py + 16).toFixed(1) : (py - 10).toFixed(1);

                svg += `      <polygon points="${px.toFixed(1)},${(py - 7).toFixed(1)} ${(px - 5).toFixed(1)},${(py + 4).toFixed(1)} ${(px + 5).toFixed(1)},${(py + 4).toFixed(1)}"/>\n`;
                svg += `      <text x="${px.toFixed(1)}" y="${textY}">${escapeXmlText(labelText)}</text>\n`;
            }
            svg += `    </g>\n`;
        }
    }

    svg += `  </g>\n`;

    // Cartouche selon le mode de disposition
    const center = (vectorData && vectorData.center) || appState.currentCenter;
    const dms = center ? formatToDMS(center.lat, center.lng) : '';

    if (appState.layoutMode === 'poster') {
        const centerX = canvasW / 2;
        const cartY = mapY + mapH + Math.round(canvasH * 0.038);
        const titleSize = Math.round(canvasW * 0.038);
        const subSize = Math.round(canvasW * 0.0135);
        const sepY = cartY + Math.round(canvasH * 0.065);

        // Cadre autour de la carte
        svg += `  <rect x="${mapX}" y="${mapY}" width="${mapW}" height="${mapH}" fill="none" stroke="${escapeXmlAttr(textColor)}" stroke-opacity="0.22" stroke-width="1.2"/>\n`;

        svg += `  <g id="cartouche-texte" fill="${escapeXmlAttr(textColor)}">\n`;
        svg += `    <text x="${centerX}" y="${cartY}" font-size="${titleSize}" font-weight="800" text-anchor="middle" letter-spacing="0.22em">${escapeXmlText((appState.titleText || '').toUpperCase())}</text>\n`;
        if (appState.subtitleText) {
            svg += `    <text x="${centerX}" y="${cartY + Math.round(canvasH * 0.038)}" font-size="${subSize}" font-weight="500" text-anchor="middle" letter-spacing="0.14em" fill-opacity="0.85">${escapeXmlText(appState.subtitleText.toUpperCase())}</text>\n`;
        }
        svg += `    <line x1="${centerX - mapW * 0.35}" y1="${sepY}" x2="${centerX + mapW * 0.35}" y2="${sepY}" stroke="${escapeXmlAttr(textColor)}" stroke-opacity="0.25" stroke-width="1.2" />\n`;

        if (appState.showScaleNorth) {
            const metaY = sepY + Math.round(canvasH * 0.024);
            const metaSize = Math.round(canvasW * 0.0095);
            if (dms) {
                svg += `    <text x="${mapX + Math.round(canvasW * 0.01)}" y="${metaY}" font-size="${metaSize}" font-weight="600" letter-spacing="0.08em" fill-opacity="0.75">${escapeXmlText(dms)}</text>\n`;
            }
            svg += `    <text x="${mapX + mapW - Math.round(canvasW * 0.01)}" y="${metaY}" font-size="${metaSize}" font-weight="700" letter-spacing="0.1em" text-anchor="end" fill-opacity="0.85">▲ N</text>\n`;
        }
        svg += `  </g>\n`;

    } else if (appState.layoutMode === 'poster-fullbleed') {
        const centerX = canvasW / 2;
        const cartY = mapH + Math.round(canvasH * 0.035);
        const titleSize = Math.round(canvasW * 0.038);
        const subSize = Math.round(canvasW * 0.0135);
        const sepY = cartY + Math.round(canvasH * 0.065);

        // Ligne de démarcation fine et nette entre la carte et le cartouche
        svg += `  <line x1="0" y1="${mapH}" x2="${canvasW}" y2="${mapH}" stroke="${escapeXmlAttr(textColor)}" stroke-opacity="0.25" stroke-width="1.2"/>\n`;

        svg += `  <g id="cartouche-plein-bord" fill="${escapeXmlAttr(textColor)}">\n`;
        svg += `    <text x="${centerX}" y="${cartY}" font-size="${titleSize}" font-weight="800" text-anchor="middle" letter-spacing="0.22em">${escapeXmlText((appState.titleText || '').toUpperCase())}</text>\n`;
        if (appState.subtitleText) {
            svg += `    <text x="${centerX}" y="${cartY + Math.round(canvasH * 0.038)}" font-size="${subSize}" font-weight="500" text-anchor="middle" letter-spacing="0.14em" fill-opacity="0.85">${escapeXmlText(appState.subtitleText.toUpperCase())}</text>\n`;
        }
        svg += `    <line x1="${centerX - canvasW * 0.35}" y1="${sepY}" x2="${centerX + canvasW * 0.35}" y2="${sepY}" stroke="${escapeXmlAttr(textColor)}" stroke-opacity="0.25" stroke-width="1.2" />\n`;

        if (appState.showScaleNorth) {
            const metaY = sepY + Math.round(canvasH * 0.024);
            const metaSize = Math.round(canvasW * 0.0095);
            if (dms) {
                svg += `    <text x="${Math.round(canvasW * 0.04)}" y="${metaY}" font-size="${metaSize}" font-weight="600" letter-spacing="0.08em" fill-opacity="0.75">${escapeXmlText(dms)}</text>\n`;
            }
            svg += `    <text x="${canvasW - Math.round(canvasW * 0.04)}" y="${metaY}" font-size="${metaSize}" font-weight="700" letter-spacing="0.1em" text-anchor="end" fill-opacity="0.85">▲ N</text>\n`;
        }
        svg += `  </g>\n`;

    } else if (appState.layoutMode === 'minimal') {
        const marginX = Math.round(canvasW * 0.035);
        const textY = canvasH - Math.round(canvasH * 0.035);
        const coordsSize = Math.max(9, Math.round(canvasW * 0.009));
        const subSize = Math.max(9, Math.round(canvasW * 0.0085));

        svg += `  <g id="cartouche-minimal" fill="${escapeXmlAttr(textColor)}">\n`;
        if (dms) {
            svg += `    <text x="${marginX}" y="${textY}" font-size="${coordsSize}" font-weight="700" letter-spacing="0.12em">${escapeXmlText(dms)}</text>\n`;
        }
        if (appState.subtitleText) {
            svg += `    <text x="${canvasW - marginX}" y="${textY}" font-size="${subSize}" font-weight="500" letter-spacing="0.08em" text-anchor="end" fill-opacity="0.85">${escapeXmlText(appState.subtitleText.toUpperCase())}</text>\n`;
        }
        svg += `  </g>\n`;
    }

    svg += `</svg>`;
    return svg;
}

function escapeXml(unsafe) {
    return escapeXmlText(unsafe);
}

function escapeXmlText(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escapeXmlAttr(unsafe) {
    if (unsafe === undefined || unsafe === null) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.download = filename;
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1000);
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
 * 13. GESTION DES ÉVÉNEMENTS INTERFACE UTILISATEUR (CARTE & RECADRAGE)
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
            } else {
                secVector.style.display = 'none';
                secRaster.style.display = 'flex';
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

    if (toggleBtn) {
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
    }

    // 5. Recherche géographique
    const searchInput = document.getElementById('input-search');
    const btnSearch = document.getElementById('btn-search');
    if (btnSearch && searchInput) {
        btnSearch.addEventListener('click', () => searchLocation(searchInput.value));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') searchLocation(searchInput.value);
        });
    }

    // 6. Pas des courbes de niveau
    const selectInterval = document.getElementById('select-contour-interval');
    if (selectInterval) {
        selectInterval.addEventListener('change', (e) => {
            appState.contourStep = parseInt(e.target.value, 10);
            document.getElementById('contour-interval-label').innerText = `${appState.contourStep} mètres`;
        });
    }

    // 7. Curseur de Lissage Fluide (0 à 8)
    const smoothingSlider = document.getElementById('input-smoothing');
    const smoothingLabel = document.getElementById('smoothing-level-label');
    const smoothingDescriptions = [
        "Niveau 0 — Brut (Strict Topo)",
        "Niveau 1 — Léger (Fidèle)",
        "Niveau 2 — Modéré (Équilibré)",
        "Niveau 3 — Fluide & Naturel (Affiche)",
        "Niveau 4 — Très Lisse (Moderne)",
        "Niveau 5 — Ultra Lisse (Grandes Courbes)",
        "Niveau 6 — Liquide Web (Style Minimaliste)",
        "Niveau 7 — Ondulations Larges (Sculptural)",
        "Niveau 8 — Courbes Maximales (Ultra Arrondi)"
    ];

    if (smoothingSlider) {
        smoothingSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            appState.smoothingLevel = val;
            smoothingLabel.innerText = smoothingDescriptions[val] || `Niveau ${val}`;
        });
    }

    // 8. Curseur Filtre de Bruit & Micro-points résiduels (0 à 40)
    const noiseSlider = document.getElementById('input-noise-threshold');
    const noiseLabel = document.getElementById('noise-threshold-label');
    if (noiseSlider) {
        noiseSlider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            appState.noiseThreshold = val;
            if (val === 0) {
                noiseLabel.innerText = "Désactivé (Tout garder)";
            } else if (val <= 4) {
                noiseLabel.innerText = `Léger (${val} px)`;
            } else if (val <= 12) {
                noiseLabel.innerText = `Standard (${val} px)`;
            } else if (val <= 24) {
                noiseLabel.innerText = `Fort (${val} px)`;
            } else {
                noiseLabel.innerText = `Maximal (${val} px)`;
            }
        });
    }

    // Fréquence des courbes maîtresses sur l'écran cadrage
    const selectMajorFreq = document.getElementById('select-major-frequency');
    const majorFreqLabel = document.getElementById('major-frequency-label');
    if (selectMajorFreq) {
        selectMajorFreq.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            appState.majorMultiplier = isNaN(val) ? 4 : val;
            if (majorFreqLabel) {
                majorFreqLabel.innerText = val === 1 ? "Toutes les courbes" : (val === 0 ? "Aucune" : `×${val} (1 sur ${val})`);
            }
            const sFreq = document.getElementById('studio-select-major-frequency');
            if (sFreq) sFreq.value = String(appState.majorMultiplier);
            const sBadge = document.getElementById('studio-major-freq-badge');
            if (sBadge) sBadge.innerText = `×${appState.majorMultiplier}`;
        });
    }

    // 9. Dalles Raster (IGN / Ortho)
    const tileSelect = document.getElementById('tile-layer-select');
    if (tileSelect) {
        tileSelect.addEventListener('change', (e) => {
            appState.rasterLayerKey = e.target.value;
            updateInteractiveMapDisplay();
        });
    }

    const checkTrails = document.getElementById('check-highlight-trails');
    if (checkTrails) {
        checkTrails.addEventListener('change', (e) => {
            appState.highlightTrails = e.target.checked;
        });
    }

    // 10. Sélecteur de format d'affiche (avec format custom)
    const customPanel = document.getElementById('custom-format-panel');
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.formatKey = btn.dataset.format;
            if (customPanel) {
                customPanel.style.display = appState.formatKey === 'custom' ? 'flex' : 'none';
            }
            updateFrameDimensions();
        });
    });

    // Contrôles du Format Custom
    const inputCustomW = document.getElementById('input-custom-w');
    const inputCustomH = document.getElementById('input-custom-h');
    const selectCustomUnit = document.getElementById('select-custom-unit');

    function onCustomDimensionsChange() {
        const w = parseFloat(inputCustomW.value) || 50;
        const h = parseFloat(inputCustomH.value) || 70;
        const unit = selectCustomUnit ? selectCustomUnit.value : 'cm';
        appState.customFormat = { w, h, unit };
        updateFrameDimensions();
    }

    if (inputCustomW) inputCustomW.addEventListener('input', onCustomDimensionsChange);
    if (inputCustomH) inputCustomH.addEventListener('input', onCustomDimensionsChange);
    if (selectCustomUnit) selectCustomUnit.addEventListener('change', onCustomDimensionsChange);

    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cw = parseFloat(btn.dataset.cw);
            const ch = parseFloat(btn.dataset.ch);
            if (inputCustomW && inputCustomH) {
                inputCustomW.value = cw;
                inputCustomH.value = ch;
                onCustomDimensionsChange();
            }
        });
    });

    // 11. Titre & Sous-titre Carte
    const titleInput = document.getElementById('input-title');
    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            appState.titleText = e.target.value;
            updateLivePreview();
        });
    }
    const subtitleInput = document.getElementById('input-subtitle');
    if (subtitleInput) {
        subtitleInput.addEventListener('input', (e) => {
            appState.subtitleText = e.target.value;
            updateLivePreview();
        });
    }

    // 12. Police de caractères Carte
    const selectFont = document.getElementById('select-font');
    if (selectFont) {
        selectFont.addEventListener('change', (e) => {
            appState.fontFamily = e.target.value;
            updateLivePreview();
        });
    }

    // 13. Synchronisation GPS Auto Carte
    const btnSyncCoords = document.getElementById('btn-sync-coords');
    if (btnSyncCoords) {
        btnSyncCoords.addEventListener('click', () => {
            if (appState.currentCenter) {
                const latStr = `${appState.currentCenter.lat.toFixed(3)}° N`;
                const lngStr = `${appState.currentCenter.lng.toFixed(3)}° E`;
                const newSub = `${latStr}, ${lngStr} — FRANCE`;
                if (subtitleInput) subtitleInput.value = newSub;
                appState.subtitleText = newSub;
                updateLivePreview();
            }
        });
    }

    // 14. Spots remarquables préconfigurés
    const presetSelect = document.getElementById('preset-places-select');
    if (presetSelect) {
        presetSelect.addEventListener('change', (e) => {
            const key = e.target.value;
            if (!key || !PRESET_PLACES[key]) return;
            const spot = PRESET_PLACES[key];

            if (titleInput) titleInput.value = spot.title;
            appState.titleText = spot.title;
            if (subtitleInput) subtitleInput.value = spot.subtitle;
            appState.subtitleText = spot.subtitle;

            appState.map.flyTo(spot.coords, spot.zoom, { duration: 1.5 });
            updateLivePreview();
        });
    }

    // 15. Modale Clés d'API
    const apiModal = document.getElementById('api-modal');
    const btnOpenApiModal = document.getElementById('btn-open-api-modal');
    const btnCloseApiModal = document.getElementById('btn-close-api-modal');
    const btnSaveApiKeys = document.getElementById('btn-save-api-keys');
    const btnClearApiKeys = document.getElementById('btn-clear-api-keys');
    const inputMapbox = document.getElementById('api-key-mapbox');
    const inputStadia = document.getElementById('api-key-stadia');
    const inputCarto = document.getElementById('api-key-carto');
    const inputGeoapify = document.getElementById('api-key-geoapify');

    function populateApiModalInputs() {
        if (inputMapbox) inputMapbox.value = localStorage.getItem('topo_mapbox_token') || '';
        if (inputStadia) inputStadia.value = localStorage.getItem('topo_stadia_key') || '';
        if (inputCarto) inputCarto.value = localStorage.getItem('topo_carto_key') || '';
        if (inputGeoapify) inputGeoapify.value = localStorage.getItem('topo_geoapify_key') || '';
    }

    if (btnOpenApiModal) {
        btnOpenApiModal.addEventListener('click', () => {
            populateApiModalInputs();
            apiModal.classList.add('show');
        });
    }
    if (btnCloseApiModal) {
        btnCloseApiModal.addEventListener('click', () => {
            apiModal.classList.remove('show');
        });
    }
    if (apiModal) {
        apiModal.addEventListener('click', (e) => {
            if (e.target === apiModal) apiModal.classList.remove('show');
        });
    }
    if (btnSaveApiKeys) {
        btnSaveApiKeys.addEventListener('click', () => {
            if (inputMapbox && inputMapbox.value.trim()) localStorage.setItem('topo_mapbox_token', inputMapbox.value.trim());
            else localStorage.removeItem('topo_mapbox_token');

            if (inputStadia && inputStadia.value.trim()) localStorage.setItem('topo_stadia_key', inputStadia.value.trim());
            else localStorage.removeItem('topo_stadia_key');

            if (inputCarto && inputCarto.value.trim()) localStorage.setItem('topo_carto_key', inputCarto.value.trim());
            else localStorage.removeItem('topo_carto_key');

            if (inputGeoapify && inputGeoapify.value.trim()) localStorage.setItem('topo_geoapify_key', inputGeoapify.value.trim());
            else localStorage.removeItem('topo_geoapify_key');

            apiModal.classList.remove('show');
            alert("Vos clés d'API ont été enregistrées localement dans votre navigateur.");
        });
    }
    if (btnClearApiKeys) {
        btnClearApiKeys.addEventListener('click', () => {
            localStorage.removeItem('topo_mapbox_token');
            localStorage.removeItem('topo_stadia_key');
            localStorage.removeItem('topo_carto_key');
            localStorage.removeItem('topo_geoapify_key');
            populateApiModalInputs();
            alert("Toutes les clés d'API ont été effacées.");
        });
    }

    // 16. Bouton de Compilation & Navigation vers la Page Studio
    const btnCompile = document.getElementById('btn-compile-and-customize');
    if (btnCompile) {
        btnCompile.addEventListener('click', () => compileContoursAndEnterStudio());
    }

    window.addEventListener('resize', updateFrameDimensions);
}

/**
 * ------------------------------------------------------------------------------
 * 14. COMPILATION TOPOGRAPHIQUE & PAGE STUDIO
 * ------------------------------------------------------------------------------
 */
async function compileContoursAndEnterStudio() {
    if (!appState.currentBBox) {
        alert('Veuillez patienter pendant la detection de la zone geographique.');
        return;
    }

    await document.fonts.ready;

    const modal = document.getElementById('progress-modal');
    const stepTitle = document.getElementById('progress-step-title');
    const stepDetail = document.getElementById('progress-step-detail');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressCount = document.getElementById('progress-count-label');

    modal.classList.add('show');

    // 1. Branche rapide : Mode Dalles Raster (Cartes Rando / IGN / OpenTopo)
    // Pas de recherche de sommets ni de villes, generation ultra-rapide centree rando
    if (appState.activeMode === 'raster') {
        stepTitle.innerText = "Generation de la carte de randonnee...";
        stepDetail.innerText = "Telechargement des dalles cartographiques haute definition...";
        progressBar.style.width = '35%';
        progressCount.innerText = "Etape 1/2 (35%)";
        await new Promise(r => setTimeout(r, 60));

        try {
            const format = POSTER_FORMATS[appState.formatKey] || POSTER_FORMATS['a4-portrait'];
            const previewRatio = format.ratio;
            const previewW = previewRatio >= 1 ? 1800 : Math.round(1800 * previewRatio);
            const previewH = previewRatio >= 1 ? Math.round(1800 / previewRatio) : 1800;

            let marginX = 0, marginY = 0, cartoucheH = 0;
            let mapX = 0, mapY = 0, mapW = previewW, mapH = previewH;
            if (appState.layoutMode === 'poster') {
                marginX = Math.round(previewW * 0.045);
                marginY = Math.round(previewH * 0.045);
                cartoucheH = Math.round(previewH * 0.165);
                mapX = marginX;
                mapY = marginY;
                mapW = previewW - (marginX * 2);
                mapH = previewH - (marginY * 2) - cartoucheH;
            } else if (appState.layoutMode === 'poster-fullbleed') {
                cartoucheH = Math.round(previewH * 0.165);
                mapX = 0;
                mapY = 0;
                mapW = previewW;
                mapH = previewH - cartoucheH;
            }

            const rasterCanvas = document.createElement('canvas');
            rasterCanvas.width = mapW;
            rasterCanvas.height = mapH;
            const rCtx = rasterCanvas.getContext('2d');
            rCtx.imageSmoothingEnabled = true;
            rCtx.imageSmoothingQuality = 'high';

            stepDetail.innerText = "Rendu et rehaussement des sentiers de randonnee (GR, PR)...";
            progressBar.style.width = '75%';
            progressCount.innerText = "Etape 2/2 (75%)";

            await renderRasterTilesEngine(rCtx, 0, 0, mapW, mapH, previewW);

            appState.compiledData = {
                mode: 'raster',
                rasterCanvas,
                mapW,
                mapH,
                bbox: { ...appState.currentBBox },
                center: { ...appState.currentCenter }
            };

            progressBar.style.width = '100%';
            progressCount.innerText = "Pret !";
            await new Promise(r => setTimeout(r, 120));
            modal.classList.remove('show');

            enterStudioMode();
            return;
        } catch (err) {
            console.error("Erreur durant la generation raster :", err);
            alert(`Erreur de carte raster : ${err.message}`);
            modal.classList.remove('show');
            return;
        }
    }

    // 2. Branche classique : Mode Vectoriel (MNT, Isocontours DEM, Toponymie)
    stepTitle.innerText = "Compilation topographique en cours...";
    stepDetail.innerText = "Telechargement du Modele Numerique de Terrain (MNT mondial).";
    progressBar.style.width = '20%';
    progressCount.innerText = "Etape 1/4 (20%)";

    try {
        const targetZoom = Math.min(14, appState.map.getZoom() + 1);
        const demSampleSize = 700;
        const { grid, gridW, gridH, minH, maxH } = await fetchElevationGrid(appState.currentBBox, targetZoom, demSampleSize);

        stepTitle.innerText = "Vectorisation des isocontours (Marching Squares)...";
        stepDetail.innerText = `Calcul des courbes entre ${Math.round(minH)}m et ${Math.round(maxH)}m (Pas de ${appState.contourStep}m).`;
        progressBar.style.width = '50%';
        progressCount.innerText = "Etape 2/4 (50%)";
        await new Promise(r => setTimeout(r, 60));

        // Isocontours Marching Squares
        const contours = computeMarchingSquaresContours(grid, gridW, gridH, appState.contourStep);

        // Recherche des sommets reels
        stepTitle.innerText = "Identification des sommets reels & toponymie...";
        stepDetail.innerText = "Interrogation de la base toponymique des reliefs...";
        progressBar.style.width = '75%';
        progressCount.innerText = "Etape 3/4 (75%)";
        let peaks = [];
        try {
            peaks = await extractMountainPeaks(grid, gridW, gridH, appState.currentBBox, Math.max(40, minH + (maxH - minH) * 0.12));
            stepDetail.innerText = `${peaks.length} sommets identifies (Base toponymique & MNT).`;
        } catch (e) {
            console.warn("Extraction sommets:", e);
        }
        await new Promise(r => setTimeout(r, 80));

        // Villes & Communes
        stepTitle.innerText = "Toponymie des villes & villages...";
        stepDetail.innerText = "Interrogation de la base officielle des communes...";
        progressBar.style.width = '90%';
        progressCount.innerText = "Etape 4/4 (90%)";
        let cities = [];
        try {
            cities = await fetchCitiesAndVillages(appState.currentBBox, gridW, gridH);
            stepDetail.innerText = `${cities.length} communes et villes repertoriees.`;
        } catch (e) {
            console.warn("Toponymie villes:", e);
        }
        await new Promise(r => setTimeout(r, 80));

        // Ombrage de relief 3D precalcule
        const hsCanvas = generateHillshadeCanvas(grid, gridW, gridH);

        // Donnees d'altitudes sur les lignes
        const tempFormat = POSTER_FORMATS[appState.formatKey];
        const tempDim = tempFormat.hd;
        const scaleX = tempDim.width / (gridW - 1);
        const scaleY = tempDim.height / (gridH - 1);
        const contourLabels = generateContourLabelsData(contours, 0, 0, scaleX, scaleY, tempDim.width);

        // Mise en cache des donnees compilees
        appState.compiledData = {
            mode: 'vector',
            contours,
            peaks,
            cities,
            contourLabels,
            gridW,
            gridH,
            minH,
            maxH,
            hsCanvas,
            bbox: { ...appState.currentBBox },
            center: { ...appState.currentCenter }
        };

        progressBar.style.width = '100%';
        progressCount.innerText = "Termine !";
        await new Promise(r => setTimeout(r, 180));
        modal.classList.remove('show');

        // Bascule vers la Page Studio
        enterStudioMode();

    } catch (err) {
        console.error("Erreur durant la compilation :", err);
        alert(`Une erreur est survenue lors du calcul : ${err.message}`);
        modal.classList.remove('show');
    }
}

function generateContourLabelsData(contours, mapX, mapY, scaleX, scaleY, canvasW) {
    const placedLabels = [];
    const minDistance = canvasW * 0.16;

    for (const c of contours) {
        if (!c.isMajor) continue;
        const altText = `${c.elevation} m`;

        for (const polyline of c.polylines) {
            const smoothed = smoothPolyline(polyline, appState.smoothingLevel);
            if (smoothed.length < 25) continue;

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
                if (angle > Math.PI / 2) angle -= Math.PI;
                if (angle < -Math.PI / 2) angle += Math.PI;

                placedLabels.push({ x: px, y: py, gridX: pCurr[0], gridY: pCurr[1], altText, angle });
            }
        }
    }
    return placedLabels;
}

function enterStudioMode() {
    document.getElementById('view-map').style.display = 'none';
    document.getElementById('view-studio').style.display = 'flex';

    const isRaster = appState.compiledData && appState.compiledData.mode === 'raster';
    const strokeRows = document.querySelectorAll('.stroke-slider-row');
    strokeRows.forEach(el => el.style.display = isRaster ? 'none' : 'flex');
    const majorFreqRow = document.getElementById('studio-major-freq-row');
    if (majorFreqRow) majorFreqRow.style.display = isRaster ? 'none' : 'block';

    syncStudioInputsFromState();
    renderStudioPreview();
}

function leaveStudioMode() {
    document.getElementById('view-studio').style.display = 'none';
    document.getElementById('view-map').style.display = 'block';

    setTimeout(() => {
        if (appState.map) {
            appState.map.invalidateSize();
            updateFrameDimensions();
        }
    }, 100);
}

function isColorDark(hexColor) {
    if (!hexColor || hexColor === 'transparent') return true;
    let c = hexColor.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    if (isNaN(num)) return true;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}

function syncStudioInputsFromState() {
    const colors = appState.customColors;
    
    // Fond 1 : Fond de l'affiche
    const colorBg = document.getElementById('color-bg');
    const hexBg = document.getElementById('hex-bg');
    const checkBgTrans = document.getElementById('check-bg-transparent');
    if (colorBg && hexBg) {
        colorBg.value = colors.bg === 'transparent' ? '#14382c' : colors.bg;
        hexBg.value = colors.bg;
        if (checkBgTrans) checkBgTrans.checked = !!colors.isTransparent;
    }

    // Bouton de liaison des fonds
    const btnLink = document.getElementById('btn-toggle-link-bgs');
    const labelLink = document.getElementById('label-link-bgs');
    if (btnLink) {
        const isLinked = !!colors.linkBgs;
        btnLink.classList.toggle('active', isLinked);
        btnLink.classList.toggle('unlinked', !isLinked);
        if (labelLink) labelLink.innerText = isLinked ? 'Fonds lies (identiques)' : 'Fonds independants';
        btnLink.title = isLinked ? "Cliquer pour dissocier le fond des lignes de l'affiche" : "Cliquer pour lier et synchroniser les deux fonds";
    }

    // Fond 2 : Fond des lignes (zone carte topo)
    const colorMapBg = document.getElementById('color-map-bg');
    const hexMapBg = document.getElementById('hex-map-bg');
    const checkMapBgTrans = document.getElementById('check-map-bg-transparent');
    if (colorMapBg && hexMapBg) {
        const mBg = colors.mapBg || colors.bg || '#14382c';
        colorMapBg.value = mBg === 'transparent' ? '#14382c' : mBg;
        hexMapBg.value = mBg;
        if (checkMapBgTrans) checkMapBgTrans.checked = !!colors.isMapTransparent;
    }

    const colorMajor = document.getElementById('color-major');
    const hexMajor = document.getElementById('hex-major');
    if (colorMajor && hexMajor) {
        colorMajor.value = colors.majorColor;
        hexMajor.value = colors.majorColor;
    }

    const colorMinor = document.getElementById('color-minor');
    const hexMinor = document.getElementById('hex-minor');
    if (colorMinor && hexMinor) {
        colorMinor.value = colors.minorColor.startsWith('#') ? colors.minorColor : '#a7f3d0';
        hexMinor.value = colors.minorColor;
    }

    const colorCities = document.getElementById('color-cities');
    const hexCities = document.getElementById('hex-cities');
    if (colorCities && hexCities) {
        colorCities.value = colors.citiesColor;
        hexCities.value = colors.citiesColor;
    }

    const colorPeaks = document.getElementById('color-peaks');
    const hexPeaks = document.getElementById('hex-peaks');
    if (colorPeaks && hexPeaks) {
        colorPeaks.value = colors.peaksColor;
        hexPeaks.value = colors.peaksColor;
    }

    const colorText = document.getElementById('color-text');
    const hexText = document.getElementById('hex-text');
    if (colorText && hexText) {
        colorText.value = colors.textColor;
        hexText.value = colors.textColor;
    }

    const inputStrokeMajor = document.getElementById('input-stroke-major');
    const labelStrokeMajor = document.getElementById('label-stroke-major');
    if (inputStrokeMajor && labelStrokeMajor) {
        inputStrokeMajor.value = colors.majorWidth;
        labelStrokeMajor.innerText = `${colors.majorWidth}px`;
    }

    const inputStrokeMinor = document.getElementById('input-stroke-minor');
    const labelStrokeMinor = document.getElementById('label-stroke-minor');
    if (inputStrokeMinor && labelStrokeMinor) {
        inputStrokeMinor.value = colors.minorWidth;
        labelStrokeMinor.innerText = `${colors.minorWidth}px`;
    }

    const studioTitle = document.getElementById('studio-input-title');
    if (studioTitle) studioTitle.value = appState.titleText;

    const studioSub = document.getElementById('studio-input-subtitle');
    if (studioSub) studioSub.value = appState.subtitleText;

    const studioFont = document.getElementById('studio-select-font');
    if (studioFont) studioFont.value = appState.fontFamily;

    document.querySelectorAll('[data-studio-layout]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.studioLayout === appState.layoutMode);
    });

    const tMajor = document.getElementById('studio-toggle-major');
    if (tMajor) tMajor.checked = appState.showMajorContours;

    const sFreq = document.getElementById('studio-select-major-frequency');
    const sFreqBadge = document.getElementById('studio-major-freq-badge');
    if (sFreq) {
        const curM = appState.majorMultiplier !== undefined ? appState.majorMultiplier : 4;
        sFreq.value = String(curM);
        if (sFreqBadge) {
            sFreqBadge.innerText = (curM === 0 || curM === '0') ? "Fines" : (curM === 1 || curM === '1' ? "Gras" : `×${curM}`);
        }
    }

    const tMinor = document.getElementById('studio-toggle-minor');
    if (tMinor) tMinor.checked = appState.showContours;

    const tLabels = document.getElementById('studio-toggle-contour-labels');
    if (tLabels) tLabels.checked = appState.showContourLabels;

    const tPeaks = document.getElementById('studio-toggle-peaks');
    if (tPeaks) tPeaks.checked = appState.showPeaks;

    const tCities = document.getElementById('studio-toggle-cities');
    if (tCities) tCities.checked = appState.showLabels;

    const tHs = document.getElementById('studio-toggle-hillshade');
    if (tHs) tHs.checked = appState.showHillshade;

    const tScale = document.getElementById('studio-toggle-scale');
    if (tScale) tScale.checked = appState.showScaleNorth;
}

function renderStudioPreview(exportResolution = null) {
    if (!appState.compiledData) return;

    const format = POSTER_FORMATS[appState.formatKey];
    const targetDim = exportResolution ? format[exportResolution] : null;

    let canvasW, canvasH;
    let targetCanvas;

    if (exportResolution) {
        canvasW = targetDim.width;
        canvasH = targetDim.height;
        targetCanvas = document.createElement('canvas');
        targetCanvas.width = canvasW;
        targetCanvas.height = canvasH;
    } else {
        targetCanvas = document.getElementById('studio-live-canvas');
        if (!targetCanvas) return;
        const ratio = format.ratio;
        canvasW = ratio >= 1 ? 1800 : Math.round(1800 * ratio);
        canvasH = ratio >= 1 ? Math.round(1800 / ratio) : 1800;
        targetCanvas.width = canvasW;
        targetCanvas.height = canvasH;
    }

    const ctx = targetCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const colors = appState.customColors;
    const font = appState.fontFamily;
    const layout = appState.layoutMode;
    const data = appState.compiledData;

    // Fond 1 : Fond global de l'affiche (bords, cartouche, texte)
    if (!colors.isTransparent && colors.bg !== 'transparent') {
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
        ctx.clearRect(0, 0, canvasW, canvasH);
    }

    // Marges et calcul surface carte
    let mapX = 0, mapY = 0, mapW = canvasW, mapH = canvasH;
    let marginX = 0, marginY = 0, cartoucheH = 0;

    if (layout === 'poster') {
        marginX = Math.round(canvasW * 0.045);
        marginY = Math.round(canvasH * 0.045);
        cartoucheH = Math.round(canvasH * 0.165);
        mapX = marginX;
        mapY = marginY;
        mapW = canvasW - (marginX * 2);
        mapH = canvasH - (marginY * 2) - cartoucheH;
    } else if (layout === 'poster-fullbleed') {
        cartoucheH = Math.round(canvasH * 0.165);
        mapX = 0;
        mapY = 0;
        mapW = canvasW;
        mapH = canvasH - cartoucheH;
    } else if (layout === 'minimal') {
        marginX = Math.round(canvasW * 0.035);
        marginY = Math.round(canvasH * 0.035);
        mapX = 0;
        mapY = 0;
        mapW = canvasW;
        mapH = canvasH;
    }

    // Fond 2 : Fond specifique de la carte sous les lignes (si dissocie ou transparent)
    const mapBg = colors.mapBg || colors.bg;
    const isMapTrans = colors.isMapTransparent || mapBg === 'transparent';
    if (isMapTrans) {
        ctx.clearRect(mapX, mapY, mapW, mapH);
    } else if (mapBg !== colors.bg || colors.isTransparent) {
        ctx.fillStyle = mapBg;
        ctx.fillRect(mapX, mapY, mapW, mapH);
    }

    if (data.mode === 'raster') {
        // --- RENDU MODE DALLES RASTER (CARTE RANDO) ---
        if (data.rasterCanvas) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapW, mapH);
            ctx.clip();
            ctx.drawImage(data.rasterCanvas, mapX, mapY, mapW, mapH);
            ctx.restore();
        }
    } else {
        // --- RENDU MODE VECTORIEL (COURBES DEM & TOPONYMIE) ---
        const scaleX = mapW / Math.max(1, data.gridW - 1);
        const scaleY = mapH / Math.max(1, data.gridH - 1);

        const multiplier = appState.majorMultiplier !== undefined ? appState.majorMultiplier : 4;
        const step = appState.contourStep || 50;

        // Ombrage 3D du relief
        if (appState.showHillshade && layout !== 'pure' && !colors.isTransparent && data.hsCanvas) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapW, mapH);
            ctx.clip();
            ctx.globalAlpha = 0.26;
            const isDarkBg = isColorDark(colors.bg);
            ctx.globalCompositeOperation = isDarkBg ? 'screen' : 'multiply';
            ctx.drawImage(data.hsCanvas, mapX, mapY, mapW, mapH);
            ctx.restore();
        }

        const previewBaseW = (format.ratio >= 1 ? 1800 : Math.round(1800 * format.ratio));
        const scaleRatio = canvasW / previewBaseW;

        // Courbes secondaires (fines et discretes)
        if (appState.showContours && data.contours) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapW, mapH);
            ctx.clip();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = colors.minorColor;
            ctx.lineWidth = Math.max(0.5, (colors.minorWidth !== undefined ? colors.minorWidth : 0.8) * scaleRatio);
            ctx.globalAlpha = 0.70;

            ctx.beginPath();
            for (const c of data.contours) {
                if (!isContourMajor(c, step, multiplier)) {
                    for (const poly of c.polylines) {
                        const sm = smoothPolyline(poly, appState.smoothingLevel);
                        if (sm.length < 2) continue;
                        ctx.moveTo(mapX + sm[0][0] * scaleX, mapY + sm[0][1] * scaleY);
                        for (let i = 1; i < sm.length; i++) {
                            ctx.lineTo(mapX + sm[i][0] * scaleX, mapY + sm[i][1] * scaleY);
                        }
                    }
                }
            }
            ctx.stroke();
            ctx.restore();
        }

        // Courbes maitresses (renforcees et nettes)
        if (appState.showMajorContours && data.contours) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapW, mapH);
            ctx.clip();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = colors.majorColor;
            ctx.lineWidth = Math.max(1.2, (colors.majorWidth !== undefined ? colors.majorWidth : 1.8) * scaleRatio);
            ctx.globalAlpha = 1.0;

            ctx.beginPath();
            for (const c of data.contours) {
                if (isContourMajor(c, step, multiplier)) {
                    for (const poly of c.polylines) {
                        const sm = smoothPolyline(poly, appState.smoothingLevel);
                        if (sm.length < 2) continue;
                        ctx.moveTo(mapX + sm[0][0] * scaleX, mapY + sm[0][1] * scaleY);
                        for (let i = 1; i < sm.length; i++) {
                            ctx.lineTo(mapX + sm[i][0] * scaleX, mapY + sm[i][1] * scaleY);
                        }
                    }
                }
            }
            ctx.stroke();
            ctx.restore();
        }

        // Cotes d'altitudes sur les courbes maitresses
        if (appState.showContourLabels && data.contourLabels) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(mapX, mapY, mapW, mapH);
            ctx.clip();

            const fontSize = Math.max(8.5, Math.round(canvasW * 0.0062));
            ctx.font = `600 ${fontSize}px '${font}', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            for (const l of data.contourLabels) {
                const px = mapX + l.gridX * scaleX;
                const py = mapY + l.gridY * scaleY;
                if (px < mapX - 5 || px > mapX + mapW + 5 || py < mapY - 5 || py > mapY + mapH + 5) continue;

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(l.angle);

                const tw = ctx.measureText(l.altText).width;
                if (!colors.isTransparent && colors.bg !== 'transparent') {
                    ctx.fillStyle = colors.bg;
                    ctx.fillRect(-tw / 2 - 4, -fontSize / 2 - 2, tw + 8, fontSize + 4);
                } else {
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
                    ctx.lineWidth = 3;
                    ctx.strokeText(l.altText, 0, 0);
                }

                ctx.fillStyle = colors.majorColor || colors.textColor;
                ctx.fillText(l.altText, 0, 0);
                ctx.restore();
            }
            ctx.restore();
        }

        // Sommets et pics (avec masque bord haut)
        if (appState.showPeaks && data.peaks && data.peaks.length > 0) {
            const themeMock = {
                peakColor: colors.peaksColor,
                textColor: colors.textColor,
                bg: colors.isTransparent ? 'transparent' : colors.bg
            };
            drawMountainPeaksOnCanvas(ctx, data.peaks, mapX, mapY, scaleX, scaleY, canvasW, themeMock, mapW, mapH);
        }

        // Villes & Communes (avec masque bord droit)
        if (appState.showLabels && layout !== 'pure' && data.cities && data.cities.length > 0) {
            const themeMock = {
                textColor: colors.citiesColor,
                bg: colors.isTransparent ? 'transparent' : colors.bg
            };
            drawCitiesOnCanvas(ctx, data.cities, mapX, mapY, scaleX, scaleY, canvasW, themeMock, mapW, mapH);
        }
    }

    // Cartouche ou Minimal Éditorial ou Plein Bord
    if (layout === 'poster') {
        const themeMock = {
            textColor: colors.textColor,
            subtleLine: isColorDark(colors.bg) ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.20)',
            bg: colors.isTransparent ? 'transparent' : colors.bg
        };
        drawPosterArtCartouche(ctx, mapX, mapY, mapW, mapH, marginX, marginY, cartoucheH, canvasW, canvasH, themeMock);
    } else if (layout === 'poster-fullbleed') {
        const themeMock = {
            textColor: colors.textColor,
            subtleLine: isColorDark(colors.bg) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.20)',
            bg: colors.isTransparent ? 'transparent' : colors.bg
        };
        drawPosterFullbleedCartouche(ctx, mapX, mapY, mapW, mapH, cartoucheH, canvasW, canvasH, themeMock);
    } else if (layout === 'minimal') {
        const themeMock = {
            textColor: colors.textColor,
            bg: colors.isTransparent ? 'transparent' : colors.bg
        };
        drawMinimalEditorialLayout(ctx, marginX, marginY, canvasW, canvasH, themeMock);
    }

    if (exportResolution) {
        return targetCanvas;
    } else {
        adjustStudioCanvasFit();
    }
}

function adjustStudioCanvasFit() {
    const stage = document.getElementById('studio-stage');
    const wrapper = document.getElementById('studio-canvas-wrapper');
    const canvas = document.getElementById('studio-live-canvas');
    if (!stage || !wrapper || !canvas) return;

    const stageW = stage.clientWidth - 48;
    const stageH = stage.clientHeight - 48;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    if (appState.studioZoom === 'fit') {
        const scale = Math.min(stageW / canvasW, stageH / canvasH);
        wrapper.style.transform = `scale(${scale})`;
        wrapper.style.transformOrigin = 'center center';
        canvas.style.display = 'block';
        const zLabel = document.getElementById('zoom-level-text');
        if (zLabel) zLabel.innerText = `${Math.round(scale * 100)}%`;
    } else if (appState.studioZoom === '100%') {
        wrapper.style.transform = `scale(1)`;
        const zLabel = document.getElementById('zoom-level-text');
        if (zLabel) zLabel.innerText = '100%';
    } else {
        const scale = typeof appState.studioZoom === 'number' ? appState.studioZoom : 1;
        wrapper.style.transform = `scale(${scale})`;
        const zLabel = document.getElementById('zoom-level-text');
        if (zLabel) zLabel.innerText = `${Math.round(scale * 100)}%`;
    }
}

async function exportFromStudio(type = 'png') {
    if (!appState.compiledData) {
        alert("Veuillez d'abord compiler les données de la carte.");
        return;
    }

    const modal = document.getElementById('progress-modal');
    const stepTitle = document.getElementById('progress-step-title');
    const stepDetail = document.getElementById('progress-step-detail');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressCount = document.getElementById('progress-count-label');

    modal.classList.add('show');
    stepTitle.innerText = "Génération du fichier haute résolution...";
    stepDetail.innerText = "Exportation vectorielle et rendu en cours.";
    progressBar.style.width = '60%';
    progressCount.innerText = "60%";

    await new Promise(r => setTimeout(r, 60));

    const cleanTitle = (appState.titleText || 'topolines')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const format = POSTER_FORMATS[appState.formatKey];
    const dim = format[appState.resolutionKey];
    const canvasW = dim.width;
    const canvasH = dim.height;

    let marginX = 0, marginY = 0, cartoucheH = 0;
    let mapX = 0, mapY = 0, mapW = canvasW, mapH = canvasH;
    const layout = appState.layoutMode;

    if (layout === 'poster') {
        marginX = Math.round(canvasW * 0.045);
        marginY = Math.round(canvasH * 0.045);
        cartoucheH = Math.round(canvasH * 0.165);
        mapX = marginX;
        mapY = marginY;
        mapW = canvasW - (marginX * 2);
        mapH = canvasH - (marginY * 2) - cartoucheH;
    } else if (layout === 'poster-fullbleed') {
        cartoucheH = Math.round(canvasH * 0.165);
        mapX = 0;
        mapY = 0;
        mapW = canvasW;
        mapH = canvasH - cartoucheH;
    }

    try {
        if (type === 'svg') {
            const svgData = generatePureSVG(
                appState.compiledData,
                mapW, mapH, mapX, mapY, canvasW, canvasH,
                appState.customColors,
                appState.fontFamily
            );
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            downloadBlob(blob, `topolines-${cleanTitle}.svg`);
        } else {
            let offscreenCanvas;
            if (appState.compiledData.mode === 'raster') {
                offscreenCanvas = document.createElement('canvas');
                offscreenCanvas.width = canvasW;
                offscreenCanvas.height = canvasH;
                const oCtx = offscreenCanvas.getContext('2d');
                oCtx.imageSmoothingEnabled = true;
                oCtx.imageSmoothingQuality = 'high';

                if (!appState.customColors.isTransparent && appState.customColors.bg !== 'transparent') {
                    oCtx.fillStyle = appState.customColors.bg;
                    oCtx.fillRect(0, 0, canvasW, canvasH);
                }
                const mapBg = appState.customColors.mapBg || appState.customColors.bg;
                if (!appState.customColors.isMapTransparent && mapBg !== 'transparent' && mapBg !== appState.customColors.bg) {
                    oCtx.fillStyle = mapBg;
                    oCtx.fillRect(mapX, mapY, mapW, mapH);
                }

                await renderRasterTilesEngine(oCtx, mapX, mapY, mapW, mapH, canvasW);

                if (layout === 'poster') {
                    const themeMock = {
                        textColor: appState.customColors.textColor,
                        subtleLine: isColorDark(appState.customColors.bg) ? 'rgba(255, 255, 255, 0.22)' : 'rgba(0, 0, 0, 0.20)',
                        bg: appState.customColors.isTransparent ? 'transparent' : appState.customColors.bg
                    };
                    drawPosterArtCartouche(oCtx, mapX, mapY, mapW, mapH, marginX, marginY, cartoucheH, canvasW, canvasH, themeMock);
                } else if (layout === 'poster-fullbleed') {
                    const themeMock = {
                        textColor: appState.customColors.textColor,
                        subtleLine: isColorDark(appState.customColors.bg) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.20)',
                        bg: appState.customColors.isTransparent ? 'transparent' : appState.customColors.bg
                    };
                    drawPosterFullbleedCartouche(oCtx, mapX, mapY, mapW, mapH, cartoucheH, canvasW, canvasH, themeMock);
                } else if (layout === 'minimal') {
                    const themeMock = {
                        textColor: appState.customColors.textColor,
                        bg: appState.customColors.isTransparent ? 'transparent' : appState.customColors.bg
                    };
                    drawMinimalEditorialLayout(oCtx, marginX, marginY, canvasW, canvasH, themeMock);
                }
            } else {
                offscreenCanvas = renderStudioPreview(appState.resolutionKey);
            }

            if (type === 'pdf') {
                const { jsPDF } = window.jspdf;
                const isLandscape = canvasW > canvasH;
                const pdf = new jsPDF({
                    orientation: isLandscape ? 'landscape' : 'portrait',
                    unit: 'mm',
                    format: appState.formatKey === 'square' ? [210, 210] : (appState.formatKey === 'panorama' ? [420, 180] : 'a4')
                });
                const pdfW = pdf.internal.pageSize.getWidth();
                const pdfH = pdf.internal.pageSize.getHeight();
                const imgData = offscreenCanvas.toDataURL('image/jpeg', 0.96);
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
                pdf.save(`topolines-${cleanTitle}.pdf`);
            } else {
                // PNG Haute Définition
                offscreenCanvas.toBlob((blob) => {
                    if (blob) {
                        downloadBlob(blob, `topolines-${cleanTitle}.png`);
                    }
                }, 'image/png');
            }
        }

        progressBar.style.width = '100%';
        progressCount.innerText = "Téléchargé !";
        setTimeout(() => modal.classList.remove('show'), 500);

    } catch (err) {
        console.error("Erreur d'exportation studio :", err);
        alert(`Erreur d'exportation : ${err.message}`);
        modal.classList.remove('show');
    }
}

function setupStudioEventListeners() {
    // 1. Bouton Retour Carte
    const btnBack = document.getElementById('btn-studio-back');
    if (btnBack) btnBack.addEventListener('click', leaveStudioMode);

    // 2. Palettes prédéfinies en 1 clic
    const presetPalettes = {
        emerald: { bg: '#14382c', mapBg: '#14382c', isTransparent: false, isMapTransparent: false, majorColor: '#ffffff', minorColor: '#a7f3d0', citiesColor: '#ffffff', peaksColor: '#ffffff', textColor: '#ffffff' },
        dark: { bg: '#0f172a', mapBg: '#0f172a', isTransparent: false, isMapTransparent: false, majorColor: '#ffffff', minorColor: '#94a3b8', citiesColor: '#ffffff', peaksColor: '#ffffff', textColor: '#ffffff' },
        blueprint: { bg: '#0d223a', mapBg: '#0d223a', isTransparent: false, isMapTransparent: false, majorColor: '#e0f2fe', minorColor: '#38bdf8', citiesColor: '#e0f2fe', peaksColor: '#38bdf8', textColor: '#e0f2fe' },
        sepia: { bg: '#f5eedc', mapBg: '#f5eedc', isTransparent: false, isMapTransparent: false, majorColor: '#3e2723', minorColor: '#8d6e63', citiesColor: '#3e2723', peaksColor: '#3e2723', textColor: '#3e2723' },
        gold: { bg: '#18181b', mapBg: '#18181b', isTransparent: false, isMapTransparent: false, majorColor: '#fef08a', minorColor: '#ca8a04', citiesColor: '#fef08a', peaksColor: '#fef08a', textColor: '#fef08a' },
        'mono-light': { bg: '#ffffff', mapBg: '#ffffff', isTransparent: false, isMapTransparent: false, majorColor: '#09090b', minorColor: '#71717a', citiesColor: '#09090b', peaksColor: '#09090b', textColor: '#09090b' },
        transparent: { bg: 'transparent', mapBg: 'transparent', isTransparent: true, isMapTransparent: true, majorColor: '#ffffff', minorColor: '#ffffff', citiesColor: '#ffffff', peaksColor: '#ffffff', textColor: '#ffffff' }
    };

    document.querySelectorAll('.palette-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.palette-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const pal = presetPalettes[chip.dataset.palette];
            if (pal) {
                Object.assign(appState.customColors, pal);
                syncStudioInputsFromState();
                renderStudioPreview();
            }
        });
    });

    // Application d'une couleur au modèle d'état avec support des fonds liés
    function applyStudioColor(key, val) {
        appState.customColors[key] = val;
        if (key === 'bg') {
            appState.customColors.isTransparent = false;
            const cBg = document.getElementById('color-bg');
            const hBg = document.getElementById('hex-bg');
            if (cBg && cBg.value !== val) cBg.value = val;
            if (hBg && hBg.value !== val.toUpperCase()) hBg.value = val.toUpperCase();
            if (appState.customColors.linkBgs) {
                appState.customColors.mapBg = val;
                const cMap = document.getElementById('color-map-bg');
                const hMap = document.getElementById('hex-map-bg');
                if (cMap) cMap.value = val;
                if (hMap) hMap.value = val.toUpperCase();
            }
        } else if (key === 'mapBg') {
            appState.customColors.isMapTransparent = false;
            const cMap = document.getElementById('color-map-bg');
            const hMap = document.getElementById('hex-map-bg');
            if (cMap && cMap.value !== val) cMap.value = val;
            if (hMap && hMap.value !== val.toUpperCase()) hMap.value = val.toUpperCase();
            if (appState.customColors.linkBgs) {
                appState.customColors.bg = val;
                const cBg = document.getElementById('color-bg');
                const hBg = document.getElementById('hex-bg');
                if (cBg) cBg.value = val;
                if (hBg) hBg.value = val.toUpperCase();
            }
        }
        renderStudioPreview();
    }

    // 3. Sélecteurs de couleur ultra-réactifs sans saccade ni lag (validation sur change / OK)
    function bindColorInput(colorId, hexId, key) {
        const cIn = document.getElementById(colorId);
        const hIn = document.getElementById(hexId);
        if (!cIn || !hIn) return;

        // Pendant le glissement dans le nuancier : mise à jour instantanée du texte HEX (0ms lag, aucun recalcul lourd)
        cIn.addEventListener('input', (e) => {
            const val = e.target.value;
            hIn.value = val.toUpperCase();
        });

        // Dès que l'utilisateur valide / relâche / clique OK / ferme le picker : validation et rendu du canvas
        cIn.addEventListener('change', (e) => {
            const val = e.target.value;
            hIn.value = val.toUpperCase();
            applyStudioColor(key, val);
        });

        // Champ texte HEX : mise à jour visuelle du sélecteur sans lag
        hIn.addEventListener('input', (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                cIn.value = val;
            }
        });

        // Champ texte HEX : validation sur Entrée ou perte de focus
        hIn.addEventListener('change', (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                cIn.value = val;
                applyStudioColor(key, val);
            }
        });
    }

    bindColorInput('color-bg', 'hex-bg', 'bg');
    bindColorInput('color-map-bg', 'hex-map-bg', 'mapBg');
    bindColorInput('color-major', 'hex-major', 'majorColor');
    bindColorInput('color-minor', 'hex-minor', 'minorColor');
    bindColorInput('color-cities', 'hex-cities', 'citiesColor');
    bindColorInput('color-peaks', 'hex-peaks', 'peaksColor');
    bindColorInput('color-text', 'hex-text', 'textColor');

    // Bouton de liaison des fonds
    const btnToggleLink = document.getElementById('btn-toggle-link-bgs');
    if (btnToggleLink) {
        btnToggleLink.addEventListener('click', () => {
            appState.customColors.linkBgs = !appState.customColors.linkBgs;
            if (appState.customColors.linkBgs) {
                appState.customColors.mapBg = appState.customColors.bg;
                appState.customColors.isMapTransparent = appState.customColors.isTransparent;
            }
            syncStudioInputsFromState();
            renderStudioPreview();
        });
    }

    // Case à cocher fond affiche transparent
    const checkBgTrans = document.getElementById('check-bg-transparent');
    if (checkBgTrans) {
        checkBgTrans.addEventListener('change', (e) => {
            appState.customColors.isTransparent = e.target.checked;
            if (appState.customColors.linkBgs) {
                appState.customColors.isMapTransparent = e.target.checked;
                const checkMap = document.getElementById('check-map-bg-transparent');
                if (checkMap) checkMap.checked = e.target.checked;
            }
            renderStudioPreview();
        });
    }

    // Case à cocher fond carte transparent
    const checkMapTrans = document.getElementById('check-map-bg-transparent');
    if (checkMapTrans) {
        checkMapTrans.addEventListener('change', (e) => {
            appState.customColors.isMapTransparent = e.target.checked;
            if (appState.customColors.linkBgs) {
                appState.customColors.isTransparent = e.target.checked;
                const checkBg = document.getElementById('check-bg-transparent');
                if (checkBg) checkBg.checked = e.target.checked;
            }
            renderStudioPreview();
        });
    }

    // Épaisseurs de trait
    const strokeMaj = document.getElementById('input-stroke-major');
    const strokeMin = document.getElementById('input-stroke-minor');
    if (strokeMaj) {
        strokeMaj.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            appState.customColors.majorWidth = v;
            document.getElementById('label-stroke-major').innerText = `${v}px`;
            renderStudioPreview();
        });
    }
    if (strokeMin) {
        strokeMin.addEventListener('input', (e) => {
            const v = parseFloat(e.target.value);
            appState.customColors.minorWidth = v;
            document.getElementById('label-stroke-minor').innerText = `${v}px`;
            renderStudioPreview();
        });
    }

    // Typographie & textes studio
    const studioFont = document.getElementById('studio-select-font');
    if (studioFont) {
        studioFont.addEventListener('change', (e) => {
            appState.fontFamily = e.target.value;
            const mapFont = document.getElementById('select-font');
            if (mapFont) mapFont.value = e.target.value;
            renderStudioPreview();
        });
    }

    const studioTitle = document.getElementById('studio-input-title');
    if (studioTitle) {
        studioTitle.addEventListener('input', (e) => {
            appState.titleText = e.target.value;
            const mapTitle = document.getElementById('input-title');
            if (mapTitle) mapTitle.value = e.target.value;
            renderStudioPreview();
        });
    }

    const studioSub = document.getElementById('studio-input-subtitle');
    if (studioSub) {
        studioSub.addEventListener('input', (e) => {
            appState.subtitleText = e.target.value;
            const mapSub = document.getElementById('input-subtitle');
            if (mapSub) mapSub.value = e.target.value;
            renderStudioPreview();
        });
    }

    const btnStudioGps = document.getElementById('studio-btn-gps-auto');
    if (btnStudioGps) {
        btnStudioGps.addEventListener('click', () => {
            if (appState.currentCenter) {
                const latStr = `${appState.currentCenter.lat.toFixed(3)}° N`;
                const lngStr = `${appState.currentCenter.lng.toFixed(3)}° E`;
                const newSub = `${latStr}, ${lngStr} — FRANCE`;
                if (studioSub) studioSub.value = newSub;
                appState.subtitleText = newSub;
                renderStudioPreview();
            }
        });
    }

    // Disposition studio (poster / minimal / pure)
    document.querySelectorAll('[data-studio-layout]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-studio-layout]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.layoutMode = btn.dataset.studioLayout;
            renderStudioPreview();
        });
    });

    // Calques studio
    const mapToggle = (id, key) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                appState[key] = e.target.checked;
                renderStudioPreview();
            });
        }
    };
    mapToggle('studio-toggle-major', 'showMajorContours');
    mapToggle('studio-toggle-minor', 'showContours');
    mapToggle('studio-toggle-contour-labels', 'showContourLabels');
    mapToggle('studio-toggle-peaks', 'showPeaks');
    mapToggle('studio-toggle-cities', 'showLabels');
    mapToggle('studio-toggle-hillshade', 'showHillshade');
    mapToggle('studio-toggle-scale', 'showScaleNorth');

    // Sélecteur de fréquence des courbes maîtresses dans le Studio
    const studioFreqSelect = document.getElementById('studio-select-major-frequency');
    const studioFreqBadge = document.getElementById('studio-major-freq-badge');
    if (studioFreqSelect) {
        studioFreqSelect.addEventListener('change', (e) => {
            const val = parseInt(e.target.value, 10);
            appState.majorMultiplier = isNaN(val) ? 4 : val;
            if (studioFreqBadge) {
                studioFreqBadge.innerText = (val === 0 || val === '0') ? "Fines" : (val === 1 || val === '1' ? "Gras" : `×${val}`);
            }
            const mapFreq = document.getElementById('select-major-frequency');
            if (mapFreq) mapFreq.value = String(appState.majorMultiplier);
            const mapBadge = document.getElementById('major-frequency-label');
            if (mapBadge) {
                mapBadge.innerText = (val === 0 || val === '0') ? "Toutes fines" : (val === 1 || val === '1' ? "Toutes" : `×${val}`);
            }
            renderStudioPreview();
        });
    }

    // Résolution studio
    document.querySelectorAll('[data-studio-res]').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('[data-studio-res]').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            appState.resolutionKey = card.dataset.studioRes;
        });
    });

    // Zoom controls
    const btnFit = document.getElementById('btn-zoom-fit');
    const btn100 = document.getElementById('btn-zoom-100');
    const btnIn = document.getElementById('btn-zoom-in');
    const btnOut = document.getElementById('btn-zoom-out');

    if (btnFit) {
        btnFit.addEventListener('click', () => {
            appState.studioZoom = 'fit';
            btnFit.classList.add('active');
            btn100.classList.remove('active');
            adjustStudioCanvasFit();
        });
    }
    if (btn100) {
        btn100.addEventListener('click', () => {
            appState.studioZoom = '100%';
            btn100.classList.add('active');
            btnFit.classList.remove('active');
            adjustStudioCanvasFit();
        });
    }
    if (btnIn) {
        btnIn.addEventListener('click', () => {
            let cur = typeof appState.studioZoom === 'number' ? appState.studioZoom : 0.5;
            appState.studioZoom = Math.min(2.5, cur * 1.25);
            btnFit.classList.remove('active');
            btn100.classList.remove('active');
            adjustStudioCanvasFit();
        });
    }
    if (btnOut) {
        btnOut.addEventListener('click', () => {
            let cur = typeof appState.studioZoom === 'number' ? appState.studioZoom : 0.5;
            appState.studioZoom = Math.max(0.15, cur * 0.8);
            btnFit.classList.remove('active');
            btn100.classList.remove('active');
            adjustStudioCanvasFit();
        });
    }

    // Export buttons
    const bindExport = (id, type) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => exportFromStudio(type));
    };

    bindExport('studio-export-png-btn', 'png');
    bindExport('btn-final-export-png', 'png');
    bindExport('studio-export-svg-btn', 'svg');
    bindExport('btn-final-export-svg', 'svg');
    bindExport('studio-export-pdf-btn', 'pdf');
    bindExport('btn-final-export-pdf', 'pdf');

    window.addEventListener('resize', () => {
        if (document.getElementById('view-studio').style.display !== 'none') {
            adjustStudioCanvasFit();
        }
    });
}

/**
 * ------------------------------------------------------------------------------
 * 15. INITIALISATION AU CHARGEMENT DE LA PAGE
 * ------------------------------------------------------------------------------
 */
window.addEventListener('DOMContentLoaded', () => {
    initUiTheme();
    initMap();
    setupEventListeners();
    setupStudioEventListeners();
});
