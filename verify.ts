import 'dotenv/config';
import { TransactionStatus, ZkVerifyEvents, zkVerifySession } from 'zkverifyjs';
import generateProof from './prove';

async function verifyProof() {
    let session;
    try {
        // Generate proof on Sindri with custom inputs
        console.log("Generating proof with Sindri...");
        const generatedProof = await generateProof(1, 2);

        if (!generatedProof || !generatedProof.proof || !generatedProof.public || !generatedProof.verification_key) {
            throw new Error('Proof generation failed. Ensure all proof data is available.');
        } else {
            console.log("Proof Successfully Generated!");
        }

        // Add the missing curve to the proof object
        generatedProof.proof.curve = "bn128";

        // Start a zkVerify session using a seed phrase (ensure SEED_PHRASE is set in .env)
        console.log("Starting zkVerify Session...");
        session = await zkVerifySession.start().Testnet().withAccount(process.env.SEED_PHRASE);

        if (!session) {
            throw new Error('Failed to start zkVerify session');
        } else {
            console.log("zkVerify Session Created!");
        }

        // Verify the proof on zkVerify using the correct proof type
        console.log("Verifying proof with zkVerify...");
        const { events, transactionResult } = await session.verify().groth16().execute(
            generatedProof.proof,
            generatedProof.public,
            generatedProof.verification_key
        );

        // Handle zkVerify events
        events.on(ZkVerifyEvents.ErrorEvent, (errorData: any) => {
            console.error('Transaction Event Error:', errorData);
        });

        events.on(ZkVerifyEvents.Finalized, (finalizedData: any) => {
            console.log('Transaction Event (finalized):', finalizedData);
        });

        events.on(ZkVerifyEvents.IncludedInBlock, (blockData: any) => {
            console.log('Transaction Event (included in block):', blockData);
        });

        // Await the result of the transaction
        const txResult = await transactionResult;
        if (txResult.status === TransactionStatus.Finalized) {
            console.log('Proof Verified Successfully: ', txResult);
        } else {
            console.log('Transaction completed but proof is not finalized');
        }

    } catch (error) {
        console.error('Error during proof verification:', (error as Error).message);
    } finally {
        if (session) {
            session.close();  // Close session to clean up resources
        }
    }
}

// Call the verifyProof function to execute when the script is run
await verifyProof();
