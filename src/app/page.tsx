'use client';
import Footer from 'src/components/Footer';
import ChatComponent from 'src/components/ChatComponent';
import AgentWallet from 'src/components/AgentWallet';
import TransactionWrapper from 'src/components/TransactionWrapper';
import WalletWrapper from 'src/components/WalletWrapper';
import { ONCHAINKIT_LINK } from 'src/links';
import OnchainkitSvg from 'src/svg/OnchainkitSvg';
import { useAccount } from 'wagmi';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';
import TransactionHistory from '../components/TransactionHistory'; //Import TransactionHistory component


export default function Page() {
  const { address } = useAccount();

  return (
    <div className="flex h-full w-96 max-w-full flex-col px-1 md:w-[1008px]">
      <section className="mt-6 mb-6 flex w-full flex-col md:flex-row">
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-0">
          <a
            href="/"
            title="Watcher.Fai"
            target="_blank"
            rel="noreferrer"
          >
            <h1 className="font-bold text-4xl" >Watcher.Fai</h1>
          </a>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="w-full md:w-1/2">
          <AgentWallet />
        </div>
        <div className="w-full md:w-1/2">
          <TransactionHistory />
        </div>
      </div>
      <section className="templateSection flex w-full flex-col items-center justify-center gap-4 rounded-xl bg-gray-100 px-8 py-10 md:grow">
        <ChatComponent />
      </section>
      <Footer />
    </div>
  );
}