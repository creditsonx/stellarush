import { CrashGame } from "@/components/CrashGame";
import { WalletButton } from "@/components/WalletButton";
import { LogoHorizontal } from "@/components/Logo";

export default function Home() {
  return (
    <main>
      {/* Header with wallet connection */}
      <div className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <LogoHorizontal size="lg" />
            <div className="border-l border-gray-600 pl-4">
              <p className="text-gray-400 text-sm">The Ultimate Solana Crash Game</p>
              <p className="text-gray-500 text-xs">Bet • Rush • Win</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </div>

      {/* Game */}
      <CrashGame />
    </main>
  );
}
