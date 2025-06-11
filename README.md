# ETH Balance Checker for BAYC Holders

A Node.js application that calculates the total ETH balance held by all Bored Ape Yacht Club (BAYC) NFT holders at a specific point in time.

## Features

- Fetches all current BAYC NFT holders
- Retrieves ETH balances at a specific block/timestamp
- Handles API rate limiting with retry logic
- Batch processing for optimal performance
- Progress tracking during execution

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- Alchemy API key
- Etherscan API key

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd eth-checker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your API keys to the `.env` file: 