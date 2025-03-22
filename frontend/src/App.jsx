import { Routes, Route } from 'react-router-dom'
import NavBar from './components/navbar/NavBar'
import Login from './components/User/UserComponents/Login'
import Home from './components/Home'
import Products from './components/Products'
import Categories from './components/Categories'
import SignUp from './components/User/UserComponents/SignUp'
import ForgotPassword from './components/User/UserComponents/forgot-password';
import ResetPassword from './components/User/UserComponents/resetpassword';
import VerifyEmail from './components/User/UserComponents/VerifyEmail';
import Search from './components/Search'
import Cart from './components/Cart/Cart'
import Wishlist from './components/Wishlist'
import Checkout from './components/Checkout/Checkout'
import { CartProvider } from './components/Cart/CartContext'
import { WishlistProvider } from './components/WishlistContext'
import Admin from './components/admin/admin'
import ProductDetails from './components/ProductDetials'
import Payment from './components/Payment'
import Profile from './components/Profile'
import OrderSuccess from './components/OrderSucess'
import ViewOrder from './components/ViewOrder'
import NotFound from './components/404'
import { AuthProvider } from './components/AuthContext'
function App() {
  return (
    <AuthProvider>
    <WishlistProvider>
    <CartProvider>
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/search" element={<Search />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/:orderId" element={<ViewOrder />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/payment/:orderId" element={<Payment />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
      </Routes>
    </>
    </CartProvider>
    </WishlistProvider>
    </AuthProvider>
  )
}

export default App