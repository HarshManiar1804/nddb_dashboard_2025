import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import Rainbow from "rainbowvis.js";
import "leaflet/dist/leaflet.css";

const mapOptions = [
    { name: "satellite", url: "https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}" },
    { name: "hybrid", url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" },
    { name: "terrain", url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" },
];

const GeoTIFFLayer: React.FC = () => {
    const map = useMap();
    const layerRef = useRef<L.Layer | null>(null);
    const url_to_geotiff_file = "/FCC_NDDB.tif";

    useEffect(() => {
        fetch(url_to_geotiff_file)
            .then((res) => res.arrayBuffer())
            .then(async (arrayBuffer) => {
                const georaster = await parseGeoraster(arrayBuffer);
                const min = Math.round(georaster.mins[0]);
                const max = Math.round(georaster.maxs[0]);

                const rainbow = new Rainbow();
                rainbow.setNumberRange(min < 0 ? 0 : 0, max);
                rainbow.setSpectrum("green", "yellow", "orange", "brown", "white");

                const layer = new GeoRasterLayer({
                    georaster,
                    opacity: 0.6,
                    pixelValuesToColorFn: (vals) =>
                        vals[0] <= 0 ? null : "#" + rainbow.colourAt(Math.round(vals[0])),
                    resolution: 512,
                });

                if (layerRef.current) {
                    map.removeLayer(layerRef.current);
                }

                layerRef.current = layer;
                layer.addTo(map);
                layer.bringToFront();
                map.fitBounds(layer.getBounds());
            });

        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map]);

    return null;
};

const MapSection: React.FC = () => {
    const [mapType, setMapType] = useState("satellite");
    const selectedMap = mapOptions.find((option) => option.name === mapType);

    return (
        <div className="h-full w-full relative rounded-lg">
            <MapContainer center={[22.56, 72.95]} zoom={13} className="h-full w-full rounded-lg z-0">
                {selectedMap && <TileLayer key={selectedMap.url} url={selectedMap.url} />}
                <GeoTIFFLayer />
                {/* <Marker position={[22.54143, 72.96441]}>
                    <Popup>
                        <strong>Name:</strong> Kigelia pinnata<br />
                        <strong>Coordinates:</strong> 22.54143, 72.96441<br />
                        <strong>Color:</strong> Red
                    </Popup>
                </Marker> */}
            </MapContainer>

            <div className="absolute top-2 right-2 bg-white p-2 rounded-lg shadow-md flex space-x-2">
                {mapOptions.map(({ name }) => (
                    <label key={name} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="mapType"
                            value={name}
                            checked={mapType === name}
                            onChange={(e) => setMapType(e.target.value)}
                        />
                        <span className="capitalize">{name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default MapSection;