import mongoose from 'mongoose';

const personaSchema = new mongoose.Schema({
  personaName: {
    type: String,
    required: true,
  },
  demographics: {
    age: { type: String, default: '' },
    location: { type: String, default: '' },
    income: { type: String, default: '' },
    occupation: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  interests: {
    hobbies: [{ type: String }],
    values: [{ type: String }],
    mediaConsumption: [{ type: String }],
    details: { type: String, default: '' },
  },
  buyingBehaviour: {
    shoppingHabits: { type: String, default: '' },
    decisionDrivers: { type: String, default: '' },
    priceSensitivity: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  painPoints: {
    specificFrustrations: [{ type: String }],
    primaryChallenge: { type: String, default: '' },
    details: { type: String, default: '' },
  },
  avatar: {
    type: String,
    default: '',
  },
});

const customerPersonaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    personas: [personaSchema],
  },
  {
    timestamps: true,
  }
);

export const CustomerPersona =
  mongoose.models.CustomerPersona || mongoose.model('CustomerPersona', customerPersonaSchema);
