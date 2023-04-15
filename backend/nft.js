const ethers = require('ethers');
const axios = require('axios');

const urlScanApiKey = '24e8d9c4-5419-4a2d-b258-d5613f8015e6';
const nftPortApiKey = '145566cf-dda7-4b7f-ab74-bbd336ed6377';
const etherscanApiKey = 'W5FKNHAJ87DX32TIF71QNXUIUAY5B7TAHF';


// --------------------------SITE SECURITY---------------------------------------

async function checkSiteSecurity(ssl, fullUrl) {
  // Check if site has SSL
  const hasSsl = ssl === "https:";
  
  const mallware = await scanUrlForMalware(fullUrl)

  return {
    hasSsl: hasSsl,
    mallware: mallware
  };
}

// -----------------------------Nft Security--------------------------------------

async function checkNftSecurity(contractAddress, tokenId) {
  //const nftData = await getNftData(contractAddress, tokenId);
  let hasMallware = false;
  let isDuplicated = false;

  if (!nftData) {
    console.error('Failed to fetch NFT data');
    hasMallware = true;
  }else{
    console.log('NFT Data:', nftData);

    // Check for metadata duplication
    // This can be done by comparing the metadata's hash with other NFTs, but NFTPort does not provide this functionality.
  
    // Scan image file for malware

    hasMallware = await checkNftDataForMallware(nftData);
    
    await analyzeNftCreator(contractAddress, tokenId)
   
  return {
    idDuplicated: isDuplicated || false,
    isMalware: hasMallware || false,
  };
}


// ------------------------------ GET NFT DATA WITH NFT PORT API ---------------------------------

function nftApiCall(nftPortApiUrl, network) {

  const options = {
    method: 'GET',
    url: nftPortApiUrl,
    params: {chain: network, refresh_metadata: 'false'},
    headers: {
      accept: 'application/json',
      Authorization: nftPortApiKey
    }
  };

  return axios.request(options);
}

function getNftPortApiUrl(contractAddress, tokenId) {
  return `https://api.nftport.xyz/v0/nfts/${contractAddress}/${tokenId}`;
}

async function getNftData(contractAddress, tokenId) {
  const networks = ['ethereum', 'polygon', 'goerli'];
  let success = false;
  let result = null;
  const url = getNftPortApiUrl(contractAddress, tokenId);
  do {
    try {
      console.log(url)
      const network = networks.shift();
      console.log(network)
      const response = await nftApiCall(url, network);
      result = response.data;
      success = true;
    } catch (error) {
      if (error.response && error.response.statusText === 'Not Found') {
        console.log('Try to fetch with another network...');
      } else {
        console.error(`Error fetching NFT data: ${error.message}`);
        return null;
      }
    }
  } while (!success && networks.length > 0);

  if (!success) {
    console.error('No networks left to try');
  }

  return result;
}

// --------------------------------- CHECK DATA FOR MALLWARE USIN URL SCAN ---------------------------------

async function scanUrlForMalware(url) {
  const urlScanApiUrl = 'https://urlscan.io/api/v1/scan/';
  console.log('Url to scan ', url)
  try {
    const response = await axios.post(
      urlScanApiUrl,
      {
        url,
        public: 'on',
      },
      {
        headers: {
          'API-Key': urlScanApiKey,
        },
      }
    );


    const scanId = response.data.uuid;
    console.log(`Scan initiated. Scan ID: ${scanId}`);
  
    console.log('Waiting for the scan to complete...');
    let scanComplete = false;
  
    while (!scanComplete) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
  
      const scanResultUrl = `https://urlscan.io/api/v1/result/${scanId}/`;
  
      try {
        const scanResult = await axios.get(scanResultUrl);
  
        scanComplete = true;
  
        // Process the scan results as before
        // console.log(scanResult)

        const malicious = scanResult.data.verdicts.overall.malicious;
       
        if (malicious) {
          console.log(`URL: ${url} is not safe`);
        } else {
          console.log(`URL: ${url} is safe`);
        }

        return malicious;
  
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('Scan still in progress...');
        } else {
          console.error(`Error checking URL safety: ${error.message}`);
          break;
        }
      }
    }
  } catch (error) {
    console.error(`Error checking URL safety: ${error.message}`);
  }
}

function ipfsToHttpUrl(ipfsUrl) {
  return ipfsUrl.replace('ipfs://', 'https://ipfs.infura.io/ipfs/');
}

async function checkNftDataForMallware(nftData) {
  try {
    const urlsToScan = [
      nftData.nft?.metadata_url ? ipfsToHttpUrl(nftData.nft.metadata_url) : null ,
      nftData.nft?.metadata?.image ? ipfsToHttpUrl(nftData.nft.metadata?.image) : null,
      nftData.nft?.file_url ? ipfsToHttpUrl(nftData.nft.file_url) : null,
      nftData.nft?.cached_file_url ? ipfsToHttpUrl(nftData.nft.cached_file_url) : null,
    ].filter(url => url !== undefined && url !== null); // Filter out undefined or null values
    
     // If there's nothing to scan, consider the NFT not secure
     if (urlsToScan.length === 0) {
      return true;
    }
  
    const scanResults = await Promise.all(urlsToScan.map(url => scanUrlForMalware(url)));
      // Analyze the scan results and return security status
    if(scanResults && scanResults.length > 0) {
      scanResults.every(result => {
        if(result && result.malicious) {
          return true;
        }
      });
    }

    return false;
  } catch (error) {
    console.error('Error while checkNftDataForMallware ', error)
    return false;
  }
 
}

// ************************************ analyzeNftCreator AND HELEPR FUNCTIONS WORKS WITH ETHER API **************************************
async function analyzeNftCreator(contractAddress, tokenId) {
  const creatorAndTransaction = await getNftCreatorAndTransactionHash(contractAddress, tokenId);
  const creatorAddress = creatorAndTransaction.creatorAddress;
  const transactionHash = creatorAndTransaction.transactionHash;

  const creatorTransactionCount = await getTransactionCount(creatorAddress);
  const transactionDetails = await getTransactionDetails(transactionHash);

  console.log(`Creator address: ${creatorAddress}`);
  console.log(`Transaction hash: ${transactionHash}`);
  console.log(`Creator transaction count: ${creatorTransactionCount}`);
  console.log(`Transaction details:`, transactionDetails);
}

async function getNftCreatorAndTransactionHash(contractAddress, tokenId) {
  const apiUrl = `https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress=${contractAddress}&startblock=0&endblock=999999999&sort=asc&apikey=${etherscanApiKey}`;

  try {
    const response = await axios.get(apiUrl);
    const transactions = response.data.result;
    const nftTransaction = transactions.find(tx => tx.tokenID === tokenId);

    if (nftTransaction) {
      return {
        creatorAddress: nftTransaction.from,
        transactionHash: nftTransaction.hash,
      };
    } else {
      console.error(`Could not find transaction for token ID: ${tokenId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching NFT transaction data: ${error.message}`);
    return null;
  }
}

async function getTransactionCount(address) {
  const response = await axios.get(`https://api.etherscan.io/api`, {
    params: {
      module: 'account',
      action: 'txlist',
      address: address,
      startblock: 0,
      endblock: 99999999,
      sort: 'asc',
      apikey: etherscanApiKey
    }
  });

  return response.data.result.length;
}

async function getTransactionDetails(transactionHash) {
  const response = await axios.get(`https://api.etherscan.io/api`, {
    params: {
      module: 'proxy',
      action: 'eth_getTransactionByHash',
      txhash: transactionHash,
      apikey: etherscanApiKey
    }
  });

  return response.data.result;
}


module.exports = { checkSiteSecurity, checkNftSecurity };
