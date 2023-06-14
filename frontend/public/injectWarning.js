function createWarningBanner(color, text) {
  const banner = document.createElement('div');
  banner.id = 'extension-warning-banner';
  banner.style.position = 'fixed';
  banner.style.top = '0';
  banner.style.left = '0';
  banner.style.width = '100%';
  banner.style.backgroundColor = color;
  banner.style.color = 'white';
  banner.style.zIndex = '99999';
  banner.style.textAlign = 'center';
  banner.style.padding = '10px';
  banner.innerText = text;
  return banner;
}

function injectWarningBanner(color, text) {
  const banner = createWarningBanner(color, text);
  document.body.prepend(banner);
}

function removeWarningBanner() {
  const banner = document.getElementById('extension-warning-banner');
  if (banner) {
    banner.remove();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectWarning') {
    removeWarningBanner()
    const color = message.secure ? '#54B435' : 'red'
    const text = message.secure 
    ? 'This website is secure. More information can be found inside extention.'
    : 'Warning: This website may contain malware. It is recommended to disable other extensions or avoid visiting this website.'
    injectWarningBanner(color, text);
  } else if(message.action === 'firstWarning') {
    removeWarningBanner()
    this.injectWarningBanner('#537FE7', 'We perform security check... Please do not perform any actions till we have full report.')
  } else if (message.action === 'injectNftWarning') {
    removeWarningBanner()
    const color = message.secure ? '#54B435' : 'red'
    const text = message.secure 
    ? 'This NFT asset is secure. More information can be found inside extention.'
    : 'Warning: This NFT asset may contain malware. It is recommended to disable other extensions or avoid working with this asset.'
    injectWarningBanner(color, text);
    setTimeout(()=>{
      removeWarningBanner()
    },10000)
  } else if(message.action === 'removeWarning') {
    removeWarningBanner()
  }
});

