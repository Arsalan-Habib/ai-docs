"use client";

import React, { useState } from "react";
import MessagesSection from "../MessagesSection/MessagesSection";
import PdfViewer from "../PDFViewer/PDFViewer";

const ChatLayout = ({ params, fileUrl }: { params: { id: string }; fileUrl: string }) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <MessagesSection params={params} setSearchQuery={setSearchQuery} />
      <PdfViewer url={fileUrl} searchQuery={searchQuery} />
    </>
  );
};

export default ChatLayout;
