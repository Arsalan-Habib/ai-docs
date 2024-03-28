import { Skeleton } from "@mui/material";
import React from "react";

const Loading = () => {
  return (
    <div style={{ display: "flex", gap: "3rem", marginTop: "2rem", flexWrap: "wrap" }}>
      <Skeleton variant="rounded" width={160} height={160} />
      <Skeleton variant="rounded" width={160} height={160} />
      <Skeleton variant="rounded" width={160} height={160} />
    </div>
  );
};

export default Loading;
