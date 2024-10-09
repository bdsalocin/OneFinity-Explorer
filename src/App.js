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
import { ethers } from "ethers";
import BalanceDisplay from "./components/BalanceDisplay";
import Web3 from "web3";

const BlockchainExplorer = () => {
  const formatAddress = (address) => {
    if (!address || address === "N/A") return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const [transactions, setTransactions] = useState([]);
  const [incomingTransactions, setIncomingTransactions] = useState([]);
  const [outgoingTransactions, setOutgoingTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [userTransactions, setUserTransactions] = useState([]);
  const [account, setAccount] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState("");
  const transactionsPerPage = 20;
  const [balance, setBalance] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [networkStats, setNetworkStats] = useState({
    totalTransactions: 0,
    totalAccounts: 0,
    totalBlocks: 0,
    currentEpoch: 0,
  });
  const formatTransactionId = (id) => {
    if (!id) return "";
    return `${id.slice(0, 8)}...${id.slice(-8)}`;
  };
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const txResponse = await fetch(
        "https://testnet-api.onefinity.network/transactions?limit=20&page=1",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const txData = await txResponse.json();
      console.log("Données de transactions:", txData);

      console.log("API response:", txData);

      if (Array.isArray(txData)) {
        console.log("Données de transactions brutes:", txData);
        setTransactions(
          txData.map((tx) => ({
            id: tx.txHash || "Inconnu",
            from: tx.sender || "Inconnu",
            to: tx.receiver || "Inconnu",
            amount: tx.value ? ethers.formatEther(tx.value) : "0.00",
            timestamp: tx.timestamp
              ? new Date(tx.timestamp * 1000).toLocaleString()
              : "Inconnu",
            status: tx.status || "En attente",
            gas: tx.gasUsed || 0,
          }))
        );
      } else {
        console.error("La réponse de l'API n'est pas un tableau comme attendu");
        setTransactions([]);
      }
      // Fetch network stats
      const statsResponse = await fetch(
        "https://testnet-api.onefinity.network/stats",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const statsData = await statsResponse.json();
      console.log("Données de statistiques:", statsData);

      console.log("Données de statistiques brutes:", statsData);
      const stats = {
        totalTransactions: statsData.transactions || 0,
        totalAccounts: statsData.accounts || 0,
        totalBlocks: statsData.blocks || 0,
        currentEpoch: statsData.epoch || 0, // Notez que 'epoch' n'est pas présent dans les données, nous le laissons à 0 pour l'instant
      };
      console.log("Statistiques formatées:", stats);
      setNetworkStats(stats);

      // Fetch incoming and outgoing transactions if wallet is connected
      if (isWalletConnected && connectedAddress) {
        const incomingTxResponse = await fetch(
          `https://testnet-api.onefinity.network/address/${connectedAddress}/transactions?type=incoming`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const incomingTxData = await incomingTxResponse.json();
        setIncomingTransactions(incomingTxData.transactions || []);

        const outgoingTxResponse = await fetch(
          `https://testnet-api.onefinity.network/address/${connectedAddress}/transactions?type=outgoing`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const outgoingTxData = await outgoingTxResponse.json();
        setOutgoingTransactions(outgoingTxData.transactions || []);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isWalletConnected, connectedAddress]);

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

  const paginate = async (pageNumber) => {
    setCurrentPage(pageNumber);
    setIsLoading(true);
    try {
      const txResponse = await fetch(
        `https://testnet-api.onefinity.network/transactions?limit=20&page=${pageNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const txData = await txResponse.json();

      if (Array.isArray(txData)) {
        // Ajoutez cette fonction utilitaire en dehors du composant principal
        const generateAccountLink = (address) => {
          return `https://testnet-explorer.onefinity.network/accounts/${address}`;
        };

        // Dans la fonction fetchData, modifiez le bloc setTransactions comme suit :
        setTransactions(
          txData.slice(0, 50).map((tx) => ({
            id: tx.txHash || "Inconnu",
            from: tx.sender || "Inconnu",
            fromLink: tx.sender ? generateAccountLink(tx.sender) : null,
            to: tx.receiver || "Inconnu",
            toLink: tx.receiver ? generateAccountLink(tx.receiver) : null,
            amount: tx.value
              ? (parseFloat(tx.value) / 1e18).toFixed(2)
              : "0.00",
            timestamp: tx.timestamp
              ? new Date(tx.timestamp * 1000).toLocaleString()
              : "Inconnu",
            status: tx.status || "En attente",
            gas: tx.gasUsed || 0,
          }))
        );
      } else {
        console.error("La réponse de l'API n'est pas un tableau comme attendu");
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (walletType) => {
    if (walletType === "MetaMask" && window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        console.log("Connected account:", accounts[0]);
        setAccount(accounts[0]);
        setConnectedAddress(accounts[0]);
        setIsWalletConnected(true);
        await fetchBalanceAndTransactions(accounts[0]); // Assurez-vous que cette ligne est présente
      } catch (error) {
        console.error("Erreur lors de la connexion à MetaMask:", error);
      }
    } else {
      console.log(`Connexion à ${walletType}...`);
      setTimeout(() => setIsWalletConnected(true), 1000);
    }
  };

  const fetchBalanceAndTransactions = async (address) => {
    console.log("Fetching data for address:", address);
    try {
      // Fetch balance
      console.log("Fetching balance...");
      const balanceResponse = await fetch(
        `https://testnet-api.onefinity.network/address/${address}`
      );
      const balanceData = await balanceResponse.json();
      console.log("Balance data:", balanceData);
      if (balanceData.data && balanceData.data.balance) {
        const formattedBalance = ethers.formatEther(balanceData.data.balance);
        console.log("Formatted balance:", formattedBalance);
        setBalance(formattedBalance);
      } else {
        console.error("Invalid balance data:", balanceData);
        setBalance("0");
      }

      // Fetch incoming transactions
      console.log("Fetching incoming transactions...");
      const incomingTxResponse = await fetch(
        `https://testnet-api.onefinity.network/address/${address}/transactions?type=incoming`
      );
      const incomingTxData = await incomingTxResponse.json();
      console.log("Incoming transactions data:", incomingTxData);
      setIncomingTransactions(incomingTxData.data || []);

      // Fetch outgoing transactions
      console.log("Fetching outgoing transactions...");
      const outgoingTxResponse = await fetch(
        `https://testnet-api.onefinity.network/address/${address}/transactions?type=outgoing`
      );
      const outgoingTxData = await outgoingTxResponse.json();
      console.log("Outgoing transactions data:", outgoingTxData);
      setOutgoingTransactions(outgoingTxData.data || []);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du solde et des transactions:",
        error
      );
      setBalance("0");
      setIncomingTransactions([]);
      setOutgoingTransactions([]);
    }
  };

  const fetchBalance = async (address) => {
    try {
      const provider = new ethers.JsonRpcProvider(
        "https://testnet-rpc.onefinity.network"
      );
      const balance = await provider.getBalance(address);
      const balanceInONE = ethers.formatEther(balance);
      setBalance(balanceInONE);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error");
    }
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
              onClick={() => connectWallet("MetaMask")}
              className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-300"
              disabled={isWalletConnected}
            >
              {isWalletConnected ? "Connected" : "Connect MetaMask"}
            </button>
          </div>

          {isWalletConnected && (
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              <div className="md:w-1/3">
                <BalanceDisplay balance={balance} address={connectedAddress} />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold mb-4 text-purple-800">
                  Vos Transactions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Transactions Entrantes
                    </h3>
                    <ul className="bg-white rounded-lg shadow p-4 max-h-60 overflow-y-auto">
                      {incomingTransactions.length > 0 ? (
                        incomingTransactions.map((tx) => (
                          <li key={tx.txHash} className="mb-2">
                            <a
                              href={`https://testnet-explorer.onefinity.network/tx/${tx.txHash}`}
                              className="text-purple-600 hover:text-purple-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              De: {formatAddress(tx.sender)} -{" "}
                              {ethers.formatEther(tx.value)} ONE
                            </a>
                          </li>
                        ))
                      ) : (
                        <li>
                          Aucune transaction entrante (Total:{" "}
                          {incomingTransactions.length})
                        </li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      Transactions Sortantes
                    </h3>
                    <ul className="bg-white rounded-lg shadow p-4 max-h-60 overflow-y-auto">
                      {outgoingTransactions.length > 0 ? (
                        outgoingTransactions.map((tx) => (
                          <li key={tx.txHash} className="mb-2">
                            <a
                              href={`https://testnet-explorer.onefinity.network/tx/${tx.txHash}`}
                              className="text-purple-600 hover:text-purple-800"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Vers: {formatAddress(tx.receiver)} -{" "}
                              {ethers.formatEther(tx.value)} ONE
                            </a>
                          </li>
                        ))
                      ) : (
                        <li>
                          Aucune transaction sortante (Total:{" "}
                          {outgoingTransactions.length})
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => fetchBalanceAndTransactions(connectedAddress)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300 mt-4"
                >
                  Rafraîchir les données
                </button>
              </div>
            </div>
          )}

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
                        Txn Hash
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("from")}
                      >
                        De
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("to")}
                      >
                        À
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        Montant (ONE)
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("timestamp")}
                      >
                        Horodatage
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        Statut
                      </th>
                      <th
                        className="p-3 text-left cursor-pointer"
                        onClick={() => handleSort("gas")}
                      >
                        Gaz Utilisé
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
                            {tx.id !== "Inconnu"
                              ? `${tx.id.slice(0, 6)}...${tx.id.slice(-4)}`
                              : tx.id}
                          </a>
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://testnet-explorer.onefinity.network/address/${tx.from}`}
                            className="text-purple-600 hover:text-purple-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.from !== "Inconnu"
                              ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`
                              : tx.from}
                          </a>
                        </td>
                        <td className="p-3">
                          <a
                            href={`https://testnet-explorer.onefinity.network/address/${tx.to}`}
                            className="text-purple-600 hover:text-purple-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.to !== "Inconnu"
                              ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}`
                              : tx.to}
                          </a>
                        </td>
                        <td className="p-3">
                          {parseFloat(tx.amount).toFixed(2)} ONE
                        </td>
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
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="mx-1 px-3 py-1 rounded bg-purple-100 text-purple-600 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from(
              {
                length: Math.min(
                  5,
                  networkStats.totalTransactions / transactionsPerPage
                ),
              },
              (_, i) => {
                const pageNumber = currentPage - 2 + i;
                return pageNumber > 0 &&
                  pageNumber <=
                    Math.ceil(
                      networkStats.totalTransactions / transactionsPerPage
                    ) ? (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentPage === pageNumber
                        ? "bg-purple-600 text-white"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ) : null;
              }
            )}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage ===
                Math.ceil(networkStats.totalTransactions / transactionsPerPage)
              }
              className="mx-1 px-3 py-1 rounded bg-purple-100 text-purple-600 disabled:opacity-50"
            >
              Next
            </button>
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
