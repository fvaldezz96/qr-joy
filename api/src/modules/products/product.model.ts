import { Document, model, Schema } from 'mongoose';

export type ProductCategory = 'drink' | 'food' | 'ticket';

export interface IProduct extends Document {
  name: string;
  category: ProductCategory;
  price: number;
  imageUrl?: string;
  active: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: true },
    category: { type: String, enum: ['drink', 'food', 'ticket'], required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: String,
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export const Product = model<IProduct>('Product', ProductSchema);
