'use client';
import WalletWrapper from './WalletWrapper';

export default function LoginButton() {
  return (
    <WalletWrapper
      className="min-w-[90px] bg-[var(--primary-color)] text-[var(--text-color)] hover:bg-[var(--palette-bg-white)]"
      text="Log in"
      withWalletAggregator={true}
    />
  );
}
