import React, { useState, useRef, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { useTreeData } from "@/contexts/TreeDataContext";
import Rainbow from "rainbowvis.js";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { campusColors, MapType } from "@/utils/utils";
import L from "leaflet";

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
                    pixelValuesToColorFn: (vals: any) =>
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

// Create a lazy loaded marker component
const LazyMarker: React.FC<{
    position: [number, number];
    icon: L.Icon;
    eventHandlers: any;
    popupContent: string;
}> = ({ position, icon, eventHandlers, popupContent }) => {
    return (
        <Marker position={position} icon={icon} eventHandlers={eventHandlers}>
            <Popup>
                <div dangerouslySetInnerHTML={{ __html: popupContent }} />
            </Popup>
        </Marker>
    );
};

const MapSection: React.FC<MapType> = ({ mapType }) => {
    const selectedMap = mapOptions.find((option) => option.name === mapType) || mapOptions[0];
    const { treeCoordinates } = useTreeData();
    const [selectedTree, setSelectedTree] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [markerIcons, setMarkerIcons] = useState<{ [key: number]: L.Icon }>({});

    // Define the default icon once
    const defaultIcon = useMemo(() => L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    // Fixed function to create custom icon URL with proper color formatting for tree markers
    const createCustomIconUrl = (colorArray: string[], index: number) => {
        // Create colored circle SVG
        const colorIndex = index % colorArray.length;
        const color = colorArray[colorIndex].replace('#', '');

        // Instead of using Icons8 with color parameter, create a simple colored circle marker
        // This ensures we don't rely on external API color parameter support
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#${color}" stroke="#000" stroke-width="1"/>
            </svg>
        `;

        // Convert SVG to data URL
        const encodedSVG = encodeURIComponent(svg);
        return `data:image/svg+xml;charset=UTF-8,${encodedSVG}`;
    };

    // Create an icon object from URL
    const createLeafletIcon = (iconUrl: string) => {
        return L.icon({
            iconUrl,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });
    };

    // Fetch all tree marker icons when component mounts
    useEffect(() => {
        const fetchAllTreeIcons = async () => {
            // Use a batch processing approach to avoid overwhelming the server
            const batchSize = 10;
            const totalTrees = treeCoordinates.length;
            const batches = Math.ceil(totalTrees / batchSize);

            const icons: { [key: number]: L.Icon } = {};
            const markerTypes = new Map(); // To track unique marker types
            let typeCounter = 0; // Counter for unique marker types

            for (let i = 0; i < batches; i++) {
                const start = i * batchSize;
                const end = Math.min(start + batchSize, totalTrees);

                // Process this batch
                const batchPromises = [];

                for (let j = start; j < end; j++) {
                    const treeGeoID = j + 1; // Adjust index for API
                    batchPromises.push(
                        fetch(`http://localhost:3000/species/details/${treeGeoID}`)
                            .then(response => response.json())
                            .then(data => {
                                // Create a type identifier (could be species, genus, or any other property)
                                const markerType = data.scientificname || data.treename || 'unknown';

                                // If this type hasn't been seen before, assign it a new color index
                                if (!markerTypes.has(markerType)) {
                                    markerTypes.set(markerType, typeCounter++);
                                }

                                // Get the color index for this marker type
                                const colorIndex = markerTypes.get(markerType);

                                // Create the icon URL with the appropriate color from the array
                                const iconUrl = createCustomIconUrl(campusColors, colorIndex);
                                icons[j] = createLeafletIcon(iconUrl);
                            })
                            .catch(() => {
                                icons[j] = defaultIcon;
                            })
                    );
                }

                // Wait for this batch to complete
                await Promise.allSettled(batchPromises);

                // Update icons state incrementally to show progress
                setMarkerIcons(prev => ({ ...prev, ...icons }));
            }
        };

        if (treeCoordinates.length > 0) {
            fetchAllTreeIcons();
        }
    }, [treeCoordinates, defaultIcon]);

    const fetchTreeDetails = async (treeGeoID: number) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`http://localhost:3000/species/details/${treeGeoID + 1}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch tree details");
            }
            setSelectedTree(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full relative rounded-lg">
            {/* Map Container */}
            <MapContainer center={[22.56, 72.95]} zoom={13} className="h-full w-full rounded-lg z-0">
                <TileLayer url={selectedMap.url} />
                <GeoTIFFLayer />

                {/* Display markers */}
                {treeCoordinates.map((tree, index) => (
                    <LazyMarker
                        key={index}
                        position={[tree.latitude, tree.longitude]}
                        icon={markerIcons[index] || defaultIcon}
                        eventHandlers={{
                            click: () => fetchTreeDetails(index + 1),
                            mouseover: (e: L.LeafletMouseEvent) => {
                                e.target.openPopup();
                            },
                            mouseout: (e: L.LeafletMouseEvent) => {
                                e.target.closePopup();
                            }
                        }}
                        popupContent={`<strong>Tree Name :</strong> ${tree.treename}<br/><strong>Coordinates :</strong> ${tree.latitude}, ${tree.longitude}`}
                    />
                ))}
            </MapContainer>

            {/* Sidebar for Tree Details */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transition-transform transform ${selectedTree ? "translate-x-0" : "translate-x-full"
                    } duration-300 ease-in-out overflow-y-auto font-sans`}
            >
                <div className="p-6 space-y-6">
                    {/* Header with close button */}
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <h2 className="text-xl font-semibold text-gray-800 font-serif">Tree Details</h2>
                        <button
                            className="text-gray-500 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer"
                            onClick={() => setSelectedTree(null)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg text-red-600 text-center">
                            <p>{error}</p>
                        </div>
                    ) : selectedTree ? (
                        <div className="space-y-6">
                            {/* Image with rounded corners and subtle shadow */}
                            <div className="rounded-lg overflow-hidden shadow-md">
                                <img
                                    src={selectedTree.treeimageurl}
                                    alt={selectedTree.treename || "Tree"}
                                    className="w-full h-48 object-cover"
                                />
                            </div>

                            {/* Tree name section */}
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h3 className="text-lg font-medium text-green-800 font-serif mb-1">{selectedTree.treename}</h3>
                                <p className="text-sm text-green-700 italic">{selectedTree.scientificname}</p>
                                {selectedTree.hindiname && (
                                    <p className="text-sm text-green-700 mt-1">हिंदी: {selectedTree.hindiname}</p>
                                )}
                            </div>

                            {/* Details section */}
                            <div className="space-y-3">
                                <h4 className="text-sm uppercase tracking-wider text-gray-500 font-medium">Details</h4>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Latitude</p>
                                        <p className="font-medium">{selectedTree.latitude}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Longitude</p>
                                        <p className="font-medium">{selectedTree.longitude}</p>
                                    </div>
                                    {selectedTree.iucnstatus && (
                                        <div className="col-span-2">
                                            <p className="text-gray-500">IUCN Status</p>
                                            <p className={`font-medium ${selectedTree.iucnstatus.toLowerCase().includes('endangered') ? 'text-red-600' :
                                                selectedTree.iucnstatus.toLowerCase().includes('vulnerable') ? 'text-orange-600' :
                                                    'text-green-600'
                                                }`}>
                                                {selectedTree.iucnstatus}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Origin and distribution with more space */}
                                {(selectedTree.centreoforigin || selectedTree.geographicaldistribution) && (
                                    <div className="mt-4 space-y-3 pt-3 border-t border-gray-100">
                                        {selectedTree.centreoforigin && (
                                            <div>
                                                <h5 className="text-gray-500 mb-1">Centre of Origin</h5>
                                                <p className="text-sm">{selectedTree.centreoforigin}</p>
                                            </div>
                                        )}
                                        {selectedTree.geographicaldistribution && (
                                            <div>
                                                <h5 className="text-gray-500 mb-1">Geographical Distribution</h5>
                                                <p className="text-sm">{selectedTree.geographicaldistribution}</p>
                                            </div>
                                        )}
                                        {selectedTree.link && (
                                            <Button asChild className="bg-green-600 hover:bg-green-800 cursor-pointer flex items-end">
                                                <a href={selectedTree.link} target="_blank" rel="noopener noreferrer">
                                                    More Info
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500 text-center">
                            <div>
                                <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="mt-2">Select a tree on the map to view its details</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapSection;