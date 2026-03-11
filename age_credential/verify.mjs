// verify.mjs -- VERIFIER side
//
// In practice: run by the vendor (bar, website, auditor, ...).
// They compiled the circuit themselves from the published Noir source,
// or trust a VK published by a standards body.
// They never see birth_year -- only the proof and public inputs.
//
// Input:  proof.json  (received from the prover)
// Run:    node verify.mjs

import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';
import { readFileSync } from 'fs';

// The verifier has the compiled circuit -- they can produce this themselves
// by running: nargo compile
// Same Noir source => same circuit => same verification key, always.
const circuit = JSON.parse(readFileSync('./target/age_credential.json', 'utf8'));

// The verifier receives this from the prover
const { proof: proofHex, publicInputs } = JSON.parse(readFileSync('proof.json', 'utf8'));
const proof = Uint8Array.from(Buffer.from(proofHex, 'hex'));

// The verifier knows what they require
const REQUIRED_AGE  = 18;
const CURRENT_YEAR  = 2026;

async function main() {
  const api     = await Barretenberg.new();
  const backend = new UltraHonkBackend(circuit.bytecode, api);

  console.log('Verifying proof...');
  console.log('Public inputs from proof:');
  console.log(`  credential   = ${publicInputs[0]}`);
  console.log(`  current_year = ${parseInt(publicInputs[1], 16)}`);
  console.log(`  required_age = ${parseInt(publicInputs[2], 16)}`);

  // Sanity-check the public inputs match what the verifier requires.
  // (The proof is only valid if these match -- but good to assert explicitly.)
  if (parseInt(publicInputs[1], 16) !== CURRENT_YEAR) {
    console.error('REJECTED: current_year in proof does not match today.');
    process.exit(1);
  }
  if (parseInt(publicInputs[2], 16) !== REQUIRED_AGE) {
    console.error('REJECTED: required_age in proof does not match policy.');
    process.exit(1);
  }

  // TODO (production): also check that publicInputs[0] (credential) appears
  // in the government's published credential registry.

  const valid = await backend.verifyProof({ proof, publicInputs });

  if (valid) {
    console.log('\nVERIFIED: age >= ' + REQUIRED_AGE + '.');
    console.log("The prover's birth_year was never revealed.");
  } else {
    console.log('\nREJECTED: proof is invalid.');
    process.exit(1);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
