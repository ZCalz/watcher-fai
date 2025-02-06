'use client';
import WalletWrapper from './WalletWrapper';

export default function LoginButton() {
  return (
    <WalletWrapper
      className="min-w-[90px] bg-[#FFD700] text-[#333] hover:bg-[#FFB6C1]"
      text="Log in"
      withWalletAggregator={true}
    />
  );
}
