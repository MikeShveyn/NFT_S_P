function createWarningBanner() {
  const banner = document.createElement('div');
  banner.id = 'extension-warning-banner';
  banner.style.position = 'fixed';
  banner.style.top = '0';
  banner.style.left = '0';
  banner.style.width = '100%';
  banner.style.backgroundColor = 'red';
  banner.style.color = 'white';
  banner.style.zIndex = '99999';
  banner.style.textAlign = 'center';
  banner.style.padding = '10px';
  banner.innerText = 'Warning: This website may contain malware. It is recommended to disable other extensions or avoid visiting this website.';
  return banner;
}

function injectWarningBanner() {
  const banner = createWarningBanner();
  document.body.prepend(banner);
}

function removeWarningBanner() {
  const banner = document.getElementById('extension-warning-banner');
  if (banner) {
    banner.remove();
  }
}

console.log('I am alive !!!!')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'injectWarning') {
    injectWarningBanner();
  } else if (message.action === 'removeWarning') {
    injectWarningBanner(); // tests
    //removeWarningBanner();
  }
});

