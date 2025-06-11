import 'dotenv/config';
import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';
import axios from 'axios';

const BAYC_CONTRACT = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

const provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC);

// Get block number from epoch
async function epochToBlock(epoch) {
  const url = `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${epoch}&closest=before&apikey=${process.env.ETHERSCAN_API_KEY}`;
  try {
    const resp = await axios.get(url);
    if (resp.data.status !== '1' || !resp.data.result) {
      throw new Error(`Etherscan error: ${resp.data.message || 'Unknown error'}`);
    }
    return parseInt(resp.data.result);
  } catch (err) {
    throw new Error('Invalid epoch or bad API response');
  }
}

// Get all owners of BAYC NFT
async function getAllOwners() {
  const owners = new Set();
  let pageKey = null;

  do {
    const res = await alchemy.nft.getOwnersForContract(BAYC_CONTRACT, {
      withTokenBalances: false,
      pageKey: pageKey || undefined,
    });

    res.owners.forEach(owner => owners.add(owner.toLowerCase()));
    pageKey = res.pageKey || null;
  } while (pageKey);

  return Array.from(owners);
}

// Retry logic for balance fetch
async function retryGetBalance(address, blockTag, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const balance = await provider.getBalance(address, blockTag);
      return parseFloat(ethers.formatEther(balance));
    } catch (err) {
      if (err.code === 'UNKNOWN_ERROR' && err.error?.code === 429) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`\nRate limited for ${address}, retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      console.error(`Error on ${address} (attempt ${attempt}):`, err.message);
      if (attempt === maxRetries) return 0;
    }
  }
  return 0;
}

// Batch ETH balance fetch
async function getEthBalancesBatchAtBlock(addresses, blockTag, batchSize = 30) {
  const results = [];

  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);

    const promises = batch.map(addr => retryGetBalance(addr, blockTag));
    const balances = await Promise.all(promises);
    results.push(...balances);

    process.stdout.write(`\rChecked ${Math.min(i + batchSize, addresses.length)} of ${addresses.length} holders...`);
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return results;
}

// MAIN
(async () => {
  const epoch = parseInt(process.argv[2]);

  if (!epoch || isNaN(epoch)) {
    console.error('Usage: node index.js <epoch_timestamp>');
    process.exit(1);
  }

  console.log(`Converting epoch ${epoch} to block number...`);
  const blockNumber = await epochToBlock(epoch);
  console.log(`Block number: ${blockNumber}`);

  console.log('Fetching all BAYC holders...');
  const owners = await getAllOwners();
  console.log(`Found ${owners.length} holders`);

  console.log(`Fetching ETH balances at block ${blockNumber}...`);
  const balances = await getEthBalancesBatchAtBlock(owners, blockNumber);

  const totalETH = balances.reduce((sum, eth) => sum + eth, 0);
  console.log(`Total ETH held by BAYC holders at epoch ${epoch}: ${totalETH.toFixed(4)} ETH`);
})();