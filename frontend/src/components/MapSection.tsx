import React, { useState, useRef, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import { useTreeData } from "@/contexts/TreeDataContext";
import Rainbow from "rainbowvis.js";
import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { X, Loader } from "lucide-react";
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

const MapSection: React.FC<MapType> = ({ mapType }) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const selectedMap = mapOptions.find((option) => option.name === mapType) || mapOptions[0];
    const { treeCoordinates, clearTreeSelections } = useTreeData();
    const [selectedTree, setSelectedTree] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [markersLoading, setMarkersLoading] = useState(false);
    const [error, setError] = useState("");
    const [markerIcons, setMarkerIcons] = useState<{ [key: number]: L.Icon }>({});
    const [treeSpeciesMap, setTreeSpeciesMap] = useState<Map<string, number>>(new Map());
    const [showMarkers, setShowMarkers] = useState(false);
    const cancelFetchRef = useRef(false);

    // Define the default icon once
    const defaultIcon = useMemo(() => L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    // Create a colored circle SVG icon for different tree species
    const createColoredIcon = (color: string) => {
        return L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #FFF; box-shadow: 0 0 3px rgba(0,0,0,0.5);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    };

    // Handle cancel button click
    const handleCancelIconConversion = () => {
        cancelFetchRef.current = true;
        setMarkersLoading(false);
        setMarkerIcons({});
        setTreeSpeciesMap(new Map());
        if (typeof clearTreeSelections === 'function') {
            clearTreeSelections();
        }
    };

    useEffect(() => {
        const fetchTreeSpecies = async () => {
            if (treeCoordinates.length === 0) return;

            cancelFetchRef.current = false;
            setMarkersLoading(true);
            setShowMarkers(false);
            setMarkerIcons({});

            const speciesMap = new Map<string, number>();
            let speciesCounter = 0;
            const newIcons: { [key: number]: L.Icon } = {};

            const fetchPromises = treeCoordinates.map((tree, index) => {
                const treeGeoID = tree.id; // Adjust index for API

                return fetch(`${BACKEND_URL}/species/details/${treeGeoID}`)
                    .then(response => response.json())
                    .then(data => {
                        if (cancelFetchRef.current) return;

                        const speciesKey = data.scientificname || data.treename || 'unknown';

                        if (!speciesMap.has(speciesKey)) {
                            speciesMap.set(speciesKey, speciesCounter++);
                        }

                        const colorIndex = speciesMap.get(speciesKey)!;
                        const color = campusColors[colorIndex];
                        console.log("color to :", color)// fix applied here

                        newIcons[index] = createColoredIcon(color);
                    })
                    .catch(() => {
                        if (cancelFetchRef.current) return;
                        newIcons[index] = defaultIcon;
                    });
            });

            await Promise.allSettled(fetchPromises);

            if (cancelFetchRef.current) {
                setMarkersLoading(false);
                return;
            }

            setMarkerIcons(newIcons);
            setTreeSpeciesMap(speciesMap);
            setMarkersLoading(false);
            setShowMarkers(true);
        };

        fetchTreeSpecies();

        return () => {
            cancelFetchRef.current = true;
        };
    }, [treeCoordinates, defaultIcon]);

    const fetchTreeDetails = async (treeGeoID: number) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch(`${BACKEND_URL}/species/details/${treeGeoID}`);
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

    // Function to get correct position for tree markers
    const getCorrectPosition = (tree: any): [number, number] => {
        // Check if the coordinates are in the correct format
        // Latitude should be between -90 and 90, Longitude between -180 and 180
        const lat = parseFloat(tree.latitude);
        const lng = parseFloat(tree.longitude);

        // If coordinates are swapped (which appears to be the case)
        if (lat > 90 || lat < -90 || lng > 180 || lng < -180) {
            // Swap lat and lng
            return [parseFloat(tree.longitude), parseFloat(tree.latitude)];
        }

        return [lat, lng];
    };

    return (
        <div className="h-full w-full relative rounded-lg">
            {/* Map Container */}
            <MapContainer center={[22.54, 72.96]} zoom={13} className="h-full w-full rounded-lg z-0">
                <TileLayer url={selectedMap.url} />
                <GeoTIFFLayer />

                {/* Show markers only after all have been processed */}
                {showMarkers && treeCoordinates.map((tree, index) => {
                    // Get correct position with swapped coordinates if needed
                    const position = getCorrectPosition(tree);

                    return (
                        <Marker
                            key={index}
                            position={position}
                            icon={markerIcons[index] || defaultIcon}
                            eventHandlers={{
                                click: () => fetchTreeDetails(tree.id),
                                mouseover: (e: L.LeafletMouseEvent) => {
                                    e.target.openPopup();
                                },
                                mouseout: (e: L.LeafletMouseEvent) => {
                                    e.target.closePopup();
                                }
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>Tree Name:</strong> {tree.treename}<br />
                                    <strong>Coordinates:</strong> {position[0].toFixed(5)}, {position[1].toFixed(5)}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Loading Overlay */}
            {markersLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg z-10">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <Loader className="h-12 w-12 mx-auto text-green-500 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-800">Loading Tree Markers...</p>
                        <p className="text-sm text-gray-600 mt-2">Converting markers to display species information</p>
                    </div>
                </div>
            )}

            {/* Cancel Button for Marker Loading */}
            {markersLoading && (
                <Button
                    onClick={handleCancelIconConversion}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 z-20 flex items-center gap-2"
                >
                    <X size={18} />
                    <span>Cancel</span>
                </Button>
            )}

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
                                        <p className="font-medium">
                                            {parseFloat(selectedTree.longitude).toFixed(5)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Longitude</p>
                                        <p className="font-medium">
                                            {parseFloat(selectedTree.latitude).toFixed(5)}
                                        </p>
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