// Proves that:
//   1. The prover knows a birth_year matching the government-issued credential
//   2. current_year - birth_year >= required_age
//
// The verifier learns: credential, current_year, required_age -- nothing else.
// birth_year never leaves the prover's device.
fn main(
    // Private: credential data -- stays in your wallet
    birth_year: u32,

    // Public: what the verifier knows
    credential:   pub Field,   // pedersen_hash([birth_year]) -- issued by government
    current_year: pub u32,
    required_age: pub u32,
) {
    // --- Step 1: bind birth_year to the government-issued credential ---
    let computed = std::hash::pedersen_hash([birth_year as Field]);
    assert(computed == credential, "credential does not match birth_year");

    // --- Step 2: prove the age claim ---
    assert(current_year >= birth_year, "birth year is in the future");
    let age = current_year - birth_year;
    assert(age >= required_age, "age requirement not met");
}
