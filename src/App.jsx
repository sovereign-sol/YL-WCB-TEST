import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Staking from './Components/Staking/Staking';
import logo from './assets/logo.svg';
import { Bounce, toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const toastMessage = (message, type) => {
  toast[type](message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: false,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });
}

export default function App() {
  return (
    <>
    <ToastContainer
            position="bottom-left"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover
            theme="dark"
            transition:Bounce
          />
          <div className='bg-[#5567a9]'>
            <nav className='container mx-auto p-5 flex justify-between items-center'>
              <img className='w-12' src={logo} alt={logo} />
              <WalletMultiButton />
            </nav>
          </div>
          <Staking toastMessage={toastMessage} />
        </>
  )
}