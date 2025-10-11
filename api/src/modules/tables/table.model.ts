import { Document, model, Schema } from 'mongoose';

export interface ITable extends Document {
  number: number;
  name?: string;
  active: boolean;
}

const TableSchema = new Schema<ITable>(
  {
    number: { type: Number, required: true, unique: true, index: true },
    name: String,
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Table = model<ITable>('Table', TableSchema);
