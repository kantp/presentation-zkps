# ZKP Presentation — BobKonf 2026

## What

A 45-minute conference talk introducing zero-knowledge proofs to functional programmers
with no cryptography background.

**Venue:** BobKonf 2026, Berlin, March 13 2026
**Title:** "Zero Knowledge Proof? That Sounds Useless!"
**Audience:** Functional programmers (OCaml, Haskell, Scala etc.), non-cryptographers

## Why

ZKPs are increasingly practical and relevant, but remain opaque to most programmers.
The BobKonf 2026 keynote is on Digital Sovereignty — ZKPs are the cryptographic primitive
that makes data sovereignty technically possible, making this an ideal moment to bridge
the two topics.

## Goals

- Give attendees an intuitive, qualitative understanding of how ZKPs work
- Connect ZKPs concretely to Digital Sovereignty (the keynote theme)
- Show that modern DSLs (Noir) make ZKPs accessible to working programmers
- Leave attendees able to start experimenting themselves

## Non-goals

- Proving theorems or deriving the underlying mathematics
- Covering the full ZKP landscape (only Noir as DSL example)
- Deep dive into specific proving backends or elliptic curve cryptography

## Key Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Framing | Digital Sovereignty throughout | Connects to keynote; makes abstract useful |
| Structure | Three properties as roadmap | Clean spine; each maps to a technical section |
| Intuition for soundness | Schwartz-Zippel | Elegant, direct, avoids interactive→non-interactive detour |
| Interactive proof / Fiat-Shamir | Skip | Unnecessary detour; S-Z is more direct for this audience |
| DSL | Noir | Clean Rust-like syntax; readable on slides; good tooling |
| Demo example | Age verification (EU Digital ID Wallet) | Real-world; directly relevant to sovereignty theme |
| Audience interaction | After Schwartz-Zippel reveal | Natural moment; audience discovers why commitments are needed |

## Take-Home Ideas (from abstract)

1. You can reason about trust without revealing secrets.
2. Modern DSLs make ZKPs accessible — no PhD required.
3. Privacy and verifiability can coexist.

## Conference Context Notes

- Keynote: "Digital Sovereignty" by Stefan Kaufmann (9:00am)
- Related talk same day: "Proofs for programs, programs for proofs" (Markus Himmel) —
  likely proof assistants (Agda/Coq). Worth a brief callout distinguishing ZK proofs
  from proof-theoretic proofs.
- Also adjacent: "Refinement types for the digital information age" (Olaf Klinke)
