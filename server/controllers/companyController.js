import { Company } from '../models/Company.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getCompany = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = await Company.create({
        name: 'BrandDNA Enterprise',
        email: 'contact@branddna.com',
        phone: '+91 98765 43210',
      });
    }
    return sendResponse(res, 200, true, 'Company details fetched', { company });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch company details');
  }
};

export const updateCompany = async (req, res) => {
  try {
    let company = await Company.findOne();
    if (!company) {
      company = new Company(req.body);
    } else {
      Object.assign(company, req.body);
    }
    await company.save();
    return sendResponse(res, 200, true, 'Company details updated', { company });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to update company');
  }
};
