// prove.mjs -- PROVER side
//
// In practice: run by the person who wants to prove their age.
// Their birth_year never leaves this script.
//
// Output: proof.json  (send this to the verifier)
//
// Run: node prove.mjs

import { Noir } from '@noir-lang/noir_js';
import { Barretenberg, UltraHonkBackend } from '@aztec/bb.js';
import { readFileSync, writeFileSync } from 'fs';

const circuit = JSON.parse(readFileSync('./target/age_credential.json', 'utf8'));

// --- Private input: known only to the prover ---
const birth_year = 1987;

// --- Public inputs: the verifier knows and requires these ---
const credential   = '0x19dd02231fae3225ecd14756dea26bd8aa2acc906f462f5cbcfc8f19ac99a1ae';
const current_year = 2026;
const required_age = 18;

async function main() {
  const api     = await Barretenberg.new();
  const backend = new UltraHonkBackend(circuit.bytecode, api);
  const noir    = new Noir(circuit);

  // Step 1: execute the circuit to produce the witness
  // (the witness includes birth_year and all intermediate values)
  console.log('Generating witness...');
  console.log(`  birth_year   = ${birth_year}  <-- stays here, never sent`);
  console.log(`  current_year = ${current_year}`);
  console.log(`  required_age = ${required_age}`);
  console.log(`  age          = ${current_year - birth_year}`);

  const { witness } = await noir.execute({
    birth_year,
    credential,
    current_year,
    required_age,
  });

  // Step 2: generate the proof
  // The proof is a compact blob that convinces any verifier
  // without revealing birth_year.
  console.log('\nGenerating proof...');
  const { proof, publicInputs } = await backend.generateProof(witness);

  // Serialize for sending to the verifier
  const proofData = {
    proof: Buffer.from(proof).toString('hex'),
    publicInputs,   // [credential, current_year, required_age] -- no birth_year
  };
  writeFileSync('proof.json', JSON.stringify(proofData, null, 2));

  console.log(`Proof size:    ${proof.length} bytes`);
  console.log(`Public inputs: ${JSON.stringify(publicInputs, null, 2)}`);
  console.log('\nproof.json written -- send this to the verifier.');
  console.log('Note: birth_year is NOT in the proof or public inputs.');
}

main().catch(err => { console.error(err); process.exit(1); });
