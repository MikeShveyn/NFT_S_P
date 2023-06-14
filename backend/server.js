const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { checkNftSecurity, checkSiteSecurity } = require('./nft');
const HttpError = require("./models/http-error");
const mongoose = require('mongoose');
const Feedback= require('./models/feedback');
const NftReport = require('./models/nftreport');

const app = express();

// middleware
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
})

app.get('/checkSiteSecurity', async (req, res) => {
  const {url} = req.query;

  console.log('URL TO BEC CHECKED: ', url)
  const {protocol} = getFormattedUrl(url);
  const result = await checkSiteSecurity(protocol, url)
  console.log(result)
  res.json({ mallwareFree: !result.mallware ,ssl: result.hasSsl }); 
});

app.get('/checkNftSecurity', async (req, res) => {
    const { contractAddress, tokenId } = req.query;
    console.log('CONTRACT TO BE CHECKED: ',contractAddress, tokenId)
    if (!contractAddress || !tokenId) {
      res.status(400).json({ error: 'Missing required query parameters: contractAddress and tokenId.' });
      return;
    }
  
    const result = await checkNftSecurity(contractAddress , tokenId)

    console.log(result.dbInfo)

    if(result.dbInfo) {
      const nftReport = new NftReport({
        chain: result.dbInfo?.chain || undefined,
        contract_address: result.dbInfo?.contract_address || undefined,
        token_id: result.dbInfo?.token_id || undefined,
        file_url: result.dbInfo?.file_url || undefined,
        file_size: result.dbInfo?.file_size || 0,
        mint_date: result.dbInfo?.mint_date || undefined,
        owner: result.dbInfo?.owner || undefined
    });
    
      nftReport.save()
      .then(() => {
        console.log('nftReport saved to database');
        mongoose.disconnect(); // Disconnect from the database
      })
      .catch(error => {
        console.error('Error saving nftReport to database:', error);
        mongoose.disconnect(); // Disconnect from the database
      });
  
    }
   
    res.json({ isSecure: !result.isMalware });
  });


  app.post('/feedback', async(req, res) => {
     // Create a new feedback object
     const feedback = new Feedback({
      text: req.body.feedback
    });
    console.log('feedback to save : ' , req.body.feedback)
    // Save the feedback object to the database
    feedback.save()
      .then(() => {
        console.log('Feedback saved to database');
        mongoose.disconnect(); // Disconnect from the database
      })
      .catch(error => {
        console.error('Error saving feedback to database:', error);
        mongoose.disconnect(); // Disconnect from the database
      });

    res.status(200).send('Feedback received successfully');
  })


  // error for unsupported routes
app.use((req, res, next)=>{
  const error = new HttpError('Could not find this route', 401)
  next(error)
})


// error case last rote !!!
app.use((error,req, res, next) => {
  if(res.headersSent) {
      return next(error);
  }
  res.status(error.code || 500);
  res.json({message : error.message || 'Unknown error occurred'})
})

mongoose.
connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5eeyj09.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`).
then(()=>{
  const PORT = process.env.PORT || 4001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err)=>{
  console.log(err);
})



function getFormattedUrl(url) {
  const myUrl = new URL(url);
  return {
    protocol: myUrl.protocol,
    host: myUrl.hostname
  }
}