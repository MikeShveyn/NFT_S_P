import React, { useState, useEffect } from 'react';

export const CheckSiteSecurity = () => {
  const [siteStatus, setSiteStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const performSecurityChecks = async (url) => {
    setLoading(true);
    const response = await fetch(`http://localhost:4001/checkSiteSecurity?url=${url}`);
    const data = await response.json();
    setSiteStatus(data.isSecure ? 'Site is secure.' : 'Site is not secure.');
    setLoading(false);
  };

  const handleButtonClick = async () => {
    const currentTab = await new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
        resolve(tab);
      });
    });
    console.log('current tab ', currentTab);
    performSecurityChecks(currentTab.url);
  };

  return (
    <div className='check-site-security'>
      <h2>Site Status</h2>
      {loading ? (
        <p>Checking site security, please wait...</p>
      ) : (
        <p>{siteStatus}</p>
      )}
      <button onClick={handleButtonClick} disabled={loading}>
        Check Site Security
      </button>
    </div>
  );
};


export const CheckNftSecurity = () => {
        const [nftStatus, setNftStatus] = useState('');
        const [contractAddress, setContractAddress] = useState('');
        const [tokenId, setTokenId] = useState('');
      
        const extractNftDataFromUrl = async (tab) => {

          console.log('PATH MATCH check start: ', tab)

          const url = new URL(tab.url);
          const pathMatch = url.pathname.match(/\/assets\/([^\/]+\/)?([^\/]+)\/(\d+)/);
          
          console.log('PATH MATCH check end: ', pathMatch)

          if (pathMatch) {
            setContractAddress(pathMatch[2]);
            setTokenId(pathMatch[3]);
          } else {
            setContractAddress('');
            setTokenId('');
          }
        };
      
        useEffect(() => {
          const getCurrentTab = async () => {
            const currentTab = await new Promise((resolve) => {
              chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                resolve(tab);
              });
            });
            extractNftDataFromUrl(currentTab);
          };
      
          getCurrentTab();
      
          const handleTabUpdated = (tabId, changeInfo, tab) => {
            if (tab.active && changeInfo.url) {
              extractNftDataFromUrl(tab);
            }
          };
      
          chrome.tabs.onUpdated.addListener(handleTabUpdated);
      
          return () => {
            chrome.tabs.onUpdated.removeListener(handleTabUpdated);
          };
        }, []);
      
        const performNftSecurityChecks = async () => {
          const response = await fetch(`http://localhost:4001/checkNftSecurity?contractAddress=${contractAddress}&tokenId=${tokenId}`);
          const data = await response.json();
          setNftStatus(data.isSecure ? 'NFT is secure.' : 'NFT is not secure.');
        };
      
        return (
          <div className='check-nft-security'>
            <p>Contract Address: {contractAddress}</p>
            <p>Token ID: {tokenId}</p>
            <button onClick={performNftSecurityChecks}>Check NFT Security</button>
            <p>{nftStatus}</p>
          </div>
        );
      };