import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to Database
connectDB();

// Mock Users Data
const users = [
  {
    name: 'ShopEZ Admin',
    email: 'admin@shopez.com',
    password: 'adminpassword123', // will be hashed by mongoose pre-save hook
    role: 'admin',
    address: {
      street: '100 Admin HQ Way',
      city: 'Silicon Valley',
      postalCode: '94025',
      country: 'USA'
    }
  },
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: 'customerpassword123',
    role: 'customer',
    address: {
      street: '123 Pine St',
      city: 'New York',
      postalCode: '10001',
      country: 'USA'
    }
  }
];

// Mock Products Data (Premium aesthetic products with high-quality Unsplash URLs)
const products = [
  {
    name: 'AeroGlide Pro Wireless Mouse',
    description: 'An ultra-lightweight ergonomic wireless gaming mouse with 26K DPI optical sensor, customizable macro keys, and zero-latency click mechanism.',
    price: 89.99,
    category: 'Electronics',
    stockQuantity: 15,
    images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80'],
    rating: 4.8,
    numReviews: 2,
    reviews: [
      {
        name: 'Jane Smith',
        rating: 5,
        comment: 'Absolutely love the weight and responsiveness! Battery life is also incredible.',
        user: new mongoose.Types.ObjectId() // temporary placeholder
      },
      {
        name: 'David K.',
        rating: 4.6,
        comment: 'Great ergonomic design. Sometimes the software is a bit slow to sync, but hardware is top-tier.',
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    name: 'Lumina Craft Ambient Desk Lamp',
    description: 'A minimalist architectural desk lamp featuring warm light diffusion, step-less touch dimming control, and an integrated fast wireless charging base.',
    price: 64.50,
    category: 'Home & Living',
    stockQuantity: 22,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'],
    rating: 4.5,
    numReviews: 1,
    reviews: [
      {
        name: 'Sarah Connor',
        rating: 4.5,
        comment: 'Sleek design. The phone charger works perfectly even with my thick case.',
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    name: 'Vanguard Leather Travel Backpack',
    description: 'Handcrafted from full-grain water-resistant Italian leather, featuring dedicated 16-inch padded laptop compartments, secure passport pockets, and luggage straps.',
    price: 185.00,
    category: 'Apparel',
    stockQuantity: 8,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    rating: 4.9,
    numReviews: 1,
    reviews: [
      {
        name: 'Alex Mercer',
        rating: 5,
        comment: 'The craftsmanship is phenomenal. Smells amazing and holds all my gear with room to spare.',
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    name: 'Chronos Smartwatch Edition 4',
    description: 'Premium fitness tracking smartwatch with customizable titanium bezel, AMOLED always-on display, ECG monitoring, sleep coach, and up to 10-day battery life.',
    price: 249.99,
    category: 'Electronics',
    stockQuantity: 12,
    images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'],
    rating: 4.7,
    numReviews: 1,
    reviews: [
      {
        name: 'Michael Scott',
        rating: 4.7,
        comment: 'A great upgrades. The sleep tracking is very informative and accurate.',
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    name: 'Sonosync Active ANC Headphones',
    description: 'Premium over-ear headphones with custom hybrid active noise cancellation, high-resolution audio codecs, memory foam earcups, and smart transparency mode.',
    price: 199.00,
    category: 'Electronics',
    stockQuantity: 10,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
    rating: 4.6,
    numReviews: 0,
    reviews: []
  },
  {
    name: 'Barista Brew Express Coffee Maker',
    description: 'Compact professional espresso and filter coffee maker machine with integrated 15-bar steam wand milk frother, rapid thermoblock heater, and programmable sizing.',
    price: 129.99,
    category: 'Home & Living',
    stockQuantity: 6,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80'],
    rating: 4.4,
    numReviews: 1,
    reviews: [
      {
        name: 'Lily Evans',
        rating: 4.4,
        comment: 'Espresso turns out rich and frothy. Easy to clean up afterwards.',
        user: new mongoose.Types.ObjectId()
      }
    ]
  },
  {
    name: 'Nova Pro Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard layout featuring hot-swappable tactile linear switches, double-shot PBT keycaps, sound dampening foam, and customizable RGB backlighting.',
    price: 115.00,
    category: 'Electronics',
    stockQuantity: 18,
    images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80'],
    rating: 4.8,
    numReviews: 0,
    reviews: []
  }
];

const importData = async () => {
  try {
    // Clear existing collections
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert sample users (which hashes their passwords via mongoose pre-save)
    const createdUsers = await User.insertMany(users);
    
    // Fetch the admin user id
    const adminUser = createdUsers[0]._id;

    // Attach admin as publisher for products and map dummy reviews users to actual customers
    const customerUser = createdUsers[1]._id;
    const sampleProducts = products.map((product) => {
      // Map reviews to the seed customer user
      const reviews = product.reviews.map(r => ({
        ...r,
        user: customerUser
      }));
      return { ...product, reviews };
    });

    await Product.insertMany(sampleProducts);

    console.log('\x1b[32m[Seeder] Data Imported Successfully!\x1b[0m');
    process.exit();
  } catch (error) {
    console.error(`\x1b[31m[Seeder] Import Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('\x1b[31m[Seeder] Data Destroyed successfully.\x1b[0m');
    process.exit();
  } catch (error) {
    console.error(`\x1b[31m[Seeder] Destroy Error: ${error.message}\x1b[0m`);
    process.exit(1);
  }
};

// Check arguments
if (process.argv[2] === '-destroy') {
  destroyData();
} else {
  importData();
}
