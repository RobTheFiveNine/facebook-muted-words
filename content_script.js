const observerConfig = { attributes: false, childList: true, subtree: true };

class Scanner {
  constructor() {
    this.muted = [];
    this.newsfeedObserver = null;

    this.processNewPosts = this.processNewPosts.bind(this);
    this.observeNewsFeed = this.observeNewsFeed.bind(this);
    this.observeBodyForFeed = this.observeBodyForFeed.bind(this);
    this.start = this.start.bind(this);
    this.loadSettings = this.loadSettings.bind(this);
  }

  processNewPosts(target) {
    const newItems = target.querySelectorAll('[data-pagelet="FeedUnit_{n}"]:not(.checked-for-muted-words), [role="article"]:not(.checked-for-muted-words)');

    for (let i = 0; i < newItems.length; i += 1) {
      for (let wi = 0; wi < this.muted.length; wi += 1) {
        if (newItems[i].innerText.toLowerCase().includes(this.muted[wi])) {
          newItems[i].style.display = 'none';
          break;
        }
      }

      newItems[i].classList.add('checked-for-muted-words');
    }
  }

  observeNewsFeed() {
    let target = document.querySelector('[role="feed"]');

    if (!target) {
      target = document.getElementById('contentArea');
    }

    if (!target) {
      return false;
    }

    if (this.newsfeedObserver) {
      this.newsfeedObserver.disconnect();
    }

    const observer = new MutationObserver(() => this.processNewPosts(target));
    observer.observe(target, observerConfig);

    this.newsfeedObserver = observer;

    return true;
  }

  observeBodyForFeed() {
    const body = document.querySelector('body');
    const observer = new MutationObserver(() => {
      if (this.observeNewsFeed()) {
        observer.disconnect();
      }
    });

    observer.observe(body, observerConfig);
  }

  async loadSettings() {
    const self = this;

    return new Promise((resolve) => {
      // eslint-disable-next-line no-undef
      chrome.runtime.sendMessage({ method: 'getLocalStorage', keys: ['wordlistUrl', 'muted'] }, async (response) => {
        const { wordlistUrl } = response.data;
        const wordlistString = response.data.muted;

        if (wordlistString) {
          self.muted = JSON.parse(wordlistString);
        }

        if (wordlistUrl) {
          chrome.runtime.sendMessage({ method: 'fetchWordlist' }, (text) => {
            try {
              const wordlist = text.split('\n');

              for (let i = 0; i < wordlist.length; i += 1) {
                wordlist[i] = wordlist[i].replace('\r', '');
              }

              self.muted = wordlist.filter((w) => w !== '');

              // eslint-disable-next-line no-undef
              chrome.runtime.sendMessage({
                method: 'setLocalStorage',
                key: 'muted',
                value: JSON.stringify(self.muted),
              });
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e);
            }

            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  }

  start() {
    if (!this.observeNewsFeed()) {
      this.observeBodyForFeed();
    }
  }
}

if (process.env.NODE_ENV !== 'TEST') {
  const scanner = new Scanner();
  scanner.loadSettings().then(() => scanner.start());

  let previousUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== previousUrl) {
      previousUrl = window.location.href;
      setTimeout(() => scanner.start(), 1000);
    }
  }, 1000);
}

export default Scanner;
