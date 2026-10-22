import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Order } from './models/Order.js';
import { Product } from './models/Product.js';
import { Return } from './models/Return.js';
import { InventoryTransaction } from './models/InventoryTransaction.js';
import { DeliveryTracking } from './models/DeliveryTracking.js';
import {
  validateAndNormalizePhone,
  validateAddress,
  validatePinCode,
  validateStreet,
} from './validators/contactValidator.js';
import {
  getAdminUsersService,
  createAdminUserService,
  updateAdminUserService,
} from './services/adminService.js';
import { registerUserService, updateUserProfileService } from './services/authService.js';
import {
  createDeliveryAgent,
  getDeliveryAgents,
  assignDeliveryAgent,
  acceptDelivery,
  pickupOrder,
  startDelivery,
  confirmDeliveryWithOtp,
} from './controllers/deliveryController.js';
import {
  createReturn,
  approveReturn,
  receiveReturn,
  inspectReturn,
  processRazorpayRefund,
} from './controllers/returnController.js';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://benilbaisil001_db_user:W2EkWX1NR034eVLY@cluster0.fgiophn.mongodb.net/branddna_ai?retryWrites=true&w=majority';

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

async function runTestSuite() {
  console.log('======================================================================');
  console.log('🚀 BRANDDNA ROLE MANAGEMENT, DELIVERY & RETURNS VERIFICATION SUITE');
  console.log('======================================================================\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB Atlas\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // =================================================================
  // SECTION 1: LIVE PHONE & ADDRESS VALIDATION
  // =================================================================
  console.log('--- SECTION 1: LIVE PHONE & ADDRESS VALIDATION ---');

  // Phone Validation
  const validInd1 = validateAndNormalizePhone('9876543210');
  assert(validInd1.isValid && validInd1.normalized === '+919876543210', 'Standard 10-digit Indian number normalized to E.164');

  const validInd2 = validateAndNormalizePhone('+919876543210');
  assert(validInd2.isValid && validInd2.normalized === '+919876543210', '+91 prefixed number verified');

  const validIntl = validateAndNormalizePhone('+14155552671');
  assert(validIntl.isValid && validIntl.normalized === '+14155552671', 'International US phone number verified');

  const invalidPhone1 = validateAndNormalizePhone('12345');
  assert(!invalidPhone1.isValid, 'Short invalid phone number (12345) rejected');

  const invalidPhone2 = validateAndNormalizePhone('abcdefghij');
  assert(!invalidPhone2.isValid, 'Alphabetic phone string rejected');

  // Address & PIN Code Validation
  const validPin = validatePinCode('560001', 'India');
  assert(validPin === null, 'Valid 6-digit Indian PIN code accepted (560001)');

  const invalidPin1 = validatePinCode('012345', 'India');
  assert(invalidPin1 !== null, 'Indian PIN code starting with 0 rejected');

  const invalidPin2 = validatePinCode('5600', 'India');
  assert(invalidPin2 !== null, '4-digit Indian PIN code rejected');

  const invalidPin3 = validatePinCode('56000199', 'India');
  assert(invalidPin3 !== null, '8-digit Indian PIN code rejected');

  const validAddressRes = validateAddress({
    street: 'Plot 42, Silicon Valley Avenue',
    city: 'Bangalore',
    state: 'Karnataka',
    zipCode: '560100',
    country: 'India',
  });
  assert(validAddressRes.isValid && validAddressRes.sanitized.city === 'Bangalore', 'Complete valid Indian address sanitized successfully');

  const invalidAddressRes = validateAddress({
    street: 'St',
    city: '',
    state: 'K',
    zipCode: 'abc',
    country: 'India',
  });
  assert(!invalidAddressRes.isValid && invalidAddressRes.errors.street && invalidAddressRes.errors.city && invalidAddressRes.errors.zipCode, 'Incomplete address correctly identifies street, city, and zipCode errors');

  console.log('✅ Phone & Address validation tests passed\n');

  // =================================================================
  // SECTION 2: ADMIN STAFF ACCOUNT MANAGEMENT & RBAC
  // =================================================================
  console.log('--- SECTION 2: ADMIN STAFF ACCOUNT MANAGEMENT & RBAC ---');

  const testTimestamp = Date.now();
  const testStaffEmail = `inv_staff_${testTimestamp}@branddna.ai`;
  const testMktgEmail = `mktg_staff_${testTimestamp}@branddna.ai`;
  const testAgentEmail = `agent_${testTimestamp}@branddna.ai`;

  // 1. Admin creates Inventory Staff
  const createdInvStaff = await createAdminUserService({
    fullName: 'Test Inventory Manager',
    email: testStaffEmail,
    password: 'password123',
    phone: '9876500001',
    role: 'inventory_staff',
    status: 'Active',
    address: {
      street: '124 Logistics Park, Sector 4',
      city: 'Gurugram',
      state: 'Haryana',
      zipCode: '122001',
      country: 'India',
    },
  });
  assert(createdInvStaff && createdInvStaff.role === 'inventory_staff', 'Admin successfully created Inventory Staff account');
  assert(createdInvStaff.phone === '+919876500001', 'Staff phone normalized to E.164 on creation');
  assert(createdInvStaff.password === undefined, 'Password is NOT exposed in createAdminUserService response');

  // 2. Admin creates Marketing Staff
  const createdMktgStaff = await createAdminUserService({
    fullName: 'Test Marketing Specialist',
    email: testMktgEmail,
    password: 'password123',
    phone: '9876500002',
    role: 'marketing_staff',
    status: 'Active',
    address: {
      street: '88 Creative Lane, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560034',
      country: 'India',
    },
  });
  assert(createdMktgStaff && createdMktgStaff.role === 'marketing_staff', 'Admin successfully created Marketing Staff account');

  // 3. Admin creates Delivery Agent
  const createdAgent = await createAdminUserService({
    fullName: 'Test Delivery Agent',
    email: testAgentEmail,
    password: 'password123',
    phone: '9876500003',
    role: 'delivery_agent',
    status: 'Active',
    vehicleNumber: 'KA-04-TR-9988',
    vehicleType: 'Bike',
    address: {
      street: '12 Delivery Hub Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
    },
  });
  assert(createdAgent && createdAgent.role === 'delivery_agent' && createdAgent.vehicleNumber === 'KA-04-TR-9988', 'Admin successfully created Delivery Agent account with vehicle details');

  // 4. Duplicate email prevention
  let dupError = null;
  try {
    await createAdminUserService({
      fullName: 'Duplicate Staff',
      email: testStaffEmail,
      password: 'password123',
      role: 'inventory_staff',
    });
  } catch (err) {
    dupError = err;
  }
  assert(dupError !== null && dupError.message.includes('already exists'), 'Duplicate staff email properly rejected with error');

  // 5. Admin updates staff account
  const updatedStaff = await updateAdminUserService(createdInvStaff.id, {
    fullName: 'Updated Inventory Manager',
    phone: '9876599999',
    status: 'Disabled',
  });
  assert(updatedStaff.fullName === 'Updated Inventory Manager' && updatedStaff.status === 'Disabled' && updatedStaff.phone === '+919876599999', 'Admin updated staff account (status, phone, name)');

  // 6. Security: Verify passwords never exposed in users list
  const usersList = await getAdminUsersService();
  const staffSample = usersList.find((u) => u.email === testStaffEmail);
  assert(staffSample && staffSample.password === undefined && staffSample.passwordHash === undefined, 'Admin staff list does NOT expose password or password hash');

  // 7. Security: Public registration MUST force role: 'customer' and reject privilege escalation
  const customerReg = await registerUserService({
    fullName: 'Attacker Attempting Escalation',
    email: `escalation_${testTimestamp}@branddna.ai`,
    password: 'Password123!',
    phone: '9876543299',
    role: 'admin', // Malicious attempt to self-register as admin
  });
  assert(customerReg.user.role === 'customer', 'Public registration forces customer role (escalation to admin blocked)');

  // 8. Security: Profile update does NOT allow changing role
  const profileUpdate = await updateUserProfileService(customerReg.user.id, {
    fullName: 'Attacker Profile Update',
    role: 'inventory_staff', // Malicious attempt to change role
  });
  assert(profileUpdate.role === 'customer', 'updateUserProfileService ignores attempts to change role');

  console.log('✅ Admin Staff Management & RBAC tests passed\n');

  // =================================================================
  // SECTION 3: INVENTORY STAFF DELIVERY MANAGEMENT
  // =================================================================
  console.log('--- SECTION 3: INVENTORY STAFF DELIVERY MANAGEMENT ---');

  // Fetch Inventory Staff & Admin users
  const inventoryStaffUser = await User.findOne({ email: 'inventory@branddna.ai' });
  const adminUser = await User.findOne({ email: 'admin@branddna.ai' });
  const activeAgentUser = await User.findOne({ role: { $in: ['delivery_agent', 'DELIVERY_AGENT'] }, status: 'Active' });

  assert(inventoryStaffUser && adminUser && activeAgentUser, 'Test users (Inventory Staff, Admin, Delivery Agent) exist in DB');

  // 1. Inventory Staff accesses delivery agents list
  const mockReqAgents = { user: inventoryStaffUser };
  const mockResAgents = createMockRes();
  await getDeliveryAgents(mockReqAgents, mockResAgents);
  assert(mockResAgents.statusCode === 200 && mockResAgents.data?.data?.agents?.length > 0, 'Inventory Staff can query delivery agents list (status 200)');

  // 2. Setup a fresh test order in Confirmed status for dispatch
  const prod = await Product.findOne({ status: 'Active' });
  assert(prod, 'Active product found for test order');
  const testOrder = await Order.create({
    orderNumber: `DISPATCH-${testTimestamp}`,
    customer: customerReg.user.id,
    items: [
      {
        product: prod._id,
        productName: prod.name,
        productImage: (prod.images && prod.images[0]) || 'https://via.placeholder.com/150',
        size: 'M',
        quantity: 1,
        unitPrice: prod.price,
        totalPrice: prod.price,
      },
    ],
    totalAmount: prod.price,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    razorpayPaymentId: `pay_test_${testTimestamp}`,
    shippingAddress: {
      fullName: 'Test Customer',
      street: '123 Customer St',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      phone: '+919876543210',
    },
  });

  // 3. Inventory Staff assigns Delivery Agent to the order
  const mockReqAssign = {
    user: inventoryStaffUser,
    params: { orderId: testOrder._id },
    body: { deliveryAgentId: activeAgentUser._id },
  };
  const mockResAssign = createMockRes();
  await assignDeliveryAgent(mockReqAssign, mockResAssign);
  assert(mockResAssign.statusCode === 200, 'Inventory Staff can assign Delivery Agent to dispatchable order');

  // 4. Verify order updated and delivery tracking event created
  const refreshedOrder = await Order.findById(testOrder._id).populate('deliveryAgent');
  assert(
    refreshedOrder.status === 'Assigned to Agent' &&
    refreshedOrder.deliveryAgent?._id?.toString() === activeAgentUser._id.toString(),
    'Order updated to "Assigned to Agent" and agent assigned'
  );

  const trackingEvents = await DeliveryTracking.find({ order: testOrder._id });
  assert(trackingEvents.length > 0, 'Delivery tracking timeline event recorded');

  // 5. Delivery Agent steps: Accept -> Pickup -> Start Delivery -> OTP Verification
  const mockReqAccept = {
    user: activeAgentUser,
    params: { orderId: testOrder._id },
  };
  const mockResAccept = createMockRes();
  await acceptDelivery(mockReqAccept, mockResAccept);
  assert(mockResAccept.statusCode === 200, 'Delivery Agent accepted delivery assignment');

  const mockReqPickup = {
    user: activeAgentUser,
    params: { orderId: testOrder._id },
  };
  const mockResPickup = createMockRes();
  await pickupOrder(mockReqPickup, mockResPickup);
  assert(mockResPickup.statusCode === 200, 'Delivery Agent picked up order');

  const mockReqStart = {
    user: activeAgentUser,
    params: { orderId: testOrder._id },
  };
  const mockResStart = createMockRes();
  await startDelivery(mockReqStart, mockResStart);
  assert(mockResStart.statusCode === 200, 'Delivery Agent marked order Out for Delivery');

  // Verify OTP verification cannot be bypassed with wrong OTP
  const mockReqWrongOtp = {
    user: activeAgentUser,
    params: { orderId: testOrder._id },
    body: { otp: '000000' },
  };
  const mockResWrongOtp = createMockRes();
  await confirmDeliveryWithOtp(mockReqWrongOtp, mockResWrongOtp);
  assert(mockResWrongOtp.statusCode === 400, 'Invalid OTP strictly rejected (OTP verification cannot be bypassed)');

  // Confirm delivery with the real OTP
  const currentOtp = (await Order.findById(testOrder._id).select('+deliveryOtp')).deliveryOtp;
  assert(currentOtp, 'Delivery verification OTP was generated upon dispatch/start delivery');
  const mockReqValidOtp = {
    user: activeAgentUser,
    params: { orderId: testOrder._id },
    body: { otp: currentOtp },
  };
  const mockResValidOtp = createMockRes();
  await confirmDeliveryWithOtp(mockReqValidOtp, mockResValidOtp);
  assert(mockResValidOtp.statusCode === 200, 'Order successfully verified with customer OTP and delivered');

  const deliveredOrder = await Order.findById(testOrder._id);
  assert(deliveredOrder.status === 'Delivered' && deliveredOrder.deliveredAt, 'Delivered timestamp recorded on order');

  console.log('✅ Inventory Staff Delivery Management & OTP verification tests passed\n');

  // =================================================================
  // SECTION 4: PRODUCT RETURNS & REFUND MANAGEMENT
  // =================================================================
  console.log('--- SECTION 4: PRODUCT RETURNS & REFUND MANAGEMENT ---');

  const prodForReturn = await Product.findById(prod._id);
  const initialStock = prodForReturn.stock;

  // 1. Customer creates a return request for the delivered order
  const mockReqCreateRet = {
    user: { _id: deliveredOrder.customer, role: 'customer' },
    body: {
      orderId: deliveredOrder._id,
      productId: prodForReturn._id,
      quantity: 1,
      reason: 'Defective / Damaged',
      customerComment: 'Minor stitch issue on arrival',
    },
  };
  const mockResCreateRet = createMockRes();
  await createReturn(mockReqCreateRet, mockResCreateRet);
  assert(mockResCreateRet.statusCode === 201, 'Customer successfully created return request');
  const returnDoc = mockResCreateRet.data.data.returnDoc;

  // 2. Inventory Staff approves return
  const mockReqApprove = {
    user: inventoryStaffUser,
    params: { id: returnDoc._id },
    body: { note: 'Return approved by Inventory Staff' },
  };
  const mockResApprove = createMockRes();
  await approveReturn(mockReqApprove, mockResApprove);
  assert(mockResApprove.statusCode === 200 && mockResApprove.data.data.returnDoc.status === 'APPROVED', 'Inventory Staff approved return request');

  // 3. Inventory Staff marks return received at warehouse
  const mockReqReceive = {
    user: inventoryStaffUser,
    params: { id: returnDoc._id },
    body: { note: 'Physically arrived at warehouse bay 3' },
  };
  const mockResReceive = createMockRes();
  await receiveReturn(mockReqReceive, mockResReceive);
  assert(mockResReceive.statusCode === 200 && mockResReceive.data.data.returnDoc.status === 'RETURN_RECEIVED', 'Inventory Staff marked return received');

  // 4. Inventory Staff inspects return as "Resellable"
  const mockReqInspect = {
    user: inventoryStaffUser,
    params: { id: returnDoc._id },
    body: { inspectStatus: 'Resellable', inspectionNotes: 'Original tags intact, flawless quality' },
  };
  const mockResInspect = createMockRes();
  await inspectReturn(mockReqInspect, mockResInspect);
  assert(mockResInspect.statusCode === 200 && mockResInspect.data.data.returnDoc.inspectStatus === 'Resellable', 'Inventory Staff inspected return as Resellable');

  // Verify stock increased and audit ledger created
  const postInspectProd = await Product.findById(prodForReturn._id);
  assert(postInspectProd.stock === initialStock + 1, 'Product stock increased by 1 for Resellable return');

  const stockTx = await InventoryTransaction.findOne({ referenceId: returnDoc._id, transactionType: 'Return' });
  assert(stockTx !== null, 'InventoryTransaction audit movement recorded for Restock');

  // Verify duplicate inspection does not increase stock a second time
  const mockResInspect2 = createMockRes();
  await inspectReturn(mockReqInspect, mockResInspect2);
  const postInspectProd2 = await Product.findById(prodForReturn._id);
  assert(postInspectProd2.stock === initialStock + 1, 'Duplicate stock movement prevented by isStockAdjusted flag');

  // 5. Inventory Staff initiates Razorpay refund
  const mockReqRefund = {
    user: inventoryStaffUser,
    params: { id: returnDoc._id },
    body: { amount: returnDoc.refundAmount },
  };
  const mockResRefund = createMockRes();
  await processRazorpayRefund(mockReqRefund, mockResRefund);
  assert(mockResRefund.statusCode === 200, 'Inventory Staff successfully initiated Razorpay refund');
  assert(mockResRefund.data.data.returnDoc.refundStatus === 'Processed', 'Return refundStatus updated to Processed');

  // 6. Verify duplicate refund is strictly prevented
  const mockResDupRefund = createMockRes();
  await processRazorpayRefund(mockReqRefund, mockResDupRefund);
  assert(mockResDupRefund.statusCode === 400 && mockResDupRefund.data.message.includes('already been processed'), 'Duplicate refund request blocked');

  console.log('✅ Inventory Staff Product Returns & Razorpay Refund tests passed\n');

  // Cleanup created test records
  console.log('--- CLEANUP TEST DATA ---');
  await User.deleteMany({ email: { $in: [testStaffEmail, testMktgEmail, testAgentEmail, `escalation_${testTimestamp}@branddna.ai`] } });
  await Return.deleteOne({ _id: returnDoc._id });
  await DeliveryTracking.deleteMany({ order: testOrder._id });
  if (testOrder.orderNumber.startsWith('DISPATCH-')) {
    await Order.deleteOne({ _id: testOrder._id });
  }
  // Restore initial product stock
  await Product.findByIdAndUpdate(prodForReturn._id, { stock: initialStock });
  console.log('🧹 Cleaned up temporary test data\n');

  console.log('======================================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('======================================================================');

  await mongoose.disconnect();
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test suite failed with error:\n', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
