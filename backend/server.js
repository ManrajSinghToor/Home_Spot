const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Import Models for database seeding
const User = require('./models/User');
const Property = require('./models/Property');

// Initial properties list to seed MongoDB
const SEED_PROPERTIES = [
  {
    title: 'Modern Punjabi Villa',
    city: 'ludhiana',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,200',
    price: '₹45,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '125 Model Town, Ludhiana, Punjab',
    phone: '+91 98765-43210'
  },
  {
    title: 'Amritsar City Apartment',
    city: 'amritsar',
    rooms: 2,
    beds: 2,
    baths: 2,
    sqft: '1,100',
    price: '₹35,000/month',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    address: '18 Mall Road, Amritsar, Punjab',
    phone: '+91 98765-43211'
  },
  {
    title: 'Jalandhar Family Home',
    city: 'jalandhar',
    rooms: 3,
    beds: 3,
    baths: 2,
    sqft: '1,800',
    price: '₹28,000/month',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    address: '42 Civil Lines, Jalandhar, Punjab',
    phone: '+91 98765-43212'
  },
  {
    title: 'Mohali Luxury Villa',
    city: 'mohali',
    rooms: 5,
    beds: 5,
    baths: 5,
    sqft: '4,500',
    price: '₹85,000/month',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    address: '9 Green Avenue, Mohali, Punjab',
    phone: '+91 98765-43213'
  },
  {
    title: 'Mohali Studio Apartment',
    city: 'mohali',
    rooms: 1,
    beds: 1,
    baths: 1,
    sqft: '750',
    price: '₹18,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    address: '55 Sector 70, Mohali, Punjab',
    phone: '+91 98765-43214'
  },
  {
    title: 'Mohali Townhouse',
    city: 'mohali',
    rooms: 3,
    beds: 3,
    baths: 2.5,
    sqft: '1,950',
    price: '₹42,000/month',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '210 Phase 8, Mohali, Punjab',
    phone: '+91 98765-43215'
  },
  {
    title: 'Ludhiana Modern Flat',
    city: 'ludhiana',
    rooms: 2,
    beds: 2,
    baths: 2,
    sqft: '1,200',
    price: '₹25,000/month',
    image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop',
    address: '78 Model Town Extension, Ludhiana, Punjab',
    phone: '+91 98765-43216'
  },
  {
    title: 'Amritsar Heritage House',
    city: 'amritsar',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,500',
    price: '₹55,000/month',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    address: '12 Heritage Street, Amritsar, Punjab',
    phone: '+91 98765-43217'
  },
  {
    title: 'Jalandhar Executive Suite',
    city: 'jalandhar',
    rooms: 1,
    beds: 1,
    baths: 1,
    sqft: '800',
    price: '₹20,000/month',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    address: '45 Executive Plaza, Jalandhar, Punjab',
    phone: '+91 98765-43218'
  },
  {
    title: 'Mohali Garden Villa',
    city: 'mohali',
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,800',
    price: '₹65,000/month',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    address: '33 Garden Estate, Mohali, Punjab',
    phone: '+91 98765-43219'
  }
];

// Seed Database helper
const seedDatabase = async () => {
  try {
    const propertyCount = await Property.countDocuments();
    if (propertyCount === 0) {
      console.log('Seeding initial properties...');
      
      // Ensure seed landlord exists
      let landlord = await User.findOne({ username: 'admin' });
      if (!landlord) {
        landlord = await User.create({
          username: 'admin',
          email: 'admin@gmail.com',
          role: 'landlord',
          password: 'Password123!'
        });
      }

      const propertiesWithLandlord = SEED_PROPERTIES.map(p => ({
        ...p,
        landlord: landlord._id
      }));

      await Property.insertMany(propertiesWithLandlord);
      console.log('Seeding properties complete.');
    }
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
  }
};

// Connect to Database and Seed
connectDB().then(() => {
  seedDatabase();
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/favorites', require('./routes/favorites'));

// Simple index endpoint
app.get('/', (req, res) => {
  res.send('HomeSpot Backend API is running...');
});

// Global error handler middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
