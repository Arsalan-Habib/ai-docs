"use client";
import { useCallback, useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PDFViewer.module.css";

function highlightPattern(text: any, pattern: string) {
  const lines = pattern.split(/(\s*\n\s*|\s*\n\s*\n|\s*\n\n\s*)/);

  // lines.forEach((line) => line.replaceAll(/\s+/g, " "));
  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replaceAll(/\s+/g, " ");
  }

  const cleanLines = lines.filter((l) => l !== " ");

  console.log("lines", cleanLines);

  if (text.str === "") {
    return text.str;
  }

  return text.str.replace(
    cleanLines[cleanLines.findIndex((l) => l === text.str)],
    (value: string) => `<mark>${value}</mark>`,
  );

  // return text.str;
}

export default function PdfViewer({ url, searchQuery }: { url: string; searchQuery: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  const textRenderer = useCallback(
    (textItem: any) => {
      return highlightPattern(textItem, searchQuery);
    },
    [searchQuery],
  );

  return (
    <div style={{ width: "100%", height: "95vh", overflow: "auto" }}>
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess} className={styles.pdfDoc}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            customTextRenderer={(textItem: any) => textRenderer(textItem)}
          />
        ))}
      </Document>
    </div>
  );
}
