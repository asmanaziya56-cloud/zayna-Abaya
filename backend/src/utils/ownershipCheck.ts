import { Model, Types } from 'mongoose';

export async function assertOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  userId: string,
  userField = 'userId'
): Promise<T> {
  if (!Types.ObjectId.isValid(resourceId) || !Types.ObjectId.isValid(userId)) {
    const err: any = new Error('Resource not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  const query: Record<string, any> = {
    _id: new Types.ObjectId(resourceId),
    [userField]: new Types.ObjectId(userId),
    isDeleted: { $ne: true }
  };

  const doc = await ModelClass.findOne(query);

  if (!doc) {
    // Always 404, never 403 — do not confirm whether the resource exists
    const err: any = new Error('Resource not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return doc;
}
