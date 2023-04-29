const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { checkNftSecurity, checkSiteSecurity } = require('./nft');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/checkSiteSecurity', async (req, res) => {
  const {url} = req.query;

  console.log('URL TO BEC CHECKED: ', url)
  const {protocol} = getFormattedUrl(url);
  const result = await checkSiteSecurity(protocol, url)
  console.log(result)
  res.json({ isSecure: !result.mallware && result.hasSsl , info: result.info }); 
});

app.get('/checkNftSecurity', async (req, res) => {
    const { contractAddress, tokenId } = req.query;
    console.log('CONTRACT TO BE CHECKED: ',contractAddress, tokenId)
    if (!contractAddress || !tokenId) {
      res.status(400).json({ error: 'Missing required query parameters: contractAddress and tokenId.' });
      return;
    }
  
    const result = await checkNftSecurity(contractAddress , tokenId)
    console.log(result)
    res.json({ isSecure: !result.isMalware , info: result.info  });
  });


  app.post('/feedback', async(req, res) => {
    const feedback = req.body.feedback;
    console.log(feedback)
    res.status(200).send('Feedback received successfully');
  })


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