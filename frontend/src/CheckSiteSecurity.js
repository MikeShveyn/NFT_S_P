import React, { useState, useEffect } from 'react';
import "./CheckSiteSecurity.css"
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

export const CheckSiteSecurity = () => {
  const [siteStatus, setSiteStatus] = useState('warning'); // warning error success
  const [siteInfo, setSiteInfo] = useState('Site in check...');
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
      chrome.storage.local.get(`siteStatus_${currentTab.id}`, (data) => {
        if (data[`siteStatus_${currentTab.id}`]) {
          setSiteStatus(data[`siteStatus_${currentTab.id}`]);
        }
      });
    
      if(!siteStatus) {
        performSecurityChecks(currentTab.url, currentTab.id);
      }
    
    };

    fetchStoredStatus();
  }, []);

  const performSecurityChecks = async (url, tabId) => {
    try {
        setLoading(true);
        setSiteStatus('warning');
        setSiteInfo('Site in check...');
        chrome.tabs.sendMessage(tabId, { action: 'firstWarning'});
        const response = await fetch(`${process.env.REACT_APP_BACKEDN_URL}/checkSiteSecurity?url=${url}`);
        const data = await response.json();
        const status = data.isSecure ? 'success' : 'error';
        const info =  data.info;
        setSiteStatus(status);
     
        // Add injected banner into webpage
        chrome.tabs.sendMessage(tabId, { action: 'injectWarning' , secure: data.isSecure});
       
        // Store siteStatus
        chrome.storage.local.set({ [`siteStatus_${tabId}`]: status });

    }catch(e) {
        console.error('Error while perfoem security check ' ,e)
    }finally{
        setLoading(false);
    }
   
  };

  const handleButtonClick = async () => {
    const currentTab = await getCurrentTab();
    console.log('current tab ', currentTab);
    performSecurityChecks(currentTab.url, currentTab.id);
  };


  const ListItem = ({ text, completed }) => {
    return (
      <li className="list-item">
        {completed ? <span>&#10003;</span> : null} {text}
      </li>
    );
  };



  const ListWithIcons = ({c1, c2, c3}) => {
    const items = [
      { text: 'Site has valid ssl', completed: c1},
      { text: 'Site not contains mallware.', completed: c2},
      { text: 'Site not in black list', completed: c3},
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
        <Alert className={'allertMe'} severity={siteStatus}>
           Check info below
        </Alert>
      </div>
     
  
      {loading ? (
        <div class="result-security">
          <p>Checking site security, please wait...</p>
          <LinearProgress color="success" />
        </div>
      ): siteStatus === 'success' ? (
        <div class="nft-result-security">
          <ListWithIcons c1={true} c2={true} c3={true}/>
        </div>
      ): siteStatus === 'error' ? (
        <div class="nft-result-security">
          <ListWithIcons c1={false} c2={false} c3={false}/>
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
