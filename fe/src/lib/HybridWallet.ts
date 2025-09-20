export class HybridWallet {
  id: string | null = null; // object ID
  ed25519_pubkey: Uint8Array | null = null; // vector<u8>
  falcon_pubkey: bigint[] | null = null; // vector<u256>
  treasury: bigint = 0n; // Balance<SUI>
  nonce: bigint = 0n; // u64

  // 로컬 키 관리
  traditionalKey: string | null = null;
  falconKey: { publicKey: string; privateKey: string } | null = null;

  constructor() {}

  // falcon key 생성
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

  // 키 반환 (Ed25519 + Falcon)
  getKeys(curAccountAddress: string) {
    return {
      ed25519Pub: curAccountAddress,
      falconPub: this.falconKey?.publicKey ?? "",
    };
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
