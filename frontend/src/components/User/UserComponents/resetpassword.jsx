import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserApi } from '../UserApi/UserApi';
import './css/auth.css';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.password !== passwords.confirmPassword) {
            setAlert({
                show: true,
                message: 'Passwords do not match',
                type: 'danger'
            });
            return;
        }

        setIsLoading(true);
        try {
            await UserApi.resetPassword(token, passwords.password);
            setAlert({
                show: true,
                message: 'Password reset successful! Redirecting to login...',
                type: 'success'
            });

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Password reset failed',
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
                            <h2 className="text-center mb-4">Reset Password</h2>

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

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">New Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={passwords.password}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={passwords.confirmPassword}
                                        onChange={handleChange}
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
                                            Resetting Password...
                                        </>
                                    ) : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;