import React, { useState, useEffect } from 'react';
import "./CheckSiteSecurity.css"
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';

export const CheckSiteSecurity = ({ onLoading }) => {
  const [siteStatus, setSiteStatus] = useState(''); // warning error success
  const [siteInfo, setSiteInfo] = useState('');
  const [siteCheckInfo, setSiteCheckInfo] = useState({ssl : true, mallwareFree : true});
  const [loading, setLoading] = useState(false);

  const getCurrentTab = async () => {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        resolve(tab);
      });
    });
  };

  useEffect(() => {
    const fetchStoredStatus = async () => {
      const currentTab = await getCurrentTab();
      // Retrieve stored siteStatus for the current tab
      const domain = new URL(currentTab.url).origin;

      chrome.storage.local.get(`siteCheckInfo_${domain}`, (data1) => {
        if (data1[`siteCheckInfo_${domain}`]) {
          const data = JSON.parse(data1[`siteCheckInfo_${domain}`])
          setSiteCheckInfo({ssl: data.ssl, mallwareFree: data.mallwareFree});
        }
      });


      chrome.storage.local.get(`siteStatus_${domain}`, (data2) => {
        if (data2[`siteStatus_${domain}`]) {
          setSiteStatus(data2[`siteStatus_${domain}`]);
        }else{
          performSecurityChecks(domain, currentTab.id);
        }
      });

    };
    fetchStoredStatus();
  }, []);

  const performSecurityChecks = async (url, tabId) => {
    try {
        // Extract domain from URL
        setLoading(true);
        onLoading(true);
        setSiteStatus('');
        setSiteInfo('Site in check...');
        chrome.tabs.sendMessage(tabId, { action: 'firstWarning'});
        const response = await fetch(`${process.env.REACT_APP_BACKEDN_URL}/checkSiteSecurity?url=${url}`);
        const data = await response.json();
        const status = data.ssl && data.mallwareFree ? 'success' : 'error';
        setSiteCheckInfo({ssl: data.ssl, mallwareFree: data.mallwareFree})
        setSiteStatus(status);
     
        // Add injected banner into webpage
        chrome.tabs.sendMessage(tabId, { action: 'injectWarning' , secure: data.ssl && data.mallwareFree});

        // Store siteStatus
        chrome.storage.local.set({ [`siteStatus_${url}`]: status });
        chrome.storage.local.set({ [`siteCheckInfo_${url}`]: JSON.stringify(siteCheckInfo)});
    
    }catch(e) {
        console.error('Error while perfoem security check ' ,e)
        setSiteStatus('');
        chrome.storage.local.set({ [`siteStatus_${url}`]: '' });
        chrome.storage.local.set({ [`siteCheckInfo_${url}`]: JSON.stringify(siteCheckInfo)});
        // Add injected banner into webpage
        chrome.tabs.sendMessage(tabId, { action: 'removeWarning' });
    }finally{
        setLoading(false);
        onLoading(false);
        setSiteInfo('');
    }
   
  };

  const handleButtonClick = async () => {
    const currentTab = await getCurrentTab();
    const domain = new URL(currentTab.url).origin;
    performSecurityChecks(domain, currentTab.id);
  };


  const ListItem = ({ text, completed }) => {
    return (
      <li className="list-item">
        {completed ? <span>&#10003;</span> : null} {text}
      </li>
    );
  };



  const ListWithIcons = ({ssl, mallware}) => {
    const items = [
      { text: ssl ? 'Site has valid ssl' : 'Site has not valid ssl', completed: ssl},
      { text: mallware ? 'Site not contains mallware' : 'Site could contain mallware', completed: mallware},
      { text: ssl && mallware ? 'Site is secure to use' : 'Site could be harmful', completed: ssl && mallware},
    ];
  
    return (
      <ul className="list-container">
        {items.map((item, index) => (
          <ListItem key={index} text={item.text} completed={item.completed} />
        ))}
      </ul>
    );
  };


  return (
    <div className='check-site-security'>
      <div className='in-header'>
        <h2>Site Status</h2>
      </div>
     
  
      {loading ? (
        <div class="result-security">
          <p>Checking site security, please wait...</p>
          <LinearProgress color="success" />
        </div>
      ): siteStatus != '' ? (
        <div class="nft-result-security">
          <ListWithIcons ssl={siteCheckInfo.ssl} mallware={siteCheckInfo.mallwareFree}/>
        </div>
      ) : (
        <div class="result-security">
          <p>{siteInfo}</p>
        </div>
      )}
      <Button 
        variant="contained" 
        color="primary" 
        size="small"
        onClick={handleButtonClick} disabled={loading}>
          Check Site Security
        </Button>
    </div>
  );
};
