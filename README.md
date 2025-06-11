# ETH Balance Checker for BAYC Holders

Calculate total ETH balance held by all BAYC NFT holders at a specific point in time.

## Setup

1. Install dependencies:
```bash
npm install dotenv alchemy-sdk ethers axios
```

2. Create `.env` file:
```env
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHEREUM_RPC=https://eth-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

## Usage

```bash
node index.js <epoch_timestamp>
```

Example:
```bash
node index.js 1640995200  # January 1, 2022
```

## API Keys

- **Alchemy**: [alchemy.com](https://www.alchemy.com/) - Create app on Ethereum Mainnet
- **Etherscan**: [etherscan.io](https://etherscan.io/) - Generate API key in profile

## Output

```
Converting epoch 1640995200 to block number...
Block number: 13916165
Fetching all BAYC holders...
Found 5502 holders
Fetching ETH balances at block 13916165...
Checked 5502 of 5502 holders...
Total ETH held by BAYC holders at epoch 1640995200: 88172.4100 ETH
```

## Notes

- Processes ~5500 addresses in 3-5 minutes
- Handles API rate limits automatically
- Returns 0 for failed address lookups
