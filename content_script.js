const observerConfig = { attributes: false, childList: true, subtree: false };

function observeNewsFeed() {
  let target = document.querySelector('[role="feed"]');

  if (!target) {
    target = document.getElementById('contentArea');
  }

  if (!target) {
    return false;
  }

  const observer = new MutationObserver(() => {
    console.log('feed changed');
  });

  observer.observe(target, observerConfig);

  return true;
}

function observeBodyForFeed() {
  const body = document.querySelector('body');
  const observer = new MutationObserver(() => {
    if (observeNewsFeed()) {
      observer.disconnect();
    }
  });

  observer.observe(body, observerConfig);
}

export default function run() {
  if (!observeNewsFeed()) {
    observeBodyForFeed();
  }
}

if (process.env.NODE_ENV !== 'TEST') {
  run();
}
