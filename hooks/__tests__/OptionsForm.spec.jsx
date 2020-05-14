import React from 'react';
import renderer from 'react-test-renderer';
import Options from '../OptionsForm';

describe('<Options />', () => {
  it('should render correctly', () => {
    const subject = renderer.create(<Options />);
    expect(subject).toMatchSnapshot();
  });

  describe('if the wordlist source is a URL', () => {
    it('should render correctly', () => {
      localStorage.setItem('source', 'url');
      localStorage.setItem('wordlistUrl', 'http://localhost/list.txt');

      const subject = renderer.create(<Options />);
      expect(subject).toMatchSnapshot();
    });

    describe('if the save button is clicked', () => {
      it('should save the URL in local storage', () => {
        localStorage.setItem('source', 'url');

        const subject = renderer.create(<Options />);
        const input = subject.root.findByProps({ id: 'url' });
        const button = subject.root.findByProps({ testId: 'saveButton' });

        renderer.act(() => input.props.onChange({
          target: { value: 'new url' },
        }));

        renderer.act(() => button.props.onClick());
        expect(localStorage.getItem('wordlistUrl')).toEqual('new url');
      });
    });
  });

  describe('if the wordlist source is a local list', () => {
    it('should render correctly', () => {
      localStorage.setItem('source', 'local');
      localStorage.setItem('muted', '["word1", "word2", "word3"]');

      const subject = renderer.create(<Options />);
      expect(subject).toMatchSnapshot();
    });

    describe('when the save button is clicked', () => {
      it('should serialise the words into a JSON array in local storage', () => {
        localStorage.setItem('source', 'local');

        const subject = renderer.create(<Options />);
        const input = subject.root.findByProps({ id: 'muted' });
        const button = subject.root.findByProps({ testId: 'saveButton' });

        renderer.act(() => input.props.onChange({
          target: { value: 'word1\nword2\r\nword3\nword4' },
        }));

        renderer.act(() => button.props.onClick());
        expect(JSON.parse(localStorage.getItem('muted'))).toEqual([
          'word1',
          'word2',
          'word3',
          'word4',
        ]);
      });
    });
  });
});
