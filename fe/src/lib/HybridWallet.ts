// src/lib/HybridWallet.ts
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export class HybridWallet {
  traditionalKey: Ed25519Keypair | null = null;
  falconKey: { publicKey: string; privateKey: string } | null = null; // PQC 연결 예정

  constructor() {
    this.traditionalKey = new Ed25519Keypair();
  }

  // 앱 시작 시 호출
  init() {
    // 1. 기존 falcon private 키 확인
    const storedPriv = localStorage.getItem("falconPrivateKey");
    const storedPub = localStorage.getItem("falconPublicKey");

    if (storedPriv && storedPub) {
      // 이미 있으면 그대로 사용
      this.falconKey = {
        privateKey: storedPriv,
        publicKey: storedPub,
      };
    } else {
      // 없으면 새로 생성 (dummy)
      const newFalconKey = {
        privateKey: crypto.randomUUID(), // 임시 dummy 값
        publicKey: "falcon_pub_" + Math.random().toString(36).slice(2),
      };
      this.falconKey = newFalconKey;

      // localStorage에 저장
      localStorage.setItem("falconPrivateKey", newFalconKey.privateKey);
      localStorage.setItem("falconPublicKey", newFalconKey.publicKey);
    }
  }

  // 키 생성 (Ed25519 + Falcon)
  createKeys() {
    this.traditionalKey = new Ed25519Keypair();

    // falconKey는 init()에서 관리되므로 여기선 public만 리턴
    return {
      suiAddress: this.traditionalKey.getPublicKey().toSuiAddress(),
      falconPub: this.falconKey?.publicKey ?? "",
    };
  }

  // 트랜잭션 서명
  async signTransaction(tx: Uint8Array) {
    const tradSig = this.traditionalKey?.sign(tx);
    const falconSig = this.falconKey ? new TextEncoder().encode("dummyFalconSig") : new Uint8Array();
    return { tradSig, falconSig };
  }
}
