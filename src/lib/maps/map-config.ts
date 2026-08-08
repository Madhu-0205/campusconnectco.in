// src/lib/maps/map-config.ts

/**
 * Global map configuration for CampusConnect
 */
export const MAP_CONFIG = {
  // Public OpenStreetMap tile provider (CartoDB Voyager)
  // Clean, premium, light-themed map style suitable for dashboard context.
  STYLE_URL_LIGHT: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  
  // Public OpenStreetMap tile provider (CartoDB Dark Matter)
  STYLE_URL_DARK: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",

  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',

  // Default coordinates (Center of India as a fallback)
  DEFAULT_CENTER: {
    lat: 20.5937,
    lng: 78.9629,
  },
  
  DEFAULT_ZOOM: 4,
  CITY_ZOOM: 11,
  STREET_ZOOM: 14,
};
