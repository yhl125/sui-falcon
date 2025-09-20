// src/App.tsx
import React, { useState } from "react";
import StartPage from "./pages/StartPage";
import WalletPage from "./pages/WalletPage";
import { HybridWalletProvider } from "./hooks/useHybridWalletContext";
import "./App.css";

// ✅ 앱 시작할 때 ENV 값 확인 (브라우저 콘솔에서 확인)
console.log("ENV CHECK (App)", {
  VITE_HYBRID_WALLET_CONTRACT: import.meta.env.VITE_HYBRID_WALLET_CONTRACT,
  VITE_REGISTRY_OBJECT_ID: import.meta.env.VITE_REGISTRY_OBJECT_ID,
});
if (
  !import.meta.env.VITE_HYBRID_WALLET_CONTRACT ||
  !import.meta.env.VITE_REGISTRY_OBJECT_ID
) {
  console.error(
    "❌ Missing ENV: VITE_HYBRID_WALLET_CONTRACT or VITE_REGISTRY_OBJECT_ID"
  );
}

function App() {
  const [started, setStarted] = useState(false);

  return (
    <HybridWalletProvider>
      {!started ? (
        <StartPage onStart={() => setStarted(true)} />
      ) : (
        <WalletPage />
      )}
    </HybridWalletProvider>
  );
}

export default App;
