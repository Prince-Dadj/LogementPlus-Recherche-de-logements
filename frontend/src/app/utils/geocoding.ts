/**
 * Référentiel précis de géolocalisation pour le Sénégal
 * Coordonnées vérifiées des villes, quartiers universitaires et zones résidentielles
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  zoom?: number;
}

export const SENEGAL_LOCATIONS: { [key: string]: GeoLocation } = {
  // --- SAINT-LOUIS & CAMPUS UNIVERSITAIRES ---
  'saint-louis': { lat: 16.0326, lng: -16.4818, zoom: 13 },
  'saint-louis/universite': { lat: 16.0592, lng: -16.4258, zoom: 15 },
  'saint-louis/ugb': { lat: 16.0592, lng: -16.4258, zoom: 15 },
  'saint-louis/sanar': { lat: 16.0610, lng: -16.4230, zoom: 15 },
  'saint-louis/sanar wolof': { lat: 16.0615, lng: -16.4225, zoom: 16 },
  'saint-louis/sanar peulh': { lat: 16.0560, lng: -16.4310, zoom: 16 },
  'saint-louis/ngallele': { lat: 16.0460, lng: -16.4520, zoom: 15 },
  'saint-louis/sor': { lat: 16.0245, lng: -16.4950, zoom: 15 },
  'saint-louis/ile': { lat: 16.0240, lng: -16.5040, zoom: 16 },
  'saint-louis/ndar toute': { lat: 16.0290, lng: -16.5090, zoom: 15 },
  'saint-louis/guet ndar': { lat: 16.0180, lng: -16.5080, zoom: 15 },
  'saint-louis/santhiaba': { lat: 16.0210, lng: -16.4890, zoom: 15 },
  'saint-louis/khor': { lat: 16.0090, lng: -16.4820, zoom: 15 },
  'saint-louis/bango': { lat: 16.0680, lng: -16.4630, zoom: 15 },
  'saint-louis/hydrobase': { lat: 15.9870, lng: -16.5180, zoom: 14 },
  'saint-louis/leona': { lat: 16.0170, lng: -16.4910, zoom: 15 },
  'saint-louis/balacoss': { lat: 16.0260, lng: -16.4910, zoom: 15 },

  // --- DAKAR ---
  'dakar': { lat: 14.7167, lng: -17.4677, zoom: 13 },
  'dakar/almadies': { lat: 14.7432, lng: -17.5190, zoom: 15 },
  'dakar/ngor': { lat: 14.7501, lng: -17.5084, zoom: 15 },
  'dakar/virage': { lat: 14.7510, lng: -17.5020, zoom: 15 },
  'dakar/mamelles': { lat: 14.7290, lng: -17.5010, zoom: 15 },
  'dakar/ouakam': { lat: 14.7230, lng: -17.4910, zoom: 15 },
  'dakar/fann': { lat: 14.6892, lng: -17.4725, zoom: 15 },
  'dakar/fann residence': { lat: 14.6892, lng: -17.4725, zoom: 15 },
  'dakar/point e': { lat: 14.6950, lng: -17.4600, zoom: 15 },
  'dakar/plateau': { lat: 14.6710, lng: -17.4320, zoom: 15 },
  'dakar/mermoz': { lat: 14.7080, lng: -17.4760, zoom: 15 },
  'dakar/sacre-coeur': { lat: 14.7180, lng: -17.4630, zoom: 15 },
  'dakar/liberte 6': { lat: 14.7260, lng: -17.4610, zoom: 15 },
  'dakar/yoff': { lat: 14.7610, lng: -17.4680, zoom: 15 },
  'dakar/maristes': { lat: 14.7330, lng: -17.4340, zoom: 15 },

  // --- SALY & PETITE CÔTE ---
  'saly': { lat: 14.4420, lng: -16.9850, zoom: 14 },
  'saly/saly portudal': { lat: 14.4420, lng: -16.9850, zoom: 14 },
  'saly/somone': { lat: 14.4880, lng: -17.0680, zoom: 14 },
  'mbour': { lat: 14.4220, lng: -16.9630, zoom: 13 },
  'thies': { lat: 14.7910, lng: -16.9260, zoom: 13 },
  'ziguinchor': { lat: 12.5580, lng: -16.2730, zoom: 13 }
};

/**
 * Résout les coordonnées géographiques précises pour une ville et un quartier
 */
export function geocodeSenegal(ville: string = '', quartier: string = ''): GeoLocation {
  const v = (ville || '').toLowerCase().trim();
  const q = (quartier || '').toLowerCase().trim();

  // 1. Recherche par couple ville/quartier
  const keyCombo = `${v}/${q}`;
  if (SENEGAL_LOCATIONS[keyCombo]) {
    return SENEGAL_LOCATIONS[keyCombo];
  }

  // 2. Recherche par quartier seul
  for (const [key, loc] of Object.entries(SENEGAL_LOCATIONS)) {
    if (key.includes('/') && q && key.split('/')[1].includes(q)) {
      return loc;
    }
  }

  // 3. Recherche par ville seule
  if (SENEGAL_LOCATIONS[v]) {
    return SENEGAL_LOCATIONS[v];
  }

  // 4. Détections de mots clés dans quartier ou ville
  if (q.includes('sanar') || q.includes('ugb') || q.includes('universit') || v.includes('louis')) {
    if (q.includes('wolof')) return SENEGAL_LOCATIONS['saint-louis/sanar wolof'];
    if (q.includes('ngallele') || q.includes('ngallèle')) return SENEGAL_LOCATIONS['saint-louis/ngallele'];
    if (q.includes('sor')) return SENEGAL_LOCATIONS['saint-louis/sor'];
    return SENEGAL_LOCATIONS['saint-louis/universite'];
  }

  if (v.includes('dakar') || q.includes('almadies') || q.includes('ngor') || q.includes('plateau')) {
    if (q.includes('almadies')) return SENEGAL_LOCATIONS['dakar/almadies'];
    if (q.includes('ngor')) return SENEGAL_LOCATIONS['dakar/ngor'];
    if (q.includes('fann')) return SENEGAL_LOCATIONS['dakar/fann'];
    if (q.includes('plateau')) return SENEGAL_LOCATIONS['dakar/plateau'];
    if (q.includes('point e')) return SENEGAL_LOCATIONS['dakar/point e'];
    return SENEGAL_LOCATIONS['dakar'];
  }

  if (v.includes('saly') || q.includes('saly')) {
    return SENEGAL_LOCATIONS['saly'];
  }

  // Par défaut : Saint-Louis (ville mise à l'honneur)
  return SENEGAL_LOCATIONS['saint-louis'];
}
