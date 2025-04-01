export interface Botany {
  id: number;
  name: string;
}
export interface Species {
  id: number;
  scientificname: string;
}
export const mapOptions = [
  {
    name: "satellite",
    url: "https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}",
  },
  { name: "hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
  {
    name: "terrain",
    url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
  },
];

export interface MapType {
  mapType: "satellite" | "hybrid" | "terrain";
}
