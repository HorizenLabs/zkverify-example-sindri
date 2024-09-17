import { useState } from 'react';

export function useSindri() {
    const [proofGenerating, setProofGenerating] = useState(false);
    const [proof, setProof] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Generate proof using two integer inputs
    const generateProof = async (num1: number, num2: number, setFeedbackMessages: Function) => {
        setProofGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/sindri', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ num1, num2 }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate proof.');
            }

            const data = await response.json();
            setProof(JSON.stringify(data.proof));
            console.log(proof);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setFeedbackMessages((prevMessages) => [...prevMessages, err.message]);
        } finally {
            setProofGenerating(false);
        }
    };

    return { proofGenerating, proof, error, generateProof };
}
