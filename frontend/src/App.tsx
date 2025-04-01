import React, { useState } from "react";
import TitleBranding from "./components/TitleBranding";
import TreeDataViewer from "./components/TreeDataViewer";
import ProjectInformation from "./components/ProjectInformation";
import MapSection from "./components/MapSection";
import Footer from "./components/Footer";
import MapSelection from "./components/MapSelection";
import type { MapType } from "./utils/utils";

const App: React.FC = () => {
  const [mapType, setMapType] = useState<MapType>("satellite");
  return (
    <div className="flex flex-col h-screen">
      <TitleBranding />
      <div className="flex h-screen">
        <div className="w-full md:w-1/4 space-y-2 p-2">
          <MapSelection mapType={mapType} setMapType={setMapType} />
          <TreeDataViewer />
          <ProjectInformation />
        </div>
        <div className="w-3/4 ">
          <MapSection mapType={mapType} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default App;
