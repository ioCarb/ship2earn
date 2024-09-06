## Introduction
This is a collection of ZoKrates programs, an open-source zkSNARKs toolbox, that can be used to construct zero-knowledge-proofs (ZKP) for decentralized physical infrastructure use-cases which can be easily verfied on-chain. As examples, we wrote programs for an animal transport use-case (where farmers prove their compliance to EU guidelines) and a driven-distance use-case, which can be used for VCM-use cases or similar, without actually reveiling the input data on-chain.

1. `animal_transport_hash.zok`: This file is responsible for generating a cryptographic hash for the animal transport data. The hash function ensures the integrity and authenticity of the data, allowing verification that the data has not been tampered with during transport.
2. `animal_transport.zok` : Implements the core logic for handling and verifying the transport of animals, including ensuring that the transport adheres to predefined rules and conditions. This could involve checking distances, times, or other transport conditions.
3. `hash_assert.zok` : This file is used to assert the correctness of a given hash. It checks whether the hash of the provided data matches a previously computed or expected hash, ensuring data integrity.
4. `sum_distance_company.zok` : Calculates the total distance covered by all transports for a specific company. This sum is often necessary for auditing purposes, tracking logistics, or verifying that all transports are accounted for.
5. `sum_distance.zok` : Similar to `sum_distance_company.zok`, this file focuses on summing the distances covered by individual transports, possibly across different entities or journeys.
6. `sum_gps.zok` : Summarizes or aggregates GPS data, likely calculating total distances or validating GPS-based tracking data. It ensures that the GPS data aligns with expected transport routes or totals.


## Requirement
**ZoKrates:** The code is written in ZoKrates. Make sure you have ZoKrates installed.
Installation: Follow the [ZoKrates installation guide](https://zokrates.github.io/gettingstarted.html).

## Usage
To compile and run the ZoKrates program, follow these steps:

1. **Clone or copy the code:** Save the code to a file, e.g., animal_transport.zok.

2. **Navigate to the ZoKrates directory:** Open your terminal and navigate to the ZoKrates directory where the code file is located.

3. **Compile the program:** 
```
zokrates compile -i animal_transport.zok
```
This will generate the `out` file containing the compiled ZoKrates program.

4. **Setup ceremony:** Depending on your [proving-scheme](https://zokrates.github.io/toolbox/proving_schemes.html) perferences, a circuit-agnostic setup might be required (see Marlin). As Marlin expects a fixed universal-setup size n prior to the setup execution, this has to be specified in the CLI. Our programs typically require size 21 (animal_transport.zok) to size 24 (animal_transport_hash.zok): Note that G16 and GM17 do not require the universal setup part. 

```
zokrates universal-setup --size n --proving-scheme marlin
zokrates setup --proving-scheme marlin
```

4. **Witness computation:** In order to compute a witness (execute the program), the function arguments have to be passed in the CLI. Replace `[arguments...]` with the actual parameters expected by the `main` function.
  
```
zokrates compute-witness -a [arguments...]
```

We advice to save your input values in a separate .txt file to avoid syntax errors in the CLI. In our case, we wrote all values in a separate line and read them in the CLI via:

```
INPUT_VALUES=$(cat input.txt | tr '\n' ' ')
zokrates compute-witness -a $INPUT_VALUES
```

5. **Generate proof:** This command will generate a ZoKrates proof of verifiable correct computation.
```
zokrates generate-proof --proving-scheme marlin
```

6. **Verify proof:** To verify the correctness, ZoKrates automatically generates a Solidity contract which can be deployed to an Ethereum Blockchain and passed the proof.json. A "true" as response indicates the successful verification. 

```
zokrates export-verifier
```

Alternatively, true is also returned in the CLI when using:

```
zokrates verify
```

## Functionhality

To gain more insights about the functionality of individual code-components e.g. signature verification etc. we refer to our project report
