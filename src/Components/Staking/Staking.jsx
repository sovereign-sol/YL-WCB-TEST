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
  const fee = 0.001;

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
        toastMessage(e.message , 'error')
      }
    }
    else {
      open()
    }
  };

  useEffect(() => {
    setamount(() => amount)
  const _amount = parseFloat(amount) + fee;
    if (balance > 0) {
      if (_amount > balance) {
        amount == balance && toastMessage('Transaction not possible: You requested to stake '+amount+' SOL, which, together with the fee, exceeds your balance of '+balance+' SOL.','error');
        amount > balance && toastMessage('Transaction not possible: You requested to stake '+amount+' SOL, which, exceeds your balance of '+balance+' SOL.','error');
      } else {
        setSolToStake(() => parseFloat(amount))
      }
    } 
  }, [amount, balance])

  
  useEffect(() => {
    if (balance > 0) {
      const solToStakeValue = balance - fee;
      setSolToStake(parseFloat(solToStakeValue.toFixed(4)));
      setamount(parseFloat(solToStakeValue.toFixed(4)));
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
      <div className='w-fit p-10 rounded-lg bg-[#fff] mx-auto mt-20'>
        <img className='mb-5 mx-auto' src={fullNameLogo} alt="fullNameLogo" />
        <div className='border-[#FF6300] border-2'>
          <input onChange={(e) => setamount(()=>parseFloat(e.target.value))} value={amount} className='outline-none py-1 px-2 text-lg w-full' type="number" min={0} name="amount" placeholder='0' />
          <button onClick={() => setamount(() => parseFloat(balance - fee))} className='w-full px-2 bg-[#FF6300] transition-all hover:opacity-80 text-white'>Maximum Amount</button>
        </div>
        <button  className={`text-[#0047AB] border-[#0047AB] hover:scale-10 hover:text-[#FF6300] hover:border-[#FF6300] border-2 p-2 w-full mt-5 font-semibold transition-all flex justify-center items-center `} onClick={onSendClick}>Stake with <img className='w-8 ml-3' src={logo} alt={logo} /></button>
      </div>
    </>
  )
}

export default Staking