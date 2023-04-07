const ethers = require('ethers');
const fetch = require('node-fetch');
const axios = require('axios');

async function checkSiteSecurity() {
  const domain = window.location.hostname;

   // Check if site has SSL
   const hasSsl = window.location.protocol === "https:";

  const isReal = await fetch(`https://isitarealemail.com/api/email/validate`, {
    method: "POST",
    body: JSON.stringify({ email: domain }),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());

  // Check if site is blacklisted
  const isBlacklisted = await fetch(`https://my-blacklist-api.com/check?domain=${domain}`)
    .then((res) => res.json())
    .then((data) => data.isBlacklisted);

  return {
    domain: domain,
    isReal: isReal.data.isReal,
    hasSsl: hasSsl,
    isBlacklisted: isBlacklisted,
  };
}


//

async function checkNftSecurity(nftContractAddress, tokenId) {
  // Get NFT metadata
    // Fetch NFT metadata using an appropriate API or service
    // For example, you can use OpenSea API: https://docs.opensea.io/reference

    const apiKey = 'your-opensea-api-key';
    const url = `https://api.opensea.io/api/v1/asset/${nftContractAddress}/${tokenId}/?api_key=${apiKey}`;
    const response = await fetch(url);
    const openseaData = await response.json();
    
    console.log(openseaData)

    // cehck history and ownership
    // const checkHistory = checkHashHistory(openseaData)

    // todo duplicated image check ? 
    // checkDuplicatedImage()

   // Check if image contains malware
   // const isMalware = await checkImageMalware(metadataJson.image);

   // Return NFT security check results
  return {
    checkHistory: checkHistory || true,
    isMalware: isMalware || false,
  };
}



async function checkHashHistory(openseaData) {
  try {
    // Get the contract instance
    // todo add API
    const infura_api = '';
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');
    const contract = new ethers.Contract(nftContractAddress, ['function ownerOf(uint256 tokenId) view returns (address)'], provider);

    // Get the current owner
    const currentOwner = await contract.ownerOf(tokenId);

    // Check if the NFT owner from OpenSea API matches the owner from the blockchain
    if (openseaData.owner.address.toLowerCase() !== currentOwner.toLowerCase()) {
      return false;
    }

    // Add any additional checks for the hash history here

    return true;
  } catch (error) {
    console.error('Error in checkHashHistory:', error);
    return false;
  }
};



async function checkDuplicatedImage (imageUrl) {
    //https://services.tineye.com/TinEye/api/pricing. check
  try {
    const tineyeUrl = 'https://api.tineye.com/rest/search/';
    const params = {
      url: imageUrl,
      api_key: 'YOUR_TINEYE_API_KEY',
    };

    const response = await axios.post(tineyeUrl, null, { params });
    const data = response.data;

    // Check the number of matches found
    const matchCount = data.result.total_results;

    // Set a threshold for matches to consider the image as duplicated
    const duplicateThreshold = 5;

    if (matchCount > duplicateThreshold) {
      return false; // Image is duplicated
    } else {
      return true; // Image is not duplicated
    }
  } catch (error) {
    console.error('Error in checkDuplicatedImage:', error);
    return false;
  }
};



async function checkImageMalware(url) {
     // Check if the image contains malware using an appropriate API or service
    // You may need to use a third-party malware scanning service
    // Return true if the image is clean, otherwise return false
   // https://developers.virustotal.com/reference#getting-started.
   try {
    const virustotalUrl = 'https://www.virustotal.com/api/v3/urls';
    const headers = {
      'x-apikey': 'YOUR_VIRUSTOTAL_API_KEY',
    };
    

    // Submit the URL for analysis
    const submitResponse = await axios.post(virustotalUrl, { url: imageUrl }, { headers });
    const id = submitResponse.data.data.id;

    // Wait for the analysis to complete (use a delay or polling)
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Get the analysis results
    const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${id}`;
    const analysisResponse = await axios.get(analysisUrl, { headers });
    const analysisData = analysisResponse.data;

    // Check if any engines detected malware
    const engines = analysisData.data.attributes.results;
    const malwareDetected = Object.values(engines).some((engine) => engine.category === 'malicious');

    if (malwareDetected) {
      return false; // Image contains malware
    } else {
      return true; // Image is clean
    }
  } catch (error) {
    console.error('Error in checkMalware:', error);
    return false;
  }

}





export { checkSiteSecurity, checkNftSecurity };
