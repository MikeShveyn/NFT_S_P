import React, { useState, useEffect } from 'react';
import "./CheckNftSecurity.css"
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';

export const CheckNftSecurity = () => {
        const [nftStatus, setNftStatus] = useState('warning');
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
            chrome.storage.local.get(`nftStatus_${tab.id}`, (data) => {
            if (data[`nftStatus_${tab.id}`]) {
              setNftStatus(data[`nftStatus_${tab.id}`]);
            }
          });
          } else {
            setContractAddress('');
            setTokenId('');
            setNftInfo('Please open specific nft asset screen')
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
            chrome.tabs.sendMessage(tabId, { action: 'firstWarning'});
            const response = await fetch(`${process.env.REACT_APP_BACKEDN_URL}/checkNftSecurity?contractAddress=${contractAddress}&tokenId=${tokenId}`);
            const data = await response.json();
            const status = data.isSecure ? 'success' : 'error';
            const info = data.isSecure ? 'Nft is secure' : 'Nft is not secure';
            setNftStatus(status);
            setNftInfo(info)

            // Add injected banner into webpage
            chrome.tabs.sendMessage(tabId, { action: 'injectNftWarning' , secure: data.isSecure});
            

              // Store siteStatus
            chrome.storage.local.set({ [`nftStatus_${tabId}`]: status });

          } catch (error) {
            console.error('Error while perform nft security check ', error)
          }finally {
            setLoading(false)
          }
       
        };


        const handleButtonClick = async () => {
          const currentTab = await getCurrentTab();
          console.log('current tab ', currentTab);
          performNftSecurityChecks(currentTab.url, currentTab.id);
        };



        const ListItem = ({ text, completed }) => {
          console.log(text, completed)
          return (
            <li className="list-item">
              {completed ? <span>&#10003;</span> : null} {text}
            </li>
          );
        };



        const ListWithIcons = ({c1, c2, c3}) => {
          const items = [
            { text: 'NFT links are secure', completed: c1},
            { text: 'NFT owner is verified', completed: c2},
            { text: 'NFT Asset exists and real', completed: c3},
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
              <Alert className={'allertMe'} severity={nftStatus}>
                  Check info below
              </Alert>
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