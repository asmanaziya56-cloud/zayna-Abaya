import { Types } from 'mongoose';
import { Wishlist } from './wishlist.model.js';
import { Product } from '../products/product.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class WishlistService {
  async getWishlist(userId: string) {
    let wishlist = await Wishlist.findOne({ userId: new Types.ObjectId(userId) }).populate({
      path: 'products',
      match: { isDeleted: { $ne: true } },
      select: 'name slug images price salePrice stock'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId: new Types.ObjectId(userId), products: [] });
    }

    return wishlist;
  }

  async addProduct(userId: string, productId: string) {
    const product = await Product.findOne({
      _id: new Types.ObjectId(productId),
      isDeleted: { $ne: true }
    });

    if (!product) {
      throw new AppError({ message: 'Product not found', statusCode: 404, code: 'NOT_FOUND' });
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $addToSet: { products: product._id } },
      { upsert: true, new: true }
    ).populate('products', 'name slug images price salePrice stock');

    return wishlist;
  }

  async removeProduct(userId: string, productId: string) {
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $pull: { products: new Types.ObjectId(productId) } },
      { new: true }
    ).populate('products', 'name slug images price salePrice stock');

    return wishlist;
  }
}

export const wishlistService = new WishlistService();
