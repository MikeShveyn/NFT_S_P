import React, { useState, useEffect } from 'react';
import "./CheckSiteSecurity.css"
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';


export const CheckSiteSecurity = () => {
  const [siteStatus, setSiteStatus] = useState('');
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
    };

    fetchStoredStatus();
  }, []);

  const performSecurityChecks = async (url, tabId) => {
    try {
        setLoading(true);
        const response = await fetch(`http://localhost:4001/checkSiteSecurity?url=${url}`);
        const data = await response.json();
        const status = data.isSecure ? 'Site is secure.' : 'Site is not secure.';
        setSiteStatus(status);

        // Add or Remove injected banner into webpage
        if (data.isSecure) {
          chrome.tabs.sendMessage(tabId, { action: 'removeWarning' });
        } else {
          chrome.tabs.sendMessage(tabId, { action: 'injectWarning' });
        }

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


  return (
    <div className='check-site-security'>
      <h2>Site Status</h2>
      {loading ? (
        <div class="result-security">
          <p>Checking site security, please wait...</p>
          <LinearProgress color="success" />
        </div>
      ) : (
        <div class="result-security">
          <p>{siteStatus}</p>
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
