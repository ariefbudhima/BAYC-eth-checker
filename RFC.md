# RFC: BAYC Holders ETH Balance Fetcher

## 1. Introduction

This document describes the **BAYC Holders ETH Balance Fetcher**, a tool to retrieve all current holders of the Bored Ape Yacht Club (BAYC) NFT collection and calculate the total ETH held by those addresses. The script interacts with multiple Web3 services, including Alchemy and Etherscan, to fetch the necessary data with rate limiting and retry logic for robustness.

## 2. Purpose

The primary purpose of the BAYC Holders ETH Balance Fetcher is to provide an automated, efficient, and fault-tolerant mechanism to:

- Retrieve all current wallet addresses holding BAYC NFTs.
- Resolve a given epoch timestamp into an Ethereum block number.
- Fetch and aggregate the ETH balances of all holders, using rate-limited batch or conservative processing modes.

This enables insight into the total wealth (in ETH) of BAYC holders at a given point in time.

## 3. Architecture

The application is built using **Node.js** and leverages the following libraries:

- [`alchemy-sdk`](https://www.npmjs.com/package/alchemy-sdk): For retrieving NFT holders.
- [`ethers`](https://www.npmjs.com/package/ethers): For interacting with the Ethereum blockchain.
- [`axios`](https://www.npmjs.com/package/axios): For HTTP requests to Etherscan.

It follows these principles:

- **External API Integration**: Uses Etherscan for timestamp-to-block resolution and Alchemy for NFT ownership data.
- **Batch Processing**: Supports efficient ETH balance fetching with retry mechanisms.
- **Rate Limit Resilience**: Designed to handle rate limits using exponential backoff and delay strategies.

## 4. Functional Requirements

### 4.1 Epoch-to-Block Conversion

- **Function**: `epochToBlock(epoch)`
- **Input**: Epoch timestamp (in seconds)
- **Output**: Corresponding Ethereum block number via Etherscan API
- **Purpose**: Enables querying balances at a specific point in time

### 4.2 Get All BAYC Owners

- **Function**: `getAllOwners()`
- **Output**: Array of wallet addresses currently holding BAYC NFTs
- **Data Source**: Alchemy NFT API
- **Purpose**: Get live list of token holders

### 4.3 Fetch ETH Balances in Batches

- **Function**: `getEthBalancesBatch(addresses, batchSize)`
- **Logic**: Splits input into chunks of `batchSize`, fetches balances concurrently with retry logic
- **Rate Limiting**: Includes delay between batches to avoid hitting provider limits
- **Retry Mechanism**: Exponential backoff on failures (e.g., 2s, 4s, 8s)
- **Output**: Array of ETH balances in number format

### 4.4 Conservative ETH Balance Fetching

- **Function**: `getEthBalancesBatchConservative(addresses)`
- **Logic**: Processes one address at a time with 100ms delay
- **Use Case**: When extremely strict rate limits are needed
- **Trade-off**: Slower but safer

## 5. Error Handling

- All HTTP and Web3 errors are caught and logged with meaningful messages.
- Retries are implemented with exponential backoff.
- If maximum retries are exceeded, a balance of `0` is returned for that address.

## 6. Implementation Details

### 6.1 Dependencies

- Node.js
- `alchemy-sdk`
- `ethers`
- `axios`
- `.env` configuration for API keys:
  - `ALCHEMY_API_KEY`
  - `ETHERSCAN_API_KEY`

### 6.2 Code Structure

- **Initialization**: Configures providers using Alchemy and Ethers.js.
- **Helper Functions**:
  - `epochToBlock`: Converts epoch to block using Etherscan API.
  - `getAllOwners`: Paginates through Alchemy API to gather holders.
  - `retryGetBalance`: Fetches balance with retry and backoff.
- **Main Function**:
  - Validates CLI input (epoch).
  - Resolves block from epoch.
  - Gets all BAYC holders.
  - Fetches and sums ETH balances.
  - Outputs total ETH.

### 6.3 Sample CLI Usage

```bash
node main.js 1718064000
# Output:
# Block at timestamp 1718064000 is 18123999
# Getting all BAYC holders...
# Found 5112 holders
# Getting ETH balances for all holders...
# Total ETH held by BAYC holders: 89123.45 ETH
```

## 7. Security Considerations

- Do not hardcode API keys in the source file.
- Consider using secure vaults or environment-based secret management for production.
- Be mindful of rate limits and ensure compliance with provider terms.

## 8. Conclusion

The **BAYC Holders ETH Balance Fetcher** is a scalable, API-resilient tool for fetching real-time on-chain ownership and ETH balance data. By integrating with Alchemy and Etherscan, and implementing robust retry and batching strategies, it enables deeper insights into NFT holder wealth distribution.
