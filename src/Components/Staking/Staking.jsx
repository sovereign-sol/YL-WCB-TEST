import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getInitCreateDelegateTX } from './helper'
import fullNameLogo from '../../assets/fullNameLogo.svg'
import logo from '../../assets/logo.svg'
import { useState , useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';


const Staking = ({ toastMessage }) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [amount, setamount] = useState('0');
  const [balance, setBalance] = useState(null);
  const [solToStake, setSolToStake] = useState('0')
  const fee = 0.01;

  useEffect(() => {
    localStorage.removeItem('walletName');
    localStorage.removeItem('walletPublicKey');

    if (!sessionStorage.getItem('reloaded')) {
      sessionStorage.clear();
      sessionStorage.setItem('reloaded', 'true');
      window.location.reload();
    }
  }, []);

  const onSendClick = async () => {
    if (wallet?.publicKey && wallet?.signTransaction) {
      try {
        const { createTX, stakeAccount } = await getInitCreateDelegateTX({
          connection,
          ownerPubkey: wallet.publicKey,
          totalSol: solToStake,
        });

        createTX.feePayer = wallet.publicKey;

        const simulationResult = await connection.simulateTransaction(createTX);
        console.log('Simulation result:', simulationResult);
        toastMessage('Transaction initializing...' , 'info');

        if (!simulationResult.value.err) {
          const sig = await wallet.sendTransaction(createTX, connection, {
            signers: [stakeAccount],
          });
          console.log('sig', {sig});
          toastMessage(sig , 'info');
          const success = await connection.confirmTransaction(sig);
          toastMessage(success , 'success');
        } else {
          toastMessage('You Have '+balance+' SOL balance' , 'error');
          if (balance <= solToStake)
            toastMessage('Transaction not possible: You requested ' + solToStake + ' SOL to stake, but you only have ' + balance + ' SOL','error');
          else
          toastMessage('Ops! Something went wrong. Please check balance and/or permissions','error')
        }
      } catch (e) {
        toastMessage(/*e.message*/'Transaction cancelled' , 'error')
      }
    }
    else {
      open()
    }
  };

  useEffect(() => {
    //setamount(() => amount)
    if (amount === "") {
      setSolToStake(0);
      return;
    }
  //const _amount = parseFloat(amount) + fee;
    if (balance > 0) {
      if (amount > (balance - fee)) {
        toastMessage('Transaction not possible: You requested to stake '+amount+' SOL, which, exceeds your balance of '+balance+' SOL.','error');
      } else {
        setSolToStake(() => parseFloat(amount))
      }
    } 
  }, [amount, balance])

  
  useEffect(() => {
    if (balance > 0) {
      const solToStakeValue = balance - fee;
      setSolToStake(parseFloat(solToStakeValue));
      setamount(parseFloat(solToStakeValue));
    }else{
      setamount(0)
      setSolToStake(0);
    }
  }, [balance])

  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet.connected && wallet.publicKey) {
        const bal = await connection.getBalance(wallet.publicKey);
        console.log(bal)
        const solBalance = bal / LAMPORTS_PER_SOL;
        setBalance(solBalance);
      }else{
        setamount(0)
        setSolToStake(0)
      }
    };

    fetchBalance();
  }, [wallet.connected, wallet.publicKey, connection]);

  return (
    <>
    {wallet.connected ? (
      <div className='w-fit p-10 rounded-lg bg-[#fff] mx-auto mt-20'>
        <img className='mb-5 mx-auto' src={fullNameLogo} alt="fullNameLogo" />
        <div className='border-2 rounded-lg' style={{ borderColor: '#FF6300', borderWidth: '2px', backgroundColor: '#fff' }}>
          <input onChange={(e) => {const value = e.target.value; setamount(() => value === "" ? "" : parseFloat(value));}} value={amount} className='outline-none py-1 px-2 text-lg w-full text-center' type="number" min={0} name="amount" placeholder='0' />
        </div>
        <button onClick={() => setamount(() => parseFloat(balance - fee))}
        className='w-auto px-2 bg-[#FF6300] transition-all hover:opacity-80 text-white justify-center items-center rounded-lg mx-auto block'>
          Max Amount
        </button>
        <button
          className={`text-[#FFFFFF] bg-[#0047AB] hover:scale-10 border-2 p-2 w-auto mt-5 font-semibold transition-all hover:opacity-80 text-white flex justify-center items-center rounded-lg mx-auto disabled:bg-gray-400`}
          onClick={onSendClick}
          disabled={!wallet.connected || amount <= 0 || amount > (balance - fee) || amount === ''}
        >
          Stake with us
        </button>
      </div>
      ) : (
        <div className='w-fit p-10 rounded-lg bg-[#fff] mx-auto mt-20'>
        <p className='text-center text-red-500'>Please select your wallet</p>
        </div>
        )}
    </>
  )
}

export default Staking