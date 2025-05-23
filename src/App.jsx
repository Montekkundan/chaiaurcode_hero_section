import React, { useState } from 'react';
import Scene from './components/scene';
import { Leva } from 'leva';

function App() {
  const [showLeva] = useState(true);

  return (
    <>
      <Leva hidden={!showLeva} />
      <main className="main">
        <Scene />
      </main>
    </>
  );
}

export default App;
