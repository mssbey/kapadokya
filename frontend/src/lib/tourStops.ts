/**
 * Real WGS84 coordinates for the stops shown on the homepage map.
 *
 * Language-independent on purpose: the visible name/description come from
 * `map.points` / `map.descriptions` in the dictionaries, matched by array
 * order, exactly like the old placeholder map did.
 */

export interface TourStop {
  id: number;
  lat: number;
  lng: number;
  /**
   * Whether the stop belongs to the Göreme loop that the dashed route line
   * connects. Derinkuyu sits ~30 km south on a different day tour, so it gets
   * a pin but no connector — drawing one would imply a drive that isn't real.
   */
  connect: boolean;
}

export const TOUR_STOPS: TourStop[] = [
  { id: 1, lat: 38.6433, lng: 34.8447, connect: true }, // Göreme Open Air Museum
  { id: 2, lat: 38.6478, lng: 34.8221, connect: true }, // Balloon launch fields
  { id: 3, lat: 38.6303, lng: 34.8055, connect: true }, // Uçhisar Castle
  { id: 4, lat: 38.6591, lng: 34.818, connect: true }, // Love Valley
  { id: 5, lat: 38.3735, lng: 34.7345, connect: false }, // Derinkuyu Underground City
  { id: 6, lat: 38.6648, lng: 34.8434, connect: true }, // Paşabağ (Monks Valley)
];

/** Default framing: the Göreme cluster, tight enough that pins stay readable. */
export const DEFAULT_VIEW = {
  center: [38.6478, 34.8248] as [number, number],
  zoom: 13,
};

export function directionsUrl(stop: TourStop): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${stop.lat},${stop.lng}`;
}
