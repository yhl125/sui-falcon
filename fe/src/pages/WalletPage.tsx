// src/pages/WalletPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import UnderWaterScene from '../scenes/UnderWaterScene';
import WalletUI from '../components/WalletUI';
import { HybridWallet } from '../lib/HybridWallet';
import { useFalcon } from '../hooks/useFalcon';

type StoredFalcon = { privateKey: string; publicKey: string };

function waitForFalconKeys(timeoutMs = 10000, intervalMs = 150): Promise<StoredFalcon> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      try {
        const raw = localStorage.getItem('falconKeys');
        if (raw) {
          const parsed = JSON.parse(raw) as StoredFalcon;
          if (parsed?.privateKey && parsed?.publicKey) {
            resolve(parsed);
            return;
          }
        }
      } catch {}
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('Timed out waiting for falconKeys in localStorage'));
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

      // 1) 이미 저장돼 있으면 즉시 세팅
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

      // 2) 없으면 생성 → 로딩 ON
      setIsGenerating(true);
      try {
        const keys = await generateKeys();
        w.setFalconKeys(keys.privateKey, keys.publicKey);
        await waitForFalconKeys(); // localStorage에 실제 기록될 때까지 대기
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

  // ✅ 로딩을 최우선으로
  const showLoading = (!wallet && (isGenerating || falconLoading));

  return (
    <UnderWaterScene animationEnabled={true}>
      {/* ✅ 로딩이 최우선 분기 (wallet보다 먼저 체크) */}
      {showLoading && (
        <div
          style={{
            position: 'absolute',        // 풀스크린 오버레이
            inset: 0,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            color: 'white',
            fontFamily: 'monospace',
            background: 'rgba(0,0,0,0.15)', // 살짝 어둡게
            pointerEvents: 'none',       // 아래 버튼 클릭 막지 않으려면 none
          }}
        >
          <div style={{ position: 'relative', width: 80, height: 80 }}>
            <div style={{
              position: 'absolute', inset: 0,
              border: '3px solid rgba(64,224,208,0.15)', borderRadius: '50%',
            }}/>
            <div style={{
              position: 'absolute', inset: 0,
              border: '3px solid transparent',
              borderTop: '3px solid #40E0D0',
              borderRight: '3px solid #40E0D0',
              borderRadius: '50%', animation: 'spin 1.2s linear infinite',
            }}/>
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 40, height: 40,
              background: 'radial-gradient(circle, rgba(64, 224, 208, 0.25), transparent)',
              borderRadius: '50%', animation: 'pulse 1.6s ease-in-out infinite',
            }}/>
          </div>
          <div>Generating Falcon Keys...</div>

          <style>{`
            @keyframes spin { 0%{transform:rotate(0)}100%{transform:rotate(360deg)} }
            @keyframes pulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.35}
                                50%{transform:translate(-50%,-50%) scale(1.12);opacity:.7} }
          `}</style>
        </div>
      )}

      {/* 그 다음에 실제 컨텐츠 */}
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
    </UnderWaterScene>
  );
};

export default WalletPage;
