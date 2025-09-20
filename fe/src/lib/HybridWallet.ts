// src/lib/HybridWallet.ts
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import type { FalconKeys } from "../hooks/useFalcon";// 타입 재사용

export class HybridWallet {
  traditionalKey: Ed25519Keypair | null = null;
  falconKey: FalconKeys | null = null;

  constructor() {
    this.traditionalKey = new Ed25519Keypair();
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

  // 트랜잭션 서명 (예시)
  async signTransaction(tx: Uint8Array) {
    const tradSig = this.traditionalKey?.sign(tx);
    const falconSig = this.falconKey
      ? new TextEncoder().encode("dummyFalconSig")
      : new Uint8Array();
    return { tradSig, falconSig };
  }
}
