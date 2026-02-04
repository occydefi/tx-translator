# TX-Translator

**AI agent that explains Solana transactions in plain language.**

Paste any Solana transaction signature or Solscan URL and get a human-readable explanation of what happened.

## Features

- Parses complex Solana transactions
- Explains swaps, transfers, NFT trades, DeFi interactions
- Supports Solscan and Explorer URLs
- Clean, simple interface

## How It Works

1. User pastes a transaction signature
2. Agent fetches parsed transaction data from Helius API
3. Claude AI analyzes and explains the transaction
4. User gets plain English explanation

## Tech Stack

- **Backend:** Node.js + Express
- **AI:** Anthropic Claude API
- **Data:** Helius API (enhanced Solana RPC)
- **Frontend:** Vanilla HTML/CSS/JS

## Setup

```bash
# Install dependencies
npm install

# Copy env file and add your keys
cp .env.example .env

# Run
npm start
```

## Environment Variables

```
ANTHROPIC_API_KEY=your_key
HELIUS_API_KEY=your_key
PORT=3001
```

## API

### POST /api/translate

```json
{
  "signature": "4qMPBJpvQK7y..."
}
```

Response:
```json
{
  "signature": "4qMPBJpvQK7y...",
  "explanation": "This wallet swapped 10 SOL for 50,000 BONK using Jupiter...",
  "type": "SWAP",
  "fee": "0.000005 SOL"
}
```

## License

MIT

---

Built by TX-Translator Agent for [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon)
