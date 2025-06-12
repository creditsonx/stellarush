# 🚀 STELLARUSH - GitHub Setup Guide

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/stellarush/stellarush.git
cd stellarush
```

### 2. Install Dependencies
```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install project dependencies
bun install
```

### 3. Run Development Server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see STELLARUSH in action!

## 🌟 Features

- **Solana Integration**: Connect Phantom, Solflare, and Torus wallets
- **Real-time Gameplay**: Live crash curve with multiplier visualization
- **Social Features**: Chat, players list, and game history
- **Space Theme**: Stunning rocket animations and starfield effects
- **Responsive Design**: Perfect on desktop, tablet, and mobile

## 🛠 Development

### Project Structure
```
stellarush/
├── src/
│   ├── components/          # React components
│   │   ├── Logo.tsx        # Animated rocket logo
│   │   ├── CrashGame.tsx   # Main game logic
│   │   ├── GameChart.tsx   # Multiplier visualization
│   │   ├── BettingPanel.tsx # Bet placement UI
│   │   ├── ChatBox.tsx     # Social chat
│   │   └── ...
│   ├── app/                # Next.js app router
│   ├── solana/             # Blockchain integration
│   └── lib/                # Utilities
├── public/                 # Static assets
├── .github/               # GitHub workflows
└── docs/                  # Documentation
```

### Available Scripts
```bash
bun run dev         # Start development server
bun run build       # Build for production
bun run start       # Start production server
bun run lint        # Run linter
bun run format      # Format code
```

### Environment Setup

#### Solana Network Configuration
The app uses Solana Devnet by default. To switch networks, edit `src/components/WalletProvider.tsx`:

```typescript
// For Mainnet (production)
const network = WalletAdapterNetwork.Mainnet;

// For Devnet (development)
const network = WalletAdapterNetwork.Devnet;
```

#### Required Wallets
- [Phantom Wallet](https://phantom.app/)
- [Solflare Wallet](https://solflare.com/)
- [Torus Wallet](https://tor.us/)

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `bun run build`
3. Set publish directory: `out`
4. Deploy!

### Vercel
1. Import project from GitHub
2. Vercel auto-detects Next.js configuration
3. Deploy!

### Manual Build
```bash
# Build static export
bun run build

# Files will be in `out/` directory
# Upload to any static hosting service
```

## 🧪 Testing

### Wallet Testing
1. Install a Solana wallet extension
2. Switch to Devnet
3. Get test SOL from [Solana Faucet](https://faucet.solana.com/)
4. Connect wallet in STELLARUSH
5. Start playing!

### Game Flow Testing
1. **Connection**: Verify wallet connects successfully
2. **Betting**: Place various bet amounts
3. **Cash Out**: Test timing-based cash outs
4. **Social**: Send chat messages, view player list
5. **Responsive**: Test on different screen sizes

## 📱 Browser Support

- **Chrome**: Fully supported ✅
- **Firefox**: Fully supported ✅
- **Safari**: Fully supported ✅
- **Edge**: Fully supported ✅
- **Mobile**: iOS Safari, Chrome Mobile ✅

## 🔧 Smart Contract Development

### Future Implementation
The project includes interfaces for smart contract integration in `src/solana/program.ts`:

- Game state management
- Provably fair crash point generation
- Automatic SOL payouts
- Player bet tracking

### Planned Features
- [ ] Anchor program development
- [ ] On-chain game logic
- [ ] Verifiable random functions (VRF)
- [ ] Real-time multiplayer sync
- [ ] Advanced autobet strategies

## 🎨 Customization

### Branding
- Logo: `src/components/Logo.tsx`
- Colors: Tailwind CSS classes throughout components
- Fonts: Configured in `src/app/layout.tsx`

### Game Logic
- Crash point generation: `src/components/CrashGame.tsx`
- Betting rules: `src/components/BettingPanel.tsx`
- Chart styling: `src/components/GameChart.tsx`

## 🐛 Troubleshooting

### Common Issues

**Wallet won't connect:**
- Ensure wallet extension is installed and unlocked
- Switch to correct network (Devnet for testing)
- Refresh page and try again

**Build errors:**
- Clear node_modules: `rm -rf node_modules && bun install`
- Check Node.js version: requires Node 18+
- Verify all dependencies are installed

**Development server issues:**
- Port 3000 might be in use: try `bun run dev -- --port 3001`
- Clear Next.js cache: `rm -rf .next`

### Getting Help
- [GitHub Issues](https://github.com/stellarush/stellarush/issues)
- [Discord Community](#) (coming soon)
- [Documentation Wiki](#) (coming soon)

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

**Ready to launch your fortune to the stars? 🚀✨**
