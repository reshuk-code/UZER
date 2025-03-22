import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="container mt-5 pt-5">
      <div className="row">
        <div className="col-md-6">
          <h1>Welcome to UZER</h1>
          <p className="lead">Discover amazing products at great prices</p>
          <Link to="/products" className="btn btn-primary">
            Shop Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home