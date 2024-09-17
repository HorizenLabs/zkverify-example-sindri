import { useState } from 'react';

export function useZkVerify() {
    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onVerifyProof = async (verificationData: any) => {
        setVerifying(true);
        setVerificationStatus(null);
        setError(null);

        try {
            setVerificationStatus('Starting proof verification...');

            // Sending the combined verification data to the backend
            const response = await fetch('/api/zkverify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(verificationData),
            });

            // Check if the request was successful before parsing the JSON
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Proof verification failed');
            }

            // Parse response
            const data = await response.json();

            // Set verification status with the successful transaction result
            setVerificationStatus(`Proof verified successfully. Transaction result: ${JSON.stringify(data.txResult, null, 2)}`);
        } catch (err) {
            // Capture and display errors
            setError(err.message || 'An unknown error occurred during verification');
        } finally {
            setVerifying(false);
        }
    };

    return { verifying, verificationStatus, error, onVerifyProof };
}
