// src/lib/suiTransactions.ts
import { Transaction } from "@mysten/sui/transactions";

/**
 * 지갑 생성 트랜잭션
 */

export function buildCreateHybridWalletTx(
    registryId: string,
    ed25519Pub: Uint8Array,
    falconPub: Uint8Array
  ): Transaction {
    const tx = new Transaction();
  
    tx.moveCall({
      target: "0x패키지주소::wallet::create_hybrid_wallet",
      arguments: [
        tx.object(registryId),
        tx.pure.vector("u8", Array.from(ed25519Pub)),
        tx.pure.vector("u256", Array.from(falconPub)),
      ],
    });
  
    return tx;
  }

  
/**
 * 결제 트랜잭션 (HybridWallet → recipient)
 */
export function buildSendPaymentTx(
  walletId: string,          // HybridWallet 객체 ID
  recipient: string,         // 받는 사람 주소
  amount: number,            // 보낼 금액 (u64 단위, SUI 아님! contract 정의에 맞춤)
  ed25519Sig: Uint8Array,    // Ed25519 서명 (프론트에서 생성)
  falconSig: Uint8Array      // Falcon 서명 (프론트에서 생성)
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    // TODO: 실제 배포된 패키지 주소로 교체
    target: "0x패키지주소::wallet::send_payment",
    arguments: [
      tx.object(walletId),                             // &mut HybridWallet
      tx.pure.address(recipient),                      // recipient: address
      tx.pure.u64(amount),                             // amount: u64
      tx.pure.vector("u8", Array.from(ed25519Sig)),    // ed25519_sig: vector<u8>
      tx.pure.vector("u8", Array.from(falconSig)),     // falcon_sig: vector<u8>
    ],
  });

  return tx;
}

/**
 * 하이브리드 지갑에 SUI 입금 트랜잭션
 */
export function buildDepositTx(
    walletId: string,    // HybridWallet 객체 ID
    amount: number       // 입금할 SUI (정수, 단위: SUI → 내부에서 mist 변환 필요)
  ): Transaction {
    const tx = new Transaction();
  
    // 가스에서 코인 분리 (입금할 amount 만큼)
    const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(amount)]);
  
    // Move 모듈 deposit 호출
    tx.moveCall({
      // TODO: 실제 배포된 패키지 주소로 교체
      target: "0x패키지주소::wallet::deposit",
      arguments: [
        tx.object(walletId),  // &mut HybridWallet
        payment,              // Coin<SUI>
      ],
    });
  
    return tx;
}
