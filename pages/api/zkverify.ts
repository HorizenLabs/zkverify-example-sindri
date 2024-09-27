import { ZkVerifyEvents, zkVerifySession } from 'zkverifyjs';

const SEED_PHRASE = process.env.SEED_PHRASE;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Access the parsed request body directly
        const { proof, publicSignals, verificationKey } = req.body;

        // Validate required fields
        if (!proof || !publicSignals || !verificationKey) {
            return res.status(400).json({ error: 'Invalid proof data. Proof, publicSignals, and verificationKey are required.' });
        }

        // Initialize zkVerify session
        const session = await zkVerifySession.start().Testnet().withAccount(SEED_PHRASE);

        // Verify the proof
        const { events, transactionResult } = await session.verify().groth16().execute(
            proof,
            publicSignals,
            verificationKey
        );

        events.on(ZkVerifyEvents.ErrorEvent, (errorData) => {
            console.error('Error event: ', errorData);
        });

        events.on(ZkVerifyEvents.Finalized, (finalizedData) => {
            console.log('Finalized event: ', finalizedData);
        });

        events.on(ZkVerifyEvents.IncludedInBlock, (blockData) => {
            console.log('Included in block event: ', blockData);
        });

        // Await the transaction result
        const txResult = await transactionResult;

        // Return the final result as JSON
        return res.status(200).json({ message: 'Proof verified successfully.\n\n', txResult });
    } catch (error) {
        console.error('Error processing verification:', error);
        return res.status(500).json({
            error: error.message || 'An unknown error occurred during verification',
        });
    }
}
