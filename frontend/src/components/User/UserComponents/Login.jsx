import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserApi from '../UserApi/UserApi';
import './css/auth.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isValidated, setIsValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'rememberMe' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsValidated(true);

        if (!e.target.checkValidity()) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await UserApi.login({
                email: formData.email,
                password: formData.password
            });

            if (!response || !response._id || !response.token) {
                throw new Error('Invalid response from server');
            }

            if (formData.rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify({
                _id: response._id,
                firstName: response.firstName,
                lastName: response.lastName,
                email: response.email,
                isAdmin: response.isAdmin
            }));

            setAlert({
                show: true,
                message: 'Login successful! Redirecting...',
                type: 'success'
            });

            const loginEvent = new CustomEvent('userLogin', { 
                detail: { user: response } 
            });
            window.dispatchEvent(loginEvent);

            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            setAlert({
                show: true,
                message: error.response?.data?.message || error.message || 'Login failed',
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
                            <h2 className="text-center mb-4">Login</h2>
                            
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

                            <form onSubmit={handleSubmit} noValidate className={isValidated ? 'was-validated' : ''}>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="invalid-feedback">
                                        Please enter a valid email address
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <div className="input-group">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                        >
                                            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                                        </button>
                                    </div>
                                    <div className="invalid-feedback">
                                        Please enter your password
                                    </div>
                                </div>

                                <div className="mb-3 form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="rememberMe"
                                        name="rememberMe"
                                        checked={formData.rememberMe}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">
                                        Remember me
                                    </label>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading && (
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    )}
                                    {isLoading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <p>Don't have an account? <Link to="/signup">Register here</Link></p>
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;