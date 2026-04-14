import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const formattedAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : null;

  return {
    address,
    formattedAddress,
    connected: isConnected,
    connectMetaMask: async () => {
      if (openConnectModal) {
        openConnectModal();
      } else {
        console.warn("Connect modal hook not ready or already connected.");
      }
    },
    disconnect,
  };
}
