const observerConfig = { attributes: false, childList: true, subtree: false };

class Scanner {
  constructor() {
    this.muted = [];

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

    const observer = new MutationObserver(() => this.processNewPosts(target));
    observer.observe(target, observerConfig);

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
    const wordlistUrl = localStorage.getItem('wordlistUrl');
    const wordlistString = localStorage.getItem('muted');

    if (wordlistString) {
      this.muted = JSON.parse(wordlistString);
    }

    if (wordlistUrl) {
      try {
        const res = await fetch(wordlistUrl);
        const text = await res.text();
        const wordlist = text.split('\n');

        for (let i = 0; i < wordlist.length; i += 1) {
          wordlist[i] = wordlist[i].replace('\r', '');
        }

        this.muted = wordlist;
        localStorage.setItem('muted', JSON.stringify(this.muted));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
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
}

export default Scanner;
