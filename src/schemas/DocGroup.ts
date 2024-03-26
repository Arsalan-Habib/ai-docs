import mongoose from "mongoose";

export interface IDocGroup {
  userId: string;
  groupId: string;
  groupName?: string;
  folderId?: string;
  filenames: string[];
  mergedFilename: string;
}

export interface IDocGroupWithFileUrls extends IDocGroup {
  fileUrls: string[];
}

export const docGroupSchema = new mongoose.Schema<IDocGroup>({
  userId: {
    type: String,
    required: true,
  },
  groupName: {
    type: String,
  },
  folderId: {
    type: String,
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
