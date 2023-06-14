import React, { useState, useEffect } from 'react';
import "./CheckNftSecurity.css"
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';


export const CheckNftSecurity = ({ onLoading }) => {
        const [nftStatus, setNftStatus] = useState('');
        const [nftInfo, setNftInfo] = useState('');
        const [contractAddress, setContractAddress] = useState('');
        const [tokenId, setTokenId] = useState('');
        const [loading, setLoading] = useState(false);
      
        const extractNftDataFromUrl = async (tab) => {
          const url = new URL(tab.url);
          const pathMatch = url.pathname.match(/(assets|app|itemdetail)\/([^\/]+\/)?([^\/]+)\/(\d+)/);
          if (pathMatch) {
            setContractAddress(pathMatch[3]);
            setTokenId(pathMatch[4]);
            setNftInfo('')

            // Retrieve stored siteStatus for the current tab
            chrome.storage.local.get(`nftStatus_${tab.url}`, (data) => {
            if (data[`nftStatus_${tab.url}`]) {
              setNftStatus(data[`nftStatus_${tab.url}`]);
            }
          });
          } else {
            setContractAddress('');
            setTokenId('');
            setNftInfo('Please open specific NFT asset screen')
          }
        };


        const getCurrentTab = async () => {
          return new Promise((resolve) => {
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
              resolve(tab);
            });
          });
        };
      
        useEffect(() => {
          const getCurrentTabAndExtract = async () => {
            const currentTab = await new Promise((resolve) => {
              chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                resolve(tab);
              });
            });
            extractNftDataFromUrl(currentTab);
          };
      
          getCurrentTabAndExtract();
      
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
      
        const performNftSecurityChecks = async (url, tabId) => {
          try {
            setLoading(true)
            onLoading(true)
            chrome.tabs.sendMessage(tabId, { action: 'firstWarning'});
            const response = await fetch(`${process.env.REACT_APP_BACKEDN_URL}/checkNftSecurity?contractAddress=${contractAddress}&tokenId=${tokenId}`);
            const data = await response.json();
            if(!data) {
              throw Error('failed to check');
            }
            const status = data.isSecure ? 'success' : 'error';
            const info = data.isSecure ? 'Nft is secure' : 'Nft is not secure';
            setNftStatus(status);
            setNftInfo(info)

            // Add injected banner into webpage
            chrome.tabs.sendMessage(tabId, { action: 'injectNftWarning' , secure: data.isSecure});
            

              // Store siteStatus
            chrome.storage.local.set({ [`nftStatus_${url}`]: status });

          } catch (error) {
            console.error('Error while perform nft security check ', error)
            // Add injected banner into webpage
            chrome.tabs.sendMessage(tabId, { action: 'removeWarning' });
            // Store siteStatus
            chrome.storage.local.set({ [`nftStatus_${url}`]: '' });
          }finally {
            setLoading(false)
            onLoading(false)
          }
       
        };


        const handleButtonClick = async () => {
          const currentTab = await getCurrentTab();
          performNftSecurityChecks(currentTab.url, currentTab.id);
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
            { text: c1 ? 'NFT links are secure' : 'NFT links could contain mallware', completed: c1},
            { text: c2? 'NFT owner is verified' : 'NFT owner not verified', completed: c2},
            { text: c1 && c2 ? 'NFT Asset exists and real' : 'NFT Asset could be fake', completed: c3},
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
          <div className='check-nft-security'>
            <div className='in-header'>
              <h2>NFT Status</h2>
            </div>
          
            <p class='bold'>Contract Address: {contractAddress}</p>
            <p class='bold'>Token ID: {tokenId}</p>
            {loading ? (
             <div class="nft-result-security">
                <p>Checking NFT security, please wait...</p>
                <LinearProgress color="success" />
              </div>
            ) : nftStatus === 'success' ? (
              <div class="nft-result-security">
                <ListWithIcons c1={true} c2={true} c3={true}/>
              </div>
            ): nftStatus === 'error' ? (
              <div class="nft-result-security">
                <ListWithIcons c1={false} c2={false} c3={false}/>
              </div>
            ): (
              <div class="nft-result-security">
              <p>{nftInfo}</p>
            </div>
            )}
             <Button 
              variant="contained" 
              color="primary"
              size="small"
              onClick={handleButtonClick} disabled={loading || !tokenId || !contractAddress}>  
               Check NFT Security
            </Button>
          </div>
        );
};