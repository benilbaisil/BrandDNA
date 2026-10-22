import '../server/config/env.js';
import { connectDB } from '../server/config/db.js';
import { Product } from '../server/models/Product.js';
import fs from 'fs';

async function main() {
  await connectDB();
  const prods = await Product.find({ status: { $ne: 'Discontinued' } })
    .select('_id name sku price discountPrice stock cost reorderLevel categoryName brand images status')
    .sort({ createdAt: -1 })
    .lean();
  console.log('Fetched', prods.length, 'products');
  fs.writeFileSync('./scratch/products_dump.json', JSON.stringify(prods, null, 2));
  process.exit(0);
}
main();
