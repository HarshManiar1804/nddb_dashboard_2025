import React from "react";
import TitleBranding from "./components/TitleBranding";
import TreeDataViewer from "./components/TreeDataViewer";
import ProjectInformation from "./components/ProjectInformation";
import MapSection from "./components/MapSection";
import Footer from "./components/Footer";

const App: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <TitleBranding />
      <div className="flex p-4">
        <div className="w-1/2 p-2">
          <TreeDataViewer />
        </div>
        <div className="w-1/2 p-2">
          <ProjectInformation />
        </div>
      </div>
      <div className="flex-1 p-4">
        <MapSection />
      </div>
      <Footer />
    </div>
  );
};

export default App;
