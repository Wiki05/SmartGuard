import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, sepolia, baseSepolia, arbitrum } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// WalletConnect Project ID (Generic dev ID - replace with production ID later)
const projectId = 'b8b39418652d87eec8eb3af9e7dcbf31';

const config = getDefaultConfig({
  appName: 'Smart Guard',
  projectId: projectId,
  chains: [sepolia, baseSepolia, mainnet, arbitrum],
  ssr: false, // Vite is SPA
});

const queryClient = new QueryClient();

/* ─── Advanced Premium Theming ────────────────────────────────────── */
const customTheme = Object.assign(
  darkTheme({
    accentColor: '#a8ff6c', // Neon Green
    accentColorForeground: '#000',
    borderRadius: 'large',
    fontStack: 'system',
    overlayBlur: 'small',
  }),
  {
    colors: {
      ...darkTheme().colors,
      modalBackground: '#0a0a0a',       // Deepest dark
      modalBorder: 'rgba(168, 255, 108, 0.15)', // Subtle neon glow border
      modalText: '#ffffff',
      modalTextSecondary: '#888888',
      actionButtonBorder: 'rgba(168, 255, 108, 0.15)',
      actionButtonSecondaryBackground: '#141414',
      closeButton: '#888888',
      closeButtonBackground: '#1a1a1a',
      connectButtonBackground: '#1a1a1a',
      connectButtonInnerBackground: '#111111',
    },
    shadows: {
      ...darkTheme().shadows,
      dialog: '0 40px 100px rgba(0,0,0,0.98), 0 0 0 1px rgba(168,255,108,0.1)',
    }
  }
);

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme} initialChain={sepolia}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
