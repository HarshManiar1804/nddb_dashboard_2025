import React from "react";

const TitleBranding: React.FC = () => {
    return (
        <header className="flex items-center p-2 py-0">
            {/* Logo on the left */}
            <img src="/logo.png" alt="NDDB Logo" className="h-10 my-4" />
            {/* Title centered */}
            <div className="flex-1 text-black text-center text-2xl font-semibold font-[Times_New_Roman]">
                NDDB DIGITAL BIODIVERSITY MAP
            </div>
        </header>
    );
};

export default TitleBranding;
