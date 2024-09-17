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

        // Handle zkVerify events
        events.on(ZkVerifyEvents.ErrorEvent, (errorData) => {
            console.error('Error event: ', errorData);
            res.write(`event: error\n`);
            res.write(`data: ${JSON.stringify({ error: `Transaction Event Error: ${JSON.stringify(errorData)}` })}\n\n`);
        });

        events.on(ZkVerifyEvents.Finalized, (finalizedData) => {
            console.log('Finalized event: ', finalizedData);
            res.write('event: finalized\n');
            res.write('data: "Proof verified and transaction finalized."\n\n');
        });

        events.on(ZkVerifyEvents.IncludedInBlock, (blockData) => {
            console.log('Included in block event: ', blockData);
            res.write('event: included\n');
            res.write('data: "Proof included in block."\n\n');
        });

        // Await the transaction result
        const txResult = await transactionResult;

        return res.status(200).json({ message: 'Proof verified successfully.', txResult });
    } catch (error) {
        console.error('Error processing verification:', error);
        return res.status(500).json({
            error: error.message || 'An unknown error occurred during verification',
        });
    }
}
