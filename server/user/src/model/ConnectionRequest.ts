import mongoose, { Document, Schema } from "mongoose";

export interface IConnectionRequest extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
}

const schema: Schema<IConnectionRequest> = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    }
  },
  {
    timestamps: true,
  }
);

schema.index({ sender: 1, receiver: 1 }, { unique: false });

export const ConnectionRequest = mongoose.model<IConnectionRequest>("ConnectionRequest", schema);