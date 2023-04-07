const express = require('express');
const cors = require('cors');
import { checkNftSecurity, checkSiteSecurity } from './nft';

const app = express();
app.use(cors());

app.get('/checkSiteSecurity', async (req, res) => {
  // Implement checkSiteSecurity logic here
  const result = await checkSiteSecurity()
  res.json({ isSecure: result.isReal && result.hasSsl && !result.isBlacklisted }); // Replace with actual result
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
