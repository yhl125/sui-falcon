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
    // 1. 실제 Falcon 키 확인 (falconKeys 형태로 저장된 것)
    const storedFalconKeys = localStorage.getItem("falconKeys");

    if (storedFalconKeys) {
      try {
        // 실제 Falcon 키가 있으면 사용
        const keys = JSON.parse(storedFalconKeys);
        this.falconKey = {
          privateKey: keys.privateKey,
          publicKey: keys.publicKey,
        };
        console.log('✅ HybridWallet: Loaded existing Falcon keys');
      } catch (error) {
        console.error('❌ HybridWallet: Failed to parse Falcon keys:', error);
        this.falconKey = null;
      }
    } else {
      // Falcon 키가 없으면 null로 설정 (더미 생성하지 않음)
      this.falconKey = null;
      console.log('⚠️ HybridWallet: No Falcon keys found - user needs to generate them');
    }
  }

  // Falcon 키 존재 여부 확인
  hasFalconKeys(): boolean {
    return this.falconKey !== null;
  }

  // Falcon 키 설정 (외부에서 생성된 키를 설정할 때 사용)
  setFalconKeys(privateKey: string, publicKey: string) {
    this.falconKey = {
      privateKey,
      publicKey,
    };
    console.log('✅ HybridWallet: Falcon keys updated');
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
