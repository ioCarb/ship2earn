const fs = require('fs');

function extractProofAndInputs(filePath) {
    // Read the content of the file
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.trim().split('\n');
    
    // Extract proof components
    const a = [BigInt(lines[0]), BigInt(lines[1])];
    const b = [
        [BigInt(lines[2]), BigInt(lines[3])],
        [BigInt(lines[4]), BigInt(lines[5])]
    ];
    const c = [BigInt(lines[6]), BigInt(lines[7])];

    // Extract inputs (first 622 values)
    const inputs = [];
    for (let i = 8; i < 630; i++) { // 8 proof values + 622 inputs = 630
        inputs.push(BigInt(lines[i]));
    }
    
    return { a, b, c, inputs };
}

// Example usage
const filePath = 'blockchain/zokrates/distance-zokinput.txt'; // Update with the actual path
const { a, b, c, inputs } = extractProofAndInputs(filePath);

console.log('Proof:', { a, b, c });
console.log('First 10 Inputs:', inputs.slice(0, 10)); // Print only the first 10 inputs for brevity

// Save to a new JSON file (if needed)
//const output = { proof: { a, b, c }, inputs: inputs.slice(0, 622) }; // Only include the first 622 inputs
//fs.writeFileSync('extracted_proof_inputs.json', JSON.stringify(output, null, 2));
