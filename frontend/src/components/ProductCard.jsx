import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img src={"https://uzer-server.onrender.com"+product.images[0]?.path} alt={product.name} className="product-card-img" />
      <h5 className="product-card-title">{product.name}</h5>
      <p className="product-card-price">₹{product.price}</p>
      <Link to={`/products/${product._id}`} className="btn btn-primary">
        View Details
      </Link>
    </div>
  );
};

export default ProductCard;