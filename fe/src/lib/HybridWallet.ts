// src/lib/HybridWallet.ts
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import type { FalconKeys } from "../hooks/useFalcon";// 타입 재사용

export class HybridWallet {
  id: string | null = null; // object ID
  ed25519_pubkey: Uint8Array | null = null; // vector<u8>
  falcon_pubkey: bigint[] | null = null; // vector<u256>
  treasury: bigint = 0n; // Balance<SUI>
  nonce: bigint = 0n; // u64

  // 로컬 키 관리
  traditionalKey: string | null = null;
  falconKey: FalconKeys | null = null;

  constructor() {
  }

  // 앱 시작 시 호출
  async init(generateFalconKeys?: () => Promise<FalconKeys>) {
    const storedFalconKeys = localStorage.getItem("falconKeys");

    if (storedFalconKeys) {
      try {
        const keys: FalconKeys = JSON.parse(storedFalconKeys);
        this.falconKey = keys;
        console.log(" HybridWallet: Loaded existing Falcon keys");
      } catch (error) {
        console.error(" HybridWallet: Failed to parse Falcon keys:", error);
        this.falconKey = null;
      }
    } else if (generateFalconKeys) {
      // 처음 실행 → 키 없으면 새로 생성
      try {
        const keys = await generateFalconKeys();
        this.setFalconKeys(keys.privateKey, keys.publicKey);
        console.log("✨ HybridWallet: New Falcon keys generated");
      } catch (err) {
        console.error("HybridWallet: Failed to generate Falcon keys:", err);
      }
    } else {
      console.log("HybridWallet: No Falcon keys and no generator provided");
    }
  }

  // Falcon 키 존재 여부
  hasFalconKeys(): boolean {
    return this.falconKey !== null;
  }

  // Falcon 키 저장
  setFalconKeys(privateKey: string, publicKey: string) {
    this.falconKey = { privateKey, publicKey };
    localStorage.setItem("falconKeys", JSON.stringify(this.falconKey));
    console.log("HybridWallet: Falcon keys updated & stored in localStorage");
  }

  // 키 생성 (Ed25519 + Falcon)
  createKeys() {
    this.traditionalKey = new Ed25519Keypair();

    return {
      suiAddress: this.traditionalKey.getPublicKey().toSuiAddress(),
      falconPub: this.falconKey?.publicKey ?? "",
    };
  }
  
  // 키 반환 (Ed25519 + Falcon)
  getKeys(curAccountAddress: string) {
    return {
      ed25519Pub: curAccountAddress,
      falconPub: this.falconKey?.publicKey ?? "",
    };
  }

  // 트랜잭션 서명 (예시)
  async signTransaction(tx: Uint8Array) {
    const tradSig = this.traditionalKey?.sign(tx);
    const falconSig = this.falconKey
      ? new TextEncoder().encode("dummyFalconSig")
      : new Uint8Array();
    return { tradSig, falconSig };
  }
  
  // Falcon 서명 반환
  async signPayment(txData: Uint8Array): Promise<{
    falconSig: Uint8Array;
  }> {
    // TODO : 실제 falcon Sig 생성
    const falconSig = this.falconKey
      ? new TextEncoder().encode("dummyFalconSig")
      : new Uint8Array();
    return { falconSig };
  }
  
   // 온체인 데이터로부터 HybridWallet 인스턴스 생성
  static fromOnChainData(objectId: string, content: any): HybridWallet {
    const wallet = new HybridWallet();
    wallet.id = objectId;
    wallet.ed25519_pubkey = content.ed25519_pubkey
      ? new Uint8Array(content.ed25519_pubkey)
      : null;
    wallet.falcon_pubkey = content.falcon_pubkey || null;
    wallet.treasury = BigInt(content.treasury || 0);
    wallet.nonce = BigInt(content.nonce || 0);
    return wallet;
  }

  // 결제 데이터 인코딩 (Move의 encode_payment와 동일)
  encodePayment(recipient: string, amount: bigint, nonce: bigint): Uint8Array {
    const recipientBytes = new TextEncoder().encode(recipient);
    const amountBytes = new Uint8Array(8);
    const nonceBytes = new Uint8Array(8);

    // amount를 8바이트 little-endian으로 변환
    const amountView = new DataView(amountBytes.buffer);
    amountView.setBigUint64(0, amount, true);

    // nonce를 8바이트 little-endian으로 변환
    const nonceView = new DataView(nonceBytes.buffer);
    nonceView.setBigUint64(0, nonce, true);

    // 모든 바이트 합치기
    const result = new Uint8Array(recipientBytes.length + 8 + 8);
    result.set(recipientBytes, 0);
    result.set(amountBytes, recipientBytes.length);
    result.set(nonceBytes, recipientBytes.length + 8);

    return result;
  }
}