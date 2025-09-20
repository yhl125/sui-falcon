import { useState, useCallback, useRef, useEffect } from "react";
import { loadPyodide, type PyodideInterface } from "pyodide";

export interface FalconKeys {
  privateKey: string;
  publicKey: string;
}

export interface FalconSignature {
  signature: string;
  salt: string;
  s2Compact: number[];
}

export interface MoveCompatibleData {
  pkCompact: bigint[];
  sigCompact: bigint[];
  salt: string;
  pkRaw?: number[];
  s2Raw?: number[];
  pkNttRaw?: number[];
}

export interface FalconInitOptions {
  autoInitialize?: boolean;
  onProgress?: (step: string, progress: number) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export const useFalcon = (options?: FalconInitOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializationProgress, setInitializationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const initializationPromiseRef = useRef<Promise<PyodideInterface> | null>(
    null
  );

  const reportProgress = useCallback(
    (step: string, progress: number) => {
      setCurrentStep(step);
      // Only update progress for major milestones to reduce re-renders
      const majorMilestones = [0, 25, 50, 75, 100];
      const nearestMilestone = majorMilestones.find(
        (milestone) => Math.abs(progress - milestone) <= 5
      );
      if (nearestMilestone !== undefined) {
        setInitializationProgress(nearestMilestone);
      }
      options?.onProgress?.(step, progress);
    },
    [options]
  );

  const initializePyodide = useCallback(async () => {
    if (pyodideRef.current) return pyodideRef.current;

    // Return existing promise if initialization is already in progress
    if (initializationPromiseRef.current) {
      return initializationPromiseRef.current;
    }

    const initPromise = (async () => {
      setIsLoading(true);
      setError(null);
      reportProgress("Starting Falcon initialization...", 0);

      try {
        reportProgress("Loading Pyodide runtime...", 10);
        console.log("Loading Pyodide...");

        // Use setTimeout to yield control to the main thread periodically
        await new Promise((resolve) => setTimeout(resolve, 10));

        const pyodide = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.2/full/",
        });

        reportProgress("Installing Python packages...", 25);
        console.log("Installing packages...");

        // Yield control to main thread before heavy operations
        await new Promise((resolve) => setTimeout(resolve, 10));
        await pyodide.loadPackage(["numpy", "pycryptodome"]);

        reportProgress("Loading Falcon Python modules...", 50);
        console.log("Loading Python files...");

        // Yield control to main thread before file loading
        await new Promise((resolve) => setTimeout(resolve, 10));
        // Python 파일들을 로드
        const pythonFiles = await Promise.all([
          fetch("/python-ref/common.py").then((r) => r.text()),
          fetch("/python-ref/falcon.py").then((r) => r.text()),
          fetch("/python-ref/encoding.py").then((r) => r.text()),
          fetch("/python-ref/shake.py").then((r) => r.text()),
          fetch("/python-ref/keccak_prng.py").then((r) => r.text()),
          fetch("/python-ref/keccak.py").then((r) => r.text()),
          fetch("/python-ref/sign_cli.py").then((r) => r.text()),
          fetch("/python-ref/fft.py").then((r) => r.text()),
          fetch("/python-ref/ffsampling.py").then((r) => r.text()),
          fetch("/python-ref/ntrugen.py").then((r) => r.text()),
          fetch("/python-ref/rng.py").then((r) => r.text()),
          fetch("/python-ref/samplerz.py").then((r) => r.text()),
          fetch("/python-ref/blake2s_prng.py").then((r) => r.text()),
          fetch("/python-ref/fft_constants.py").then((r) => r.text()),
          // polyntt 모듈들
          fetch("/python-ref/polyntt/poly.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/ntt_iterative.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/ntt_constants_iterative.py").then((r) =>
            r.text()
          ),
          fetch("/python-ref/polyntt/ntt.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/ntt_recursive.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/ntt_constants_recursive.py").then((r) =>
            r.text()
          ),
          fetch("/python-ref/polyntt/utils.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/m31_2.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/m31.py").then((r) => r.text()),
          fetch("/python-ref/polyntt/params.py").then((r) => r.text()),
        ]);

        reportProgress("Setting up Falcon environment...", 75);

        // Yield control to main thread before file system operations
        await new Promise((resolve) => setTimeout(resolve, 10));

        // 디렉토리 생성
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (pyodide.FS as any).mkdir("/polyntt");
        } catch (e) {
          console.log("Directory already exists or creation failed:", e);
        }

        // Python 파일들을 Pyodide 파일시스템에 저장
        pyodide.FS.writeFile("/common.py", pythonFiles[0]);
        pyodide.FS.writeFile("/falcon.py", pythonFiles[1]);
        pyodide.FS.writeFile("/encoding.py", pythonFiles[2]);
        pyodide.FS.writeFile("/shake.py", pythonFiles[3]);
        pyodide.FS.writeFile("/keccak_prng.py", pythonFiles[4]);
        pyodide.FS.writeFile("/keccak.py", pythonFiles[5]);
        pyodide.FS.writeFile("/sign_cli.py", pythonFiles[6]);
        pyodide.FS.writeFile("/fft.py", pythonFiles[7]);
        pyodide.FS.writeFile("/ffsampling.py", pythonFiles[8]);
        pyodide.FS.writeFile("/ntrugen.py", pythonFiles[9]);
        pyodide.FS.writeFile("/rng.py", pythonFiles[10]);
        pyodide.FS.writeFile("/samplerz.py", pythonFiles[11]);
        pyodide.FS.writeFile("/blake2s_prng.py", pythonFiles[12]);
        pyodide.FS.writeFile("/fft_constants.py", pythonFiles[13]);
        pyodide.FS.writeFile("/polyntt/poly.py", pythonFiles[14]);
        pyodide.FS.writeFile("/polyntt/ntt_iterative.py", pythonFiles[15]);
        pyodide.FS.writeFile(
          "/polyntt/ntt_constants_iterative.py",
          pythonFiles[16]
        );
        pyodide.FS.writeFile("/polyntt/ntt.py", pythonFiles[17]);
        pyodide.FS.writeFile("/polyntt/ntt_recursive.py", pythonFiles[18]);
        pyodide.FS.writeFile(
          "/polyntt/ntt_constants_recursive.py",
          pythonFiles[19]
        );
        pyodide.FS.writeFile("/polyntt/utils.py", pythonFiles[20]);
        pyodide.FS.writeFile("/polyntt/m31_2.py", pythonFiles[21]);
        pyodide.FS.writeFile("/polyntt/m31.py", pythonFiles[22]);
        pyodide.FS.writeFile("/polyntt/params.py", pythonFiles[23]);
        pyodide.FS.writeFile("/polyntt/__init__.py", "# polyntt package");

        reportProgress("Initializing Falcon crypto system...", 90);
        console.log("Initializing Falcon...");

        // Yield control to main thread before Python execution
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Python 환경 설정
        await pyodide.runPython(`
        import sys
        import importlib
        import numpy as np

        # 파일 시스템 루트를 Python 경로에 추가
        sys.path.insert(0, '/')

        # 캐시 무효화로 새 파일들을 인식하도록 함
        importlib.invalidate_caches()

        # 이제 모듈들을 import
        from common import falcon_compact, q
        from falcon import PublicKey, SecretKey
        from encoding import decompress
        from shake import SHAKE
        from keccak_prng import KeccakPRNG

        def generate_falcon_keys():
            """Falcon 키 생성"""
            try:
                sk = SecretKey(512)
                pk = PublicKey(512, sk.h)

                # 키를 문자열로 변환
                sk_data = {
                    'n': sk.n,
                    'f': sk.f,
                    'g': sk.g,
                    'F': sk.F,
                    'G': sk.G
                }

                pk_data = {
                    'n': pk.n,
                    'pk': pk.pk
                }

                return sk_data, pk_data
            except Exception as e:
                return None, str(e)

        def sign_data(sk_data, data_hex):
            """데이터 서명"""
            try:
                # SecretKey 객체 재구성
                sk = SecretKey(sk_data['n'], polys=[
                    sk_data['f'], sk_data['g'],
                    sk_data['F'], sk_data['G']
                ])

                # 데이터를 바이트로 변환
                data = bytes.fromhex(data_hex)

                # 서명 생성 (deterministic)
                deterministic_bytes = SHAKE()
                deterministic_bytes.update(bytes([0x01]*32))
                deterministic_bytes.update(bytes([0x00]))
                deterministic_bytes.update(b''.join(x.to_bytes(2, 'big') for x in sk.h))
                deterministic_bytes.update(data)

                sig = sk.sign(data, randombytes=deterministic_bytes.read, xof=KeccakPRNG)

                # 서명을 hex 문자열로 변환하여 반환 (명시적 문자열 변환)
                sig_hex = str(sig.hex())
                return sig_hex
            except Exception as e:
                error_msg = f"Error: {str(e)}"
                return error_msg

        def verify_signature(pk_data, data_hex, sig_hex):
            """서명 검증"""
            try:
                # PublicKey 객체 재구성
                pk = PublicKey(pk_data['n'], pk_data['pk'])

                # 데이터와 서명을 바이트로 변환
                data = bytes.fromhex(data_hex)
                sig = bytes.fromhex(sig_hex)

                # 서명 검증
                return pk.verify(data, sig, xof=KeccakPRNG)
            except Exception as e:
                return str(e)

        def compress_for_move(pk_data, sig_hex):
            """Move 호환 포맷으로 압축"""
            try:
                from polyntt.poly import Poly

                # PublicKey 객체 재구성
                pk = PublicKey(pk_data['n'], pk_data['pk'])

                # 서명을 바이트로 변환
                sig = bytes.fromhex(sig_hex)

                # 공개키 압축 (NTT 변환 후 압축)
                pk_ntt = Poly(pk.pk, q).ntt()
                pk_compact = falcon_compact(pk_ntt)

                # 서명에서 salt와 s2 추출
                HEAD_LEN = 1
                SALT_LEN = 40

                salt = sig[HEAD_LEN:HEAD_LEN + SALT_LEN]
                enc_s = sig[HEAD_LEN + SALT_LEN:]

                # s2 압축 해제 및 재압축
                s2 = decompress(enc_s, pk.sig_bytelen - HEAD_LEN - SALT_LEN, 512)
                s2 = [elt % q for elt in s2]
                s2_compact = falcon_compact(s2)

                # BigInt 정밀도 보존을 위해 큰 정수들을 문자열로 변환
                return {
                    'pk_compact': [str(val) for val in pk_compact],
                    's2_compact': [str(val) for val in s2_compact],
                    'salt': salt.hex(),
                    # 원본 값들도 추가로 반환
                    'pk_raw': list(pk.pk),     # 공개키 원본 512개 계수
                    's2_raw': s2,              # s2 원본 512개 계수 (이미 list)
                    'pk_ntt_raw': list(pk_ntt) # NTT 변환된 공개키
                }
            except Exception as e:
                return str(e)

        def compress_publickey_for_move(pk_data):
            """Move 호환 포맷으로 압축"""
            try:
                from polyntt.poly import Poly

                # PublicKey 객체 재구성
                pk = PublicKey(pk_data['n'], pk_data['pk'])

                # 공개키 압축 (NTT 변환 후 압축)
                pk_ntt = Poly(pk.pk, q).ntt()
                pk_compact = falcon_compact(pk_ntt)

                # BigInt 정밀도 보존을 위해 큰 정수들을 문자열로 변환
                return {
                    'pk_compact': [str(val) for val in pk_compact],
                    'pk_raw': list(pk.pk),     # 공개키 원본 512개 계수
                    'pk_ntt_raw': list(pk_ntt) # NTT 변환된 공개키
                }
            except Exception as e:
                return str(e)

        print("Falcon initialized successfully!")
      `);

        reportProgress("Falcon ready!", 100);
        pyodideRef.current = pyodide;
        setIsInitialized(true);
        console.log("Pyodide initialized successfully!");

        // Clear the initialization promise
        initializationPromiseRef.current = null;

        // Notify completion
        options?.onComplete?.();

        return pyodide;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to initialize Pyodide";
        setError(errorMsg);
        console.error("Pyodide initialization error:", err);

        // Clear the initialization promise on error
        initializationPromiseRef.current = null;

        // Notify error
        options?.onError?.(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    })();

    initializationPromiseRef.current = initPromise;
    return initPromise;
  }, [reportProgress, options]);

  const generateKeys = useCallback(async (): Promise<FalconKeys> => {
    const pyodide = await initializePyodide();

    setIsLoading(true);
    setError(null);

    try {
      const result = pyodide.runPython(`
        sk_data, pk_data = generate_falcon_keys()
        if pk_data is None:
            raise Exception(sk_data)  # sk_data contains error message

        # 결과를 JSON으로 변환
        import json
        json.dumps({
            'private_key': sk_data,
            'public_key': pk_data
        })
      `);

      const keys = JSON.parse(result);
      return {
        privateKey: JSON.stringify(keys.private_key),
        publicKey: JSON.stringify(keys.public_key),
      };
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to generate keys";
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [initializePyodide]);

  const signData = useCallback(
    async (privateKey: string, data: string): Promise<string> => {
      const pyodide = await initializePyodide();

      setIsLoading(true);
      setError(null);

      try {
        // privateKey는 JSON 문자열이므로 파싱
        const skData = JSON.parse(privateKey);

        pyodide.globals.set("sk_data_json", JSON.stringify(skData));
        pyodide.globals.set("data_hex", data);

        const signature = pyodide.runPython(`
        import json
        sk_data = json.loads(sk_data_json)
        result = sign_data(sk_data, data_hex)
        str(result)
      `);

        if (typeof signature !== "string") {
          throw new Error(`Invalid signature type: ${typeof signature}`);
        }

        if (signature.startsWith("Error:")) {
          throw new Error(signature);
        }

        if (signature.length < 10) {
          throw new Error("Signature too short");
        }

        return signature;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to sign data";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializePyodide]
  );

  const verifySignature = useCallback(
    async (
      publicKey: string,
      data: string,
      signature: string
    ): Promise<boolean> => {
      const pyodide = await initializePyodide();

      setIsLoading(true);
      setError(null);

      try {
        const pkData = JSON.parse(publicKey);

        pyodide.globals.set("pk_data_json", JSON.stringify(pkData));
        pyodide.globals.set("data_hex", data);
        pyodide.globals.set("sig_hex", signature);

        const result = pyodide.runPython(`
        import json
        pk_data = json.loads(pk_data_json)
        result = verify_signature(pk_data, data_hex, sig_hex)
        bool(result)
      `);

        return result === true;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to verify signature";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializePyodide]
  );

  const compressForMove = useCallback(
    async (
      publicKey: string,
      signature: string
    ): Promise<MoveCompatibleData> => {
      const pyodide = await initializePyodide();

      setIsLoading(true);
      setError(null);

      try {
        const pkData = JSON.parse(publicKey);

        pyodide.globals.set("pk_data_json", JSON.stringify(pkData));
        pyodide.globals.set("sig_hex", signature);

        const resultJson = pyodide.runPython(`
        import json
        pk_data = json.loads(pk_data_json)
        result = compress_for_move(pk_data, sig_hex)
        if isinstance(result, str):
            raise Exception(result)

        json.dumps(result)
      `);

        const compressed = JSON.parse(resultJson);

        // Convert string values to BigInt to maintain precision for large integers
        const pkCompactBigInt = compressed.pk_compact.map((val: string) =>
          BigInt(val)
        );
        const s2CompactBigInt = compressed.s2_compact.map((val: string) =>
          BigInt(val)
        );

        return {
          pkCompact: pkCompactBigInt,
          sigCompact: s2CompactBigInt,
          salt: compressed.salt,
          pkRaw: compressed.pk_raw,
          s2Raw: compressed.s2_raw,
          pkNttRaw: compressed.pk_ntt_raw,
        };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to compress for Move";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializePyodide]
  );

  const compressPublicKey = useCallback(
    async (
      publicKey: string
    ): Promise<{
      pkCompact: bigint[];
      pkRaw: number[];
      pkNttRaw: number[];
    }> => {
      const pyodide = await initializePyodide();

      setIsLoading(true);
      setError(null);

      try {
        const pkData = JSON.parse(publicKey);

        pyodide.globals.set("pk_data_json", JSON.stringify(pkData));

        const resultJson = pyodide.runPython(`
      import json
      pk_data = json.loads(pk_data_json)
      result = compress_publickey_for_move(pk_data)
      if isinstance(result, str):
          raise Exception(result)

      json.dumps(result)
    `);

        const compressed = JSON.parse(resultJson);

        // Convert string values to BigInt to maintain precision for large integers
        const pkCompactBigInt = compressed.pk_compact.map((val: string) =>
          BigInt(val)
        );

        return {
          pkCompact: pkCompactBigInt,
          pkRaw: compressed.pk_raw,
          pkNttRaw: compressed.pk_ntt_raw,
        };
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to compress public key";
        setError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [initializePyodide]
  );

  // Auto-initialization effect
  useEffect(() => {
    if (
      options?.autoInitialize &&
      !isInitialized &&
      !isLoading &&
      !initializationPromiseRef.current
    ) {
      console.log("Auto-initializing Falcon...");
      initializePyodide().catch((err) => {
        console.error("Auto-initialization failed:", err);
      });
    }
  }, [options?.autoInitialize, isInitialized, isLoading, initializePyodide]);

  return {
    isLoading,
    isInitialized,
    error,
    initializationProgress,
    currentStep,
    generateKeys,
    signData,
    verifySignature,
    compressForMove,
    compressPublicKey,
    initializePyodide,
  };
};
