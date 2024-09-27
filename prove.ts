import sindri from 'sindri';
import 'dotenv/config';
import { fileURLToPath } from 'url';

// Function to generate the proof
async function generateProof(X: number = 23, Y: number = 52): Promise<any> {
    const circuitIdentifier = 'is-equal:latest';
    const proofInput = JSON.stringify({ X, Y });

    // Create a Sindri Client using your API KEY.
    const myClient = sindri.create({ apiKey: process.env.SINDRI_API_KEY }, undefined);

    try {
        // Create the proof using Sindri
        const proof = await myClient.proveCircuit(circuitIdentifier, proofInput);
        console.log(JSON.stringify(proof, null, 2));

        return proof;
    } catch (error) {
        console.error('Error generating proof:', error);
    }
}

// Check if the script is being run directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
    // Run the function with default values
    await generateProof();
}

export default generateProof;
