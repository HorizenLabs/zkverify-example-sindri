import { useState } from 'react';
import { useSindri } from '../hooks/useSindri';
import { useZkVerify } from '../hooks/useZkVerify';

export default function Home() {
    const [num1, setNum1] = useState('');
    const [num2, setNum2] = useState('');
    const [num1Error, setNum1Error] = useState('');
    const [num2Error, setNum2Error] = useState('');
    const [buttonColor, setButtonColor] = useState('#0070f3');
    const [feedbackMessages, setFeedbackMessages] = useState([]);
    const { proofGenerating, proof, error: sindriError, generateProof } = useSindri();
    const { verifying, verificationStatus, error: zkVerifyError, onVerifyProof } = useZkVerify();

    const validateInputs = () => {
        let valid = true;
        if (!num1 || isNaN(num1) || parseInt(num1) < 0) {
            setNum1Error('Please enter a valid positive integer for Number 1');
            valid = false;
        } else {
            setNum1Error('');
        }

        if (!num2 || isNaN(num2) || parseInt(num2) < 0) {
            setNum2Error('Please enter a valid positive integer for Number 2');
            valid = false;
        } else {
            setNum2Error('');
        }

        return valid;
    };

    const handleGenerateAndVerify = async () => {
        if (validateInputs()) {
            setFeedbackMessages([]); // Clear old messages

            // Start proof generation
            setFeedbackMessages((prevMessages) => [...prevMessages, 'Starting proof generation with Sindri...']);
            await generateProof(parseInt(num1), parseInt(num2), setFeedbackMessages);

            // After proof generation, proceed to verification
            if (proof) {
                setFeedbackMessages((prevMessages) => [...prevMessages, 'Proof generation completed. Starting verification...']);

                // Parse the proof and add the curve field
                const proofData = JSON.parse(proof);
                const { proof: generatedProof, public: publicSignals, verification_key: verificationKey } = proofData;

                // Prepare verification data
                const verificationData = {
                    proof: { ...generatedProof, curve: "bn128" },
                    publicSignals,
                    verificationKey
                };

                // Trigger verification
                await onVerifyProof(verificationData);

                // Handle feedback based on the result
                if (zkVerifyError) {
                    setFeedbackMessages((prevMessages) => [...prevMessages, `Verification error: ${zkVerifyError}`]);
                    setButtonColor('red');
                } else if (verificationStatus) {
                    setFeedbackMessages((prevMessages) => [...prevMessages, verificationStatus]);
                    setButtonColor('green');
                }
            } else {
                setFeedbackMessages((prevMessages) => [...prevMessages, 'Proof generation failed, cannot proceed with verification.']);
            }
        }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Proof Generation and Verification</h1>

            <div style={styles.inputGroup}>
                <label style={styles.label}>Number 1:</label>
                <input
                    style={styles.input}
                    type="text"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                />
                {num1Error && <p style={styles.error}>{num1Error}</p>}
            </div>

            <div style={styles.inputGroup}>
                <label style={styles.label}>Number 2:</label>
                <input
                    style={styles.input}
                    type="text"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                />
                {num2Error && <p style={styles.error}>{num2Error}</p>}
            </div>

            <button
                id="verifyButton"
                style={{ ...styles.button, backgroundColor: buttonColor }}
                onClick={handleGenerateAndVerify}
                disabled={proofGenerating || verifying}
            >
                {proofGenerating ? 'Generating Proof...' : verifying ? 'Verifying Proof...' : 'Generate and Verify Proof'}
            </button>

            <div style={styles.outputBox}>
                {feedbackMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    heading: {
        textAlign: 'center',
        marginBottom: '20px',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        display: 'block',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    error: {
        color: 'red',
        fontSize: '14px',
        marginTop: '5px',
    },
    button: {
        display: 'block',
        width: '100%',
        padding: '10px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    outputBox: {
        marginTop: '20px',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
    },
};
