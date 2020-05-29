import React, { useState } from 'react';
import Map from './components/Map/Map';
import Controls from './components/Controls/Controls';

import './lib/bootstrap.min.css';

const App = () => {
  const [toggledLayer, setToggledLayer] = useState({});
  const [annotate, setAnnotate] = useState(false);

  return (
    <div className="fullscreen">
      <Controls
        setAnnotate={setAnnotate}
        setToggledLayer={setToggledLayer}
      />
      <Map
        annotate={annotate}
        setAnnotate={setAnnotate}
        toggledLayer={toggledLayer}
      />
    </div>
  )
};

export default App;