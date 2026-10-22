import dotenv from 'dotenv';
dotenv.config({ path: 'c:/Users/BENIL/OneDrive/Desktop/BrandDNA/.env' });
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Category } from './models/Category.js';
import { InventoryTransaction } from './models/InventoryTransaction.js';
import { Return } from './models/Return.js';
import { Order } from './models/Order.js';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const measure = async (name, fn) => {
    const t0 = performance.now();
    await fn();
    console.log(name.padEnd(45), (performance.now() - t0).toFixed(0) + 'ms');
  };

  await measure('1. Product.find + populate category', () => Product.find({ status: { $ne: 'Discontinued' } }).populate('category').lean());
  await measure('2. Product.find (no populate)', () => Product.find({ status: { $ne: 'Discontinued' } }).lean());
  await measure('3. InventoryTransaction.find(Sale 30d)', () => InventoryTransaction.find({ transactionType: 'Sale' }).lean());
  await measure('4. InventoryTransaction.find(limit 15 nested)', () => InventoryTransaction.find().populate({ path: 'product', populate: { path: 'category' } }).populate('user').limit(15).lean());
  await measure('5. Return.find + 3 populates', () => Return.find().populate('order').populate('product').populate('customer').lean());
  await measure('6. Order.find + populate items.product', () => Order.find().populate('items.product').lean());

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
