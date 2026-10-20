import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Supplier } from '../models/Supplier.js';
import { Company } from '../models/Company.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { Order } from '../models/Order.js';
import { recordStockMovement } from '../services/inventoryService.js';
import { seedDefaultRoles } from '../services/authService.js';

export const DEFAULT_CATEGORIES = [
  'Workout Essentials',
  'Hiking & Trekking',
  'Shoes',
  'Bags & Backpacks',
  'Sport Accessories',
  'Nutrition & Care',
];

export const ensureCategoriesExist = async () => {
  for (const catName of DEFAULT_CATEGORIES) {
    await Category.findOneAndUpdate(
      { name: catName },
      { name: catName, isActive: true },
      { upsert: true, new: true }
    );
  }
};

export const seedDatabaseIfEmpty = async () => {
  try {
    // 1. Ensure 4 role users exist
    await seedDefaultRoles();

    // 2. Ensure company info
    const companyCount = await Company.countDocuments();
    if (companyCount === 0) {
      await Company.create({
        name: 'BrandDNA Performance & Lifestyle Store',
        email: 'info@branddna.com',
        phone: '+91 98765 12345',
        address: {
          street: '45 Heritage Boulevard',
          city: 'Kochi',
          state: 'Kerala',
          zipCode: '682001',
          country: 'India',
        },
        currency: 'INR',
      });
      console.log('🏢 Company details seeded.');
    }

    // Ensure default 6 categories exist in MongoDB
    await ensureCategoriesExist();

    // 3. Check categories & products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Seeding initial products, suppliers, and transaction ledger...');

      // Retrieve created Categories
      const catWorkout = await Category.findOne({ name: 'Workout Essentials' });
      const catHiking = await Category.findOne({ name: 'Hiking & Trekking' });
      const catShoes = await Category.findOne({ name: 'Shoes' });
      const catBags = await Category.findOne({ name: 'Bags & Backpacks' });
      const catAccessories = await Category.findOne({ name: 'Sport Accessories' });
      const catNutrition = await Category.findOne({ name: 'Nutrition & Care' });

      // Suppliers
      const sup1 = await Supplier.create({ name: 'Apex Sports Supply Ltd', contactPerson: 'Rajan Menon', email: 'rajan@apexsports.com', phone: '+91 94470 11223', address: 'Kochi, Kerala' });
      const sup2 = await Supplier.create({ name: 'Summit Outdoor Co', contactPerson: 'Anita Rao', email: 'anita@summitoutdoor.in', phone: '+91 98450 33445', address: 'Bangalore, Karnataka' });

      const adminUser = await User.findOne({ role: 'admin' });
      const customerUser = await User.findOne({ role: 'customer' });

      const p1 = await Product.create({
        name: 'Pro-Fit Performance Resistance Bands Set',
        sku: 'DNA-WKO-BAND',
        category: catWorkout?._id,
        categoryName: 'Workout Essentials',
        brand: 'ProFit',
        description: 'Set of 5 heavy-duty latex resistance bands for strength training, therapy, and home workout routines.',
        price: 899,
        discountPrice: 1200,
        cost: 420,
        stock: 50,
        reorderLevel: 15,
        targetStockLevel: 60,
        leadTimeDays: 5,
        images: ['/images/cat_workout_essentials.jpg'],
      });

      const p2 = await Product.create({
        name: 'SummitPro 4-Person Waterproof Camping Tent',
        sku: 'DNA-[#HKG]-TENT',
        category: catHiking?._id,
        categoryName: 'Hiking & Trekking',
        brand: 'SummitPro',
        description: 'Double-layer 3000mm waterproof dome tent with lightweight aluminum trekking poles and rainfly.',
        price: 6499,
        discountPrice: 7999,
        cost: 3800,
        stock: 30,
        reorderLevel: 8,
        targetStockLevel: 30,
        leadTimeDays: 4,
        images: ['/images/cat_hiking_trekking.jpg'],
      });

      const p3 = await Product.create({
        name: 'VaporStride Cushion Pro Running Shoes',
        sku: 'DNA-[#SHO]-RUN',
        category: catShoes?._id,
        categoryName: 'Shoes',
        brand: 'VaporStride',
        description: 'Ultra-lightweight breathable mesh running shoes with memory foam responsiveness and trail grip.',
        price: 3499,
        discountPrice: 4200,
        cost: 1700,
        stock: 45,
        reorderLevel: 12,
        targetStockLevel: 50,
        leadTimeDays: 7,
        images: ['/images/cat_shoes.jpg'],
      });

      const p4 = await Product.create({
        name: 'Urban Commuter Waterproof 45L Duffel & Backpack',
        sku: 'DNA-[#BAG]-PACK',
        category: catBags?._id,
        categoryName: 'Bags & Backpacks',
        brand: 'UrbanCommute',
        description: 'Expandable 45L sports backpack with dedicated shoe sleeve, laptop pouch, and hydration hose access.',
        price: 2850,
        discountPrice: 3490,
        cost: 1350,
        stock: 35,
        reorderLevel: 10,
        targetStockLevel: 40,
        leadTimeDays: 5,
        images: ['/images/cat_bags_backpacks.jpg'],
      });

      const p5 = await Product.create({
        name: 'PulseTrack Pro Smartwatch & Fitness Tracker',
        sku: 'DNA-[#ACC]-WATCH',
        category: catAccessories?._id,
        categoryName: 'Sport Accessories',
        brand: 'PulseTrack',
        description: 'Waterproof sports watch with built-in GPS, heart rate monitor, multi-sport tracking, and 14-day battery.',
        price: 4999,
        discountPrice: 5999,
        cost: 2400,
        stock: 25,
        reorderLevel: 5,
        targetStockLevel: 30,
        leadTimeDays: 3,
        images: ['/images/cat_sport_accessories.jpg'],
      });

      const p6 = await Product.create({
        name: 'HydroPro Whey Isolate Protein Powder 2kg',
        sku: 'DNA-[#NUT]-WHEY',
        category: catNutrition?._id,
        categoryName: 'Nutrition & Care',
        brand: 'HydroPro',
        description: '27g ultra-pure whey protein isolate with digestive enzymes, BCAAs, and electrolyte hydration formula.',
        price: 3899,
        discountPrice: 4500,
        cost: 2100,
        stock: 40,
        reorderLevel: 10,
        targetStockLevel: 50,
        leadTimeDays: 4,
        images: ['/images/cat_nutrition_care.jpg'],
      });

      // 4. Create Initial Purchase Order and Receive it to seed inventory stock balance & ledger
      const po = await PurchaseOrder.create({
        poNumber: 'PO-10001',
        supplier: sup1._id,
        items: [
          { product: p1._id, quantity: 50, unitCost: 220, totalCost: 11000 },
          { product: p2._id, quantity: 35, unitCost: 310, totalCost: 10850 },
          { product: p3._id, quantity: 40, unitCost: 290, totalCost: 11600 },
          { product: p4._id, quantity: 15, unitCost: 950, totalCost: 14250 },
        ],
        totalAmount: 47700,
        status: 'Received',
        receivedDate: new Date(),
        createdBy: adminUser?._id,
      });

      // Record Purchase Stock Movements
      await recordStockMovement({ productId: p1._id, transactionType: 'Purchase', quantity: 50, reference: 'PO-10001', referenceId: po._id, userId: adminUser?._id, notes: 'Initial Inventory Stock Receipt' });
      await recordStockMovement({ productId: p2._id, transactionType: 'Purchase', quantity: 35, reference: 'PO-10001', referenceId: po._id, userId: adminUser?._id, notes: 'Initial Inventory Stock Receipt' });
      await recordStockMovement({ productId: p3._id, transactionType: 'Purchase', quantity: 40, reference: 'PO-10001', referenceId: po._id, userId: adminUser?._id, notes: 'Initial Inventory Stock Receipt' });
      await recordStockMovement({ productId: p4._id, transactionType: 'Purchase', quantity: 15, reference: 'PO-10001', referenceId: po._id, userId: adminUser?._id, notes: 'Initial Inventory Stock Receipt' });

      // 5. Create Sample Order & decrement stock to seed live sales transactions
      if (customerUser) {
        const order = await Order.create({
          orderNumber: 'ORD-50001',
          customer: customerUser._id,
          items: [
            { product: p1._id, productName: p1.name, quantity: 5, unitPrice: p1.price, totalPrice: 5 * p1.price },
            { product: p3._id, productName: p3.name, quantity: 2, unitPrice: p3.price, totalPrice: 2 * p3.price },
          ],
          totalAmount: (5 * p1.price) + (2 * p3.price),
          shippingAddress: {
            fullName: customerUser.fullName,
            street: '12 Marine Drive',
            city: 'Kochi',
            state: 'Kerala',
            zipCode: '682011',
            phone: '+91 98765 43210',
          },
          paymentMethod: 'razorpay',
          paymentStatus: 'Paid',
          status: 'Delivered',
        });

        await recordStockMovement({ productId: p1._id, transactionType: 'Sale', quantity: 5, reference: 'ORD-50001', referenceId: order._id, userId: customerUser._id, notes: 'Customer Order Sale' });
        await recordStockMovement({ productId: p3._id, transactionType: 'Sale', quantity: 2, reference: 'ORD-50001', referenceId: order._id, userId: customerUser._id, notes: 'Customer Order Sale' });
      }

      console.log('✅ Real database inventory seed completed cleanly.');
    }
  } catch (err) {
    console.warn('Database seed notice:', err.message);
  }
};
