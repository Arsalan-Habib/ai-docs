import mongoose from "mongoose";

export interface IDocGroup {
  userId: string;
  groupId: string;
  filenames: string[];
  mergedFilename: string;
}

export const docGroupSchema = new mongoose.Schema<IDocGroup>({
  userId: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
  },
  filenames: {
    type: [String],
  },
  mergedFilename: {
    type: String,
  },
});

export default mongoose.models.docgroup || mongoose.model<IDocGroup>("docgroup", docGroupSchema);
