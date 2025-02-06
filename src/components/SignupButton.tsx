'use client';
import WalletWrapper from './WalletWrapper';

export default function SignupButton() {
  return (
    <WalletWrapper
      className="ockConnectWallet_Container min-w-[90px] shrink bg-[#FFD700] text-[#333] hover:bg-[#FFB6C1]"
      text="Sign up"
    />
  );
}
