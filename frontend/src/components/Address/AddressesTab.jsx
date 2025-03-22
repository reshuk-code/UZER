import React, { useState , useEffect } from 'react';
import AddressForm from './AddressForm';
import { UserApi } from '../User/UserApi/UserApi';
import { BiEdit, BiTrash } from 'react-icons/bi';
import PropTypes from 'prop-types';

const AddressesTab = ({ setAlert }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Prop validation
    if (!setAlert || typeof setAlert !== 'function') {
        console.error('setAlert prop is missing or invalid');
        return null;
    }

    const fetchAddresses = async () => {
        try {
            const response = await UserApi.getAddresses();
            setAddresses(response.addresses);
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to fetch addresses',
                type: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);


    const handleAddAddress = async (addressData) => {
        try {
            await UserApi.addAddress(addressData);
            await fetchAddresses();
            setShowForm(false);
            setAlert({
                show: true,
                message: 'Address added successfully',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to add address',
                type: 'danger'
            });
        }
    };

    const handleUpdateAddress = async (addressData) => {
        try {
            await UserApi.updateAddress(editingAddress._id, addressData);
            await fetchAddresses();
            setEditingAddress(null);
            setAlert({
                show: true,
                message: 'Address updated successfully',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to update address',
                type: 'danger'
            });
        }
    };

    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) {
            return;
        }

        try {
            await UserApi.deleteAddress(addressId);
            await fetchAddresses();
            setAlert({
                show: true,
                message: 'Address deleted successfully',
                type: 'success'
            });
        } catch (error) {
            setAlert({
                show: true,
                message: error.message || 'Failed to delete address',
                type: 'danger'
            });
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">My Addresses</h4>
                {!showForm && !editingAddress && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Add New Address
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Add New Address</h5>
                        <AddressForm
                            onSubmit={handleAddAddress}
                            onCancel={() => setShowForm(false)}
                        />
                    </div>
                </div>
            )}

            {editingAddress && (
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title mb-4">Edit Address</h5>
                        <AddressForm
                            initialData={editingAddress}
                            onSubmit={handleUpdateAddress}
                            onCancel={() => setEditingAddress(null)}
                        />
                    </div>
                </div>
            )}

            <div className="row">
                {addresses.map(address => (
                    <div key={address._id} className="col-md-6 mb-4">
                        <div className="card h-100">
                            <div className="card-body">
                                {address.isDefault && (
                                    <span className="badge bg-primary mb-2">Default</span>
                                )}
                                <h5 className="card-title">{address.name}</h5>
                                <p className="card-text">
                                    {address.street}<br />
                                    {address.city}, {address.state} {address.pinCode}<br />
                                    Phone: {address.phone}
                                </p>
                                <div className="btn-group">
                                    <button
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => setEditingAddress(address)}
                                    >
                                        <BiEdit /> Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDeleteAddress(address._id)}
                                    >
                                        <BiTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

AddressesTab.propTypes = {
    setAlert: PropTypes.func.isRequired
};

export default AddressesTab;