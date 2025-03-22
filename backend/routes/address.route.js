import express from 'express';
import { protect } from '../config/auth/auth.js';
const router = express.Router();
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/address/address.controllers.js';


// Protect all address routes - require authentication
router.use(protect);

// Address routes
router.route('/')
    .get(getAddresses)
    .post(addAddress);

router.route('/:addressId')
    .put(updateAddress)
    .delete(deleteAddress);

router.patch('/:addressId/set-default', setDefaultAddress);

export default router;