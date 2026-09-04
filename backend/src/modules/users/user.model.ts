import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  _id: mongoose.Types.ObjectId;
  label?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IRefreshTokenSession {
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  device?: string;
  ipAddress?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'staff' | 'customer';
  isActive: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  refreshTokens: IRefreshTokenSession[];
  addresses: IAddress[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isLocked(): boolean;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false }
});

const RefreshTokenSessionSchema = new Schema<IRefreshTokenSession>({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  device: { type: String },
  ipAddress: { type: String }
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'staff', 'customer'],
      default: 'customer',
      index: true
    },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokens: { type: [RefreshTokenSessionSchema], default: [] },
    addresses: { type: [AddressSchema], default: [] },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date }
  },
  {
    timestamps: true
  }
);

UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export const User = mongoose.model<IUser>('User', UserSchema);
