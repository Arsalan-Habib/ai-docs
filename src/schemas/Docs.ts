import mongoose from "mongoose";

interface IDocs {
  userId: string;
  uploadedPdfs: string[];
  embedding: number[];
}

export const docsSchema = new mongoose.Schema<IDocs>({
  userId: {
    type: String,
    required: true,
  },
  uploadedPdfs: {
    type: [String],
  },
  embedding: [[Number]],
});

export default mongoose.models.docs ||
  mongoose.model<IDocs>("docs", docsSchema);
