# Sui-Falcon: Quantum-Resistant Multi-Signature Wallet on Sui

A quantum-resistant multi-signature wallet implementing the **FALCON-512** post-quantum signature scheme with on-chain verification on the Sui blockchain. This project provides a complete solution, including a Python reference implementation, Sui Move smart contracts, and a user-friendly React frontend.

## 🚀 Overview

Sui-Falcon offers a robust, forward-looking security solution for the Sui ecosystem.

  - **Quantum-Resistant Security**: Utilizes FALCON-512, a signature scheme standardized by NIST, to protect against threats from both classical and quantum computers.
  - **Hybrid Multi-Signature**: Combines traditional Ed25519 signatures with quantum-resistant FALCON signatures for dual-key security, ensuring a smooth transition to post-quantum cryptography.
  - **Full-Stack Implementation**: Includes a Python CLI for key management and signing, gas-optimized Sui smart contracts for on-chain verification, and a React frontend for seamless user interaction.
  - **Blockchain-Optimized**: Uses the `ethfalcon` variant with keccak256 hash function for Sui blockchain compatibility.
  - **Production Ready**: Features a comprehensive test suite and clear deployment instructions.

## 🎥 Demo & Resources

### 📹 Live Demo

[📽️ **Sui-Falcon Demo - Youtube**](https://youtu.be/GXIX_QHDv4A?si=hVTDm4MK1HG9zByj)

_Watch our comprehensive demo showcasing quantum-resistant transactions on Sui blockchain_

### 📊 Pitch Deck

[📈 **View Pitch Deck**](https://www.canva.com/design/DAGzbOf8Ctg/e2acuGvsG1nri4jOV_ZSHQ/view?utm_content=DAGzbOf8Ctg&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h197008506b) - Complete project overview, technical architecture, and roadmap

## 🏗️ Project Structure

```
sui-falcon/
├── python-ref/              # Python implementation & CLI tools
│   ├── sign_cli.py          # Main command-line interface
│   ├── falcon.py            # Core FALCON-512 implementation
│   └── tests/               # Python test suite
├── falcon_move/             # Sui smart contracts for FALCON verification
│   └── sources/
│       └── falcon512.move
├── hybrid_wallet/           # Sui smart contracts for the multi-sig wallet
│   └── sources/
│       └── hybrid_wallet.move
└── fe/                      # React frontend web application
    └── src/
        ├── hooks/
        │   └── useFalcon.ts # Browser-based FALCON logic via Pyodide
        └── components/      # UI components
```

## 🛠️ Requirements

  - Python 3.11+
  - Sui CLI
  - Node.js 18+ (for frontend)

## ⚡ Quick Start

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/your-org/sui-falcon
    cd sui-falcon
    ```

2.  **Setup Python Environment**

    ```bash
    cd python-ref
    make install
    ```

3.  **Activate Virtual Environment**

    ```bash
    # On Linux/macOS
    source myenv/bin/activate

    # On Windows
    myenv\Scripts\activate
    ```

### Basic Usage

#### 1\. Generate Keys

Generate a new FALCON key pair. Uses the `ethfalcon` variant with keccak256 hash function for Sui blockchain compatibility.

```bash
./sign_cli.py genkeys --version='ethfalcon'
# Creates: private_key.pem, public_key.pem
```

#### 2\. Sign Data

Create a digital signature for a piece of hex data using keccak256 hash function.

```bash
./sign_cli.py sign --privkey='private_key.pem' --data=546869732069732061207472616e73616374696f6e
# Creates signature file: sig
```

#### 3\. Verify Signature (Local)

Verify the signature off-chain using the Python implementation.

```bash
./sign_cli.py verify --pubkey='public_key.pem' --data=546869732069732061207472616e73616374696f6e --signature='sig'
```

#### 4\. Verify Signature (On-chain on Sui)

Verify the signature on the Sui blockchain by calling the deployed smart contract.

```bash
./sign_cli.py verifyonsui \
  --pubkey='public_key.pem' \
  --data=546869732069732061207472616e73616374696f6e \
  --signature='sig' \
  --packageid='0x9a8703dc46ec28ac45098030a0dbfeffc7c30323bb69300f70a887fa5c9ef99c'
```

## 🚀 Core Smart Contract: FALCON-512 On-Chain Verification

**The heart of Sui-Falcon is the `falcon512.move` contract** - the first production-ready implementation of post-quantum cryptography on Sui blockchain.

### 📜 Contract Details

**FALCON Verification Contract (Sui Testnet):**
- **Package ID**: `0x9a8703dc46ec28ac45098030a0dbfeffc7c30323bb69300f70a887fa5c9ef99c`
- **Module**: `falcon512`

**Hybrid Wallet Contract (Sui Testnet):**
- **Package ID**: `0x71f954d61db852751260638fd5cd5e3f8408e59640855a2fadcd905839537141`
- **Module**: `hybrid_wallet`

**Security Level**: NIST Level 1 (equivalent to AES-128)

### ⚡ Gas-Optimized Implementation

To make on-chain post-quantum cryptography feasible, we implemented breakthrough optimizations:

- **Keccak256 Hash Function**: Adapted from shake256 to keccak256 for blockchain compatibility and efficiency
- **Compacted u256 Format**: Essential compression technique to fit large FALCON keys/signatures within Move's data input limits
- **Vectorized NTT Operations**: Gas-efficient Number Theoretic Transform with optimized twiddle factors
- **Memory Optimization**: Carefully structured data to minimize Move VM memory usage during verification


### 🔧 Key Functions

```move
/// Verifies a FALCON-512 signature on-chain
/// Returns true if signature is valid, false otherwise
public fun verify_signature(
    public_key_compacted: &vector<u256>,    // 32 u256 words (compressed)
    message: &vector<u8>,                   // Message to verify
    signature: &vector<u8>                  // FALCON signature
): bool

/// CLI-compatible verification interface
public fun verify_signature_cli(
    public_key_compacted: vector<u256>,
    message: vector<u8>,
    signature: vector<u8>
): bool
```

### 🧪 Comprehensive Testing

The contract includes extensive test vectors and edge case handling:

```bash
cd falcon_move
sui move test
# Runs comprehensive test suite including:
# - Standard FALCON test vectors
# - Browser-generated signatures
# - Edge cases and error handling
# - Gas optimization validation
```

### 🔒 Security Comparison

| Signature Scheme | Quantum Resistance | NIST Status | Use Case |
|-------------------|-------------------|-------------|----------|
| **FALCON-512** | **✅ Resistant** | **Standardized** | **Future-proof** |
| Ed25519 | ❌ Vulnerable | Current standard | Legacy compatibility |

## 🔐 Hybrid Multi-Sig Wallet (Development Status)

The Sui-Falcon project includes a hybrid multi-signature wallet concept that mandates both traditional (Ed25519) and quantum-resistant (FALCON-512) signatures for every transaction. **This component is currently under development** with integration challenges being resolved.

### Implementation Status

⚠️ **Current Limitation**: The hybrid wallet contracts have integration issues with intent prefix signature verification, preventing full frontend integration. The project is currently focused on rigorous testing of the core FALCON-512 implementation.

### Planned Features

  - **Dual-Key Security**: All transactions require signatures from both an Ed25519 key (managed by a standard Sui wallet) and a FALCON key.
  - **On-Chain Treasury**: Securely manage SUI and other assets within the wallet.
  - **Nonce-Based Replay Protection**: An incrementing nonce prevents transaction replay attacks.
  - **Global Wallet Registry**: A central registry maps user addresses to their hybrid wallets for easy discovery.

### Smart Contract Architecture

The `HybridWallet` design stores two public keys and enforces dual-signature verification:

```move
// From hybrid_wallet.move (under development)
public struct HybridWallet has key, store {
    id: UID,
    ed25519_pubkey: vector<u8>,    // Traditional public key
    falcon_pubkey: vector<u256>,   // Quantum-resistant public key (compressed)
    treasury: Balance<SUI>,        // Wallet balance
    nonce: u64,                    // Transaction counter for replay protection
}
```

### Transaction Workflow (Frontend)

The React frontend abstracts the complexity of dual-signing into a simple user workflow.

```typescript
// Planned frontend logic for hybrid wallet (future implementation)
const sendPayment = async (recipient: string, amount: bigint) => {
  // 1. Prepare the transaction payload with the current nonce
  const txData = wallet.encodePayment(recipient, amount, nonce);

  // 2. User signs with their connected Ed25519 wallet (e.g., Sui Wallet)
  const ed25519Sig = await signPersonalMessage(txData);

  // 3. The frontend generates the FALCON signature in the browser via Pyodide
  const falconSig = await wallet.signWithFalcon(txData);

  // 4. Submit the transaction to the smart contract with both signatures
  await hybridWallet.sendPayment(recipient, amount, ed25519Sig, falconSig);
};
```

## Frontend Web Application

The React frontend currently features a FALCON signature testing interface while the hybrid wallet implementation is temporarily disabled for focused quantum cryptography testing.

### Current Status (Hackathon/Testing Phase)

Due to integration challenges with the hybrid wallet's intent prefix signature verification, **the frontend currently shows only the FalconDemo component** for isolated testing of FALCON-512 quantum-safe signatures. This allows for focused testing and validation of the core cryptographic implementation.

### FalconDemo Features

  - **Browser-Based Cryptography**: Generates FALCON keys, signs data, and verifies signatures directly in the browser using Pyodide
  - **Step-by-Step Testing Interface**: Guides through initialization, key generation, signing, verification, and Move contract preparation
  - **Move Contract Integration**: Outputs data in the exact format required by the `falcon512.move` contract
  - **Test Vector Validation**: Uses test vectors matching `test_browser_vector()` function in the Move contract
  - **Console Integration**: Exposes compressed data to browser console for easy copying to Move tests

### Frontend Architecture

```typescript
// Current App.tsx configuration (testing mode)
function App() {
  return <FalconDemo />; // Simplified for FALCON testing
}

// Standard configuration (temporarily commented)
// return (
//   <HybridWalletProvider>
//     {!started ? <StartPage /> : <WalletPage />}
//   </HybridWalletProvider>
// );
```

### Running the Frontend

```bash
cd fe
npm install
npm run dev
# Access the FALCON testing interface at http://localhost:5173
```

### Hybrid Wallet Implementation Notes

The hybrid wallet frontend components remain available but are currently disabled due to:
- Intent prefix signature verification issues in the smart contract
- Focus on rigorous testing of FALCON-512 implementation before full integration
- Need for community feedback on standardization as a new native wallet authenticator

The full hybrid wallet interface will be re-enabled after resolving the signature verification integration.

## 📊 Key Specifications

FALCON-512 cryptographic parameters and data sizes:

| Component | Size | Description |
|-----------|------|-------------|
| Private Key | 1,281 bytes | Complete FALCON-512 private key |
| Public Key | 897 bytes | Raw FALCON-512 public key |
| Signature | ~666 bytes | Average signature size |
| **Compressed Public Key** | **32 u256 words** | **Optimized for Move contract** |
| **Compressed Signature** | **Variable** | **Gas-efficient format** |

## 🧪 Testing

Comprehensive test suites are available for all components of the project.

### Python Tests

```bash
cd python-ref
make test             # Run all Python tests
make test_falcon      # Test core FALCON implementation
make bench            # Run performance benchmarks
```

### Sui Contract Tests

```bash
cd falcon_move
sui move test

cd ../hybrid_wallet
sui move test
```

### Frontend Tests

```bash
cd fe
npm test
```

### Local Deployment

Deploy your own instance of the FALCON verification contract:

```bash
cd falcon_move
sui client publish --gas-budget 100000000
```

## 🤝 Contributing

Contributions are welcome\! Please follow these steps:

1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-feature`).
3.  Make your changes and add corresponding tests.
4.  Ensure the entire test suite passes.
5.  Submit a pull request with a clear description of your changes.


## 🌟 Project Origins & Technical Background

This project builds upon [ETHFALCON](https://github.com/ZKNoxHQ/ETHFALCON).

### Key Innovations for Sui

- **Platform Migration**: Ported ETHFALCON's Solidity logic to Sui Move, transforming Ethereum's memory model to Move's resource-oriented paradigm
- **Move Compatibility**: Implemented compacted u256 format to overcome Move's data input limitations for large cryptographic parameters
- **Sui Integration**: Extended python-ref with `verifyonsui` command for native Sui CLI workflows
- **Hybrid Wallet System**: Built upon core verification to create novel dual-signature (Ed25519 + FALCON) wallet architecture

Special thanks to the [ZKNox](https://github.com/ZKNoxHQ) team for pioneering blockchain post-quantum cryptography and demonstrating its feasibility.

## 📚 References

  - [FALCON Specification](https://falcon-sign.info/)
  - [NIST Post-Quantum Cryptography Project](https://csrc.nist.gov/projects/post-quantum-cryptography)
  - [Sui Documentation](https://docs.sui.io/)
  - [ETHFALCON - Original Ethereum Implementation](https://github.com/ZKNoxHQ/ETHFALCON)
