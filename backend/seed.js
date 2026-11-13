
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  {
    name: "Wireless Headphones",
    description: "Enjoy clear sound and comfortable wireless listening.",
    price: 1999,
    category: "Electronics",
    image: "https://placehold.co/400x400?text=Headphones",
    stock: 15
  },
  {
    name: "Smart Watch",
    description: "A stylish smartwatch for everyday use.",
    price: 2499,
    category: "Electronics",
    image: "https://placehold.co/400x400?text=Smart+Watch",
    stock: 12
  },
  {
    name: "Running Shoes",
    description: "Comfortable shoes for daily activities.",
    price: 1799,
    category: "Fashion",
    image: "https://placehold.co/400x400?text=Shoes",
    stock: 20
  },
  {
    name: "Backpack",
    description: "A practical backpack for college and travel.",
    price: 999,
    category: "Accessories",
    image: "https://placehold.co/400x400?text=Backpack",
    stock: 18
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable speaker with rich sound.",
    price: 1499,
    category: "Electronics",
    image: "https://placehold.co/400x400?text=Speaker",
    stock: 10
  },
  {
    name: "Sunglasses",
    description: "Classic sunglasses for everyday style.",
    price: 799,
    category: "Fashion",
    image: "https://placehold.co/400x400?text=Sunglasses",
    stock: 25
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("6 sample products added successfully!");
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedProducts();
