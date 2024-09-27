import { useState, useEffect } from 'react';
import { useSindri } from '../hooks/useSindri';
import { useZkVerify } from '../hooks/useZkVerify';

export default function Home() {
    const [num1, setNum1] = useState('');
    const [num2, setNum2] = useState('');
    const [num1Error, setNum1Error] = useState('');
    const [num2Error, setNum2Error] = useState('');
    const [buttonColor, setButtonColor] = useState('initial');
    const [buttonText, setButtonText] = useState('Generate and Verify Proof');
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [feedbackMessages, setFeedbackMessages] = useState([]);
    const { proofGenerating, error: sindriError, generateProof } = useSindri();
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

    const resetButtonState = () => {
        setTimeout(() => {
            setButtonColor('initial');
            setButtonText('Generate and Verify Proof');
            setButtonDisabled(false);
        }, 5000);
    };

    const handleGenerateAndVerify = async () => {
        if (validateInputs()) {
            setFeedbackMessages([]);
            setButtonColor('generating');
            setButtonText('Generating Proof...');
            setButtonDisabled(true);

            // Start proof generation
            const proof = await generateProof(parseInt(num1), parseInt(num2), setFeedbackMessages);

            if (proof) {
                setFeedbackMessages((prevMessages) => [...prevMessages, 'Starting zkVerify proof verification...']);
                setButtonColor('verifying');
                setButtonText('Verifying Proof...');

                // Parse and prepare verification data
                const proofData = JSON.parse(proof);
                const { proof: generatedProof, public: publicSignals, verification_key: verificationKey } = proofData;
                const verificationData = {
                    proof: { ...generatedProof, curve: "bn128" },
                    publicSignals,
                    verificationKey,
                };

                // Trigger verification
                await onVerifyProof(verificationData);
            } else {
                setFeedbackMessages((prevMessages) => [...prevMessages, 'Proof generation failed, cannot proceed with verification.']);
                setButtonColor('error');
                setButtonText('Error');
                resetButtonState();
            }
        }
    };

    const appendMessageOnce = (message) => {
        setFeedbackMessages((prevMessages) => {
            if (!prevMessages.includes(message)) {
                return [...prevMessages, message];
            }
            return prevMessages;
        });
    };

    useEffect(() => {
        if (verificationStatus) {
            appendMessageOnce(verificationStatus);
            setButtonColor('success');
            setButtonText('SUCCESS');
            resetButtonState();
        }

        if (zkVerifyError) {
            appendMessageOnce(`Verification error: ${zkVerifyError}`);
            setButtonColor('error');
            setButtonText('Error');
            resetButtonState();
        }
    }, [verificationStatus, zkVerifyError]);

    return (
        <div className="container">
            <h1 className="heading">Sindri Proof Generation & zkVerify Proof Verification</h1>

            <div className="input-group">
                <label className="label">Number 1:</label>
                <input
                    className="input"
                    type="text"
                    value={num1}
                    onChange={(e) => setNum1(e.target.value)}
                />
                {num1Error && <p className="error">{num1Error}</p>}
            </div>

            <div className="input-group">
                <label className="label">Number 2:</label>
                <input
                    className="input"
                    type="text"
                    value={num2}
                    onChange={(e) => setNum2(e.target.value)}
                />
                {num2Error && <p className="error">{num2Error}</p>}
            </div>

            <button
                className={`button ${buttonColor}`}
                onClick={handleGenerateAndVerify}
                disabled={proofGenerating || verifying || buttonDisabled}
            >
                {buttonText}
            </button>

            <div className="output-box">
                {feedbackMessages.map((message, index) => (
                    <p key={index}>{message}</p>
                ))}
            </div>
        </div>
    );
}
