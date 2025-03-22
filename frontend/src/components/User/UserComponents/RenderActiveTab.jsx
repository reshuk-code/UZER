import React from 'react';
import AddressTab from '../../Address/AddressesTab';
import OrderTab from '../../Order/OrderTab';
const RenderActiveTab = ({
    activeTab,
    user,
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    fetchUserProfile,
    setAlert,
    ...props
}) => {
    switch (activeTab) {
        case 'info':
            return (
                <div className="personal-info">
                    <h3>Personal Information</h3>
                    <div className="card-body">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">First Name</label>
                                <p className="form-control-plaintext">{user?.firstName}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Last Name</label>
                                <p className="form-control-plaintext">{user?.lastName}</p>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email</label>
                            <p className="form-control-plaintext">{user?.email}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phone Number</label>
                            <p className="form-control-plaintext">{user?.phoneNumber || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            );
        case 'orders':
            return <OrderTab user={user} setAlert={setAlert} />;
        case 'addresses':
            return (
                <AddressTab 
                    user={user} 
                    setAlert={setAlert}  // Pass it explicitly
                    {...props} 
                />
            );
        case 'wishlist':
            return <div>Wishlist content coming soon...</div>;
        case 'products':
            return user?.isAdmin ? <div>Manage Products content coming soon...</div> : null;
        case 'categories':
            return user?.isAdmin ? <div>Categories content coming soon...</div> : null;
        case 'allOrders':
            return user?.isAdmin ? <div>All Orders content coming soon...</div> : null;
        default:
            return null;
    }
};

export default RenderActiveTab;