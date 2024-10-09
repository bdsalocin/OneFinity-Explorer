import React from "react";

const ExplorerHeader = () => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://cdn.prod.website-files.com/65afa41517b5d6857775bd8f/65cf7fa8666082289a5e3a87_Logo.svg"
            alt="OneFinityChain Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300">
              OneFinityChain
            </span>
            <span className="ml-2 text-white">Explorer</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default ExplorerHeader;
