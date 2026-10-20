import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.SHIPMENT_PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory shipment store as described in the specification
const shipments = {};

const STATUS_FLOW = [
  {
    status: 'ORDER_PLACED',
    statusText: 'Order Placed',
    description: 'Shipment order registered with courier',
    getLocation: (origin, dest) => origin.city || 'Origin Facility',
  },
  {
    status: 'ORDER_CONFIRMED',
    statusText: 'Order Confirmed',
    description: 'Courier confirmed shipment & generated shipping label',
    getLocation: (origin, dest) => origin.city || 'Origin Facility',
  },
  {
    status: 'PICKED_UP',
    statusText: 'Picked Up',
    description: 'Parcel picked up by courier driver',
    getLocation: (origin, dest) => origin.city || 'Origin Facility',
  },
  {
    status: 'IN_TRANSIT',
    statusText: 'In Transit',
    description: 'Parcel is en route to destination sorting hub',
    getLocation: (origin, dest) => `${origin.city || 'Origin'} -> ${dest.city || 'Destination'} Transit Center`,
  },
  {
    status: 'ARRIVED_AT_HUB',
    statusText: 'Arrived at Hub',
    description: 'Parcel arrived at local sorting facility',
    getLocation: (origin, dest) => dest.city || 'Destination Hub',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    statusText: 'Out for Delivery',
    description: 'Parcel is out for delivery with local dispatch agent',
    getLocation: (origin, dest) => dest.city || 'Local Delivery Area',
  },
  {
    status: 'DELIVERED',
    statusText: 'Delivered',
    description: 'Parcel successfully delivered to recipient address',
    getLocation: (origin, dest) => dest.city || 'Customer Destination',
  },
];

// Helper to schedule status progression every 10 seconds
const startSimulation = (trackingNumber) => {
  let stepIndex = 0;
  const intervalId = setInterval(() => {
    const shipment = shipments[trackingNumber];
    if (!shipment) {
      clearInterval(intervalId);
      return;
    }

    stepIndex++;
    if (stepIndex >= STATUS_FLOW.length) {
      clearInterval(intervalId);
      return;
    }

    const stepInfo = STATUS_FLOW[stepIndex];
    const now = new Date();
    shipment.status = stepInfo.status;
    shipment.statusText = stepInfo.statusText;

    const newEvent = {
      status: stepInfo.status,
      statusText: stepInfo.statusText,
      description: stepInfo.description,
      location: stepInfo.getLocation(shipment.origin, shipment.destination),
      timestamp: now.toISOString(),
    };

    shipment.events.push(newEvent);

    if (stepInfo.status === 'DELIVERED') {
      clearInterval(intervalId);
    }
  }, 10000); // 10 seconds step interval
};

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Demo Shipment API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// POST /api/shipments — Create a shipment
app.post('/api/shipments', (req, res) => {
  const { orderId, origin, destination } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  if (!origin || !origin.city) {
    return res.status(400).json({ error: 'origin.city is required' });
  }

  if (!destination || !destination.city) {
    return res.status(400).json({ error: 'destination.city is required' });
  }

  // Generate unique tracking number
  const trackingNumber = `TRK-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date();
  
  // Calculate estimated delivery: 3 days from now
  const estDelivery = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const initialStep = STATUS_FLOW[0];
  const initialEvent = {
    status: initialStep.status,
    statusText: initialStep.statusText,
    description: initialStep.description,
    location: initialStep.getLocation(origin, destination),
    timestamp: now.toISOString(),
  };

  const shipment = {
    trackingNumber,
    orderId: String(orderId),
    courier: 'SwiftExpress Courier',
    status: initialStep.status,
    statusText: initialStep.statusText,
    estimatedDelivery: estDelivery.toISOString(),
    origin,
    destination,
    createdAt: now.toISOString(),
    events: [initialEvent],
  };

  shipments[trackingNumber] = shipment;

  // Automated timer simulation disabled: status is updated by Delivery Agent
  // startSimulation(trackingNumber);

  return res.status(201).json(shipment);
});

// GET /api/shipments/:trackingNumber — Get shipment details
app.get('/api/shipments/:trackingNumber', (req, res) => {
  const { trackingNumber } = req.params;
  const shipment = shipments[trackingNumber];

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  return res.json(shipment);
});

// GET /api/shipments/:trackingNumber/events — Get tracking events
app.get('/api/shipments/:trackingNumber/events', (req, res) => {
  const { trackingNumber } = req.params;
  const shipment = shipments[trackingNumber];

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  return res.json({
    trackingNumber: shipment.trackingNumber,
    events: shipment.events,
  });
});

// GET /api/shipments — Get all shipments
app.get('/api/shipments', (req, res) => {
  return res.json(Object.values(shipments));
});

app.listen(PORT, () => {
  console.log(`Demo Shipment API server running at http://localhost:${PORT}`);
});
