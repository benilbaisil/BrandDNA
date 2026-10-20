import { MarketingProject } from '../models/MarketingProject.js';
import { sendResponse } from '../utils/apiResponse.js';
import {
  generateBrandIdentityAI,
  generateProductStrategyAI,
  generateProductDescriptionAI,
  generateCustomerPersonaAI,
  generateMarketingIdeasAI,
  generateCampaignAI,
  generateSocialMediaContentAI,
  generateAdvertisementCopyAI,
} from '../services/marketingAiService.js';

// GET /api/marketing-projects (Fetch real MongoDB projects)
export const getProjects = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const projects = await MarketingProject.find({ createdBy: userId }).sort({ updatedAt: -1 });

    const totalProjects = projects.length;
    const inProgressProjects = projects.filter((p) => p.status === 'In Progress').length;
    const completedProjects = projects.filter((p) => p.status === 'Completed').length;

    return sendResponse(res, 200, true, 'Marketing projects retrieved successfully', {
      projects,
      summary: {
        totalProjects,
        inProgressProjects,
        completedProjects,
      },
    });
  } catch (err) {
    console.error('Error fetching marketing projects:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch marketing projects');
  }
};

// POST /api/marketing-projects (Create new project from Product Idea)
export const createProject = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const {
      title,
      productIdea,
      productCategory,
      intendedMarket,
      productCost,
      specialFeatures,
      businessObjective,
      geographicMarket,
    } = req.body;

    if (!productIdea || !productIdea.trim()) {
      return sendResponse(res, 400, false, 'Product Idea / Concept is required to create a marketing project');
    }

    const projectTitle = title && title.trim() ? title.trim() : productIdea.substring(0, 45) + (productIdea.length > 45 ? '...' : '');

    const project = await MarketingProject.create({
      createdBy: userId,
      title: projectTitle,
      productIdea: productIdea.trim(),
      productCategory: productCategory || '',
      intendedMarket: intendedMarket || '',
      productCost: productCost || '',
      specialFeatures: specialFeatures || '',
      businessObjective: businessObjective || '',
      geographicMarket: geographicMarket || '',
      status: 'In Progress',
    });

    return sendResponse(res, 201, true, 'Marketing project created from product idea', { project });
  } catch (err) {
    console.error('Error creating marketing project:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to create marketing project');
  }
};

// GET /api/marketing-projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await MarketingProject.findById(req.params.id);
    if (!project) {
      return sendResponse(res, 404, false, 'Marketing project not found');
    }
    return sendResponse(res, 200, true, 'Marketing project details retrieved', { project });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch project');
  }
};

// PUT /api/marketing-projects/:id (Save selected results or manual edits)
export const updateProject = async (req, res) => {
  try {
    const project = await MarketingProject.findById(req.params.id);
    if (!project) {
      return sendResponse(res, 404, false, 'Marketing project not found');
    }

    const {
      title,
      productIdea,
      productCategory,
      intendedMarket,
      productCost,
      specialFeatures,
      businessObjective,
      geographicMarket,
      selectedProductName,
      selectedTagline,
      selectedUSP,
      brandIdentity,
      productStrategy,
      productDescription,
      customerPersona,
      marketingIdeas,
      campaigns,
      socialMediaContent,
      advertisementCopy,
      status,
    } = req.body;

    if (title !== undefined) project.title = title;
    if (productIdea !== undefined) project.productIdea = productIdea;
    if (productCategory !== undefined) project.productCategory = productCategory;
    if (intendedMarket !== undefined) project.intendedMarket = intendedMarket;
    if (productCost !== undefined) project.productCost = productCost;
    if (specialFeatures !== undefined) project.specialFeatures = specialFeatures;
    if (businessObjective !== undefined) project.businessObjective = businessObjective;
    if (geographicMarket !== undefined) project.geographicMarket = geographicMarket;

    if (selectedProductName !== undefined) project.selectedProductName = selectedProductName;
    if (selectedTagline !== undefined) project.selectedTagline = selectedTagline;
    if (selectedUSP !== undefined) project.selectedUSP = selectedUSP;

    if (brandIdentity !== undefined) project.brandIdentity = brandIdentity;
    if (productStrategy !== undefined) project.productStrategy = productStrategy;
    if (productDescription !== undefined) project.productDescription = productDescription;
    if (customerPersona !== undefined) project.customerPersona = customerPersona;
    if (marketingIdeas !== undefined) project.marketingIdeas = marketingIdeas;
    if (campaigns !== undefined) project.campaigns = campaigns;
    if (socialMediaContent !== undefined) project.socialMediaContent = socialMediaContent;
    if (advertisementCopy !== undefined) project.advertisementCopy = advertisementCopy;
    if (status !== undefined) project.status = status;

    await project.save();
    return sendResponse(res, 200, true, 'Marketing project updated successfully', { project });
  } catch (err) {
    console.error('Error updating project:', err);
    return sendResponse(res, 400, false, err.message || 'Failed to update marketing project');
  }
};

// DELETE /api/marketing-projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await MarketingProject.findByIdAndDelete(req.params.id);
    if (!project) {
      return sendResponse(res, 404, false, 'Marketing project not found');
    }
    return sendResponse(res, 200, true, 'Marketing project deleted');
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to delete marketing project');
  }
};

// POST /api/marketing-projects/:id/generate/:moduleKey (Generate individual section dynamically using Product Idea)
export const generateModuleAI = async (req, res) => {
  try {
    const { id, moduleKey } = req.params;
    const project = await MarketingProject.findById(id);
    if (!project) {
      return sendResponse(res, 404, false, 'Marketing project not found');
    }

    const context = {
      productIdea: req.body?.productIdea || project.productIdea,
      productCategory: req.body?.productCategory || project.productCategory,
      intendedMarket: req.body?.intendedMarket || project.intendedMarket,
      productCost: req.body?.productCost || project.productCost,
      specialFeatures: req.body?.specialFeatures || project.specialFeatures,
      businessObjective: req.body?.businessObjective || project.businessObjective,
      geographicMarket: req.body?.geographicMarket || project.geographicMarket,
      selectedProductName: project.selectedProductName,
      selectedTagline: project.selectedTagline,
      selectedUSP: project.selectedUSP,
    };

    let result = null;

    switch (moduleKey) {
      case 'brandIdentity':
        result = await generateBrandIdentityAI(context);
        project.brandIdentity = result;
        break;
      case 'productStrategy':
        result = await generateProductStrategyAI(context);
        project.productStrategy = result;
        break;
      case 'productDescription':
        result = await generateProductDescriptionAI(context);
        project.productDescription = result;
        break;
      case 'customerPersona':
        result = await generateCustomerPersonaAI(context);
        project.customerPersona = result;
        break;
      case 'marketingIdeas':
        result = await generateMarketingIdeasAI(context);
        project.marketingIdeas = result;
        break;
      case 'campaigns':
        result = await generateCampaignAI(context);
        project.campaigns = result;
        break;
      case 'socialMediaContent':
        result = await generateSocialMediaContentAI(context);
        project.socialMediaContent = result;
        break;
      case 'advertisementCopy':
        result = await generateAdvertisementCopyAI(context);
        project.advertisementCopy = result;
        break;
      default:
        return sendResponse(res, 400, false, `Unknown module key: ${moduleKey}`);
    }

    await project.save();
    return sendResponse(res, 200, true, `Generated ${moduleKey} dynamically from product idea`, {
      moduleKey,
      result,
      project,
    });
  } catch (err) {
    console.error(`Error generating ${req.params.moduleKey} AI:`, err);
    return sendResponse(res, 500, false, err.message || 'Unable to generate content. Please try again.');
  }
};
