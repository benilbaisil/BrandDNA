import { CustomerPersona } from '../models/CustomerPersona.js';
import { StartupProfile } from '../models/StartupProfile.js';
import { BrandIdentity } from '../models/BrandIdentity.js';
import { ProductStrategy } from '../models/ProductStrategy.js';
import { sendResponse } from '../utils/apiResponse.js';
import { generateCustomerPersonasAI } from '../services/personaService.js';

const getUserContext = async (userId) => {
  const profile = await StartupProfile.findOne({ owner: userId });
  let brand = await BrandIdentity.findOne({ user: userId });
  let strategy = await ProductStrategy.findOne({ user: userId });
  let personaDoc = await CustomerPersona.findOne({ user: userId });
  if (!personaDoc) {
    personaDoc = await CustomerPersona.create({ user: userId, personas: [] });
  }
  return { profile, brand, strategy, personaDoc };
};

// 1. GET /api/customer-persona
export const getPersonas = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy, personaDoc } = await getUserContext(userId);

    return sendResponse(res, 200, true, 'Customer personas retrieved successfully', {
      personas: personaDoc?.personas || [],
      brandContext: {
        brandName: brand?.brandName || profile?.companyName || '',
        industry: profile?.industry || '',
        targetAudience: profile?.targetAudience || '',
        productName: strategy?.productName || '',
      },
    });
  } catch (err) {
    console.error('Error fetching customer personas:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch customer personas.');
  }
};

// 2. POST /api/generate-personas (or /api/customer-persona/generate-personas)
export const generatePersonas = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { profile, brand, strategy, personaDoc } = await getUserContext(userId);
    const userHint = req.body?.userHint || req.body?.productIdea || '';

    const generatedPersonas = await generateCustomerPersonasAI(profile, brand, strategy, userHint);

    personaDoc.personas = generatedPersonas;
    await personaDoc.save();

    return sendResponse(res, 200, true, 'Customer personas generated successfully', {
      personas: generatedPersonas,
    });
  } catch (err) {
    console.error('Error generating customer personas:', err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate customer personas right now.');
  }
};

// 3. POST /api/customer-persona/save
export const savePersonas = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let personaDoc = await CustomerPersona.findOne({ user: userId });
    if (!personaDoc) {
      personaDoc = new CustomerPersona({ user: userId, personas: [] });
    }

    const { personas } = req.body;
    if (Array.isArray(personas)) {
      personaDoc.personas = personas;
    }

    await personaDoc.save();
    return sendResponse(res, 200, true, 'Customer personas saved to MongoDB successfully', {
      personas: personaDoc.personas,
    });
  } catch (err) {
    console.error('Error saving customer personas:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to save customer personas.');
  }
};
