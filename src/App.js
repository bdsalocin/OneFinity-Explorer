import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./index.css";

const BlockchainExplorer = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [activeTab, setActiveTab] = useState("transactions");
  const [networkStats, setNetworkStats] = useState({
    totalTransactions: 0,
    totalAccounts: 0,
    totalBlocks: 0,
    currentEpoch: 0,
  });
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const transactionsPerPage = 10;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [txResponse, statsResponse] = await Promise.all([
        fetch("https://testnet-api.onefinity.network/transactions"),
        fetch("https://testnet-api.onefinity.network/stats"),
      ]);
      const txData = await txResponse.json();
      const statsData = await statsResponse.json();

      setTransactions(
        txData.slice(0, 50).map((tx) => ({
          id: tx.id || "Unknown",
          from: tx.sender || "Unknown",
          to: tx.recipient || "Unknown",
          amount: parseFloat(tx.amount || 0).toFixed(18),
          timestamp: tx.timestamp
            ? new Date(tx.timestamp * 1000).toLocaleString()
            : "Unknown",
          status: Math.random() > 0.1 ? "Success" : "Failed", // Simulated status
          gas: Math.floor(Math.random() * 1000000), // Simulated gas
        }))
      );

      setNetworkStats({
        totalTransactions: statsData.totalTransactions || 0,
        totalAccounts: statsData.totalAccounts || 0,
        totalBlocks: statsData.totalBlocks || 0,
        currentEpoch: statsData.currentEpoch || 0,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        width: "100%",
        height: 400,
        symbol: "XEXCHANGE:ONEUSDC",
        interval: "D",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "tradingview_chart",
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = React.useMemo(() => {
    let sortableItems = [...transactions];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [transactions, sortConfig]);

  const filteredTransactions = sortedTransactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const connectWallet = async (walletType) => {
    // Implement wallet connection logic here
    console.log(`Connecting to ${walletType}...`);
    // Simulating a successful connection
    setTimeout(() => setIsWalletConnected(true), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <h1 className="text-4xl font-bold text-center">
            OneFinity Blockchain Explorer
          </h1>
        </div>

        <div className="p-6">
          <div className="flex justify-end mb-6 space-x-4">
            <button
              onClick={() => connectWallet("XPortal")}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300"
              disabled={isWalletConnected}
            >
              {isWalletConnected ? "Connected" : "Connect XPortal"}
            </button>
            <button
              onClick={() => connectWallet("MetaMask")}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300"
              disabled={isWalletConnected}
            >
              {isWalletConnected ? "Connected" : "Connect MetaMask"}
            </button>
          </div>

          <div className="flex mb-6">
            <input
              type="text"
              placeholder="Search transactions..."
              className="flex-grow p-3 rounded-l-md border-2 border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearch}
            />
            <button className="bg-purple-600 text-white p-3 rounded-r-md hover:bg-purple-700 transition duration-300">
              Search
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {Object.entries(networkStats).map(([key, value]) => (
              <div
                key={key}
                className="bg-gradient-to-br from-purple-100 to-indigo-100 p-4 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300"
              >
                <h2 className="text-lg font-semibold text-purple-700 mb-2">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </h2>
                <p className="text-3xl font-bold text-purple-900">
                  {value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">
              Recent Transactions
            </h2>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-900"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <tr>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("id")}
                      >
                        Transaction ID
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("from")}
                      >
                        From
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("to")}
                      >
                        To
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        Amount (ONE)
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("timestamp")}
                      >
                        Timestamp
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Status
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("gas")}
                      >
                        Gas Used
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTransactions.map((tx) => (
                      <tr
                        key={tx.id}
                        className="border-b border-purple-100 hover:bg-purple-50 transition duration-300"
                      >
                        <td className="p-3">
                          <a
                            href={`https://testnet-explorer.onefinity.network/tx/${tx.id}`}
                            className="text-purple-600 hover:text-purple-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.id}
                          </a>
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://testnet-explorer.onefinity.network/address/${tx.from}`}
                            className="text-purple-600 hover:text-purple-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                          </a>
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://testnet-explorer.onefinity.network/address/${tx.to}`}
                            className="text-purple-600 hover:text-purple-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                          </a>
                        </td>
                        <td className="p-3">{tx.amount}</td>
                        <td className="p-3">{tx.timestamp}</td>
                        <td className="p-3">{tx.status}</td>
                        <td className="p-3">{tx.gas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            {Array.from(
              {
                length: Math.ceil(
                  filteredTransactions.length / transactionsPerPage
                ),
              },
              (_, i) => (
                <button
                  key={i}
                  onClick={() => paginate(i + 1)}
                  className={`mx-1 px-3 py-1 rounded ${
                    currentPage === i + 1
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {i + 1}
                </button>
              )
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-800">
              ONE/USDC Chart
            </h2>
            <div
              id="tradingview_chart"
              className="rounded-lg overflow-hidden"
            ></div>
          </div>

          <div className="text-center">
            <button
              onClick={fetchData}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-purple-700 hover:to-indigo-700 transition duration-300 flex items-center justify-center mx-auto"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplorer;
