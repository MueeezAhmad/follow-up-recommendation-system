import mongoose from 'mongoose';

const followUpSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending'], default: 'Pending' },
  },
  { timestamps: true },
);

export default mongoose.model('FollowUp', followUpSchema);
