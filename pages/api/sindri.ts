export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { num1, num2 } = req.body;

        if (typeof num1 !== 'number' || typeof num2 !== 'number') {
            return res.status(400).json({ error: 'Both inputs must be valid numbers' });
        }

        const response = await fetch(
            `https://sindri.app/api/v1/circuit/is-equal:latest/prove`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.SINDRI_API_KEY}`,
                },
                body: JSON.stringify({
                    proof_input: JSON.stringify({ X: num1, Y: num2 }),
                    perform_verify: true,
                }),
            }
        );

        if (!response.ok) {
            const errorDetails = await response.text();
            return res.status(response.status).json({ error: `Sindri API Error: ${errorDetails}` });
        }

        const { proof_id } = await response.json();

        // Poll for the final proof
        const finalProof = await pollForProof(proof_id);
        console.log("FINAL PROOF: " + JSON.stringify(finalProof));

        return res.status(200).json({ proof: finalProof });
    } catch (error) {
        return res.status(500).json({ error: error.message || 'An unknown error occurred.' });
    }
}

async function pollForProof(proofId: string) {
    const proofDetailUrl = `https://sindri.app/api/v1/proof/${proofId}/detail`;
    const MAX_POLLING_ATTEMPTS = 10;
    const POLLING_INTERVAL = 5000;

    for (let attempt = 0; attempt < MAX_POLLING_ATTEMPTS; attempt++) {
        const response = await fetch(proofDetailUrl, {
            headers: {
                Authorization: `Bearer ${process.env.SINDRI_API_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch proof details: ${response.statusText}`);
        }

        const proofDetails = await response.json();

        if (proofDetails.status === 'Ready') {
            return proofDetails;
        } else if (proofDetails.status === 'Failed') {
            throw new Error('Proof generation failed');
        }

        await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }

    throw new Error('Proof generation timed out');
}
