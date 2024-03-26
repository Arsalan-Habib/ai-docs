import mongoose from "mongoose";

export interface IFolder {
  name: string;
  userId: string;
}

export const folderSchema = new mongoose.Schema<IFolder>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
});

export default mongoose.models.folder || mongoose.model<IFolder>("folder", folderSchema);
