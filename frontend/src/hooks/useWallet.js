import { useState, useEffect } from "react";

// Global atomic state for simple wallet connection (no context needed)
let globalWalletAddress = null;
let listeners = [];

function setGlobalWalletAddress(address) {
  globalWalletAddress = address;
  listeners.forEach((fn) => fn(globalWalletAddress));
}

export function useWallet() {
  const [address, setAddress] = useState(globalWalletAddress);

  useEffect(() => {
    listeners.push(setAddress);
    
    // Check if genuinely connected to MetaMask already on mount
    if (window.ethereum && !globalWalletAddress) {
      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) {
            setGlobalWalletAddress(accounts[0]);
          }
        })
        .catch(console.error);
    }

    // Listen to MetaMask account switching
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setGlobalWalletAddress(accounts[0]);
      } else {
        setGlobalWalletAddress(null);
      }
    };

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      listeners = listeners.filter((fn) => fn !== setAddress);
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to use this feature.");
      throw new Error("No MetaMask");
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setGlobalWalletAddress(accounts[0]);
        return accounts[0];
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const disconnect = () => {
    setGlobalWalletAddress(null);
  };

  const formattedAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  return {
    address,
    formattedAddress,
    connected: !!address,
    connectMetaMask,
    disconnect
  };
}
