import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { sendResponse } from '../utils/apiResponse.js';
import { generateAdPosterAI } from '../services/marketingAdPosterService.js';
import mongoose from 'mongoose';

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const ensureProductSizes = (prod) => {
  if (!prod) return prod;
  const p = prod.toObject ? prod.toObject() : { ...prod };
  if (!p.sizes || p.sizes.length === 0) {
    const catLower = (p.categoryName || p.category?.name || '').toLowerCase();
    if (catLower.includes('shoe') || catLower.includes('footwear')) {
      p.sizes = ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
    } else if (catLower.includes('nutrition') || catLower.includes('care') || catLower.includes('protein')) {
      p.sizes = ['500g', '1kg', '2kg'];
    } else if (catLower.includes('bag') || catLower.includes('backpack')) {
      p.sizes = ['Small (20L)', 'Medium (35L)', 'Large (50L)'];
    } else {
      p.sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    }
  }
  return p;
};

// GET /api/products (Public / Customer / Admin)
export const getProducts = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const filter = {};

    if (category && category !== 'ALL') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const escapedCat = escapeRegex(category.trim());
        filter.$or = [
          { categoryName: { $regex: `^${escapedCat}$`, $options: 'i' } }
        ];
      }
    }

    // Status filtering rules:
    // If status parameter is explicitly 'ALL', return all products (Active & Inactive, excluding Discontinued)
    // If status parameter is specified (e.g., 'Active', 'Inactive'), filter by that status
    // Default (for Customer Shop): return ONLY 'Active' products
    if (status === 'ALL') {
      filter.status = { $ne: 'Discontinued' };
    } else if (status) {
      filter.status = status;
    } else {
      filter.status = 'Active';
    }

    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      const searchConditions = [
        { name: searchRegex },
        { sku: searchRegex },
        { description: searchRegex },
        { brand: searchRegex },
        { categoryName: searchRegex }
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    const rawProducts = await Product.find(filter).populate('category').sort({ createdAt: -1 });
    const products = rawProducts.map(ensureProductSizes);
    return sendResponse(res, 200, true, 'Products retrieved successfully', { products });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch products');
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const rawProduct = await Product.findById(req.params.id).populate('category');
    if (!rawProduct) {
      return sendResponse(res, 404, false, 'Product not found');
    }
    const product = ensureProductSizes(rawProduct);
    return sendResponse(res, 200, true, 'Product details retrieved', { product });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch product details');
  }
};

// POST /api/products (Admin or Inventory Staff)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      categoryName,
      brand,
      description,
      price,
      discountPrice,
      cost,
      stock,
      reorderLevel,
      images,
      image,
      sizes,
      status
    } = req.body;

    if (!name || price === undefined || price === null) {
      return sendResponse(res, 400, false, 'Product name and selling price are required');
    }

    const catInput = category || categoryName;
    if (!catInput || (typeof catInput === 'string' && !catInput.trim())) {
      return sendResponse(res, 400, false, 'Category is required');
    }

    // Auto-generate SKU if not provided
    const finalSKU = (sku && sku.trim() !== '') 
      ? sku.trim().toUpperCase() 
      : `SKU-${Date.now().toString(36).toUpperCase()}`;

    const existingSKU = await Product.findOne({ sku: finalSKU });
    if (existingSKU) {
      return sendResponse(res, 400, false, 'Product SKU already exists');
    }

    // Category resolution (ObjectId or String)
    let categoryObjId = null;
    let finalCategoryName = typeof catInput === 'string' ? catInput.trim() : 'General';

    if (mongoose.Types.ObjectId.isValid(catInput)) {
      categoryObjId = catInput;
      const catDoc = await Category.findById(catInput);
      if (catDoc) finalCategoryName = catDoc.name;
    } else {
      const escapedCat = escapeRegex(finalCategoryName);
      let catDoc = await Category.findOne({ name: { $regex: `^${escapedCat}$`, $options: 'i' } });
      if (!catDoc) {
        catDoc = await Category.create({ name: finalCategoryName, description: `${finalCategoryName} products` });
      }
      categoryObjId = catDoc._id;
      finalCategoryName = catDoc.name;
    }

    // Handle single image or images array
    let imageList = [];
    if (Array.isArray(images) && images.length > 0) {
      imageList = images;
    } else if (image && typeof image === 'string') {
      imageList = [image];
    } else {
      imageList = ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'];
    }

    let parsedSizes = [];
    if (Array.isArray(sizes)) {
      parsedSizes = sizes.map(s => String(s).trim()).filter(Boolean);
    } else if (typeof sizes === 'string' && sizes.trim()) {
      parsedSizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (parsedSizes.length === 0) {
      const catLower = (finalCategoryName || '').toLowerCase();
      if (catLower.includes('shoe') || catLower.includes('footwear')) {
        parsedSizes = ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
      } else if (catLower.includes('nutrition') || catLower.includes('care') || catLower.includes('protein')) {
        parsedSizes = ['500g', '1kg', '2kg'];
      } else if (catLower.includes('bag') || catLower.includes('backpack')) {
        parsedSizes = ['Small (20L)', 'Medium (35L)', 'Large (50L)'];
      } else {
        parsedSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      }
    }

    const numDiscountPrice = (discountPrice !== undefined && discountPrice !== null && discountPrice !== '' && !isNaN(Number(discountPrice))) ? Number(discountPrice) : 0;
    const numCost = (cost !== undefined && cost !== null && cost !== '' && !isNaN(Number(cost))) ? Number(cost) : 0;
    const numStock = (stock !== undefined && stock !== null && stock !== '' && !isNaN(Number(stock))) ? Number(stock) : 0;
    const numReorderLevel = (reorderLevel !== undefined && reorderLevel !== null && reorderLevel !== '' && !isNaN(Number(reorderLevel))) ? Number(reorderLevel) : 10;

    const product = await Product.create({
      name: name.trim(),
      sku: finalSKU,
      category: categoryObjId,
      categoryName: finalCategoryName,
      brand: (brand || '').trim(),
      description: (description || '').trim(),
      price: Number(price),
      discountPrice: numDiscountPrice,
      cost: numCost,
      stock: numStock,
      reorderLevel: numReorderLevel,
      images: imageList,
      sizes: parsedSizes,
      status: status || 'Active',
    });

    const populatedProduct = await Product.findById(product._id).populate('category');

    return sendResponse(res, 201, true, 'Product created successfully', { product: ensureProductSizes(populatedProduct) });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create product');
  }
};

// PUT /api/products/:id (Admin or Inventory Staff)
export const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.sku) {
      updateData.sku = updateData.sku.trim().toUpperCase();
    }
    if (updateData.image && !updateData.images) {
      updateData.images = [updateData.image];
    }
    if (updateData.sizes !== undefined) {
      if (Array.isArray(updateData.sizes)) {
        updateData.sizes = updateData.sizes.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof updateData.sizes === 'string') {
        updateData.sizes = updateData.sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    const catVal = updateData.category || updateData.categoryName;
    if (catVal && !mongoose.Types.ObjectId.isValid(catVal)) {
      const catNameStr = String(catVal).trim();
      const escapedCat = escapeRegex(catNameStr);
      let catDoc = await Category.findOne({ name: { $regex: `^${escapedCat}$`, $options: 'i' } });
      if (!catDoc) {
        catDoc = await Category.create({ name: catNameStr, description: `${catNameStr} products` });
      }
      updateData.category = catDoc._id;
      updateData.categoryName = catDoc.name;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('category');
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }
    return sendResponse(res, 200, true, 'Product updated successfully', { product: ensureProductSizes(product) });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to update product');
  }
};

// DELETE /api/products/:id (Admin or Inventory Staff)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }
    product.status = 'Discontinued';
    await product.save();
    return sendResponse(res, 200, true, 'Product discontinued successfully');
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to delete product');
  }
};

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendResponse(res, 200, true, 'Categories retrieved', { categories });
  } catch (err) {
    return sendResponse(res, 500, false, err.message || 'Failed to fetch categories');
  }
};

// POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    return sendResponse(res, 201, true, 'Category created', { category });
  } catch (err) {
    return sendResponse(res, 400, false, err.message || 'Failed to create category');
  }
};

// POST /api/products/:id/generate-ad-poster - Generate Cloud AI Ad Poster for Inventory Product
export const generateProductAdPosterController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category');
    if (!product) {
      return sendResponse(res, 404, false, 'Inventory product not found');
    }

    console.log(`Generating AI Ad Poster for inventory product: "${product.name}" (${product.sku})...`);
    const posterData = await generateAdPosterAI(product);

    product.adPosterData = posterData;
    product.adPosterStatus = 'Generated';
    product.adPosterCreatedAt = new Date();
    await product.save();

    return sendResponse(res, 200, true, 'AI Ad Poster generated successfully using Cloud AI', {
      product: ensureProductSizes(product),
      adPosterData: posterData,
    });
  } catch (err) {
    console.error('Error generating product ad poster:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to generate product ad poster');
  }
};

// GET /api/products/:id/ad-poster - Get Ad Poster for Inventory Product
export const getProductAdPosterController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('category');
    if (!product) {
      return sendResponse(res, 404, false, 'Inventory product not found');
    }

    return sendResponse(res, 200, true, 'Product Ad Poster retrieved', {
      adPosterData: product.adPosterData,
      adPosterStatus: product.adPosterStatus,
      adPosterCreatedAt: product.adPosterCreatedAt,
      product: ensureProductSizes(product),
    });
  } catch (err) {
    console.error('Error fetching product ad poster:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to fetch product ad poster');
  }
};

// POST /api/products/:id/regenerate-ad-poster - Regenerate Cloud AI Ad Poster
export const regenerateProductAdPosterController = async (req, res) => {
  return generateProductAdPosterController(req, res);
};

// POST /api/products/:id/save-ad-poster - Save customized ad poster data
export const saveProductAdPosterController = async (req, res) => {
  try {
    const { id } = req.params;
    const { adPosterData, adPosterUrl } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return sendResponse(res, 404, false, 'Inventory product not found');
    }

    if (adPosterData) {
      product.adPosterData = { ...product.adPosterData, ...adPosterData };
    }
    if (adPosterUrl) {
      product.adPosterUrl = adPosterUrl;
    }
    product.adPosterStatus = 'Saved';
    await product.save();

    return sendResponse(res, 200, true, 'Product ad poster saved successfully', {
      product: ensureProductSizes(product),
    });
  } catch (err) {
    console.error('Error saving product ad poster:', err);
    return sendResponse(res, 500, false, err.message || 'Failed to save product ad poster');
  }
};

