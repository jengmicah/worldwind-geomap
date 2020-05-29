import React, { useState } from 'react';
import Map from './components/Map/Map';
import Controls from './components/Controls/Controls';

import './lib/bootstrap.min.css';

const App = () => {
  const [toggledLayer, setToggledLayer] = useState({});
  const [annotate, setAnnotate] = useState(false);
  const [map, setMap] = useState(false);

  return (
    <div className="fullscreen">
      <Controls
        map={map}
        setMap={setMap}
        setAnnotate={setAnnotate}
        setToggledLayer={setToggledLayer}
      />
      <Map
        map={map}
        annotate={annotate}
        setAnnotate={setAnnotate}
        toggledLayer={toggledLayer}
      />
    </div>
  )
};

export default App;