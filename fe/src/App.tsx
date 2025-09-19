// src/App.tsx
import React, { useState } from "react";
import StartPage from "./pages/StartPage";
import WalletUI from "./components/WalletUI";

function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {!started ? (
        <StartPage onStart={() => setStarted(true)} />
      ) : (
        <WalletUI />
      )}
    </>
  );
}

export default App;
