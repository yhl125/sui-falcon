# Sui-Falcon: Quantum-Resistant Multi-Signature Wallet on Sui

A quantum-resistant multi-signature wallet implementing the **FALCON-512** post-quantum signature scheme with on-chain verification on the Sui blockchain. This project provides a complete solution, including a Python reference implementation, Sui Move smart contracts, and a user-friendly React frontend.

## 🚀 Overview

Sui-Falcon offers a robust, forward-looking security solution for the Sui ecosystem.

  - **Quantum-Resistant Security**: Utilizes FALCON-512, a signature scheme standardized by NIST, to protect against threats from both classical and quantum computers.
  - **Hybrid Multi-Signature**: Combines traditional Ed25519 signatures with quantum-resistant FALCON signatures for dual-key security, ensuring a smooth transition to post-quantum cryptography.
  - **Full-Stack Implementation**: Includes a Python CLI for key management and signing, gas-optimized Sui smart contracts for on-chain verification, and a React frontend for seamless user interaction.
  - **Blockchain-Optimized**: Uses the `ethfalcon` variant with keccak256 hash function for Sui blockchain compatibility.
  - **Production Ready**: Features a comprehensive test suite and clear deployment instructions.

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

Create a digital signature for a piece of data using keccak256 hash function.

```bash
./sign_cli.py sign --privkey='private_key.pem' --data=<hexdata>
# Creates signature file: sig
```

#### 3\. Verify Signature (Local)

Verify the signature off-chain using the Python implementation.

```bash
./sign_cli.py verify --pubkey='public_key.pem' --data=<hexdata> --signature='sig'
```

#### 4\. Verify Signature (On-chain on Sui)

Verify the signature on the Sui blockchain by calling the deployed smart contract.

```bash
./sign_cli.py verifyonsui \
  --pubkey='public_key.pem' \
  --data=<hexdata> \
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

## 🔐 Hybrid Multi-Sig Wallet

The core of Sui-Falcon is a hybrid multi-signature wallet that mandates both a traditional (Ed25519) and a quantum-resistant (FALCON-512) signature for every transaction, providing robust, dual-layer security.

### Features

  - **Dual-Key Security**: All transactions require signatures from both an Ed25519 key (managed by a standard Sui wallet) and a FALCON key.
  - **On-Chain Treasury**: Securely manage SUI and other assets within the wallet.
  - **Nonce-Based Replay Protection**: An incrementing nonce prevents transaction replay attacks.
  - **Global Wallet Registry**: A central registry maps user addresses to their hybrid wallets for easy discovery.

### Smart Contract Logic

The `HybridWallet` stores the two public keys and enforces the dual-signature verification for all outgoing transactions.

```move
// From hybrid_wallet.move
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
// Example frontend logic for sending a payment
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

The React frontend provides a complete interface for managing the hybrid wallet.

### Features

  - **Browser-Based Cryptography**: Generates FALCON keys, signs data, and prepares transactions directly in the browser using Pyodide, ensuring private keys never leave the user's machine.
  - **Wallet Management**: Streamlines the creation of new hybrid wallets and the management of existing ones.
  - **Dual-Signature Coordination**: Guides the user through the process of providing both Ed25519 and FALCON signatures.
  - **Balance & History**: Displays the wallet's balance and transaction history.

### Running the Frontend

```bash
cd fe
npm install
npm run dev
# Access the application at http://localhost:5173
```

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
