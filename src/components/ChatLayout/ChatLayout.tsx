"use client";

import React, { useState } from "react";
import MessagesSection from "../MessagesSection/MessagesSection";
import PdfViewer from "../PDFViewer/PDFViewer";

const ChatLayout = ({
  params,
  fileUrl,
  groupTitle,
}: {
  params: { id: string };
  fileUrl: string;
  groupTitle: string;
}) => {
  const [searchQuery, setSearchQuery] = useState<
    | {
        content: string;
        pageNumber: number;
        transforms?: number[][];
      }
    | undefined
  >(undefined);

  return (
    <>
      <MessagesSection params={params} setSearchQuery={setSearchQuery} groupTitle={groupTitle} />
      <PdfViewer url={fileUrl} searchQuery={searchQuery} />
    </>
  );
};

export default ChatLayout;
