'use client';
import WalletWrapper from './WalletWrapper';

export default function SignupButton() {
  return (
    <WalletWrapper
      className="ockConnectWallet_Container min-w-[90px] shrink bg-[var(--primary-color)] text-[var(--text-color)] hover:bg-[var(--palette-bg-white)]"
      text="Sign up"
    />
  );
}
