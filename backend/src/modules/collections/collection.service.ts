import { Collection } from './collection.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class CollectionService {
  async getActiveCollections() {
    return Collection.find({ active: true }).sort({ sortOrder: 1, name: 1 });
  }

  async getAllCollections() {
    return Collection.find().sort({ sortOrder: 1, name: 1 });
  }

  async getCollectionBySlug(slug: string) {
    const collection = await Collection.findOne({ slug });
    if (!collection) {
      throw new AppError({ message: 'Collection not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return collection;
  }

  async createCollection(data: any) {
    const existing = await Collection.findOne({ slug: data.slug });
    if (existing) {
      throw new AppError({ message: 'Collection with this slug already exists', statusCode: 409, code: 'CONFLICT' });
    }
    return Collection.create(data);
  }

  async updateCollection(id: string, data: any) {
    if (data.slug) {
      const existing = await Collection.findOne({ slug: data.slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError({ message: 'Collection with this slug already exists', statusCode: 409, code: 'CONFLICT' });
      }
    }
    const collection = await Collection.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!collection) {
      throw new AppError({ message: 'Collection not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return collection;
  }

  async deleteCollection(id: string) {
    const collection = await Collection.findByIdAndDelete(id);
    if (!collection) {
      throw new AppError({ message: 'Collection not found', statusCode: 404, code: 'NOT_FOUND' });
    }
    return { success: true };
  }
}

export const collectionService = new CollectionService();
