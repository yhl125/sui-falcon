// src/lib/HybridWallet.ts
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";

export class HybridWallet {
  traditionalKey: Ed25519Keypair | null = null;
  falconKey: any | null = null; // PQC는 팀원 코드 연결 예정


  // 지갑 생성 버튼 클릭 → 두 개 키(Ed25519, FALCON) 생성 → 주소(Ed25519으로만) + 공개키 반환
  createKeys() {
    this.traditionalKey = new Ed25519Keypair();
    this.falconKey = { publicKey: "dummy", privateKey: "dummy" };
    return {
      suiAddress: this.traditionalKey.getPublicKey().toSuiAddress(),
      falconPub: this.falconKey.publicKey,
    };
  }

  // 인자로 들어오는 트랜잭션에 대해 falcon, 기존 두개의 서명 반환
  async signTransaction(tx: Uint8Array) {
    const tradSig = this.traditionalKey?.sign(tx);
    const falconSig = this.falconKey?.sign?.(tx) || new Uint8Array();
    return { tradSig, falconSig };
  }
}
