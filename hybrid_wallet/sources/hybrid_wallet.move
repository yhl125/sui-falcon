module hybrid_wallet::hybrid_wallet;

use falcon_move::falcon512;
use std::option::{Self, Option};
use sui::balance::{Self, Balance};
use sui::bcs;
use sui::coin::{Self, Coin};
use sui::ed25519;
use sui::event;
use sui::object::{Self, UID};
use sui::sui::SUI;
use sui::table::{Self, Table};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

// ==============================
// Structs
// ==============================

public struct WalletRegistry has key {
    id: UID,
    wallets: Table<address, ID>,
}

public struct HybridWallet has key, store {
    id: UID,
    ed25519_pubkey: vector<u8>, // Ed25519/ECDSA 공개키
    falcon_pubkey: vector<u256>, // FALCON 공개키
    treasury: Balance<SUI>,
    nonce: u64,
}

// ==============================
// Events
// ==============================

public struct WalletCreated has copy, drop {
    hybrid_wallet_addr: address,
    owner: address,
}

public struct TransactionExecuted has copy, drop {
    hybrid_wallet_addr: address,
    nonce: u64,
    data_hash: vector<u8>,
}

public struct PaymentSent has copy, drop {
    hybrid_wallet_addr: address,
    recipient: address,
    amount: u64,
    nonce: u64,
}

public struct Deposited has copy, drop {
    hybrid_wallet_addr: address,
    amount: u64,
    new_balance: u64,
}

// ==============================
// Constants and Error Codes
// ==============================

const INVALID_ED25519_SIG: u64 = 0;
const INVALID_FALCON_SIG: u64 = 1;
const INSUFFICIENT_BALANCE: u64 = 2;
const INVALID_NONCE: u64 = 3;

// ==============================
// Main Functions
// ==============================

// 초기화
fun init(ctx: &mut TxContext) {
    let registry = WalletRegistry {
        id: object::new(ctx),
        wallets: table::new(ctx),
    };
    transfer::share_object(registry);
}

// 지갑 생성
public entry fun create_hybrid_wallet(
    registry: &mut WalletRegistry,
    ed25519_pubkey: vector<u8>,
    falcon_pubkey: vector<u256>,
    ctx: &mut TxContext,
) {
    let wallet_id = object::new(ctx);
    let wallet_address = object::uid_to_address(&wallet_id);
    let wallet = HybridWallet {
        id: wallet_id,
        ed25519_pubkey,
        falcon_pubkey,
        treasury: balance::zero<SUI>(),
        nonce: 0,
    };

    let sender = tx_context::sender(ctx);

    table::add(&mut registry.wallets, sender, object::uid_to_inner(&wallet.id));

    event::emit(WalletCreated {
        hybrid_wallet_addr: wallet_address,
        owner: sender,
    });

    transfer::public_transfer(wallet, sender);
}

// hybrid tx 실행
public entry fun execute_transaction(
    wallet: &mut HybridWallet,
    tx_data: vector<u8>,
    ed25519_sig: vector<u8>,
    falcon_sig: vector<u8>,
    ctx: &mut TxContext,
) {
    // ed25519 signature verification
    assert!(verify_ed25519(&wallet.ed25519_pubkey, &tx_data, &ed25519_sig), INVALID_ED25519_SIG);
    // falcon signature verification
    let is_valid = falcon512::verify_signature(
        &wallet.falcon_pubkey,
        &tx_data,
        &falcon_sig,
    );
    assert!(is_valid, INVALID_FALCON_SIG);

    wallet.nonce = wallet.nonce + 1;

    execute_wallet_operation(wallet, tx_data, ctx);

    event::emit(TransactionExecuted {
        hybrid_wallet_addr: object::uid_to_address(&wallet.id),
        nonce: wallet.nonce,
        data_hash: sui::hash::keccak256(&tx_data),
    })
}

// 결제
public entry fun send_payment(
    wallet: &mut HybridWallet,
    recipient: address,
    amount: u64,
    ed25519_sig: vector<u8>,
    falcon_sig: vector<u8>,
    ctx: &mut TxContext,
) {
    assert!(balance::value(&wallet.treasury) >= amount, INSUFFICIENT_BALANCE);

    let tx_data = encode_payment(recipient, amount, wallet.nonce);

    // ed25519 signature verification
    assert!(verify_ed25519(&wallet.ed25519_pubkey, &tx_data, &ed25519_sig), INVALID_ED25519_SIG);
    // falcon signature verification
    let is_valid = falcon512::verify_signature(
        &wallet.falcon_pubkey,
        &tx_data,
        &falcon_sig,
    );
    assert!(is_valid, INVALID_FALCON_SIG);

    transfer_tokens(wallet, recipient, amount, ctx);

    wallet.nonce = wallet.nonce + 1;

    event::emit(PaymentSent {
        hybrid_wallet_addr: object::uid_to_address(&wallet.id),
        recipient,
        amount,
        nonce: wallet.nonce,
    })
}

public entry fun deposit(wallet: &mut HybridWallet, payment: Coin<SUI>, ctx: &mut TxContext) {
    let amount = coin::value(&payment);
    let payment_balance = coin::into_balance(payment);

    balance::join(&mut wallet.treasury, payment_balance);

    event::emit(Deposited {
        hybrid_wallet_addr: object::uid_to_address(&wallet.id),
        amount,
        new_balance: balance::value(&wallet.treasury),
    });
}

// ==============================
// Helper Functions
// ==============================

public fun verify_ed25519(
    ed25519_pubkey: &vector<u8>,
    msg: &vector<u8>,
    ed25519_sig: &vector<u8>,
): bool {
    ed25519::ed25519_verify(
        ed25519_sig,
        ed25519_pubkey,
        msg,
    )
}

public fun encode_payment(recipient: address, amount: u64, nonce: u64): vector<u8> {
    let mut data = vector::empty<u8>();

    // recipient 주소를 바이트로 변환 (32바이트)
    let recipient_bytes = bcs::to_bytes(&recipient);
    vector::append(&mut data, recipient_bytes);

    // amount를 바이트로 변환 (8바이트)
    let amount_bytes = bcs::to_bytes(&amount);
    vector::append(&mut data, amount_bytes);

    // nonce를 바이트로 변환 (8바이트)
    let nonce_bytes = bcs::to_bytes(&nonce);
    vector::append(&mut data, nonce_bytes);

    data
}

public fun execute_wallet_operation(
    wallet: &mut HybridWallet,
    tx_data: vector<u8>,
    ctx: &mut TxContext,
) {}

public fun transfer_tokens(
    wallet: &mut HybridWallet,
    recipient: address,
    amount: u64,
    ctx: &mut TxContext,
) {
    let payment_balance = balance::split(&mut wallet.treasury, amount);
    let payment_coin = coin::from_balance(payment_balance, ctx);

    transfer::public_transfer(payment_coin, recipient);
}

// ==============================
// View Functions
// ==============================

// 지갑 object id 조회
public fun get_hybrid_wallet_id(registry: &WalletRegistry, user: address): Option<ID> {
    if (table::contains(&registry.wallets, user)) {
        let wallet_id = table::borrow(&registry.wallets, user);
        option::some(*wallet_id)
    } else {
        option::none()
    }
}
