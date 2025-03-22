import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserApi } from '../UserApi/UserApi';
import './css/auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await UserApi.forgotPassword(email);
            setIsEmailSent(true);
            setAlert({
                show: true,
                message: 'Password reset link has been sent to your email',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to send reset link',
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
                            <h2 className="text-center mb-4">Forgot Password</h2>
                            
                            {alert.show && (
                                <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                                    {alert.message}
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setAlert({ show: false })}
                                    />
                                </div>
                            )}

                            {!isEmailSent ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Sending...
                                            </>
                                        ) : 'Send Reset Link'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center">
                                    <p>Check your email for the password reset link.</p>
                                    <button 
                                        className="btn btn-outline-primary mt-3"
                                        onClick={() => setIsEmailSent(false)}
                                    >
                                        Send another link
                                    </button>
                                </div>
                            )}

                            <div className="text-center mt-3">
                                <Link to="/login">Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;