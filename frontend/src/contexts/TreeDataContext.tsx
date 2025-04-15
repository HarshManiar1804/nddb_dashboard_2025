import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { Botany, Species } from "../utils/utils";


interface TreeCoordinates {
    latitude: number;
    longitude: number;
    treename: string;
}

interface TreeDataContextType {
    botanyList: Botany[];
    selectedBotany: string[];
    setSelectedBotany: React.Dispatch<React.SetStateAction<string[]>>;
    speciesList: Species[];
    selectedSpecies: string[];
    setSelectedSpecies: React.Dispatch<React.SetStateAction<string[]>>;
    treeCoordinates: TreeCoordinates[];
    loading: boolean;
}

const TreeDataContext = createContext<TreeDataContextType | undefined>(undefined);

export const TreeDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [botanyList, setBotanyList] = useState<Botany[]>([]);
    const [selectedBotany, setSelectedBotany] = useState<string[]>([]);
    const [speciesList, setSpeciesList] = useState<Species[]>([]);
    const [selectedSpecies, setSelectedSpecies] = useState<string[]>([]);
    const [treeCoordinates, setTreeCoordinates] = useState<TreeCoordinates[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const backendUrl = 'http://13.60.191.45:3000';

    // Fetch botany list on mount
    useEffect(() => {
        axios.get(`${backendUrl}/botany`)
            .then((response) => setBotanyList(response.data))
            .catch((error) => console.error("Error fetching botany data:", error));
    }, [backendUrl]);

    // Fetch species when selectedBotany changes
    useEffect(() => {
        if (selectedBotany.length === 0) {
            setSpeciesList([]); // Clear species list if no botany is selected
            return;
        }

        setLoading(true);
        axios.post(`${backendUrl}/species`, { botanyIds: selectedBotany.map(Number) })
            .then((response) => setSpeciesList(response.data))
            .catch((error) => console.error("Error fetching species data:", error))
            .finally(() => setLoading(false));
    }, [selectedBotany, backendUrl]);

    // Fetch tree coordinates when selectedSpecies changes
    useEffect(() => {
        if (selectedSpecies.length === 0) {
            setTreeCoordinates([]); // Clear coordinates if no species is selected
            return;
        }

        setLoading(true);
        axios.post(`${backendUrl}/geolocation`, { speciesIDs: selectedSpecies.map(Number) })
            .then((response) => setTreeCoordinates(response.data))
            .catch((error) => console.error("Error fetching geolocation data:", error))
            .finally(() => setLoading(false));
    }, [selectedSpecies, backendUrl]);

    return (
        <TreeDataContext.Provider value={{
            botanyList, selectedBotany, setSelectedBotany,
            speciesList, selectedSpecies, setSelectedSpecies,
            treeCoordinates, loading
        }}>
            {children}
        </TreeDataContext.Provider>
    );
};

export const useTreeData = () => {
    const context = useContext(TreeDataContext);
    if (!context) {
        throw new Error("useTreeData must be used within a TreeDataProvider");
    }
    return context;
};
