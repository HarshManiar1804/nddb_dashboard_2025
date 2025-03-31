import React, { useEffect, useState } from "react";
import axios from "axios";
import { Botany } from "../utils/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const TreeDataViewer: React.FC = () => {
    const [botanyList, setBotanyList] = useState<Botany[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    useEffect(() => {
        axios.get("http://localhost:3000/botany")
            .then((response) => setBotanyList(response.data))
            .catch((error) => console.error("Error fetching botany data:", error));
    }, []);

    const toggleSelection = (id: string) => {
        setSelectedItems((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id.toString()]
        );
    };

    const selectAll = () => {
        setSelectedItems(botanyList.map((botany) => botany.id.toString()));
    };

    const clearAll = () => {
        setSelectedItems([]);
    };

    return (
        <div className="p-2 bg-white shadow-md rounded-lg h-auto">
            <h2 className="text-lg font-semibold mb-2">Tree Data Viewer</h2>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left cursor-pointer">
                        {selectedItems.length > 0
                            ? `${selectedItems.length} selected`
                            : "Select Species"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 ">
                    <ScrollArea className="h-40 overflow-auto border rounded p-2">
                        {botanyList.map((botany) => (
                            <div key={botany.id} className="flex items-center gap-2">
                                <Checkbox checked={selectedItems.includes(botany.id.toString())}
                                    onCheckedChange={() => toggleSelection(botany.id.toString())} />
                                <span>{botany.name}</span>
                            </div>
                        ))}
                    </ScrollArea>
                    <div className="flex justify-between mt-2">
                        <Button onClick={selectAll} size="sm" className="bg-blue-500 text-white cursor-pointer hover:bg-blue-600">
                            Select All
                        </Button>
                        <Button onClick={clearAll} size="sm" className="bg-red-500 text-white cursor-pointer hover:bg-red-600">
                            Clear All
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default TreeDataViewer;
