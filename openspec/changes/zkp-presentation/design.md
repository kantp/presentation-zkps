# Presentation Design

## Overall Structure

```
Opening: The Sovereignty Problem          ~5 min
Roadmap: The Three Properties             ~2 min
─────────────────────────────────────────────────
① Completeness  →  Arithmetic Circuits   ~8 min   ☑
② Soundness     →  Schwartz-Zippel       ~8 min   ☑
③ Zero-Knowledge →  Commitments          ~5 min   ☑
─────────────────────────────────────────────────
DSL Landscape                             ~2 min
Noir Demo                                ~12 min
Zoom Out / Close                          ~3 min
─────────────────────────────────────────────────
Total                                    ~45 min
```

---

## Section 1: Opening — The Sovereignty Problem (~5 min)

**Hook:** Connect immediately to the morning keynote.

> "Stefan talked about Digital Sovereignty this morning.
>  What does that actually look like as an engineering problem?"

**The Sovereignty Paradox slide:**
To participate in the digital world, you constantly prove things about yourself:
- Your age → to access content, buy things, enter venues
- Your income → to get a loan, rent an apartment
- Your credentials → to get a job, practice a profession
- Your identity → to vote, sign contracts, cross borders

**The broken model slide:**
Today: you hand over the document.
- passport → KYC database
- date of birth → every website that ever asked
- salary slip → lender's servers

They now have more than they needed.
They are now a liability.
**This isn't sovereignty. This is delegation of trust.**

**The inversion slide:**
What if you could prove the *claim* without revealing the *data*?

- "I am over 18" — without your date of birth
- "I am creditworthy" — without your bank statements
- "I voted correctly" — without exposing your ballot
- "I hold this license" — without the license number

**The payoff line:**
> "Data sovereignty isn't about keeping your data in a vault.
>  It's about proving claims without surrendering the underlying data.
>  That capability has a name: zero-knowledge proofs."

**Title flip:** "Zero Knowledge Proof? That Sounds Useless!" → actually the foundation
of data sovereignty.

---

## Section 2: Roadmap — The Three Properties (~2 min)

Present as a checklist that will be the spine of the talk:

```
For data sovereignty to work, we need three properties:

  □ Completeness   — honest provers always succeed
  □ Soundness      — dishonest provers always fail
  □ Zero-knowledge — the proof reveals nothing
```

Brief sovereignty framing of each:
- Completeness: *the system is usable* — I can always assert rights I legitimately have
- Soundness: *the system is trustworthy* — no one can forge credentials
- Zero-knowledge: *the system is sovereign* — my data stays mine

> "Two down, one to go" beat after soundness should leave one unresolved tension:
> "ok, but does the proof itself leak my data?"

---

## Section 3: ☑ Completeness — Arithmetic Circuits (~8 min)

**The question being answered:** If I genuinely know the secret, can I always prove it?

**Key concept: arithmetic circuits**

Any computation can be expressed as additions and multiplications over a finite field.
Why just those two? Because polynomials are built from exactly those operations.

```
Wire: a value (field element)
Gate: one constraint

  Addition gate:    a + b = c
  Multiplication:   a · b = c
```

**Building up from primitives** (satisfying for FP audience):

```
Boolean:           x · (1 - x) = 0      ← forces x ∈ {0, 1}
Conditional:       b·x + (1-b)·y        ← if b then x else y
Equality:          a - b = 0
Range check:       bit-decompose age, assert each bit is boolean,
                   reassemble and check ≥ 18
```

**The key insight:**
Each gate = one polynomial constraint.
The whole circuit = one polynomial P(x) such that P(r) = 0 iff all constraints satisfied.

**Visual:**
```
    [birth_year]   [current_year]         (private)  (public)
          └──────── SUB ────────┘
                     │
                  [age]
                     │
             ┌────── SUB ─────┐
             │                │
          [age]              [18]
             │
          [diff]    (must be ≥ 0)
             │
      [bit decomposition]
      b₇ b₆ b₅ b₄ b₃ b₂ b₁ b₀
             │
      [boolean constraints]
      bᵢ · (1 - bᵢ) = 0 for each i
```

**Check completeness:** If you know `birth_year`, you can satisfy all these constraints,
construct P(x), and evaluate it correctly. A valid witness always produces a valid proof.  ☑

**Callout for FP audience:**
This is like a pure function: fixed private + public inputs, deterministic constraints.
No side effects. No state. The circuit IS the specification.

---

## Section 4: ☑ Soundness — Schwartz-Zippel (~8 min)

**The question being answered:** Can a dishonest prover fake a proof?

**Setup:**
The whole circuit is now encoded as polynomial P(x).
- Correct computation → P evaluates to 0 everywhere
- Wrong computation → P is a different polynomial, P' ≠ P

**The Schwartz-Zippel lemma:**

> Two distinct polynomials of degree d can agree at *at most* d points.

A typical ZKP field has ~2²⁵⁶ elements. Circuit degree is in the thousands.

```
Probability of a cheating prover getting away with it:
  d / |field|  ≈  thousands / 10⁷⁷  ≈  negligible
```

So: verifier picks a *random* r and asks "what is P(r)?"
If the prover answers correctly → they almost certainly have the right polynomial
→ they almost certainly satisfied all the constraints
→ with overwhelming probability, they know the secret.

**One random question. Near-certainty.** No back-and-forth.

FP analogy: like property-based testing with a cryptographic guarantee —
not "test on 100 random inputs and probably it's correct",
but "test on ONE random point in a field of size 10⁷⁷".

**Audience interaction moment:**

> "I claim I know the secret. I tell you P(r) = 0. Do you trust me?"

Expected: "No, you could just say that!"

> "What if I'd already committed to P(x) before you picked r?"

Expected: "...wait, can't you wait until you see r, then construct a P that passes?"

> "Exactly the right question."

This naturally reveals why commit-first ordering is essential, and hands off to
the next section. The cheating strategy (construct P' after seeing r such that P'(r) = 0)
is precisely what commitments prevent.

**Check soundness:**  ☑

---

## Section 5: ☑ Zero-Knowledge — Polynomial Commitments (~5 min)

**The question being answered:** Does the proof leak anything about my private data?

**The remaining problem:**
The verifier now picks r *after* the prover has committed. But what does "committed" mean?
And does the commitment itself reveal P(x) — and therefore the private inputs?

**Polynomial commitment scheme (KZG et al.):**

```
1. Prover publishes:   commit(P)   ← a compact fingerprint of P
                                      reveals nothing about coefficients
2. Verifier picks:     random r
3. Prover reveals:     P(r), plus a proof of consistency with commit(P)
4. Verifier checks:    does P(r) match the expected value?
                       is the evaluation proof valid?
```

The verifier sees:
- A fingerprint (commit(P)) — no information about coefficients
- A single evaluation P(r) — one point on the polynomial
- One point on a degree-d polynomial reveals nothing about the other d coefficients

**The cryptographic black box:**
The commitment scheme (KZG, FRI, ...) is built on elliptic curves or hash functions.
This is where we trust the cryptographers. The important point is the *interface*:
commit-first, reveal-nothing-extra.

**Check zero-knowledge:**  ☑

**The payoff line:**
> "We have all three properties. This is a SNARK:
>  Succinct Non-interactive ARgument of Knowledge."

Brief note on "succinct": the proof is small and fast to verify,
regardless of how complex the original computation was.

---

## Section 6: DSL Landscape (~2 min)

**Before DSLs:**
Hand-crafting R1CS constraints (Rank-1 Constraint Systems) — specifying every gate manually.
Extremely tedious. Error-prone. Inaccessible.

**Now:**
Write code. Get circuits.

| DSL    | Syntax  | Notes                          |
|--------|---------|--------------------------------|
| Noir   | Rust-like | Clean, readable, Aztec-backed |
| Cairo  | Rust-like | Starknet ecosystem            |
| o1js   | TypeScript | Mina protocol               |
| Leo    | Rust-like | Aleo network                  |

**Why Noir for this talk:**
- Syntax readable on slides
- Separates private/public inputs clearly
- Active ecosystem and good tooling

---

## Section 7: Noir Demo (~12 min)

**The scenario:** EU Digital ID Wallet. You want to prove you're over 18 to a service,
without revealing your date of birth (or anything else from your credential).

**Walk through:**

```rust
fn main(
    birth_year: u32,           // private: stays in your wallet
    current_year: pub u32,     // public: verifier provides this
    required_age: pub u32,     // public: the threshold (18)
) {
    let age = current_year - birth_year;
    assert(age >= required_age);
}
```

Key teaching moments:
- `pub` vs non-pub: the interface/implementation distinction FP people know
- `assert(age >= required_age)`: this one line compiles to the bit-decomposition
  circuit we just drew — the DSL does the heavy lifting
- The proof contains no `birth_year`. The verifier sees only: current_year, required_age,
  and the proof. That's it.

**Actual demo code (age_credential/src/main.nr):**

```rust
fn main(
    birth_year: u32,            // private: stays in your wallet

    credential:   pub Field,    // public: pedersen_hash([birth_year])
    current_year: pub u32,
    required_age: pub u32,
) {
    let computed = std::hash::pedersen_hash([birth_year as Field]);
    assert(computed == credential);

    let age = current_year - birth_year;
    assert(age >= required_age);
}
```

Key teaching moments:
- `pub` vs bare: the interface/implementation distinction FP people know
- `credential` is the government-issued hash commitment to birth_year
- `assert(age >= required_age)`: compiles to bit-decomposition constraints
- The proof contains no `birth_year` -- verifier sees credential, current_year,
  required_age, and nothing else

**Demo flow:**
1. Show src/main.nr -- walk through public/private split
2. `node prove.mjs` -- show output: proof size, public inputs, "birth_year NOT in proof"
3. `node verify.mjs` -- show: VERIFIED, "birth_year was never revealed"
4. Point out: the verifier ran the same circuit compiled from the same source

---

## Section 8: Zoom Out / Close (~3 min)

**The pattern generalises:**

```
Age verification   →  prove birth_year satisfies age ≥ N
Credit score       →  prove score satisfies score ≥ 700
Election integrity →  prove ballot is valid without revealing vote
Credential check   →  prove membership in a set without revealing which element
Compliance         →  prove a computation was done correctly without revealing the data
```

**The design shift:**
Old model: give me your data, I'll check it.
New model: you check it, give me the proof.

This is what data sovereignty looks like as an engineering pattern.

**Return to the three properties:**
```
  ☑ Completeness   — the system is usable
  ☑ Soundness      — the system is trustworthy
  ☑ Zero-knowledge — the system is sovereign
```

**Close:**
> "Zero-knowledge proof? That sounds useless.
>  Actually, it's what makes the internet safe for secrets."

---

## Section 9: Production Credentials (slide only, ~2 min)

**Not implemented in the demo circuit. Explained visually in slides.**

The demo uses `pedersen_hash([birth_year])` as a placeholder credential.
In a real system (EU Digital Identity Wallet / eIDAS 2.0):

```
CREDENTIAL ISSUANCE (once, by government)
  credential = {
    birth_date, name, nationality, device_pubkey, ...
  }
  merkle_root = MerkleTree(credential_fields).root
  signature   = gov_key.sign(merkle_root)
  => stored in your wallet

PROOF GENERATION (per use, on your device)
  Verifier sends: nonce (prevents replay)
  Biometric unlocks: device key in secure enclave
  ZKP circuit proves all at once:
    a) birth_date is a leaf in the Merkle tree          "real credential"
    b) merkle_root is signed by the government          "real credential"
    c) device_pubkey is a leaf in the same tree         "this credential is mine"
    d) I can sign the nonce with device_privkey         "I am present now"
    e) current_year - birth_year >= 18                  "age claim holds"
  Output: one proof, ~16KB
  Verifier sees: gov_pubkey, nonce, required_age
  Verifier does NOT see: birth_date, name, device_privkey
```

**What each layer adds:**

| Layer              | Proves                              | Prevents                    |
|--------------------|-------------------------------------|-----------------------------|
| Hash commitment    | You know birth_year                 | Lying about birth_year      |
| Issuer signature   | Credential signed by authority      | Forging credentials         |
| Merkle proof       | birth_year is one field of many     | Mixing fields across creds  |
| Device binding     | Credential tied to your device key  | Credential theft / sharing  |
| Biometric          | Device key unlocked by rightful user| Lost/stolen device          |
| Nonce              | Proof is for this request only      | Replay attacks              |

The demo implements row 1. Each subsequent row is one more `assert` in the circuit.
The structure is identical -- only the depth changes.

**The closing point for this slide:**
> "Your phone becomes the root of your identity.
>  Not a government database. Not a service's server. You."

---

## Open Questions / Decisions Made

- [x] Exact Noir code for demo -- simple hash commitment, issuer sig explained in slides
- [x] Interactive proofs / Fiat-Shamir -- dropped in favour of Schwartz-Zippel
- [ ] How to handle "proof" terminology overlap with "Proofs for programs, programs for proofs"
      talk (Agda/Coq proofs vs ZK proofs) -- brief callout recommended
- [ ] Slide tooling (see below)
- [x] Demo: pre-built scripts (prove.mjs + verify.mjs), not live coding
