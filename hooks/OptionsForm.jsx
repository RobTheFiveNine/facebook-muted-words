import React from 'react';
import PropTypes from 'prop-types';

function SourceOption({ initialValue, onChange }) {
  return (
    <div className="row">
      <div className="col-md-12">
        <label className="w-100" htmlFor="source">
          Source
          <select
            className="form-control"
            id="source"
            defaultValue={initialValue}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="local">Local List</option>
            <option value="url">URL</option>
          </select>
        </label>
      </div>
    </div>
  );
}

SourceOption.propTypes = {
  initialValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

SourceOption.defaultProps = {
  initialValue: 'local',
};

function MutedWordsInput({ initialValue, onChange, visible }) {
  return (
    <div className="row" style={{display: visible ? '' : 'none'}}>
      <div className="col-md-12">
        <label className="w-100" htmlFor="muted">
          Wordlist (one word per line)
          <textarea
            id="muted"
            name="muted"
            className="form-control"
            rows="10"
            defaultValue={initialValue}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

MutedWordsInput.propTypes = {
  initialValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

MutedWordsInput.defaultProps = {
  initialValue: '',
};

function UrlInput({ initialValue, onChange, visible }) {
  return (
    <div className="row" style={{display: visible ? '' : 'none'}}>
      <div className="col-md-12">
        <label className="w-100" htmlFor="url">
          URL of wordlist
          <input
            id="url"
            name="url"
            type="text"
            className="form-control"
            defaultValue={initialValue}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      </div>
    </div>
  );
}

UrlInput.propTypes = {
  initialValue: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

UrlInput.defaultProps = {
  initialValue: '',
};

function OptionsForm() {
  const mutedArray = JSON.parse(localStorage.getItem('muted'));
  const [source, setSource] = React.useState(localStorage.getItem('source') || 'local');
  const [muted, setMuted] = React.useState(mutedArray ? mutedArray.join('\n') : undefined);
  const [wordlistUrl, setWordlistUrl] = React.useState(localStorage.getItem('wordlistUrl') || '');
  const [dirty, setDirty] = React.useState(false);
  const mounted = React.useRef(false);

  const saveSettings = React.useCallback(() => {
    localStorage.setItem('source', source);

    if (source === 'local') {
      const wordlist = muted.split('\n');

      for (let i = 0; i < wordlist.length; i += 1) {
        wordlist[i] = wordlist[i].replace('\r', '');
      }

      localStorage.setItem('muted', JSON.stringify(wordlist));
      localStorage.removeItem('wordlistUrl');
    } else {
      localStorage.removeItem('muted');
      localStorage.setItem('wordlistUrl', wordlistUrl);
    }
  });

  React.useEffect(() => {
    if (mounted.current) {
      setDirty(true);
    } else {
      mounted.current = true;
    }
  }, [source, muted, wordlistUrl]);

  return (
    <div>
      <SourceOption initialValue={source} onChange={setSource} />
      <MutedWordsInput initialValue={muted} onChange={setMuted} visible={source === 'local'} />
      <UrlInput initialValue={wordlistUrl} onChange={setWordlistUrl} visible={source === 'url'} />

      <div className="row">
        <div className="col-md-12">
          <button
            disabled={!dirty}
            type="button"
            className="btn btn-primary btn-block"
            onClick={saveSettings}
            testId="saveButton"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default OptionsForm;
