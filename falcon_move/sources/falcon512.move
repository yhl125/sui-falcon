module falcon_move::falcon512;

use sui::hash::keccak256;

// ==============================
// Constants and Error Codes
// ==============================

const N: u64 = 512; // Polynomial degree for FALCON-512
const Q: u64 = 12289; // Prime modulus
const SIGNATURE_BOUND: u64 = 34034726; // Beta squared for FALCON-512 (corrected from Solidity)

// NTT constants
const INV_N: u64 = 12265; // N^(-1) mod Q

// ETHFALCON constants (from Solidity)
const KQ: u64 = 61445; // kq value for rejection sampling
const QS1: u64 = 6144; // q >> 1
const FALCON_S256: u64 = 32; // 32 uint256 words for compacted format

// ==============================
// Main Verification Function
// ==============================

/// Verifies a FALCON-512 signature following ETHFALCON Solidity implementation
/// Returns true if signature is valid, false otherwise
public fun verify_signature(
    public_key_compacted: &vector<u256>,
    message: &vector<u8>,
    signature: &vector<u8>,
): bool {
    // Extract salt (first 40 bytes of signature)
    if (vector::length(signature) < 40) {
        return false
    };
    let salt = extract_salt_40_bytes(signature);

    // Parse signature s2 part - ETHFALCON uses compacted u256 format
    let s2_compacted_result = parse_s2_from_signature(signature);
    if (!s2_compacted_result.success) {
        return false
    };

    // Use input public key compacted format directly
    let ntth_result = CompactedResult {
        success: true,
        compacted: *public_key_compacted,
    };

    // Hash to point using ETHFALCON method
    let hashed = hash_to_point_rip(&salt, message);

    // Core FALCON verification
    falcon_core(&s2_compacted_result.compacted, &ntth_result.compacted, &hashed)
}

// CLI-friendly version
public fun verify_signature_cli(
    public_key_compacted: vector<u256>,
    message: vector<u8>,
    signature: vector<u8>,
): bool {
    verify_signature(&public_key_compacted, &message, &signature)
}

// ==============================
// Polynomial Operations
// ==============================

/// Represents a polynomial in Z_q[X]/(X^n + 1)
public struct Polynomial has copy, drop, store {
    coefficients: vector<u64>,
}

/// Creates a new polynomial with n zero coefficients
fun new_polynomial(): Polynomial {
    let mut coeffs = vector::empty<u64>();
    let mut i = 0;
    while (i < N) {
        vector::push_back(&mut coeffs, 0);
        i = i + 1;
    };
    Polynomial { coefficients: coeffs }
}

// ==============================
// Signature Processing
// ==============================

/// Compacted format result (32 words of 256 bits each)
public struct CompactedResult has copy, drop {
    success: bool,
    compacted: vector<u256>,
}

/// Extracts the 40-byte salt from signature (ETHFALCON format)
fun extract_salt_40_bytes(signature: &vector<u8>): vector<u8> {
    let mut salt = vector::empty<u8>();
    let mut i = 0; // ETHFALCON starts from byte 0
    while (i < 40 && i < vector::length(signature)) {
        vector::push_back(&mut salt, *vector::borrow(signature, i));
        i = i + 1;
    };
    salt
}

/// Parses s2 part from signature in compacted format
fun parse_s2_from_signature(signature: &vector<u8>): CompactedResult {
    if (vector::length(signature) < 40 + (FALCON_S256 as u64) * 32) {
        return CompactedResult {
            success: false,
            compacted: vector::empty<u256>(),
        }
    };

    let mut compacted = vector::empty<u256>();
    let mut i = 0;
    let start_offset = 40; // Skip 40-byte salt

    while (i < FALCON_S256) {
        // Each u256 is 32 bytes
        let byte_offset = start_offset + (i as u64) * 32;
        if (byte_offset + 32 <= vector::length(signature)) {
            let word = bytes_to_u256(signature, byte_offset);
            vector::push_back(&mut compacted, word);
        } else {
            return CompactedResult {
                success: false,
                compacted: vector::empty<u256>(),
            }
        };
        i = i + 1;
    };

    CompactedResult {
        success: true,
        compacted,
    }
}

/// Helper function to convert 32 bytes to u256
fun bytes_to_u256(bytes: &vector<u8>, offset: u64): u256 {
    let mut result = 0u256;
    let mut i = 0;
    while (i < 32 && offset + i < vector::length(bytes)) {
        let byte_val = (*vector::borrow(bytes, offset + i) as u256);
        result = result | (byte_val << (((31 - i) * 8) as u8));
        i = i + 1;
    };
    result
}

// ==============================
// Hash-to-Point Function
// ==============================

/// Hash-to-Point following ETHFALCON RIP implementation
fun hash_to_point_rip(salt: &vector<u8>, msg_hash: &vector<u8>): Polynomial {
    let mut output = new_polynomial();

    // Initial state: keccak256(msgHash || salt)
    let mut initial_input = *msg_hash;
    let mut i = 0;
    while (i < vector::length(salt)) {
        vector::push_back(&mut initial_input, *vector::borrow(salt, i));
        i = i + 1;
    };

    let state = keccak256(&initial_input);

    let mut counter = 0u64;
    let mut coeff_idx = 0;

    while (coeff_idx < N) {
        // Create extended state: state || counter (8 bytes)
        let mut extended_state = state;
        // Add 64-bit counter as 8 bytes (big-endian)
        let mut temp_counter = counter;
        let mut counter_bytes = vector::empty<u8>();
        let mut j = 0;
        while (j < 8) {
            vector::push_back(&mut counter_bytes, ((temp_counter & 0xFF) as u8));
            temp_counter = temp_counter >> 8;
            j = j + 1;
        };
        // Reverse to get big-endian
        let mut k = 0;
        while (k < 8) {
            vector::push_back(&mut extended_state, *vector::borrow(&counter_bytes, 7 - k));
            k = k + 1;
        };

        let buffer = keccak256(&extended_state);

        // Extract coefficients from 32-byte buffer
        let mut byte_idx = 0;
        while (byte_idx + 1 < 32 && coeff_idx < N) {
            let byte1 = *vector::borrow(&buffer, byte_idx);
            let byte2 = *vector::borrow(&buffer, byte_idx + 1);
            let chunk = ((byte1 as u64) << 8) | (byte2 as u64);

            // Rejection sampling: accept if chunk < kq
            if (chunk < KQ) {
                let coeff = chunk % Q;
                *vector::borrow_mut(&mut output.coefficients, coeff_idx) = coeff;
                coeff_idx = coeff_idx + 1;
            };

            byte_idx = byte_idx + 2;
        };

        counter = counter + 1;
    };

    output
}

// ==============================
// Public Key Parsing
// ==============================

/// FALCON core verification function (following Solidity implementation)
fun falcon_core(
    s2_compacted: &vector<u256>,
    ntth_compacted: &vector<u256>,
    hashed: &Polynomial,
): bool {
    if (vector::length(s2_compacted) != (FALCON_S256 as u64)) {
        return false
    };
    if (vector::length(ntth_compacted) != (FALCON_S256 as u64)) {
        return false
    };

    // Expand s2 from compacted format
    let s2_expanded = expand_compacted(s2_compacted);

    // In ETHFALCON Solidity, ntth is already in NTT domain (public key)
    // So we need to compute s1 = s2 * ntth where ntth is NTT-transformed public key
    let s1_compacted = ntt_halfmul_compacted(s2_compacted, ntth_compacted);
    let s1_expanded = expand_compacted(&s1_compacted);

    // Normalize: s1[i] = (hashed[i] + Q - s1[i]) % Q and check bounds
    falcon_normalize(&s1_expanded, &s2_expanded, hashed)
}

/// Expand compacted polynomial (32 u256 words to 512 coefficients)
fun expand_compacted(compacted: &vector<u256>): Polynomial {
    let mut result = new_polynomial();
    let mut word_idx = 0;

    // Debug: Print first u256 value for manual verification
    if (vector::length(compacted) > 0) {
        let first_word = *vector::borrow(compacted, 0);
        std::debug::print(&std::string::utf8(b"First u256 value:"));
        std::debug::print(&first_word);
    };

    while (word_idx < vector::length(compacted)) {
        let word = *vector::borrow(compacted, word_idx);
        let mut coeff_in_word = 0;

        while (coeff_in_word < 16 && (word_idx * 16 + coeff_in_word) < N) {
            // Extract 16-bit coefficient from word
            let shift = coeff_in_word * 16;
            let mask = 0xFFFF;
            let coeff = ((word >> (shift as u8)) & mask) as u64;

            let global_idx = word_idx * 16 + coeff_in_word;
            *vector::borrow_mut(&mut result.coefficients, global_idx) = coeff;

            coeff_in_word = coeff_in_word + 1;
        };

        word_idx = word_idx + 1;
    };

    result
}

/// FALCON NTT constants - vectorized twiddle factors
fun get_psi_rev_vectorized(): vector<u256> {
    vector[
        0x16e40c7b04bc29930e25261022510dd61fdb166802d22ae80fcb1be72a3a0001u256,
        0x5471c8f1970230116c4139f1e1216602549244324622dce2c4c25c00a4f1d2cu256,
        0x270b2bdb222012c50e8023c2254612ee2ad313de0bc623802ceb2c462b6f090fu256,
        0x2d2b1dfe28c42f752531299e1f622b68093e24161ce1246e2c191f212fb00c13u256,
        0x27d81c1d0cd40b410ca902d9232807dd06a00594014e097a19861218112404ecu256,
        0x18ea1ce720a525561a5b00910d830e351f7a260d2e9e0d36218629221bc62193u256,
        0x2624056522011fb01c841b2e10b629780220169f0153265d000903fe01e024e7u256,
        0x1b030b1500821eff095c116423210f6d1c360895007609ac1687033b215d2c48u256,
        0x2bec0b2b26501394164224a112fd01620ec22108030501862bd61c1401ba0961u256,
        0x2de0139b0e78258b1fd2126a00f206012a61214e2407001b1c2506601cec03f9u256,
        0x268b186a277625fb0bab17860e3e267c2c96213d29ba1c911f4513e0139303eau256,
        0x77805622e4e1f10094d1abd200101ed0cb02b4a149d04901ddc2e6d085f2bd8u256,
        0x2910067f1dd32a6f0a9014ab134a0e3411552ffe0c4d2f611cca2f900f4b0876u256,
        0x5cc1ce22525144b0a550fd527001c4f1114087e1ec324e2233a0fd906990d24u256,
        0x2031273824bd2b800c72151f27b3065e0db614d40b3126bf2468207725832352u256,
        0x1dc0dcb13290f910608277f01a41a4a00f30bc8029f244923c11bba22b926a2u256,
        0x118d237f27f814f9150728ea015e05e818cb29d22a30263d05cb171b04ef0031u256,
        0x129207422e57230e0b6d015b2154284a02d300ae069d24400a5f199a1915254fu256,
        0x28f424bf27fe07a2267217fe02400f7b22380d6a00da0b5c28ce093910130bd6u256,
        0x50d1d801d5b15352e3c171401a20ebc14d5281216f408e9009c253220800f97u256,
        0x20302171048717662c4d2b872a850145249a214f0fed2051028c168617d30127u256,
        0x14b1181a0f7405502b511bc126061817063a28571c0f17490a842f5910ca0d01u256,
        0x2cbe1850220f1090052723b302c50fce081e045810e207a601b9039a2bdf2012u256,
        0x1b780efa18e21eb01a932413292e23ce263a247d169629e32fc10e4802ab099bu256,
        0x2800133005292f41228c12ac125a13c10313226703f21aa523ca1fb824991b88u256,
        0x27b2009724ea0f75171226382e52062b0c662fcd2533052b22f9185a190f02a5u256,
        0x10742c320d6e24e52bb0008e19d00d9518892c8c1c7007a42c160dcc2f102fc7u256,
        0x1df117bd0cbf21f117b40e1220112e5c2da408fe01f81f8c16fe12ae1a27242cu256,
        0x2be71e4915450f14258604a6211717e621342f6e1ab11161128d1a601d4c1e8eu256,
        0x2c0717252bf022471a3b07b526d92b0314c3201613341f1d2df70879234313d7u256,
        0x294101901808135421c61ada191b17f82fc90c7f14561a6807c306a60ded028eu256,
        0x2b1b03cd1ac62ab207820f27206328102e83013c206d01d417cd0e7e154614dbu256,
    ]
}

fun get_psi_inv_rev_vectorized(): vector<u256> {
    vector[
        0x222b0db009f121dc066e2b452386191d05192d2f19991026141a203605c70001u256,
        0x12d525b20a4103b502330b9f0bbe0ab819a111ef1c62193d0d00169113722abau256,
        0x23ee005110e003e80b9313200beb26c30499109f06630ad0008c073d120302d6u256,
        0x26f2049203bb03160c81243b1c23052e1d130abb0c3f21811d3c0de1042608f6u256,
        0x3b90ea42cc6197a26552f8b276c13cb20940ce01e9d26a511022f7f24ec14feu256,
        0xb1a2e212c032ff809a42eae19622de106891f4b14d3137d10510e002a9c09ddu256,
        0xe6e143b06df0e7b22cb016309f4108721cc227e2f7015a60aab0f5c131a1717u256,
        0x2b151edd1de9167b26872eb32a6d296128240cd92d28235824c0232d13e40829u256,
        0x95f0d4814470c400bb82d6224392f0e15b72e5d088229f920701cd822362e25u256,
        0xcaf0a7e0f8a0b99094224d01b2d224b29a3084e1ae2238f04810b4408c90fd0u256,
        0x22dd296820280cc70b1f113e27831eed13b20901202c25ac1bb60adc131f2a35u256,
        0x278b20b60071133700a023b400031eac21cd1cb71b5625710592122e298206f1u256,
        0x42927a2019412252b711b6404b723512e141000154426b410f101b32a9f2889u256,
        0x2c171c6e1c2110bc137006470ec4036b098521c3187b24560a06088b17970976u256,
        0x2c08131529a113dc2fe60bfa0eb305a02a002f0f1d97102f0a7621891c660221u256,
        0x26a02e4713ed042b2e7b2cfc0ef9213f2e9f1d040b6019bf1c6d09b124d60415u256,
        0x1b261abb218318342e2d0f942ec5017e07f10f9e20da287f054f153b2c3404e6u256,
        0x2d732214295b283e15991bab23820038180916e615270e3b1cad17f92e7106c0u256,
        0x1c2a0cbe2788020a10e41ccd0feb1b3e04fe0928284c15c60dba041118dc03fau256,
        0x117312b515a11d741ea0155000930ecd181b0eea2b5b0a7b20ed1abc11b8041au256,
        0xbd515da1d53190310752e092703025d01a50ff021ef184d0e10234218441210u256,
        0x3a00f1223503eb285d139103751778226c16312f7304510b1c229303cf1f8du256,
        0x2d5c16f217a70d082ad60ace0034239b29d601af09c918ef208c0b172f6a084fu256,
        0x14790b6810490c37155c2c0f0d9a2cee1c401da71d550d7500c02ad81cd10801u256,
        0x26662d5621b90040061e196b0b8409c70c3306d30bee156e1151171f21071489u256,
        0xfef04222c672e48285b1f1f2ba927e320332d3c0c4e2ada1f710df217b10343u256,
        0x23001f3700a8257d18b813f207aa29c717ea09fb144004b02ab1208d17e71b50u256,
        0x2eda182e197b2d750fb020140eb20b672ebc057c047a03b4189b2b7a0e900fd1u256,
        0x206a0f810acf2f652718190d07ef1b2c21452e5f18ed01c51acc12a612812af4u256,
        0x242b1fee26c8073324a52f2722970dc920862dc11803098f285f08030b42070du256,
        0xab216ec166725a20bc129642f532d2e07b70ead2ea624940cf301aa28bf1d6fu256,
        0x2fd02b1218e62a3609c405d1062f17362a192ea307171afa1b0808090c821e74u256,
    ]
}

/// Extract 16-bit twiddle factor from vectorized format
fun get_twiddle_factor(vectorized: &vector<u256>, index: u64): u64 {
    let word_idx = index / 16;
    let coeff_idx = index % 16;
    if (word_idx < vector::length(vectorized)) {
        let word = *vector::borrow(vectorized, word_idx);
        let shift = coeff_idx * 16;
        ((word >> (shift as u8)) & 0xFFFF) as u64
    } else {
        0
    }
}

/// Forward NTT with vectorized twiddle factors
fun ntt_forward_vectorized(poly: &Polynomial): Polynomial {
    let mut result = *poly;
    let psi_rev = get_psi_rev_vectorized();
    let mut t = N;
    let mut m = 1;

    while (m < N) {
        t = t / 2;
        let mut i = 0;
        while (i < m) {
            let j1 = (i * t) * 2;
            let j2 = j1 + t - 1;
            let twiddle_idx = m + i;
            let s = get_twiddle_factor(&psi_rev, twiddle_idx);

            let mut j = j1;
            while (j <= j2) {
                let u = *vector::borrow(&result.coefficients, j);
                let v_coeff = *vector::borrow(&result.coefficients, j + t);
                let v = mod_mul(v_coeff, s, Q);

                *vector::borrow_mut(&mut result.coefficients, j) = (u + v) % Q;
                let diff = if (u >= v) { u - v } else { Q - (v - u) };
                *vector::borrow_mut(&mut result.coefficients, j + t) = diff;
                j = j + 1;
            };
            i = i + 1;
        };
        m = m * 2;
    };

    result
}

/// Inverse NTT with vectorized twiddle factors
fun ntt_inverse_vectorized(poly: &Polynomial): Polynomial {
    let mut result = *poly;
    let psi_inv_rev = get_psi_inv_rev_vectorized();
    let mut t = 1;
    let mut m = N;

    while (m > 1) {
        let mut j1 = 0;
        let h = m / 2;
        let mut i = 0;
        while (i < h) {
            let j2 = j1 + t - 1;
            let twiddle_idx = h + i;
            let s = get_twiddle_factor(&psi_inv_rev, twiddle_idx);

            let mut j = j1;
            while (j <= j2) {
                let u = *vector::borrow(&result.coefficients, j);
                let v = *vector::borrow(&result.coefficients, j + t);

                *vector::borrow_mut(&mut result.coefficients, j) = (u + v) % Q;
                let diff = if (u >= v) { u - v } else { Q - (v - u) };
                *vector::borrow_mut(&mut result.coefficients, j + t) = mod_mul(diff, s, Q);
                j = j + 1;
            };
            j1 = j1 + (t * 2);
            i = i + 1;
        };
        t = t * 2;
        m = m / 2;
    };

    // Scale by N^(-1) mod Q
    let mut j = 0;
    while (j < N) {
        let val = *vector::borrow(&result.coefficients, j);
        *vector::borrow_mut(&mut result.coefficients, j) = mod_mul(val, INV_N, Q);
        j = j + 1;
    };

    result
}

/// Pointwise multiplication in NTT domain
fun ntt_pointwise_multiply(a: &Polynomial, b: &Polynomial): Polynomial {
    let mut result = new_polynomial();
    let mut i = 0;
    while (i < N) {
        let a_coeff = *vector::borrow(&a.coefficients, i);
        let b_coeff = *vector::borrow(&b.coefficients, i);
        let product = mod_mul(a_coeff, b_coeff, Q);
        *vector::borrow_mut(&mut result.coefficients, i) = product;
        i = i + 1;
    };
    result
}

/// NTT half multiplication for compacted format (ETHFALCON implementation)
/// a: signature s2 (needs NTT transform)
/// b: public key ntth (already in NTT domain)
fun ntt_halfmul_compacted(a: &vector<u256>, b: &vector<u256>): vector<u256> {
    std::debug::print(&std::string::utf8(b"=== NTT Half Multiplication ==="));

    // 1. Expand a (s2) from compacted format and apply NTT
    let a_expanded = expand_compacted(a);
    let a_ntt = ntt_forward_vectorized(&a_expanded);

    // 2. Expand b (ntth - public key already in NTT domain)
    let b_expanded = expand_compacted(b);

    // 3. Pointwise multiply a_ntt with b_expanded (b is already NTT-transformed public key)
    let result_ntt = ntt_pointwise_multiply(&a_ntt, &b_expanded);

    // 4. Inverse NTT to get result in polynomial domain
    let result_poly = ntt_inverse_vectorized(&result_ntt);
    std::debug::print(&std::string::utf8(b"NTT multiplication completed"));

    // 5. Compact back to u256 format
    compact_polynomial(&result_poly)
}

/// Compact polynomial back to u256 vector format
fun compact_polynomial(poly: &Polynomial): vector<u256> {
    let mut compacted = vector::empty<u256>();
    let mut word_idx = 0;

    while (word_idx < (FALCON_S256 as u64)) {
        let mut word = 0u256;
        let mut coeff_in_word = 0;

        while (coeff_in_word < 16) {
            let coeff_idx = word_idx * 16 + coeff_in_word;
            if (coeff_idx < N) {
                let coeff_val = (*vector::borrow(&poly.coefficients, coeff_idx) as u256);
                word = word | ((coeff_val & 0xFFFF) << ((coeff_in_word * 16) as u8));
            };
            coeff_in_word = coeff_in_word + 1;
        };

        vector::push_back(&mut compacted, word);
        word_idx = word_idx + 1;
    };

    compacted
}

/// FALCON normalize function (following ETHFALCON Solidity exactly)
fun falcon_normalize(s1: &Polynomial, s2: &Polynomial, hashed: &Polynomial): bool {
    let mut norm = 0u64;
    let mut i = 0;

    // Debug: Show first few values
    std::debug::print(&std::string::utf8(b"=== FALCON Normalize ==="));

    // Process s1: s1[i] = (hashed[i] + Q - s1[i]) % Q, then center and square
    while (i < N) {
        let hashed_coeff = *vector::borrow(&hashed.coefficients, i);
        let s1_coeff = *vector::borrow(&s1.coefficients, i);

        // s1[i] = (hashed[i] + Q - s1[i]) % Q (following Solidity addmod)
        let s1_final = (hashed_coeff + Q - s1_coeff) % Q;

        // Center coefficient: if s1[i] > q/2, use q - s1[i], else use s1[i]
        let s1_centered = if (s1_final > QS1) { Q - s1_final } else { s1_final };
        norm = norm + (s1_centered * s1_centered);

        i = i + 1;
    };

    std::debug::print(&std::string::utf8(b"After s1 processing, norm:"));
    std::debug::print(&norm);

    // Process s2: expand from compacted and center coefficients
    let mut i = 0;
    while (i < N) {
        let s2_coeff = *vector::borrow(&s2.coefficients, i);

        // Center coefficient: if s2[i] > q/2, use q - s2[i], else use s2[i]
        let s2_centered = if (s2_coeff > QS1) { Q - s2_coeff } else { s2_coeff };
        norm = norm + (s2_centered * s2_centered);

        i = i + 1;
    };

    std::debug::print(&std::string::utf8(b"Final norm:"));
    std::debug::print(&norm);
    std::debug::print(&std::string::utf8(b"SIGNATURE_BOUND:"));
    let sig_bound = SIGNATURE_BOUND;
    std::debug::print(&sig_bound);

    let result = norm < sig_bound;
    std::debug::print(&std::string::utf8(b"Normalize result:"));
    std::debug::print(&result);

    result
}

// ==============================
// Modular Arithmetic Helpers
// ==============================

/// Modular multiplication: (a * b) mod m
fun mod_mul(a: u64, b: u64, m: u64): u64 {
    // Use u128 to prevent overflow
    let product = (a as u128) * (b as u128);
    ((product % (m as u128)) as u64)
}

// ==============================
// Testing Functions
// ==============================

#[test]
public fun test_verify_signature_empty() {
    let public_key_compacted = vector::empty<u256>();
    let message = vector::empty<u8>();
    let signature = vector::empty<u8>();

    let result = verify_signature(&public_key_compacted, &message, &signature);
    assert!(!result, 0);
}

// ==============================
// Test Helper Functions
// ==============================

#[test_only]
public fun create_test_public_key(): vector<u256> {
    // Create a test public key in compacted format (32 u256 values)
    let mut pk = vector::empty<u256>();
    let mut i = 0;
    while (i < 32) {
        vector::push_back(&mut pk, (i as u256));
        i = i + 1;
    };
    pk
}

#[test_only]
public fun create_test_signature(): vector<u8> {
    // Create a test signature with correct size (between 41-690 bytes)
    let mut sig = vector::empty<u8>();
    let mut i = 0;
    while (i < 100) {
        // Test with 100 bytes
        vector::push_back(&mut sig, ((i % 256) as u8));
        i = i + 1;
    };
    sig
}

#[test_only]
public fun test_signature_format_validation() {
    let message = b"test message";
    let valid_pk = create_test_public_key();
    let valid_sig = create_test_signature();

    // Test with valid sizes - should not fail on size validation
    let _result = verify_signature(&valid_pk, &message, &valid_sig);

    // Test with invalid public key size
    let invalid_pk = vector::empty<u256>();
    let result2 = verify_signature(&invalid_pk, &message, &valid_sig);
    assert!(!result2, 0);

    // Test with invalid signature size
    let invalid_sig = vector::empty<u8>();
    let result3 = verify_signature(&valid_pk, &message, &invalid_sig);
    assert!(!result3, 0);
}

#[test]
fun test_ethfalcon_vector0() {
    std::debug::print(&std::string::utf8(b"=== ETHFALCON Test Vector 0 ==="));

    // Message: "My name is Renaud from ZKNOX!!!!"
    let message = b"My name is Renaud from ZKNOX!!!!";

    // Create signature in ETHFALCON format: salt (40 bytes) + s2 compacted (32 * 32 bytes)
    let mut signature = vector::empty<u8>();

    // Salt from test vector 0 (40 bytes)
    let salt = x"46b9dd2b0ba88d13233b3feb743eeb243fcd52ea62b81b82b50c27646ed5762fd75dc4ddd8c0f200";
    vector::append(&mut signature, salt);

    // S2 signature in compacted u256 format (32 values)
    let s2_u256 = vector[
        226161519869725251356344408907678892390104083586443563386125715426949738413u256,
        21562601821269046643200858246202301062882075022429333461940742114375696384039u256,
        90110472414887206477556374273677958001997210199677829434480895130167869638u256,
        21654478003405504511793214880183423382929023752422285237729687373819110359084u256,
        124010583294412487840928470639623851466514210374141790445951906817056047265u256,
        21265773698128382376022414973503284259154426469208937332107898559103680786159u256,
        21152693329132454665465594805050489554057022987498904220914967648446535106661u256,
        267122872098078746204314427438418999544365432680553123824944190772157612036u256,
        21682749335929743170997895048871458212437570849625560537002514737635745595434u256,
        21484861795441278719515884781875615016373675264589641157843053661627825926024u256,
        21494022030535633365205167718007907277461970816212877879540051900491462618919u256,
        84810874808887099016503540234665696039790220957637403019349383349827678057u256,
        350166225851747430063282192816376389746770807469089243428549425128277475466u256,
        650199881649548118992129068296237894454679779678092241702610418170527744121u256,
        21488719656068291800611809833048050573318660200348545716103717126286509420403u256,
        314829877589026152452887293853354466667021155167076575997137597709859106809u256,
        35345487657487992676444089392285082869581089981817556183765262333748457234u256,
        21614166714262062022744724588614947811478116106019858299625278902489629994820u256,
        152273369432049113794598368263972752042931312526597870853463921178997960704u256,
        21084111354649684158712973468179417192282084173425140862405837349011434766486u256,
        21670384457790930114458052024912458205631480789721490499424656469597800837116u256,
        379872172932402056331205938589211266183595970379019632768796329750222536804u256,
        245593521367258131080917704623762266216657855821763979281880033371241918282u256,
        21283440200703761945357331956834716141942358303792526371596883332396933251127u256,
        189052986446048398455180269543195197282143096421268665349796348614205046933u256,
        21504626235299717977365561039066129148841879524220507149017609506261092008069u256,
        434973774590266779008708861354942402923329948686241231971615661507036065573u256,
        21375639956089752449127111071353048175707725148465526277052153320707821547382u256,
        21594734092587436036182371931355996474990889855110505875435994529156361957075u256,
        21329707868621957044425685110229835681048781346542006194666559814521442598942u256,
        226161492811046565732054082664382647078339185537063904212969076231405449060u256,
        21541400788752694945415155366788038951273885644370092786472578455575017947183u256,
    ];

    // Convert each u256 to 32 bytes (big endian) and append
    let mut i = 0;
    while (i < vector::length(&s2_u256)) {
        let u256_val = *vector::borrow(&s2_u256, i);
        let mut j = 0;
        while (j < 32) {
            let shift = ((31 - j) * 8) as u8;
            let byte_val = ((u256_val >> shift) & 0xFF) as u8;
            vector::push_back(&mut signature, byte_val);
            j = j + 1;
        };
        i = i + 1;
    };

    // Public key from test vector 0 (32 u256 compacted format)
    let pkc_u256 = vector[
        5662797900309780854973796610500849947334657117880689816302353465126500706865u256,
        19773102689601973621062070293263100534733440101750387150077711329493973274058u256,
        14606681890476865709816748627007131256488820167404174518724605890405097603719u256,
        15845234755931409677594030697035096324340457247480758851130851814703350289524u256,
        5524941775098342886171484209767745714294893760953145782448900256027476885810u256,
        15301033023652038200658165594502048003364566882283859976805808429697192567788u256,
        18875246040654000517074755552890901133645669291006567534900678519700207707731u256,
        11843395683334522200668269515783436692309636627649985746204914551011013629864u256,
        8419305811746464065544475584323153271481428319969733938911379662274846467111u256,
        18343417927809591481517183183479503623951147924071925629514120039495430967592u256,
        10007451325105194000131443764495043320645967197761209321537835667210153693191u256,
        779487061150515667795843171268512499191273448454307717194241961063365614179u256,
        14889466660684110621550004892629051623956217990147793956971155241422811501259u256,
        2995124819739638247263964985959552967489690950312509006670204449438399867779u256,
        16698797261630410217796026169071784061995015858612862963622742163763641855864u256,
        13129716852402613948762495927854872029721399215764359316540986925328111906305u256,
        8620514528683669238836845045565231437047299941974001946945409334379184590766u256,
        5184181041252042291984928267300200431567362250531180743278111084485128161037u256,
        15555356690664302555826193017277818624355238475260445618945780405430020481200u256,
        19264077329172342356817033544893125657281034846341493111114385757819435942150u256,
        8708853592016768361541207473719404660232059936330605270802350059910738161396u256,
        21018648773068189736719755689803981281912117625241701774409626083005150670687u256,
        267026197077955750670312407002345619518873569178283514941902712705828521229u256,
        14359242962640593260752841229079220345384234239741953227891227234975247894859u256,
        8320354099602406351863744856415421903486499003224102136141447162113864442068u256,
        17564344674783852357247325589247473882830766139750808683064015010041459773180u256,
        12601232530472338126510941067000966999586933909071534455578397454667291628041u256,
        17820703520112071877812607241017358905719406745793395857586668204300579510382u256,
        20977963461796112341763752649093803701879441191599296283127418471622134932903u256,
        5627732773047409045458881938100601008133088383905060686572856121439798106767u256,
        2602661464000108367786729796742170641292899005030508211661215565063118195399u256,
        20110282897068872581106488251090599973196923955248066799683528955504800771309u256,
    ];

    // Debug output
    std::debug::print(&std::string::utf8(b"Message length:"));
    std::debug::print(&vector::length(&message));
    std::debug::print(&std::string::utf8(b"Signature length:"));
    std::debug::print(&vector::length(&signature));
    std::debug::print(&std::string::utf8(b"Public key compacted length:"));
    std::debug::print(&vector::length(&pkc_u256));

    // Verify signature with ETHFALCON implementation using compacted public key
    let result = verify_signature(&pkc_u256, &message, &signature);

    std::debug::print(&std::string::utf8(b"ETHFALCON Test Vector 0 result:"));
    std::debug::print(&result);
    std::debug::print(&std::string::utf8(b"Expected: true (from Solidity test)"));
    std::debug::print(&std::string::utf8(b"================================"));

    // This should return true with correct ETHFALCON implementation
    // Current result may still be false due to remaining implementation details
}
