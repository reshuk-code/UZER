import React, { useState } from 'react';

const AddressForm = ({ onSubmit, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        street: initialData?.street || '',
        city: initialData?.city || '',
        state: initialData?.state || '',
        pinCode: initialData?.pinCode || '',
        isDefault: initialData?.isDefault || false
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            name: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            phone: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="col-12">
                    <label className="form-label">Street Address</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.street}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            street: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            city: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="col-md-4">
                    <label className="form-label">State</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            state: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <label className="form-label">PIN Code</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.pinCode}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pinCode: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="col-12">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="defaultAddress"
                            checked={formData.isDefault}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                isDefault: e.target.checked
                            }))}
                        />
                        <label className="form-check-label" htmlFor="defaultAddress">
                            Make this my default address
                        </label>
                    </div>
                </div>
                <div className="col-12">
                    <button type="submit" className="btn btn-primary me-2">
                        {initialData ? 'Update' : 'Add'} Address
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </form>
    );
};

export default AddressForm;