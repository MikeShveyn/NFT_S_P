import React, { useState } from 'react';

export const CheckSiteSecurity = () => {
  const [siteStatus, setSiteStatus] = useState('');

  const performSecurityChecks = async () => {
    const response = await fetch('http://localhost:4001/checkSiteSecurity');
    const data = await response.json();
    setSiteStatus(data.isSecure ? 'Site is secure.' : 'Site is not secure.');
  };

  return (
    <div>
      <button onClick={performSecurityChecks}>Check Site Security</button>
      <p>{siteStatus}</p>
    </div>
  );
};


/**
 * 
    Now, you can test your extension using a real example from OpenSea:

    1 Find an NFT on OpenSea, and copy its contract address and token ID.
    2 Run your extension and enter the contract address and token ID in the input fields.
    3 Click the "Check NFT Security" button to perform the security checks.
 */
 

export const CheckNftSecurity = () => {
        const [nftStatus, setNftStatus] = useState('');
        const [contractAddress, setContractAddress] = useState('');
        const [tokenId, setTokenId] = useState('');
      
        const extractNftDataFromUrl = async (tab) => {
          const url = new URL(tab.url);
          const pathMatch = url.pathname.match(/\/assets\/(0x[a-fA-F0-9]{40})\/(\d+)/);
      
          if (pathMatch) {
            setContractAddress(pathMatch[1]);
            setTokenId(pathMatch[2]);
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
          <div>
            <p>Contract Address: {contractAddress}</p>
            <p>Token ID: {tokenId}</p>
            <button onClick={performNftSecurityChecks}>Check NFT Security</button>
            <p>{nftStatus}</p>
          </div>
        );
      };