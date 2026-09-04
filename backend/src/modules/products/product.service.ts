import { Types } from 'mongoose';
import { Product } from './product.model.js';
import { Category } from '../categories/category.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logAuditEvent } from '../audit/audit.model.js';

export class ProductService {
  async getProducts(params: any) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { isDeleted: { $ne: true } };

    // Search query using text index or regex
    if (params.search) {
      filter.$text = { $search: params.search };
    }

    // Category filter by ID or slug
    if (params.category) {
      if (Types.ObjectId.isValid(params.category)) {
        filter.category = new Types.ObjectId(params.category);
      } else {
        const cat = await Category.findOne({ slug: params.category });
        if (cat) filter.category = cat._id;
      }
    }

    // Collection filter
    if (params.collection && Types.ObjectId.isValid(params.collection)) {
      filter.collectionId = new Types.ObjectId(params.collection);
    }

    // Flags
    if (params.bestseller !== undefined) filter['flags.isBestseller'] = params.bestseller;
    if (params.featured !== undefined) filter['flags.isFeatured'] = params.featured;
    if (params.newArrival !== undefined) filter['flags.isNewArrival'] = params.newArrival;

    // In-stock filter
    if (params.inStock) {
      filter.stock = { $gt: 0 };
    }

    // Price range (in smallest currency unit)
    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      filter.price = {};
      if (params.minPrice !== undefined) filter.price.$gte = params.minPrice;
      if (params.maxPrice !== undefined) filter.price.$lte = params.maxPrice;
    }

    // Variant size/color filters
    if (params.size) {
      filter['variants.size'] = params.size;
    }
    if (params.color) {
      filter['variants.color'] = params.color;
    }

    // Sorting
    let sort: Record<string, any> = { createdAt: -1 };
    if (params.sort === 'price_asc') sort = { price: 1 };
    else if (params.sort === 'price_desc') sort = { price: -1 };
    else if (params.sort === 'bestseller') sort = { 'flags.isBestseller': -1, createdAt: -1 };

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('collectionId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
    ]);

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductBySlug(slug: string) {
    const product = await Product.findOne({ slug, isDeleted: { $ne: true } })
      .populate('category', 'name slug')
      .populate('collectionId', 'name slug');

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    // Fetch related products from same category
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isDeleted: { $ne: true }
    })
      .limit(4)
      .select('name slug price salePrice images stock flags');

    return {
      product,
      related
    };
  }

  async createProduct(data: any, actorUserId?: string) {
    const existing = await Product.findOne({
      $or: [{ slug: data.slug }, { sku: data.sku }]
    });

    if (existing) {
      throw new AppError({
        message: 'A product with this slug or SKU already exists',
        statusCode: 409,
        code: 'CONFLICT'
      });
    }

    // Calculate total stock from variants if variants are supplied
    let computedStock = data.stock || 0;
    if (data.variants && data.variants.length > 0) {
      computedStock = data.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
    }
    data.stock = computedStock;

    const product = await Product.create(data);

    await logAuditEvent({
      actor: actorUserId,
      action: 'PRODUCT_CREATED',
      resource: 'Product',
      resourceId: product._id.toString(),
      metadata: { slug: product.slug, sku: product.sku }
    });

    return product;
  }

  async updateProduct(id: string, data: any, actorUserId?: string) {
    if (data.slug || data.sku) {
      const conflict = await Product.findOne({
        _id: { $ne: id },
        $or: [{ slug: data.slug }, { sku: data.sku }]
      });
      if (conflict) {
        throw new AppError({
          message: 'A product with this slug or SKU already exists',
          statusCode: 409,
          code: 'CONFLICT'
        });
      }
    }

    if (data.variants && data.variants.length > 0) {
      data.stock = data.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0);
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: data },
      { new: true }
    );

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    await logAuditEvent({
      actor: actorUserId,
      action: 'PRODUCT_UPDATED',
      resource: 'Product',
      resourceId: product._id.toString(),
      metadata: { updatedFields: Object.keys(data) }
    });

    return product;
  }

  async deleteProduct(id: string, actorUserId?: string) {
    // Soft delete pattern
    const product = await Product.findOneAndUpdate(
      { _id: id, isDeleted: { $ne: true } },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    await logAuditEvent({
      actor: actorUserId,
      action: 'PRODUCT_SOFT_DELETED',
      resource: 'Product',
      resourceId: product._id.toString()
    });

    return { success: true };
  }
}

export const productService = new ProductService();
