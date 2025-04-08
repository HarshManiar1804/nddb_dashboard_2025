import { MapType } from "@/utils/utils";
import { MapPlus } from "lucide-react";
import React from "react";

const mapOptions = ["satellite", "hybrid", "terrain"];

interface MapSelectionProps {
    mapType: MapType;
    setMapType: (type: MapType) => void;
}

const MapSelection: React.FC<MapSelectionProps> = ({ mapType, setMapType }) => {
    return (
        <div className="p-4 bg-white shadow-lg rounded-xl max-w-md mx-auto border border-gray-100">
            <h2 className="text-xl font-serif mb-4 text-gray-800 flex items-center">
                <MapPlus className="w-5 h-5 mr-2 text-[#00958F]" />
                <span className="text-[#00958F]">Select Map Theme</span>
            </h2>
            <div className="space-y-2">
                {mapOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-2">
                        <input
                            type="radio"
                            name="mapType"
                            value={option}
                            checked={mapType === option as unknown as MapType}
                            onChange={() => setMapType(option)}
                            className="cursor-pointer"
                        />
                        <span className="capitalize">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default MapSelection;
