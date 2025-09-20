import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  useCurrentAccount,
  useSuiClient,
  useSignAndExecuteTransaction,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { HybridWallet } from "../lib/HybridWallet";
import { useFalcon } from "./useFalcon";

interface HybridWalletState {
  hybridWallet: HybridWallet | null;
  hybridWalletId: string | null;
  hasHybridWallet: boolean; // 하이브리드 지갑 존재 여부
  isLoading: boolean;
  error: string | null;

  // 하이브리드 지갑 생성 함수
  createHybridWallet: () => Promise<void>;
  // 하이브리드 지갑 새로고침 함수
  refreshHybridWallet: () => Promise<void>;
  // 하이브리드 지갑 수이 송금 함수
  sendPayment: (recipient: string, amount: bigint) => Promise<void>;
  // 하이브리드 지갑 로드 함수
  loadHybridWalletForAccount: (accoutAddress: string) => Promise<void>;
  // 하이브리드 지갑 예치 함수
  deposit: (amount: bigint) => Promise<void>;
}

const HybridWalletContext = createContext<HybridWalletState | undefined>(
  undefined
);

const HYBRID_WALLET_CONTRACT = import.meta.env.VITE_HYBRID_WALLET_CONTRACT;
const REGISTRY_OBJECT_ID = import.meta.env.VITE_REGISTRY_OBJECT_ID;

interface HybridWalletProviderProps {
  children: ReactNode;
}

export const HybridWalletProvider: React.FC<HybridWalletProviderProps> = ({
  children,
}) => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutate: signPersonalMessage } = useSignPersonalMessage();
  const { compressPublicKey } = useFalcon();

  // 상태 관리
  const [hybridWallet, setHybridWallet] = useState<HybridWallet | null>(null);
  const [hybridWalletId, setHybridWalletId] = useState<string | null>(null);
  const [hasHybridWallet, setHasHybridWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 계정별 하이브리드 지갑 데이터 캐시
  // const [walletCache, setWalletCache] = useState<
  //   Map<
  //     string,
  //     {
  //       wallet: HybridWallet;
  //       walletId: string | null;
  //     }
  //   >
  // >(new Map());

  // 하이브리드 지갑 로드
  const loadHybridWalletForAccount = async (accountAddress: string) => {
    console.log("load 시작", accountAddress);
    setIsLoading(true);
    setError(null);

    try {
      // 1. 캐시에서 먼저 확인
      // const cached = walletCache.get(accountAddress);
      // console.log("캐시: ", cached);
      // if (cached) {
      //   setHybridWallet(cached.wallet);
      //   setHybridWalletId(cached.walletId);
      //   setHasHybridWallet(!!cached.walletId);
      //   setIsLoading(false);
      //   return;
      // }

      // 2. HybridWallet 인스턴스 생성 및 초기화
      const localWallet = new HybridWallet();
      localWallet.init();
      localWallet.traditionalKey = accountAddress;

      // 3. 온체인에서 하이브리드 지갑 ID 조회
      let onChainWalletId: string | null = null;

      try {
        const tx = new Transaction();
        tx.moveCall({
          target: `${HYBRID_WALLET_CONTRACT}::hybrid_wallet::get_hybrid_wallet_id`,
          arguments: [
            tx.object(REGISTRY_OBJECT_ID),
            tx.pure.address(accountAddress),
          ],
        });

        const result = await suiClient.devInspectTransactionBlock({
          sender: accountAddress,
          transactionBlock: tx,
        });
        console.log(result);

        // 결과 파싱하여 wallet ID 추출
        if (result.results?.[0]?.returnValues?.[0]) {
          const returnValue = result.results[0].returnValues[0][0];
          if (returnValue && returnValue.length > 0) {
            const hex = Array.from(new Uint8Array(returnValue))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
            let objectIdHex = hex;
            if (hex.length === 66 && hex.startsWith("01")) {
              objectIdHex = hex.slice(2);
            }
            const objectId = `0x${objectIdHex}`;
            console.log("object id: ", objectId);
            if (hex !== "00") {
              onChainWalletId = objectId;
            }
          }
        }
      } catch (queryError) {
        console.log(
          "No hybrid wallet found on-chain for this account:",
          queryError
        );
      }

      // 4. object id 기반으로 지갑 정보 온체인에서 불러오기
      if (onChainWalletId) {
        console.log("지갑 정보 불러오기");
        try {
          const walletObject = await suiClient.getObject({
            id: onChainWalletId,
            options: {
              showContent: true,
              showType: true,
            },
          });
          console.log("hybrid wallet object: ", walletObject);
          if (walletObject.data?.content) {
            const mergedWallet = HybridWallet.fromOnChainData(
              onChainWalletId,
              walletObject.data.content
            );
            mergedWallet.init();

            // 상태 업데이트
            console.log(mergedWallet);
            setHybridWallet(mergedWallet);
            setHybridWalletId(onChainWalletId);
            setHasHybridWallet(true);

            // 5. 캐시에 저장
            // setWalletCache((prev) =>
            //   new Map(prev).set(accountAddress, {
            //     wallet: mergedWallet,
            //     walletId: onChainWalletId,
            //   })
            // );
          }
        } catch (error) {
          console.error("Failed to fetch hybrid wallet object:", error);
          setHybridWallet(localWallet); // 생성용 지갑 준비
          setHybridWalletId(null);
          setHasHybridWallet(false); // false로 설정해서 Create 버튼 표시
        }
      } else {
        setHybridWallet(localWallet);
        setHybridWalletId(null);
        setHasHybridWallet(false);

        console.log(
          "No hybrid wallet found, ready to create with local wallet"
        );
      }

      console.log(`✅ Hybrid wallet loaded for account ${accountAddress}:`, {
        hasOnChainWallet: !!onChainWalletId,
        walletId: onChainWalletId,
      });
    } catch (err) {
      console.error("Failed to load hybrid wallet:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load hybrid wallet"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 하이브리드 지갑 생성
  const createHybridWallet = async () => {
    if (!currentAccount || !hybridWallet) {
      throw new Error("No account connected or hybrid wallet not initialized");
    }

    console.log("지갑 생성 시작");
    setIsLoading(true);
    setError(null);

    try {
      // 1. 키 정보 준비
      const ed25519PubStr = hybridWallet.traditionalKey;
      if (!ed25519PubStr) {
        throw new Error("Ed25519 public key not available");
      }
      const hex = ed25519PubStr.replace(/^0x/, "");
      function hexToBytes(hex: any) {
        const bytes = [];
        for (let c = 0; c < hex.length; c += 2) {
          bytes.push(parseInt(hex.substr(c, 2), 16));
        }
        return bytes;
      }

      const ed25519PubBytes = hexToBytes(hex);

      const falconPubStr = hybridWallet.falconKey?.publicKey || "";
      const falconKeyObj = JSON.parse(falconPubStr);
      const falconPub = falconKeyObj.pk.map((n: number) => BigInt(n));
      const { pkCompact } = await compressPublicKey(falconPubStr);

      console.log("퍼블릭 키 준비 완료", ed25519PubBytes, falconPub);
      // console.log("압축된 falcon key", pkCompact);

      // 2. 트랜잭션 생성
      const tx = new Transaction();
      tx.moveCall({
        target: `${HYBRID_WALLET_CONTRACT}::hybrid_wallet::create_hybrid_wallet`,
        arguments: [
          tx.object(REGISTRY_OBJECT_ID),
          tx.pure("vector<u8>", ed25519PubBytes),
          tx.pure("vector<u256>", pkCompact),
        ],
      });
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("Create Wallet Success", result);
            await refreshHybridWallet();
          },
          onError: (error) => {
            console.error("Create Wallet Failed");
            setError(error.message || "Failed to create hybrid wallet");
          },
        }
      );
    } catch (err) {
      console.error("Failed to create hybrid wallet:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create hybrid wallet"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 하이브리드 지갑 새로고침
  const refreshHybridWallet = async () => {
    if (currentAccount?.address) {
      // 캐시 클리어 후 다시 로드
      // setWalletCache((prev) => {
      //   const newCache = new Map(prev);
      //   newCache.delete(currentAccount.address);
      //   return newCache;
      // });

      await loadHybridWalletForAccount(currentAccount.address);
    }
  };

  // 하이브리드 지갑 예치 (SUI)
  const deposit = async (amount: bigint) => {
    if (!currentAccount?.address || !hybridWalletId) {
      throw new Error("Wallet not ready");
    }

    setIsLoading(true);
    setError(null);

    try {
      // (선택) 잔고 체크
      const bal = await suiClient.getBalance({
        owner: currentAccount.address,
        coinType: "0x2::sui::SUI",
      });
      const need = amount + 50_000_000n; // 가스 예산 포함 대략치
      if (BigInt(bal.totalBalance) < need) {
        throw new Error("SUI 잔고가 부족합니다. (입금액 + 가스 예산 필요)");
      }

      // 1) 트랜잭션 생성
      const tx = new Transaction();
      tx.setGasBudget(50_000_000n);

      // 2) 가스에서 amount만큼 분리 → Coin<SUI>
      const [paymentCoin] = tx.splitCoins(tx.gas, [
        tx.pure.u64(amount.toString()),
      ]);

      // 3) deposit 호출 (TxContext는 자동 주입)
      tx.moveCall({
        target: `${HYBRID_WALLET_CONTRACT}::hybrid_wallet::deposit`,
        arguments: [
          tx.object(hybridWalletId), // &mut HybridWallet
          paymentCoin, // Coin<SUI>
        ],
      });

      // 4) 전송/확정/리프레시
      await new Promise<void>((resolve, reject) => {
        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: async (res) => {
              try {
                const digest =
                  (res as any).digest ??
                  (res as any).effects?.transactionDigest ??
                  res;
                await suiClient.waitForTransaction({
                  digest,
                  options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                  },
                });
                console.log("deposit 성공, 지갑 리프레시");

                await refreshHybridWallet();
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            onError: (err) => reject(err),
          }
        );
      });
    } catch (e: any) {
      console.error("[deposit] failed", e);
      setError(e?.message ?? "Failed to deposit");
      // ★ 실패를 호출측으로 전달해야 UI에서 성공 alert가 안 뜸
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // 하이브리드 지갑 수이 송금
  const sendPayment = async (recipient: string, amount: bigint) => {
    if (!currentAccount || !hybridWallet || !hybridWalletId) {
      throw new Error("No account connected or hybrid wallet not initialized");
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 메시지 준비
      const txData = hybridWallet.encodePayment(
        recipient,
        amount,
        hybridWallet.nonce
      );
      // 2. falcon 서명 생성
      const { falconSig } = await hybridWallet.signPayment(txData);
      // 3. ed25519 서명 생성
      const ed25519Sig = await new Promise<Uint8Array>((resolve) => {
        signPersonalMessage(
          {
            message: txData,
          },
          {
            onSuccess: (signature) =>
              resolve(
                new Uint8Array(
                  atob(signature.bytes)
                    .split("")
                    .map((c) => c.charCodeAt(0))
                )
              ),
            onError: (error) => resolve(new Uint8Array()),
          }
        );
      });

      // 2. 트랜잭션 생성
      const tx = new Transaction();
      tx.moveCall({
        target: `${HYBRID_WALLET_CONTRACT}::hybrid_wallet::send_payment`,
        arguments: [
          tx.object(hybridWalletId),
          tx.pure.address(recipient),
          tx.pure.u64(amount.toString()),
          tx.pure(new Uint8Array(ed25519Sig)),
          tx.pure(new Uint8Array(falconSig)),
        ],
      });
      signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: async (result) => {
            console.log("Payment sent successfully:", result);
            await refreshHybridWallet();
          },
          onError: (error) => {
            console.error("Payment failed:", error);
            setError(error.message || "Failed to send payment");
          },
        }
      );
    } catch (err) {
      console.error("Failed to send payment:", err);
      setError(err instanceof Error ? err.message : "Failed to send payment");
    } finally {
      setIsLoading(false);
    }
  };

  // 계정 변경 감지 및 하이브리드 지갑 로드
  useEffect(() => {
    if (currentAccount?.address) {
      loadHybridWalletForAccount(currentAccount.address);
    } else {
      // 계정이 없으면 상태 초기화
      setHybridWallet(null);
      setHybridWalletId(null);
      setHasHybridWallet(false);
      setError(null);
    }
  }, [currentAccount?.address]);

  const contextValue: HybridWalletState = {
    hybridWallet,
    hybridWalletId,
    hasHybridWallet,
    isLoading,
    error,
    createHybridWallet,
    refreshHybridWallet,
    sendPayment,
    loadHybridWalletForAccount,
    deposit,
  };

  return (
    <HybridWalletContext.Provider value={contextValue}>
      {children}
    </HybridWalletContext.Provider>
  );
};

export const useHybridWallet = (): HybridWalletState => {
  const context = useContext(HybridWalletContext);
  if (context === undefined) {
    throw new Error(
      "useHybridWallet must be used within a HybridWalletProvider"
    );
  }
  return context;
};
