import React from "react";

const TitleBranding: React.FC = () => {
    return (
        <header className="flex items-center p-2">
            {/* Logo on the left */}
            <img src="/logo.png" alt="NDDB Logo" className="h-10 my-4" />
            {/* Title centered */}
            <div className="flex-1 text-black text-center text-2xl font-bold">
                NDDB DIGITAL BIODIVERSITY MAP
            </div>
        </header>
    );
};

export default TitleBranding;
