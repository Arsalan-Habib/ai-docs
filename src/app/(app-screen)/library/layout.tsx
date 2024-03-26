import LibraryTitle from "@/components/LibraryTitle/LibraryTitle";
import React from "react";

export const revalidate = 3600;

const LibraryLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ padding: "2rem" }}>
      <LibraryTitle />

      {children}
    </div>
  );
};

export default LibraryLayout;
