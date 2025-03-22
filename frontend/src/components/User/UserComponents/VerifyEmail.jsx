import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserApi } from '../UserApi/UserApi';
import './css/auth.css';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [verificationCode, setVerificationCode] = useState('');
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const emailFromState = location.state?.email;
        const emailFromStorage = localStorage.getItem('verificationEmail');
        
        if (emailFromState) {
            setEmail(emailFromState);
            if (location.state?.message) {
                setAlert({
                    show: true,
                    message: location.state.message,
                    type: 'info'
                });
            }
        } else if (emailFromStorage) {
            setEmail(emailFromStorage);
        } else {
            navigate('/signup');
        }
    }, [location, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await UserApi.verifyEmail({
                email,
                code: verificationCode
            });

            setAlert({
                show: true,
                message: 'Email verified successfully! Redirecting to login...',
                type: 'success'
            });

            // Clear verification email from storage
            localStorage.removeItem('verificationEmail');

            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'Email verified successfully. Please login to continue.'
                    }
                });
            }, 2000);
        } catch (error) {
            setAlert({
                show: true,
                message: error.response?.data?.message || 'Verification failed',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            await UserApi.resendVerification(email);
            setAlert({
                show: true,
                message: 'New verification code has been sent to your email',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.response?.data?.message || 'Failed to resend code',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="row justify-content-center min-vh-100 align-items-center">
                <div className="col-md-5">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4">Verify Your Email</h2>
                            
                            {alert.show && (
                                <div className={`alert alert-${alert.type} alert-dismissible fade show`}>
                                    {alert.message}
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setAlert({ show: false })}
                                    />
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label htmlFor="verificationCode" className="form-label">
                                        Enter 6-digit Verification Code
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control form-control-lg text-center"
                                        id="verificationCode"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="000000"
                                        maxLength="6"
                                        pattern="\d{6}"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100 mb-3"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" />
                                            Verifying...
                                        </>
                                    ) : 'Verify Email'}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-link w-100"
                                    onClick={handleResendCode}
                                    disabled={isLoading}
                                >
                                    Resend Verification Code
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;