import { useState } from 'react';

export function useSindri() {
    const [proofGenerating, setProofGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate proof using two integer inputs
    const generateProof = async (num1: number, num2: number, setFeedbackMessages: Function) => {
        setProofGenerating(true);
        setError(null);
        setFeedbackMessages((prevMessages) => [...prevMessages, 'Starting Sindri proof generation...']);

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
            const proof = JSON.stringify(data.proof);  // Return proof as JSON string

            console.log('Proof generated:', proof);
            setFeedbackMessages((prevMessages) => [...prevMessages, 'Proof generation completed.']);
            return proof;  // Return the proof to the caller
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setFeedbackMessages((prevMessages) => [...prevMessages, err.message]);
            return null;  // Return null if proof generation failed
        } finally {
            setProofGenerating(false);
        }
    };

    return { proofGenerating, error, generateProof };
}
