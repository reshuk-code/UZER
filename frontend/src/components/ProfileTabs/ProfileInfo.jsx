import React from 'react';
import { UserApi } from '../../UserApi/UserApi';

const PersonalInfo = ({
    user,
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    fetchUserProfile,
    setAlert
}) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            await UserApi.updateProfile(formDataToSend);
            await fetchUserProfile();
            setIsEditing(false);
            setAlert({
                show: true,
                message: 'Profile updated successfully',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to update profile',
                type: 'danger'
            });
        }
    };

    return (
        <div className="personal-info">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Personal Information</h3>
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setIsEditing(!isEditing)}
                >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={!isEditing}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                    />
                </div>

                {isEditing && (
                    <button type="submit" className="btn btn-primary">
                        Save Changes
                    </button>
                )}
            </form>
        </div>
    );
};

export default PersonalInfo;