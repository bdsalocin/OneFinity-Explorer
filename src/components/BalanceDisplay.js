import React from "react";

const BalanceDisplay = ({ balance, address }) => {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 shadow-lg max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Wallet Balance</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
      </div>
      <div className="bg-white bg-opacity-20 rounded-lg p-4">
        <p className="text-sm text-gray-200 mb-1">Connected Address</p>
        <p className="text-xs text-gray-300 mb-4 break-all">{address}</p>
        <p className="text-sm text-gray-200 mb-1">Balance</p>
        <p className="text-3xl font-bold text-white">
          {parseFloat(balance).toFixed(4)} ONE
        </p>
      </div>
    </div>
  );
};

export default BalanceDisplay;
