import React from "react";
import { useTreeData } from "@/contexts/TreeDataContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react"; // Loader icon

const TreeDataViewer: React.FC = () => {
    const {
        botanyList, selectedBotany, setSelectedBotany,
        speciesList, selectedSpecies, setSelectedSpecies,
        loading
    } = useTreeData();

    // Toggle botany selection
    const toggleBotanySelection = (id: string) => {
        setSelectedBotany((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Select all botany
    const selectAllBotany = () => {
        setSelectedBotany(botanyList.map((botany) => botany.id.toString()));
    };

    // Clear all botany selection
    const clearAllBotany = () => {
        setSelectedBotany([]);
    };

    // Toggle species selection
    const toggleSpeciesSelection = (id: string) => {
        setSelectedSpecies((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    // Select all species
    const selectAllSpecies = () => {
        setSelectedSpecies(speciesList.map((species) => species.id.toString()));
    };

    // Clear all species selection
    const clearAllSpecies = () => {
        setSelectedSpecies([]);
    };

    return (
        <div className="p-2 bg-white shadow-md rounded-lg h-auto">
            <h2 className="text-lg font-semibold mb-2">Tree Data Viewer</h2>
            <div className="flex gap-2">
                {/* Botany Dropdown */}
                <div className="w-1/2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left cursor-pointer">
                                {selectedBotany.length > 0
                                    ? `${selectedBotany.length} Botany selected`
                                    : "Select Botany"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <ScrollArea className="h-40 overflow-auto border rounded p-2">
                                {botanyList.map((botany) => (
                                    <div key={botany.id} className="flex items-center gap-2">
                                        <Checkbox
                                            checked={selectedBotany.includes(botany.id.toString())}
                                            onCheckedChange={() => toggleBotanySelection(botany.id.toString())}
                                        />
                                        <span>{botany.name}</span>
                                    </div>
                                ))}
                            </ScrollArea>
                            <div className="flex justify-between mt-2">
                                <Button onClick={selectAllBotany} size="sm" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600">
                                    Select All
                                </Button>
                                <Button onClick={clearAllBotany} size="sm" className="bg-red-500 text-white cursor-pointer hover:bg-red-600">
                                    Clear All
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Species Dropdown */}
                <div className="w-1/2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full text-left cursor-pointer">
                                {selectedSpecies.length > 0
                                    ? `${selectedSpecies.length} Species selected`
                                    : "Select Species"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64">
                            <ScrollArea className="h-40 overflow-auto border rounded p-2">
                                {loading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <Loader2 className="animate-spin w-5 h-5 text-gray-500" />
                                    </div>
                                ) : speciesList.length === 0 ? (
                                    <div className="flex justify-center items-center h-full">
                                        <p>Select Botany First</p>
                                    </div>
                                ) : (
                                    speciesList.map((species) => (
                                        <div key={species.id} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={selectedSpecies.includes(species.id.toString())}
                                                onCheckedChange={() => toggleSpeciesSelection(species.id.toString())}
                                            />
                                            <span>{species.scientificname}</span>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            <div className="flex justify-between mt-2">
                                <Button onClick={selectAllSpecies} size="sm" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600">
                                    Select All
                                </Button>
                                <Button onClick={clearAllSpecies} size="sm" className="bg-red-500 text-white cursor-pointer hover:bg-red-600">
                                    Clear All
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
};

export default TreeDataViewer;
