import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Order } from './models/Order.js';
import { Product } from './models/Product.js';
import { Return } from './models/Return.js';
import { InventoryTransaction } from './models/InventoryTransaction.js';
import {
  createReturn,
  getOrderReturnEligibility,
  approveReturn,
  rejectReturn,
  receiveReturn,
  inspectReturn,
  processRazorpayRefund,
} from './controllers/returnController.js';

const MONGODB_URI = 'mongodb+srv://benilbaisil001_db_user:W2EkWX1NR034eVLY@cluster0.fgiophn.mongodb.net/branddna_ai?retryWrites=true&w=majority';

// Mock Express Response helper
const createMockRes = () => {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
};

async function runTests() {
  console.log('--- BRANDDNA RETURN & REFUND WORKFLOW VERIFICATION SUITE ---');
  await mongoose.connect(MONGODB_URI);

  // 1. Fetch Users
  const customer = await User.findOne({ email: 'customer@branddna.ai' });
  const otherCustomer = await User.findOne({ email: 'geo@gmail.com' });
  const inventoryStaff = await User.findOne({ email: 'inventory@branddna.ai' });
  const admin = await User.findOne({ email: 'admin@branddna.ai' });

  if (!customer || !inventoryStaff || !admin) {
    throw new Error('Required test users not found in database');
  }

  // Fetch or create products for testing
  let prodA = await Product.findOne({ status: 'Active' });
  let prodB = await Product.findOne({ _id: { $ne: prodA._id }, status: 'Active' });

  console.log(`Using products: Prod A (${prodA.name}, stock=${prodA.stock}), Prod B (${prodB.name}, stock=${prodB.stock})`);

  const initialStockA = prodA.stock;

  // TEST 1: Strict 7-Day Deadline Backend Enforcement
  console.log('\n[TEST 1] Strict 7-Day Rule - Expired Order (>7 Days Ago)');
  const expiredDeliveredAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  const expiredOrder = await Order.create({
    orderNumber: `TEST-EXP-${Date.now().toString().slice(-5)}`,
    customer: customer._id,
    items: [
      {
        product: prodA._id,
        productName: prodA.name,
        quantity: 2,
        unitPrice: prodA.price,
        totalPrice: prodA.price * 2,
      },
    ],
    totalAmount: prodA.price * 2,
    shippingAddress: {
      fullName: 'Customer Test',
      street: '123 Marine Drive',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682001',
      phone: '+919999999999',
    },
    status: 'Delivered',
    paymentStatus: 'Paid',
    razorpayOrderId: 'order_test_expired',
    razorpayPaymentId: 'pay_test_expired',
    deliveredAt: expiredDeliveredAt,
  });

  // Check eligibility endpoint
  let req = { params: { orderId: expiredOrder._id }, user: customer };
  let res = createMockRes();
  await getOrderReturnEligibility(req, res);
  console.log(`Eligibility Check on 10-day old order: isWithin7Days=${res.data?.data?.isWithin7Days}, isExpired=${res.data?.data?.isExpired}`);
  console.log(`Item Eligibility: isEligible=${res.data?.data?.items[0]?.isEligible}, reason="${res.data?.data?.items[0]?.reasonNotEligible}"`);
  if (res.data?.data?.isExpired !== true || res.data?.data?.items[0]?.isEligible !== false) {
    throw new Error('TEST 1 FAILED: Expired order was marked eligible!');
  }

  // Attempt direct API return creation on expired order
  req = {
    user: customer,
    body: {
      orderId: expiredOrder._id,
      productId: prodA._id,
      quantity: 1,
      reason: 'Defective product',
    },
  };
  res = createMockRes();
  await createReturn(req, res);
  console.log(`Direct API createReturn on expired order result: status=${res.statusCode}, success=${res.data?.success}, message="${res.data?.message}"`);
  if (res.statusCode !== 400 || !res.data?.message?.includes('Return period expired')) {
    throw new Error('TEST 1 FAILED: Backend did not reject expired return request!');
  }
  console.log('✓ TEST 1 PASSED: Expired orders strictly rejected by backend.');

  // TEST 2: Undelivered Order Return Attempt
  console.log('\n[TEST 2] Undelivered Order Return Attempt');
  const undeliveredOrder = await Order.create({
    orderNumber: `TEST-UNDEL-${Date.now().toString().slice(-5)}`,
    customer: customer._id,
    items: [
      {
        product: prodA._id,
        productName: prodA.name,
        quantity: 1,
        unitPrice: prodA.price,
        totalPrice: prodA.price,
      },
    ],
    totalAmount: prodA.price,
    shippingAddress: {
      fullName: 'Customer Test',
      street: '123 Marine Drive',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682001',
      phone: '+919999999999',
    },
    status: 'Out for Delivery',
    paymentStatus: 'Paid',
    deliveredAt: null,
  });

  req = {
    user: customer,
    body: {
      orderId: undeliveredOrder._id,
      productId: prodA._id,
      quantity: 1,
      reason: 'Wrong product',
    },
  };
  res = createMockRes();
  await createReturn(req, res);
  console.log(`Undelivered order result: status=${res.statusCode}, message="${res.data?.message}"`);
  if (res.statusCode !== 400) {
    throw new Error('TEST 2 FAILED: Undelivered order was allowed to create return!');
  }
  console.log('✓ TEST 2 PASSED: Undelivered order return request rejected.');

  // TEST 3: Multi-product Order within 7 Days, Partial Return & Quantity Limits
  console.log('\n[TEST 3] Multi-product Order within 7 Days - Independent Eligibility & Quantity Cap');
  const validDeliveredAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const validOrder = await Order.create({
    orderNumber: `TEST-VAL-${Date.now().toString().slice(-5)}`,
    customer: customer._id,
    items: [
      {
        product: prodA._id,
        productName: prodA.name,
        quantity: 2,
        unitPrice: 1000,
        totalPrice: 2000,
      },
      {
        product: prodB._id,
        productName: prodB.name,
        quantity: 1,
        unitPrice: 1500,
        totalPrice: 1500,
      },
    ],
    totalAmount: 3500,
    shippingAddress: {
      fullName: 'Customer Test',
      street: '123 Marine Drive',
      city: 'Kochi',
      state: 'Kerala',
      zipCode: '682001',
      phone: '+919999999999',
    },
    status: 'Delivered',
    paymentStatus: 'Paid',
    razorpayOrderId: `order_test_${Date.now()}`,
    razorpayPaymentId: `pay_test_sim_${Date.now()}`,
    deliveredAt: validDeliveredAt,
  });

  // Return 1 of 2 units of Prod A
  req = {
    user: customer,
    body: {
      orderId: validOrder._id,
      productId: prodA._id,
      quantity: 1,
      reason: 'Wrong product',
      description: 'Ordered blue but received black',
    },
  };
  res = createMockRes();
  await createReturn(req, res);
  console.log(`Created return 1 of 2 for Prod A: status=${res.statusCode}, returnNumber=${res.data?.data?.returnDoc?.returnNumber}`);
  const returnA1 = res.data?.data?.returnDoc;

  // Check eligibility again: Prod A should have 1 remaining, Prod B should have 1 remaining
  req = { params: { orderId: validOrder._id }, user: customer };
  res = createMockRes();
  await getOrderReturnEligibility(req, res);
  const eligItems = res.data?.data?.items || [];
  const itemAElig = eligItems.find(i => i.productId === prodA._id.toString());
  const itemBElig = eligItems.find(i => i.productId === prodB._id.toString());
  console.log(`Eligibility after 1st return: Prod A remaining=${itemAElig?.remainingReturnableQty}, Prod B remaining=${itemBElig?.remainingReturnableQty}`);
  if (itemAElig?.remainingReturnableQty !== 1 || itemBElig?.remainingReturnableQty !== 1) {
    throw new Error('TEST 3 FAILED: Remaining returnable quantities incorrect!');
  }

  // Attempt to return 2 units of Prod A (should fail because only 1 remains)
  req = {
    user: customer,
    body: {
      orderId: validOrder._id,
      productId: prodA._id,
      quantity: 2,
      reason: 'Damaged product',
    },
  };
  res = createMockRes();
  await createReturn(req, res);
  console.log(`Attempted to return 2 units when only 1 remains: status=${res.statusCode}, message="${res.data?.message}"`);
  if (res.statusCode !== 400 || !res.data?.message?.includes('exceeds the remaining returnable quantity')) {
    throw new Error('TEST 3 FAILED: Exceeded return quantity was not rejected!');
  }
  console.log('✓ TEST 3 PASSED: Independent product eligibility & quantity caps verified.');

  // TEST 4: Unauthorized Customer Return Attempt
  console.log('\n[TEST 4] Security: Customer cannot return items from another customer order');
  req = {
    user: otherCustomer,
    body: {
      orderId: validOrder._id,
      productId: prodB._id,
      quantity: 1,
      reason: 'Incorrect size',
    },
  };
  res = createMockRes();
  await createReturn(req, res);
  console.log(`Other customer attempt: status=${res.statusCode}, message="${res.data?.message}"`);
  if (res.statusCode !== 403) {
    throw new Error('TEST 4 FAILED: Unauthorized customer was not blocked!');
  }
  console.log('✓ TEST 4 PASSED: Customer authorization strictly enforced.');

  // TEST 5: Return Lifecycle & Stock Movement Inspection (Resellable vs Damaged)
  console.log('\n[TEST 5] Full Lifecycle: APPROVE -> RECEIVE -> INSPECT (Resellable restocks inventory)');
  // Staff approves
  req = { params: { id: returnA1._id }, user: inventoryStaff, body: { note: 'Staff approved' } };
  res = createMockRes();
  await approveReturn(req, res);
  console.log(`Approved return status: ${res.data?.data?.returnDoc?.status}`);

  // Staff receives physical package
  req = { params: { id: returnA1._id }, user: inventoryStaff, body: { note: 'Package received at warehouse' } };
  res = createMockRes();
  await receiveReturn(req, res);
  console.log(`Received return status: ${res.data?.data?.returnDoc?.status}`);

  // Staff inspects as Resellable
  req = {
    params: { id: returnA1._id },
    user: inventoryStaff,
    body: { inspectStatus: 'Resellable', inspectionNotes: 'Seals intact, mint condition' },
  };
  res = createMockRes();
  await inspectReturn(req, res);
  console.log(`Inspected return status: ${res.data?.data?.returnDoc?.status}, inspectStatus=${res.data?.data?.returnDoc?.inspectStatus}, isStockAdjusted=${res.data?.data?.returnDoc?.isStockAdjusted}`);

  // Verify Prod A available stock increased by 1
  const updatedProdA = await Product.findById(prodA._id);
  console.log(`Stock for Prod A: initial=${initialStockA}, updated=${updatedProdA.stock}`);
  if (updatedProdA.stock !== initialStockA + 1) {
    throw new Error('TEST 5 FAILED: Sellable stock did not increase after Resellable inspection!');
  }

  // Attempt duplicate inspection (should prevent duplicate stock movement)
  await inspectReturn(req, res);
  const reCheckedProdA = await Product.findById(prodA._id);
  if (reCheckedProdA.stock !== updatedProdA.stock) {
    throw new Error('TEST 5 FAILED: Duplicate stock movement occurred on re-inspection!');
  }
  console.log('✓ TEST 5 PASSED: Resellable item restocked into available inventory & duplicate prevention verified.');

  // TEST 6: Damaged Inspection (Audit Logged, No Stock Increase)
  console.log('\n[TEST 6] Damaged Inspection: Logged in Damaged Records without increasing sellable stock');
  // Return the remaining 1 unit of Prod A as Damaged
  req = {
    user: customer,
    body: {
      orderId: validOrder._id,
      productId: prodA._id,
      quantity: 1,
      reason: 'Damaged product',
    },
  };
  res = createMockRes();
  await createReturn(req, res);
  const returnA2 = res.data?.data?.returnDoc;

  // Approve & receive
  await approveReturn({ params: { id: returnA2._id }, user: inventoryStaff, body: {} }, createMockRes());
  await receiveReturn({ params: { id: returnA2._id }, user: inventoryStaff, body: {} }, createMockRes());

  const stockBeforeDamage = (await Product.findById(prodA._id)).stock;
  // Inspect as Damaged
  req = {
    params: { id: returnA2._id },
    user: inventoryStaff,
    body: { inspectStatus: 'Damaged', inspectionNotes: 'Cracked handle - cannot resell' },
  };
  res = createMockRes();
  await inspectReturn(req, res);
  const stockAfterDamage = (await Product.findById(prodA._id)).stock;
  console.log(`Stock around damaged inspection: before=${stockBeforeDamage}, after=${stockAfterDamage}`);
  if (stockAfterDamage !== stockBeforeDamage) {
    throw new Error('TEST 6 FAILED: Available stock changed on damaged return!');
  }

  // Verify damage transaction was recorded in ledger
  const damageTx = await InventoryTransaction.findOne({ referenceId: returnA2._id, transactionType: 'Damage' });
  if (!damageTx) {
    throw new Error('TEST 6 FAILED: Damaged inventory transaction not logged!');
  }
  console.log(`Damage transaction logged: ${damageTx.reference}, notes="${damageTx.notes}"`);
  console.log('✓ TEST 6 PASSED: Damaged return logged in audit records without increasing sellable stock.');

  // TEST 7: Razorpay Refund Processing & Duplicate Prevention
  console.log('\n[TEST 7] Razorpay Refund Processing & Duplicate Prevention');
  req = {
    params: { id: returnA1._id },
    user: inventoryStaff,
    body: { amount: 1000 },
  };
  res = createMockRes();
  await processRazorpayRefund(req, res);
  console.log(`Razorpay refund response: status=${res.statusCode}, refundId=${res.data?.data?.returnDoc?.refundDetails?.razorpayRefundId}, refundStatus=${res.data?.data?.returnDoc?.refundStatus}`);
  if (res.statusCode !== 200 || res.data?.data?.returnDoc?.refundStatus !== 'Processed') {
    throw new Error('TEST 7 FAILED: Razorpay refund processing failed!');
  }

  // Attempt duplicate refund on same return
  res = createMockRes();
  await processRazorpayRefund(req, res);
  console.log(`Duplicate refund attempt: status=${res.statusCode}, message="${res.data?.message}"`);
  if (res.statusCode !== 400 || !res.data?.message?.includes('already been processed')) {
    throw new Error('TEST 7 FAILED: Duplicate refund was not prevented!');
  }
  console.log('✓ TEST 7 PASSED: Razorpay refund executed, details stored, duplicate refunds blocked.');

  // Clean up test data
  console.log('\nCleaning up test orders & returns...');
  await Return.deleteMany({ order: { $in: [expiredOrder._id, undeliveredOrder._id, validOrder._id] } });
  await InventoryTransaction.deleteMany({ referenceId: { $in: [returnA1._id, returnA2._id] } });
  await Order.deleteMany({ _id: { $in: [expiredOrder._id, undeliveredOrder._id, validOrder._id] } });
  // restore stock
  prodA.stock = initialStockA;
  await prodA.save();

  console.log('\n======================================================');
  console.log('ALL 7 RETURN & REFUND WORKFLOW TESTS PASSED PERFECTLY!');
  console.log('======================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n❌ TEST RUNNER FAILED:', err);
  process.exit(1);
});
