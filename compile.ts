import sindri from 'sindri';
import 'dotenv/config';

// Create a Sindri Client using your API KEY.
const myClient = sindri.create({ apiKey: process.env.SINDRI_API_KEY}, undefined);
// Compile the circuit in the `is-equal` directory.
const circuit = await myClient.createCircuit('is-equal');

// Log out the circuit object as JSON.
console.log(JSON.stringify(circuit, null, 2));