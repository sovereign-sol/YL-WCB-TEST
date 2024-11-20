import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@solana/wallet-adapter-react-ui/styles.css';
import './index.css'
import { Wallet } from './Components/Wallet.jsx';

const RenderApp = () => (
  <Wallet>
    <App />
  </Wallet>
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RenderApp />
  </StrictMode>,
)
