import FetchMock from 'fetch-mock';
import Scanner from '../content_script';

let bodyDouble;
let feedDouble;
let contentAreaDouble;
let postsDouble;

function run() {
  const scanner = new Scanner();
  scanner.muted = ['horde', 'kawhii'];
  scanner.start();
}

const createDomMocks = ({ getElementById } = {}) => {
  const originalQuerySelector = document.querySelector;
  const originalMutationObserver = MutationObserver;
  const originalGetElementById = document.getElementById;
  const originalQuerySelectorAll = document.querySelectorAll;

  if (getElementById) {
    document.getElementById = getElementById;
  } else {
    document.getElementById = jest.fn();
  }

  document.querySelector = jest.fn((selector) => {
    switch (selector) {
      case '[role="feed"]':
        return feedDouble;

      case 'body':
        return bodyDouble;

      default:
        throw new Error(`Unknown selector specified: ${selector}`);
    }
  });

  document.querySelectorAll = jest.fn(() => postsDouble);

  window.MutationObserver = jest.fn();
  window.MutationObserver.instance = {
    disconnect: jest.fn(),
    observe: jest.fn(),
  };

  window.MutationObserver.mockImplementation(() => window.MutationObserver.instance);

  return () => {
    document.querySelector = originalQuerySelector;
    window.MutationObserver = originalMutationObserver;
    document.getElementById = originalGetElementById;
    document.querySelectorAll = originalQuerySelectorAll;
  };
};

let resetMocks;

beforeEach(() => {
  bodyDouble = {
    innerText: 'body double',
  };

  feedDouble = {
    innerText: 'news feed double',
    querySelectorAll: jest.fn(() => postsDouble),
  };

  contentAreaDouble = {
    innerText: 'content area double',
  };

  postsDouble = [
    document.createElement('div'),
    document.createElement('div'),
    document.createElement('div'),
    document.createElement('div'),
  ];

  postsDouble[0].innerText = 'For the Horde';
  postsDouble[1].innerText = 'For the Alliance';
  postsDouble[2].innerText = 'Caruso is the GOAT';
  postsDouble[3].innerText = 'Kawhii is the GOAT';

  resetMocks = createDomMocks({
    getElementById: jest.fn(() => contentAreaDouble),
  });

  FetchMock.mock('*', 'word1\r\nword2\r\nword3\r\nword4');
});

afterEach(() => {
  localStorage.clear();
  FetchMock.reset();
  resetMocks();
});

it('should load the muted words from local storage', async () => {
  localStorage.setItem('muted', '["foo", "bar"]');

  const scanner = new Scanner();
  await scanner.loadSettings();

  expect(scanner.muted).toEqual(['foo', 'bar']);
});

describe('if a wordlist URL is specified', () => {
  it('should pull the muted words from the URL', async () => {
    localStorage.setItem('wordlistUrl', 'http://localhost/mute.txt');

    const scanner = new Scanner();
    await scanner.loadSettings();

    expect(scanner.muted).toEqual(['word1', 'word2', 'word3', 'word4']);
  });

  it('should save a copy of the words to local storage', async () => {
    localStorage.setItem('wordlistUrl', 'http://localhost/mute.txt');
    expect(localStorage.getItem('muted')).toBeNull();

    const scanner = new Scanner();
    await scanner.loadSettings();

    expect(localStorage.getItem('muted')).toEqual(
      JSON.stringify(['word1', 'word2', 'word3', 'word4']),
    );
  });
});

it('should look for the news feed on launch and observe it if found', () => {
  run();
  expect(MutationObserver.instance.observe).toHaveBeenCalledWith(feedDouble, {
    attributes: false,
    childList: true,
    subtree: false,
  });
});

describe('if an element with a "feed" role is not found', () => {
  it('should observe the #contentArea element instead', () => {
    feedDouble = null;
    run();
    expect(MutationObserver.instance.observe).toHaveBeenCalledWith(contentAreaDouble, {
      attributes: false,
      childList: true,
      subtree: false,
    });
  });
});

describe('if the news feed is not present on launch', () => {
  it('should observe the body for child node changes and rescan on every change', () => {
    feedDouble = null;
    contentAreaDouble = null;

    run();

    expect(MutationObserver.instance.observe).not.toHaveBeenCalledWith(
      feedDouble,
      expect.anything(),
    );

    expect(MutationObserver.instance.observe).toHaveBeenCalledWith(bodyDouble, {
      attributes: false,
      childList: true,
      subtree: false,
    });
  });

  describe('if the news feed becomes available when the body DOM is changed', () => {
    it('should observe the news feed', () => {
      feedDouble = null;
      contentAreaDouble = null;

      run();

      feedDouble = { innerText: 'news feed double' };

      const bodyMutationCallback = MutationObserver.mock.calls[0][0];
      bodyMutationCallback([], MutationObserver.instance);

      expect(MutationObserver).toHaveBeenCalledWith(bodyMutationCallback);
      expect(MutationObserver.instance.observe).toHaveBeenCalledWith(
        feedDouble,
        expect.anything(),
      );

      expect(MutationObserver.mock.calls).toHaveLength(2);

      const feedMutationcallback = MutationObserver.mock.calls[1][0];
      expect(feedMutationcallback).not.toBe(bodyMutationCallback);
    });

    it('should disconnect the body observer', () => {
      feedDouble = null;
      contentAreaDouble = null;

      run();

      feedDouble = { innerText: 'news feed double' };
      expect(MutationObserver.instance.disconnect).not.toHaveBeenCalled();

      const bodyMutationCallback = MutationObserver.mock.calls[0][0];
      bodyMutationCallback([], MutationObserver.instance);
      expect(MutationObserver.instance.disconnect).toHaveBeenCalled();
    });
  });
});

describe('when a new news feed item is found', () => {
  it('should add the checked-for-muted-words class to it', () => {
    run();

    const callback = MutationObserver.mock.calls[0][0];
    callback();

    for (let i = 0; i < 4; i += 1) {
      expect(postsDouble[i].classList.contains('checked-for-muted-words')).toBe(true);
    }
  });

  it('should hide posts containing a muted word', () => {
    run();

    const callback = MutationObserver.mock.calls[0][0];
    callback();

    expect(postsDouble[0].style.display).toEqual('none');
    expect(postsDouble[1].style.display).toEqual('');
    expect(postsDouble[2].style.display).toEqual('');
    expect(postsDouble[3].style.display).toEqual('none');
  });
});
