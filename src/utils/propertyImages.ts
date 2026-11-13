import heroImg from '../assets/images/hero_bengaluru_flat_1794570046544.jpg';
import studioImg from '../assets/images/flat_indiranagar_studio_1794570046481.jpg';
import colivingImg from '../assets/images/flat_koramangala_coliving_1794570047864.jpg';
import hsrPgImg from '../assets/images/flat_hsr_pg_1794570048143.jpg';
import whitefieldImg from '../assets/images/flat_whitefield_2bhk_1794570048532.jpg';
import type { PropertyImageKey } from '../types/housing.ts';

export const PROPERTY_IMAGES: Record<PropertyImageKey, string> = {
  hero: heroImg,
  studio: studioImg,
  coliving: colivingImg,
  hsr_pg: hsrPgImg,
  whitefield: whitefieldImg,
};
