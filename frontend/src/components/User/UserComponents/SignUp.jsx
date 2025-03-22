import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserApi } from '../UserApi/UserApi';
import './css/signup.css';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });
    const [isValidated, setIsValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsValidated(true);
    
        if (!e.target.checkValidity()) {
            return;
        }
    
        if (formData.password !== formData.confirmPassword) {
            setAlert({
                show: true,
                message: 'Passwords do not match',
                type: 'danger'
            });
            return;
        }
    
        setIsLoading(true);
        try {
            const response = await UserApi.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phoneNumber,
                password: formData.password
            });
    
            // Store email temporarily for verification page
            localStorage.setItem('verificationEmail', formData.email);
    
            setAlert({
                show: true,
                message: 'Registration successful! Redirecting to verification page...',
                type: 'success'
            });
    
            setTimeout(() => {
                navigate('/verify-email', {
                    state: {
                        email: formData.email,
                        firstName: formData.firstName,
                        message: 'Please check your email for the verification code.'
                    }
                });
            }, 1500);
        } catch (error) {
            setAlert({
                show: true,
                message: error.response?.data?.message || 'Registration failed',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    
    };

    return (
        <div className="container">
            <div className="row justify-content-center min-vh-100 align-items-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body p-5">
                            <h2 className="text-center mb-4">Create Account</h2>
                            
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
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                        <div className="invalid-feedback">
                                            Please enter your first name
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                        />
                                        <div className="invalid-feedback">
                                            Please enter your last name
                                        </div>
                                    </div>
                                </div>

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
    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
    <input
        type="tel"
        className="form-control"
        id="phoneNumber"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleChange}
        pattern="[0-9]{10}"
        required
        disabled={isLoading}
        placeholder="Enter 10-digit phone number"
    />
    <div className="invalid-feedback">
        Please enter a valid 10-digit phone number
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
                                            minLength="6"
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
                                        Password must be at least 6 characters long
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                    <div className="invalid-feedback">
                                        Please confirm your password
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-primary w-100"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating Account...
                                        </>
                                    ) : 'Sign Up'}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <p>Already have an account? <Link to="/login">Login here</Link></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;