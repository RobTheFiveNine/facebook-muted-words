import run from '../content_script';

let bodyDouble;
let feedDouble;
let contentAreaDouble;

const createDomMocks = ({ getElementById } = {}) => {
  const originalQuerySelector = document.querySelector;
  const originalMutationObserver = MutationObserver;
  const originalGetElementById = document.getElementById;

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
  };
};

let resetMocks;

beforeEach(() => {
  bodyDouble = {
    innerText: 'body double',
  };

  feedDouble = {
    innerText: 'news feed double',
  };

  contentAreaDouble = {
    innerText: 'content area double',
  };

  resetMocks = createDomMocks({
    getElementById: jest.fn(() => contentAreaDouble),
  });
});

afterEach(() => {
  resetMocks();
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
