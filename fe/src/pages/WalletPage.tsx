// src/pages/WalletPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import WalletUI from '../components/WalletUI';
import { HybridWallet } from '../lib/HybridWallet';
import { useFalcon } from '../hooks/useFalcon';
import HybridWalletGate from '../components/HybridWalletGate'; // ← 추가

type StoredFalcon = { privateKey: string; publicKey: string };

function waitForFalconKeys(
  timeoutMs = 10000,
  intervalMs = 150
): Promise<StoredFalcon> {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const tick = () => {
      try {
        const raw = localStorage.getItem("falconKeys");
        if (raw) {
          const parsed = JSON.parse(raw) as StoredFalcon;
          if (parsed?.privateKey && parsed?.publicKey) {
            resolve(parsed);
            return;
          }
        }
      } catch {
        // JSON 파싱 실패는 무시하고 재시도
      }

      if (Date.now() - start >= timeoutMs) {
        reject(new Error("Timed out waiting for falconKeys in localStorage"));
        return;
      }
      setTimeout(tick, intervalMs);
    };

    tick();
  });
}


export const WalletPage: React.FC = () => {
  const { generateKeys, isLoading: falconLoading } = useFalcon();
  const [wallet, setWallet] = useState<HybridWallet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const init = async () => {
      setError(null);
      const w = new HybridWallet();

      const stored = localStorage.getItem('falconKeys');
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as StoredFalcon;
          if (parsed?.privateKey && parsed?.publicKey) {
            w.setFalconKeys(parsed.privateKey, parsed.publicKey);
            if (mountedRef.current) setWallet(w);
            return;
          }
        } catch {
          localStorage.removeItem('falconKeys');
        }
      }

      setIsGenerating(true);
      try {
        const keys = await generateKeys();
        w.setFalconKeys(keys.privateKey, keys.publicKey);
        await waitForFalconKeys();
        if (mountedRef.current) setWallet(w);
      } catch (e) {
        console.error(e);
        if (mountedRef.current) setError('Falcon key generation failed.');
      } finally {
        if (mountedRef.current) setIsGenerating(false);
      }
    };

    init();
    return () => { mountedRef.current = false; };
  }, [generateKeys]);

  const showLoading = (!wallet && (isGenerating || falconLoading));

  return (
    <UnderWaterScene animationEnabled={true}>
      {/* ← 이 한 줄로 '없으면 생성 / 있으면 children' 분기 */}
      <HybridWalletGate>
        {/* 아래부터는 '하이브리드 지갑이 이미 있음'일 때만 보임 */}

        {/* Falcon 키 준비 로딩 오버레이 */}
        {showLoading && (
          <div /* ... 기존 로딩 오버레이 그대로 ... */>Generating Falcon Keys...</div>
        )}

        {/* 실제 컨텐츠 */}
        {wallet ? (
          <WalletUI onDeposit={() => {
            if (!wallet) { alert('Wallet not ready yet!'); return; }
            alert('Deposit functionality will be implemented in the future.');
          }} />
        ) : error ? (
          <div style={{
            color: 'tomato',
            textAlign: 'center',
            fontFamily: 'monospace',
            marginTop: '2rem',
          }}>
            ⚠️ {error}
          </div>
        ) : null}
      </HybridWalletGate>
    </UnderWaterScene>
  );
};

export default WalletPage;
