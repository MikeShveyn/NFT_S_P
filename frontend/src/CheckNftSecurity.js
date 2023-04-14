import React, { useState, useEffect } from 'react';
import "./CheckNftSecurity.css"
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';


export const CheckNftSecurity = () => {
        const [nftStatus, setNftStatus] = useState('');
        const [contractAddress, setContractAddress] = useState('');
        const [tokenId, setTokenId] = useState('');
        const [loading, setLoading] = useState(false);
      
        const extractNftDataFromUrl = async (tab) => {
          const url = new URL(tab.url);
          const pathMatch = url.pathname.match(/\/assets\/([^\/]+\/)?([^\/]+)\/(\d+)/);
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
          try {
            setLoading(true)
            const response = await fetch(`http://localhost:4001/checkNftSecurity?contractAddress=${contractAddress}&tokenId=${tokenId}`);
            const data = await response.json();
            setNftStatus(data.isSecure ? 'NFT is secure.' : 'NFT is not secure.');
          } catch (error) {
            console.error('Error while perform nft security check ', error)
          }finally {
            setLoading(false)
          }
       
        };
      
        return (
          <div className='check-nft-security'>
            <h2>NFT Status</h2>
            <p class='bold'>Contract Address: {contractAddress}</p>
            <p class='bold'>Token ID: {tokenId}</p>
            {loading ? (
             <div class="nft-result-security">
                <p>Checking NFT security, please wait...</p>
                <LinearProgress color="success" />
              </div>
            ) : (
              <div class="nft-result-security">
                <p>{nftStatus}</p>
              </div>
            )}
             <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={performNftSecurityChecks} disabled={loading || !tokenId || !contractAddress}>  
               Check NFT Security
            </Button>
          </div>
        );
};