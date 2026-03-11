# age_credential — ZKP Demo

Proves that a prover is at least `required_age` years old, given a government-issued
credential, without revealing their `birth_year`.

Used as a live demo in the talk **"Zero Knowledge Proof? That Sounds Useless!"**
at BobKonf 2026.

## What the proof establishes

```
Private (prover only):   birth_year = 1987

Public (verifier sees):  credential   = pedersen_hash([birth_year])
                         current_year = 2026
                         required_age = 18

Proof asserts:  pedersen_hash([birth_year]) == credential   ← real credential
                current_year - birth_year  >= required_age  ← age holds
```

The verifier learns that the age claim is true. They do not learn `birth_year`.

## Prerequisites

```bash
# 1. Install Noir (nargo)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash
noirup                        # installs latest stable

# 2. Install Node.js dependencies
npm install
```

## Run the demo

```bash
# Compile the circuit to ACIR bytecode
nargo compile

# PROVER: generate the proof (birth_year stays private)
node prove.mjs
# => writes proof.json

# VERIFIER: check the proof (never sees birth_year)
node verify.mjs
# => VERIFIED: age >= 18.
```

In practice these run on different machines. The prover sends `proof.json`
to the verifier. The verifier has the compiled circuit (or compiles it
themselves from the published Noir source) and checks the proof against it.

**How does the verifier know the proof proves the right thing?**
The verification key is derived deterministically from the circuit bytecode.
Anyone who compiles `src/main.nr` gets the same VK. The circuit is the
auditable specification of what is being proven.

## Generating a new credential

The credential value in `Prover.toml` is `pedersen_hash([birth_year])`.
To generate one for a different birth year:

```bash
# Edit generate_commitment/src/main.nr with the new birth year, then:
cd /tmp/gen_commitment   # or re-create this helper project
nargo execute            # prints the circuit output = the credential hash
```

Or more simply: edit `birth_year` in `Prover.toml` and in `prove.mjs`,
run `node prove.mjs` — it will fail at witness generation with a clear
constraint error, telling you the credential doesn't match.

## Circuit walkthrough (src/main.nr)

```
fn main(
    birth_year:   u32,        // PRIVATE: stays in your wallet

    credential:   pub Field,  // PUBLIC: pedersen_hash([birth_year])
    current_year: pub u32,    // PUBLIC: verifier provides
    required_age: pub u32,    // PUBLIC: verifier provides
) {
    // Step 1: credential must match birth_year
    let computed = std::hash::pedersen_hash([birth_year as Field]);
    assert(computed == credential);

    // Step 2: age claim must hold
    let age = current_year - birth_year;
    assert(age >= required_age);
}
```

In a production system, `credential` would also include an issuer signature
(ECDSA/EdDSA) proving the government attested to `birth_year`. The circuit
structure is identical — one more `assert` for the signature verification.

## Files

```
src/main.nr          Noir circuit (the zero-knowledge program)
Prover.toml          Test inputs (private + public)
prove.mjs            Node.js: generate and verify a proof end-to-end
generate_inputs.py   Python: generate ECDSA inputs (reference, not used in demo)
target/              Compiled circuit artifacts (after nargo compile)
```
