import LibraryTitle from "@/components/LibraryTitle/LibraryTitle";
import React from "react";

const LibraryLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ padding: "2rem", width: "100%", height: "100%", overflow: "auto" }}>
      <LibraryTitle />

      {children}
    </div>
  );
};

export default LibraryLayout;
