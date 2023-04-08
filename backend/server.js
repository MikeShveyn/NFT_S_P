const express = require('express');
const cors = require('cors');
const { checkNftSecurity, checkSiteSecurity } = require('./nft');
var url = require('url');

const app = express();
app.use(cors());

app.get('/checkSiteSecurity', async (req, res) => {
  const {url} = req.query;
  // Implement checkSiteSecurity logic here
  console.log('URL TO BEC CHECKED: ', url)
  const {protocol} = getFormattedUrl(url);
  const result = await checkSiteSecurity(protocol, url)
  console.log(result)
  res.json({ isSecure: !result.mallware && result.hasSsl }); // Replace with actual result
});

app.get('/checkNftSecurity', async (req, res) => {
    const { contractAddress, tokenId } = req.query;
  
    if (!contractAddress || !tokenId) {
      res.status(400).json({ error: 'Missing required query parameters: contractAddress and tokenId.' });
      return;
    }
  
    // Implement checkNftSecurity logic here
    const result = await checkNftSecurity(contractAddress , tokenId)
  
    res.json({ isSecure: result.checkHistory && !result.isMalware }); // Replace with actual result
  });

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


function getFormattedUrl(url) {
  const myUrl = new URL(url);
  return {
    protocol: myUrl.protocol,
    host: myUrl.hostname
  }
}