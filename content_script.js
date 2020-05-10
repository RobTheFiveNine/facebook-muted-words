const observerConfig = { attributes: false, childList: true, subtree: false };

class Scanner {
  constructor() {
    this.muted = [];
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
