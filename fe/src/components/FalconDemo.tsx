import React, { useState } from 'react';
import { useFalcon, type FalconKeys, type MoveCompatibleData } from '../hooks/useFalcon';

export const FalconDemo: React.FC = () => {
  const {
    isLoading,
    isInitialized,
    error,
    generateKeys,
    signData,
    verifySignature,
    compressForMove,
    initializePyodide
  } = useFalcon();

  const [keys, setKeys] = useState<FalconKeys | null>(null);
  const [message, setMessage] = useState('We are SuiQ!');
  const [signature, setSignature] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [moveData, setMoveData] = useState<MoveCompatibleData | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleInitialize = async () => {
    setLoadingStep('Initializing Pyodide (10-16 seconds)...');
    try {
      await initializePyodide();
      setLoadingStep('');
    } catch (err) {
      setLoadingStep('');
      console.error('Initialization failed:', err);
    }
  };

  const handleGenerateKeys = async () => {
    setLoadingStep('Generating Falcon keys...');
    try {
      const newKeys = await generateKeys();
      setKeys(newKeys);
      setLoadingStep('');
    } catch (err) {
      setLoadingStep('');
      console.error('Key generation failed:', err);
    }
  };

  const handleSign = async () => {
    if (!keys) return;

    setLoadingStep('Signing data...');
    try {
      const messageHex = Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const sig = await signData(keys.privateKey, messageHex);
      setSignature(sig);
      setLoadingStep('');
    } catch (err) {
      setLoadingStep('');
      console.error('Signing failed:', err);
    }
  };

  const handleVerify = async () => {
    if (!keys || !signature) return;

    setLoadingStep('Verifying signature...');
    try {
      const messageHex = Array.from(new TextEncoder().encode(message))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const result = await verifySignature(keys.publicKey, messageHex, signature);
      setVerificationResult(result);
      setLoadingStep('');
    } catch (err) {
      setLoadingStep('');
      console.error('Verification failed:', err);
    }
  };

  const handleCompress = async () => {
    if (!keys || !signature) return;

    setLoadingStep('Compressing for Move...');
    try {
      const compressed = await compressForMove(keys.publicKey, signature);
      setMoveData(compressed);
      setLoadingStep('');
    } catch (err) {
      setLoadingStep('');
      console.error('Compression failed:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatU256Array = (arr: bigint[]) => {
    return `[${arr.map(n => `${n.toString()}u256`).join(', ')}]`;
  };

  const logMoveValues = () => {
    if (!moveData) return;

    // Expose data to window for console access
    // Type-safe window extension for debugging
    interface WindowWithFalconData extends Window {
      falconMoveData?: MoveCompatibleData;
      falconMessage?: string;
    }

    const extendedWindow = window as WindowWithFalconData;
    extendedWindow.falconMoveData = moveData;
    extendedWindow.falconMessage = message;

    console.log('=== FE(브라우저)에서 실행된 형식 비교 ===');
    console.log('Data exposed to window.falconMoveData');
    console.log('Message exposed to window.falconMessage');

    // 원본 값들 형식 확인
    if (moveData.pkRaw && moveData.s2Raw) {
      console.log('\n1. 원본 Public Key (pkRaw):');
      console.log(`  - 길이: ${moveData.pkRaw.length}`);
      console.log(`  - 타입: ${typeof moveData.pkRaw[0]}`);
      console.log(`  - 범위: ${Math.min(...moveData.pkRaw)} ~ ${Math.max(...moveData.pkRaw)}`);
      console.log(`  - 처음 5개: [${moveData.pkRaw.slice(0, 5).join(', ')}]`);

      console.log('\n2. 원본 S2 서명 (s2Raw):');
      console.log(`  - 길이: ${moveData.s2Raw.length}`);
      console.log(`  - 타입: ${typeof moveData.s2Raw[0]}`);
      console.log(`  - 범위: ${Math.min(...moveData.s2Raw)} ~ ${Math.max(...moveData.s2Raw)}`);
      console.log(`  - 처음 5개: [${moveData.s2Raw.slice(0, 5).join(', ')}]`);
    }

    if (moveData.pkNttRaw) {
      console.log('\n3. NTT 변환된 Public Key (pkNttRaw):');
      console.log(`  - 길이: ${moveData.pkNttRaw.length}`);
      console.log(`  - 타입: ${typeof moveData.pkNttRaw[0]}`);
      console.log(`  - 범위: ${Math.min(...moveData.pkNttRaw)} ~ ${Math.max(...moveData.pkNttRaw)}`);
      console.log(`  - 처음 5개: [${moveData.pkNttRaw.slice(0, 5).join(', ')}]`);
    }

    console.log('\n4. falcon_compact 압축된 Public Key (pkCompact) - BigInt:');
    console.log(`  - 길이: ${moveData.pkCompact.length}`);
    console.log(`  - 타입: ${typeof moveData.pkCompact[0]}`);
    console.log('  - 처음 3개 값:');
    moveData.pkCompact.slice(0, 3).forEach((val, i) => {
      console.log(`    pkCompact[${i}] = ${val.toString()}`);
      console.log(`    hex: 0x${val.toString(16)}`);
      console.log(`    bits: ${val.toString(2).length}`);
    });

    console.log('\n5. falcon_compact 압축된 s2 (sigCompact) - BigInt:');
    console.log(`  - 길이: ${moveData.sigCompact.length}`);
    console.log(`  - 타입: ${typeof moveData.sigCompact[0]}`);
    console.log('  - 처음 3개 값:');
    moveData.sigCompact.slice(0, 3).forEach((val, i) => {
      console.log(`    sigCompact[${i}] = ${val.toString()}`);
      console.log(`    hex: 0x${val.toString(16)}`);
      console.log(`    bits: ${val.toString(2).length}`);
    });

    console.log('\n6. Salt:');
    console.log(`  - 길이: ${moveData.salt.length / 2} bytes`);
    console.log(`  - hex: ${moveData.salt}`);

    console.log('\n=== Python-ref vs FE 형식 비교 요약 ===');
    console.log('동일한 데이터 구조와 형식임을 확인할 수 있습니다:');
    console.log('- 원본 계수: 512개 정수 (0~12287 범위)');
    console.log('- 압축된 형태: 32개 큰 정수 값 (200+ bits)');
    console.log('- Salt: 40 bytes hex');

    console.log('\n=== ACCESS VIA CONSOLE ===');
    console.log('Use: window.falconMoveData.pkRaw for 512 raw pk coefficients');
    console.log('Use: window.falconMoveData.s2Raw for 512 raw s2 coefficients');
    console.log('Use: window.falconMoveData.pkCompact[0] for compressed values');
    console.log('=====================================');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🦅 Falcon Signature Demo</h1>

      {error && (
        <div style={{
          background: '#fee',
          border: '1px solid #fcc',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loadingStep && (
        <div style={{
          background: '#eff',
          border: '1px solid #cdf',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Loading:</strong> {loadingStep}
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 1: Initialize Pyodide</h2>
        <button
          onClick={handleInitialize}
          disabled={isLoading || isInitialized}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: isInitialized ? '#90EE90' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isInitialized ? '✅ Initialized' : 'Initialize Falcon'}
        </button>
        <p style={{ fontSize: '14px', color: '#666' }}>
          This will load Pyodide and all Python dependencies (10-16 seconds)
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 2: Generate Keys</h2>
        <button
          onClick={handleGenerateKeys}
          disabled={isLoading || !isInitialized}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: keys ? '#90EE90' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isLoading || !isInitialized) ? 'not-allowed' : 'pointer'
          }}
        >
          {keys ? '✅ Keys Generated' : 'Generate Falcon Keys'}
        </button>

        {keys && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Public Key:</strong>
              <br />
              <textarea
                readOnly
                value={keys.publicKey}
                style={{ width: '100%', height: '80px', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button onClick={() => copyToClipboard(keys.publicKey)}>Copy</button>
            </div>
            <div>
              <strong>Private Key:</strong>
              <br />
              <textarea
                readOnly
                value={keys.privateKey}
                style={{ width: '100%', height: '80px', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button onClick={() => copyToClipboard(keys.privateKey)}>Copy</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 3: Sign Data</h2>
        <div style={{ marginBottom: '10px' }}>
          <label>
            Message to sign:
            <br />
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ width: '300px', padding: '5px' }}
            />
          </label>
        </div>
        <button
          onClick={handleSign}
          disabled={isLoading || !keys}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: signature ? '#90EE90' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isLoading || !keys) ? 'not-allowed' : 'pointer'
          }}
        >
          {signature ? '✅ Signed' : 'Sign Data'}
        </button>

        {signature && (
          <div style={{ marginTop: '10px' }}>
            <strong>Signature:</strong>
            <br />
            <textarea
              readOnly
              value={signature}
              style={{ width: '100%', height: '60px', fontFamily: 'monospace', fontSize: '12px' }}
            />
            <button onClick={() => copyToClipboard(signature)}>Copy</button>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 4: Verify Signature</h2>
        <button
          onClick={handleVerify}
          disabled={isLoading || !signature}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: verificationResult === true ? '#90EE90' : verificationResult === false ? '#FFB6C1' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isLoading || !signature) ? 'not-allowed' : 'pointer'
          }}
        >
          {verificationResult === true ? '✅ Valid' : verificationResult === false ? '❌ Invalid' : 'Verify Signature'}
        </button>

        {verificationResult !== null && (
          <div style={{ marginTop: '10px' }}>
            <strong>Verification Result:</strong> {verificationResult ? 'VALID ✅' : 'INVALID ❌'}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Step 5: Compress for Move</h2>
        <button
          onClick={handleCompress}
          disabled={isLoading || !signature}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: moveData ? '#90EE90' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (isLoading || !signature) ? 'not-allowed' : 'pointer'
          }}
        >
          {moveData ? '✅ Compressed' : 'Compress for Move'}
        </button>

        {moveData && (
          <div style={{ marginTop: '10px' }}>
            <div style={{ marginBottom: '15px' }}>
              <strong>Public Key Compacted (32 u256 values):</strong>
              <br />
              <textarea
                readOnly
                value={formatU256Array(moveData.pkCompact)}
                style={{ width: '100%', height: '120px', fontFamily: 'monospace', fontSize: '11px' }}
              />
              <button onClick={() => copyToClipboard(formatU256Array(moveData.pkCompact))}>Copy</button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Signature S2 Compacted (32 u256 values):</strong>
              <br />
              <textarea
                readOnly
                value={formatU256Array(moveData.sigCompact)}
                style={{ width: '100%', height: '120px', fontFamily: 'monospace', fontSize: '11px' }}
              />
              <button onClick={() => copyToClipboard(formatU256Array(moveData.sigCompact))}>Copy</button>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <strong>Salt (40 bytes):</strong>
              <br />
              <textarea
                readOnly
                value={`0x${moveData.salt}`}
                style={{ width: '100%', height: '40px', fontFamily: 'monospace', fontSize: '12px' }}
              />
              <button onClick={() => copyToClipboard(`0x${moveData.salt}`)}>Copy</button>
            </div>

            <div style={{
              background: '#f0f8ff',
              border: '1px solid #cce7ff',
              padding: '15px',
              borderRadius: '4px',
              marginTop: '20px'
            }}>
              <h3>Move Contract Call Ready! 🎉</h3>
              <p>You can now use these values in your Move smart contract:</p>
              <ul>
                <li><strong>pkc_u256</strong>: Public key compacted format</li>
                <li><strong>s2_compact</strong>: Signature compacted format</li>
                <li><strong>salt</strong>: 40-byte salt</li>
              </ul>
              <button
                onClick={logMoveValues}
                style={{
                  padding: '10px 20px',
                  fontSize: '14px',
                  background: '#007acc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                📋 Log Exact Values to Console
              </button>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                Click to output exact u256 values to browser console for Move testing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};