# Orange Exchange

**The Blockchain Marketplace for Nigeria’s Orange Economy**

Securely mint, list, license, and trade intellectual property — music, art, film, digital content, fashion, and more — with immutable ownership on Polygon.

Built for Nigerian creators to protect their work, earn royalties, and reach global buyers.

---

## ✨ Features

- **Drag & Drop Upload** — Upload files (image, audio, video, PDF, etc.) directly
- **IPFS Pinning** — Permanent decentralized storage via Pinata
- **On-chain NFT Minting** — ERC-721 with built-in 10% royalties (EIP-2981)
- **Duplicate Protection** — Warns creators if the exact same file was already minted
- **Live Marketplace** — Real-time listings from Supabase
- **Wallet Integration** — RainbowKit + Polygon Amoy (ready for mainnet)
- **User Authentication** — Email/password login + wallet linking
- **Creator Quick Mint** — One-click upload → IPFS → mint → listed

---

## 🛠 Tech Stack

| Layer            | Technology                              |
|------------------|-----------------------------------------|
| Blockchain       | Polygon (Amoy testnet) + Solidity 0.8.28 |
| Smart Contracts  | Hardhat + OpenZeppelin                  |
| Frontend         | Vite + React + TypeScript + Tailwind + shadcn/ui |
| Web3             | wagmi + viem + RainbowKit               |
| Storage          | Pinata (IPFS)                           |
| Database & Auth  | Supabase (Postgres + Auth)              |

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/franklyayo/orange-economy.git
cd orange-economy

2. Install dependencies
Bashnpm install
3. Set up environment variables
Create a .env file in the root:
envVITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PINATA_JWT=your_pinata_jwt_here
4. Run locally
Bashnpm run dev
Open http://localhost:5173

📍 Deployed Contracts (Polygon Amoy Testnet)

OrangeEconomyNFT — 0xbBd713a3EdeA46343887aC1CDCfBa2e8F74FECc8
OrangeMarketplace — 0x890f4884633A083d1CD78228A823e704AA6f6D2f


🧪 How to Test

Connect Wallet (MetaMask on Polygon Amoy testnet)
Login / Register via the Account button
Link Wallet in the Account modal
Creator Quick Mint:
Drag & drop a file
Click “Upload to IPFS & Mint NFT”
Watch it appear in the live grid

Duplicate files will show a warning before minting


📋 Roadmap (Next Priorities)

Full "List for Sale" + "Buy Now" flow with payment + royalties
Gemini-powered auto metadata generation
Progress bar during upload
Row Level Security (RLS) on Supabase
Production deployment to Polygon mainnet
Advanced duplicate detection (perceptual similarity)


🏗 Project Structure (Key Folders)
textcontracts/              # Solidity smart contracts
src/
 ├── components/        # MintNFT, MarketplaceCard, LoginModal
 ├── lib/               # supabase.ts, contracts.ts, web3.ts
 └── App.tsx            # Main application

🤝 Contributing
We welcome contributions from the Nigerian tech and creative community!

Fork the repo
Create a feature branch
Make your changes
Open a Pull Request


📄 License
MIT License — feel free to use this as a foundation for your own Orange Economy projects.

Built with ❤️ for Nigeria’s creative economy
Made possible by the hard work of creators, developers, and the Polygon ecosystem.
