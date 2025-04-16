declare module "georaster-layer-for-leaflet" {
  import L from "leaflet";

  interface GeoRasterLayerOptions {
    opacity?: number;
    resolution?: number;
    pixelValuesToColorFn?: (values: any[]) => string;
    bounds?: L.LatLngBounds;
    // Add other options as needed
  }

  class GeoRasterLayer extends L.Layer {
    constructor(options: GeoRasterLayerOptions);
    // Add methods as needed
  }

  export default GeoRasterLayer;
}
