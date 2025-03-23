import express from 'express'
import { configDotenv } from 'dotenv'
import userRoute from './routes/user.route.js'
import brandRoutes from './routes/brand.route.js'
import categoryRoutes from './routes/category.route.js'
import productRoutes from './routes/product.route.js';
import orderRoutes from './routes/order.route.js';
import adminRoutes from './routes/admin.route.js';
import addressRoutes from './routes/address.route.js';
import wishlistRoutes from './routes/wishlist.route.js';
import connectDB from './config/database/db.js'
import cors from 'cors'
import { mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Load env vars
configDotenv()


// Create uploads directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
mkdirSync(path.join(__dirname, 'uploads', 'profiles'), { recursive: true })
mkdirSync(path.join(__dirname, 'uploads', 'categories'), { recursive: true })
mkdirSync(path.join(__dirname, 'uploads', 'products'), { recursive: true });
// Initialize express
const app = express()

// Connect to database
connectDB()
const corsOptions = {
    origin: "*",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static('uploads'))

// Routes
app.get('/', (req, res) => {
    res.json({ message: "API Running" })
})
app.use('/api/users', userRoute)
app.use('/api/brands', brandRoutes)
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/addresses', addressRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    })
})

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//     console.log('UNHANDLED REJECTION! 💥 Shutting down...')
//     console.log(err.name, err.message)
//     process.exit(1)
// })
