'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletButton() {
  const { connected, publicKey } = useWallet();

  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-orange-600 !text-white hover:!bg-orange-700 !rounded-md !px-4 !py-2 !font-medium !transition-colors" />
      {connected && publicKey && (
        <div className="text-sm text-gray-400">
          Connected: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </div>
      )}
    </div>
  );
}
