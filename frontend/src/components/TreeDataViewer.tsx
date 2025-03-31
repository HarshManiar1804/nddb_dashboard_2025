import React from "react";

const TreeDataViewer: React.FC = () => {
    return (
        <div className="p-2 bg-white shadow-md rounded-lg h-[120px] overflow-auto">
            <h2 className="text-lg font-semibold mb-2">Tree Data Viewer</h2>
            <div className="flex gap-2">
                <select className="w-full p-2 border rounded">
                    <option>All Species</option>
                </select>
                <select className="w-full p-2 border rounded">
                    <option>All Species</option>
                </select>
            </div>
        </div>
    );
};

export default TreeDataViewer;