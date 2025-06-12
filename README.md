# STELLARUSH 🚀✨
### The Ultimate Solana Crash Game

Experience the next generation of crash gaming on the Solana blockchain. **STELLARUSH** combines the thrill of bustabit-style gameplay with cutting-edge blockchain technology and stunning space-themed visuals.

> **Bet • Rush • Win** - Launch your fortune to the stars!

![STELLARUSH Game Screenshot](https://ext.same-assets.com/2650025529/1248550479.jpeg)

## 🎮 Features

### Core Gameplay
- **Real-time Multiplier**: Watch the multiplier increase from 1.0x upwards
- **Strategic Cash-out**: Players can cash out at any time before the crash
- **Provably Fair**: Transparent and verifiable random crash points
- **Instant Payouts**: Automatic SOL distribution via smart contract

### Social Features
- **Live Chat**: Communicate with other players in real-time
- **Players List**: See active bets and cash-outs from other players
- **Game History**: View recent crash results and statistics
- **Leaderboards**: Track top players and biggest wins

### Wallet Integration
- **Multi-Wallet Support**: Phantom, Solflare, Torus wallets
- **Secure Transactions**: All bets and payouts handled on-chain
- **Real Balance**: Connect your wallet to play with real SOL

## 🛠 Technology Stack

### Frontend
- **Next.js 14** - React framework with TypeScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Recharts** - Chart library for multiplier visualization
- **Framer Motion** - Animation library

### Blockchain
- **Solana Web3.js** - Blockchain interaction
- **Wallet Adapters** - Multi-wallet connection support
- **SPL Token** - Token standards and utilities

### Development Tools
- **Bun** - Fast JavaScript runtime and package manager
- **TypeScript** - Type-safe development
- **Biome** - Fast code formatter and linter

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed
- [Phantom Wallet](https://phantom.app/) or another Solana wallet
- Some SOL for testing (use Solana devnet faucet)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/stellarush/stellarush.git
   cd stellarush
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Setup

The app is currently configured for **Solana Devnet**. To switch networks, edit `src/components/WalletProvider.tsx`:

```typescript
// For Mainnet
const network = WalletAdapterNetwork.Mainnet;

// For Devnet (current default)
const network = WalletAdapterNetwork.Devnet;
```

## 🎯 How to Play

1. **Connect Wallet**: Click "Select Wallet" and connect your Solana wallet
2. **Place Bet**: Enter your bet amount in SOL and click "Place Bet"
3. **Watch Multiplier**: The multiplier starts at 1.0x and increases
4. **Cash Out**: Click "Cash Out" before the multiplier crashes
5. **Win/Lose**: If you cash out in time, you win your bet × multiplier

### Game Rules
- Minimum bet: 0.01 SOL
- House edge: 1%
- Crash points are provably fair and unpredictable
- Players can only bet during the waiting period between rounds
- Cash-out must happen before the crash to receive payout

## 🏗 Architecture

### Frontend Structure
```
src/
├── components/
│   ├── WalletProvider.tsx     # Solana wallet integration
│   ├── WalletButton.tsx       # Wallet connection UI
│   ├── CrashGame.tsx          # Main game component
│   ├── GameChart.tsx          # Multiplier visualization
│   ├── BettingPanel.tsx       # Bet placement and cash-out
│   ├── GameHistory.tsx        # Recent crash results
│   ├── PlayersList.tsx        # Active players display
│   └── ChatBox.tsx            # Social chat feature
├── solana/
│   └── program.ts             # Smart contract interface
└── app/
    ├── layout.tsx             # App layout with providers
    └── page.tsx               # Main page
```

### Current Implementation Status

✅ **Completed Features:**
- Wallet connection and integration
- Complete game UI with real-time updates
- Mock game logic and state management
- Social features (chat, players list, history)
- Responsive design and animations

🚧 **In Development:**
- Smart contract implementation
- Real blockchain integration
- Provably fair random generation
- Real-time multiplayer synchronization

📋 **Planned Features:**
- Autobet functionality
- Friend system and private messages
- Advanced statistics and analytics
- Mobile app version

## 🔧 Smart Contract Development

The project includes a structured approach for smart contract development:

### Program Interface (`src/solana/program.ts`)
- **Game State Management**: Track active games and player bets
- **Provably Fair Logic**: Transparent crash point generation
- **Automatic Payouts**: Instant SOL distribution
- **Event Emission**: Real-time game state updates

### Key Functions (Planned)
```typescript
// Place a bet for the current round
await CrashGameProgram.placeBet(playerPublicKey, betAmount, gameAccount);

// Cash out during an active round
await CrashGameProgram.cashOut(playerPublicKey, gameAccount, currentMultiplier);

// Start a new round (admin only)
await CrashGameProgram.startRound(authorityKey, gameAccount, crashPoint);
```

## 🎨 Design & UI

The interface is inspired by the original bustabit design with modern improvements:

- **Dark Theme**: Easy on the eyes for extended gaming sessions
- **Real-time Updates**: Smooth animations and live data
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Accessible**: Keyboard navigation and screen reader support

### Color Scheme
- Primary: Orange (`#ea580c`) - Represents excitement and energy
- Success: Green (`#22c55e`) - For wins and cash-outs
- Danger: Red (`#ef4444`) - For crashes and losses
- Background: Dark grays for reduced eye strain

## 🧪 Testing

### Manual Testing
1. Connect different wallet types
2. Place various bet amounts
3. Test cash-out at different multipliers
4. Verify game state consistency
5. Check responsive design on different devices

### Automated Testing (Planned)
- Unit tests for game logic components
- Integration tests for wallet interactions
- End-to-end tests for complete game flows

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service:

```bash
# Build for production
bun run build

# Deploy to Netlify, Vercel, or similar
```

### Smart Contract Deployment (Future)
```bash
# Build the Solana program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use the existing component patterns
- Maintain responsive design
- Test wallet integration thoroughly
- Document new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a gambling application. Please gamble responsibly:
- Only bet what you can afford to lose
- Gambling can be addictive
- Check your local laws regarding online gambling
- This software is provided as-is without warranty

## 🔗 Links

- [Solana Documentation](https://docs.solana.com/)
- [Phantom Wallet](https://phantom.app/)
- [Original Bustabit](https://bustabit.com/) (inspiration)
- [Solana Devnet Faucet](https://faucet.solana.com/)

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Join our Discord community (coming soon)
- Check the documentation wiki

---

**Built with ❤️ for the Solana ecosystem**
