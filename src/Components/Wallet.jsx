import { useMemo, useEffect, useState } from 'react';

import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  Coin98WalletAdapter,
  SafePalWalletAdapter,
  MathWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { Connection } from '@solana/web3.js';

const APP_IDENTITY = {
    name: '0% Fee + MEV | Yonta Labs YL',
    url: 'https://www.yontalabs.io',
    icon: 'https://www.yontalabs.io/favicon.ico',
  };

export const Wallet = ({ children }) => {
  const network = WalletAdapterNetwork.Mainnet;

  const [connectionError, setConnectionError] = useState(null);
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  // List of RPC endpoints
  const endpoints = useMemo(() => [
    'https://marketa-1sh8m6-fast-mainnet.helius-rpc.com/',
    'https://misty-burned-hill.solana-mainnet.quiknode.pro/c3c44dab045d13ddf3a2094e47ec3682d0b87363/',
    'https://solana-api.projectserum.com/',
    'https://mainnet.rpcpool.com/',
    'https://solana-mainnet.rpc.extrnode.com',
    'https://rpc.ankr.com/solana',
    'https://try-rpc.mainnet.solana.blockdaemon.tech',
    'https://getblock.io/nodes/sol/',
    'https://api.mainnet-beta.solana.com',
  ], []);

  // Try to connect to the first RPC endpoint available
  useEffect(() => {
    const checkConnection = async () => {
      for (const endpoint of endpoints) {
        console.log('RPC Network: ', endpoint);
        try {
          const connection = new Connection(endpoint);
          await connection.getVersion();
          setActiveEndpoint(endpoint);
          setConnectionError(null);
          return; 
        } catch (error) {
          console.error(`Cannot connect to endpoint ${endpoint}:`, error);
        }
      }
      setConnectionError('Unable to connect to any endpoint');
    };

    checkConnection();
  }, [endpoints]);

  const wallets = useMemo(
    () => [
        new PhantomWalletAdapter({ appIdentity: APP_IDENTITY }), // Passing APP_IDENTITY here
        new SolflareWalletAdapter({ network, appIdentity: APP_IDENTITY }),
        new TorusWalletAdapter(),
        new Coin98WalletAdapter(),
        new SafePalWalletAdapter(),
        new MathWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new BackpackWalletAdapter(),
      ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={activeEndpoint || 'https://api.mainnet-beta.solana.com'}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {connectionError ? (
            <div>{connectionError}</div>
          ) : (
            children
          )}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
