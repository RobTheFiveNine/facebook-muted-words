/* eslint-disable no-undef */
export function messageHandler(request, sender, sendResponse) {
  if (request.method === 'getLocalStorage') {
    const response = {};

    for (let i = 0; i < request.keys.length; i += 1) {
      response[request.keys[i]] = localStorage.getItem(request.keys[i]);
    }

    sendResponse({ data: response });
  } else if (request.method === 'setLocalStorage') {
    localStorage.setItem(request.key, request.value);
    sendResponse();
  }
}

if (typeof chrome === 'undefined') {
  global.chrome = {
    runtime: {
      onMessage: {
        addListener: () => {},
      },
    },
  };
}

chrome.runtime.onMessage.addListener(messageHandler);

export default messageHandler;
