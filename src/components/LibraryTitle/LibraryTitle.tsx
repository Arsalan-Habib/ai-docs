"use client";

import { IFolder } from "@/schemas/Folder";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const LibraryTitle = () => {
  const params = useParams();
  const [folder, setFolder] = useState<IFolder | undefined>(undefined);

  useEffect(() => {
    async function fetchFolder() {
      if (!params.folderId) {
        setFolder(undefined);
        return;
      }

      const res = await fetch(`/api/folder/${params.folderId}`);
      const data = await res.json();

      if (data.status) {
        setFolder(data.data);
      }
    }

    fetchFolder();
  }, [params.folderId]);

  return (
    <div>
      <h1>Library {!!folder ? `> ${folder.name}` : ""}</h1>
    </div>
  );
};

export default LibraryTitle;
