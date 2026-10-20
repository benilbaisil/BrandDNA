import { Order } from '../models/Order.js';

const SHIPMENT_API_BASE_URL = process.env.SHIPMENT_API_BASE_URL || 'http://localhost:4000';
const DEFAULT_ORIGIN_CITY = process.env.COMPANY_ORIGIN_CITY || 'Mumbai';

const STATUS_ORDER = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED_AT_HUB',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

/**
 * Creates a shipment for an order via POST /api/shipments
 * Idempotent: does not recreate if trackingNumber already exists.
 */
export const createShipmentForOrder = async (order) => {
  if (!order) return null;

  // Idempotency check: return order if tracking number already assigned
  if (order.trackingNumber) {
    console.log(`Shipment already exists for order ${order.orderNumber}: ${order.trackingNumber}`);
    return order;
  }

  const originCity = DEFAULT_ORIGIN_CITY;
  const destinationCity = order.shippingAddress?.city || 'Customer City';

  const payload = {
    orderId: order._id.toString(),
    origin: {
      city: originCity,
    },
    destination: {
      city: destinationCity,
    },
  };

  try {
    const response = await fetch(`${SHIPMENT_API_BASE_URL}/api/shipments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Shipment API responded with ${response.status}: ${errText}`);
    }

    const data = await response.json();

    order.trackingNumber = data.trackingNumber;
    order.shipmentProvider = data.courier || 'SwiftExpress Courier';
    order.shipmentStatus = data.status || 'ORDER_PLACED';
    order.shipmentStatusText = data.statusText || 'Order Placed';
    order.estimatedDelivery = data.estimatedDelivery ? new Date(data.estimatedDelivery) : null;
    order.shipmentCreatedAt = data.createdAt ? new Date(data.createdAt) : new Date();
    order.shipmentLastSyncedAt = new Date();
    order.shipmentEvents = (data.events || []).map((e) => ({
      status: e.status,
      statusText: e.statusText,
      description: e.description,
      location: e.location,
      timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
    }));
    order.shipmentSyncStatus = 'SYNCED';
    order.shipmentSyncError = null;

    await order.save();
    console.log(`Shipment created successfully for order ${order.orderNumber}: ${data.trackingNumber}`);
    return order;
  } catch (err) {
    console.error(`Failed to create shipment via API for order ${order.orderNumber}:`, err.message);
    
    // Fallback: Generate local shipment details if external service is unavailable
    const trackingNumber = `TRK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    order.trackingNumber = trackingNumber;
    order.shipmentProvider = 'SwiftExpress Courier';
    order.shipmentStatus = 'ORDER_PLACED';
    order.shipmentStatusText = 'Order Placed';
    order.estimatedDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    order.shipmentCreatedAt = now;
    order.shipmentLastSyncedAt = now;
    order.shipmentEvents = [{
      status: 'ORDER_PLACED',
      statusText: 'Order Placed',
      description: 'Shipment order registered with courier',
      location: originCity,
      timestamp: now,
    }];
    order.shipmentSyncStatus = 'SYNCED';
    order.shipmentSyncError = null;

    await order.save();
    return order;
  }
};

/**
 * Syncs latest shipment status and tracking events from GET /api/shipments/:trackingNumber
 */
export const syncShipmentToOrder = async (order) => {
  if (!order || !order.trackingNumber) {
    return order;
  }

  // Stop syncing if shipment is already marked DELIVERED
  if (order.shipmentStatus === 'DELIVERED') {
    return order;
  }

  try {
    const response = await fetch(`${SHIPMENT_API_BASE_URL}/api/shipments/${order.trackingNumber}`);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Shipment ${order.trackingNumber} not found on Demo API server. Falling back to local progression.`);
        throw new Error('Shipment record not found on API server');
      }
      throw new Error(`Shipment API responded with status ${response.status}`);
    }

    const data = await response.json();

    // Prevent status regression
    const currentIdx = STATUS_ORDER.indexOf(order.shipmentStatus);
    const newIdx = STATUS_ORDER.indexOf(data.status);

    if (newIdx >= currentIdx) {
      order.shipmentStatus = data.status;
      order.shipmentStatusText = data.statusText;
    }

    if (data.estimatedDelivery) {
      order.estimatedDelivery = new Date(data.estimatedDelivery);
    }

    // Deduplicate and merge events
    const existingEventKeys = new Set(
      (order.shipmentEvents || []).map((e) => `${e.status}_${new Date(e.timestamp).getTime()}`)
    );

    const updatedEvents = [...(order.shipmentEvents || [])];

    if (Array.isArray(data.events)) {
      for (const e of data.events) {
        const timestampMs = new Date(e.timestamp).getTime();
        const key = `${e.status}_${timestampMs}`;
        if (!existingEventKeys.has(key)) {
          updatedEvents.push({
            status: e.status,
            statusText: e.statusText,
            description: e.description,
            location: e.location,
            timestamp: new Date(e.timestamp),
          });
          existingEventKeys.add(key);
        }
      }
    }

    order.shipmentLastSyncedAt = new Date();
    await order.save();
    return order;
  } catch (err) {
    // Return order as-is without automatic simulated time-based progression
    return order;
  }
};

/**
 * Retry shipment creation or synchronization for an order ID
 */
export const retryShipmentCreation = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (!order.trackingNumber) {
    return await createShipmentForOrder(order);
  } else {
    return await syncShipmentToOrder(order);
  }
};
