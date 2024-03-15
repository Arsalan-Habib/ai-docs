import mongoose from "mongoose";

interface IDocs {
  userId: string;
  content: string;
  filename: string;
  embedding: number[];
}

export const docsSchema = new mongoose.Schema<IDocs>({
  userId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  filename: {
    type: String,
  },
  embedding: [Number],
});

export default mongoose.models.docs || mongoose.model<IDocs>("docs", docsSchema);
