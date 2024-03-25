"use client";
import { useCallback, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PDFViewer.module.css";

function highlightPattern(text: any, pattern: string) {
  const lines = pattern.split(/(\s*\n\s*|\s*\n\s*\n|\s*\n\n\s*|\s*-\s*)/);

  for (let i = 0; i < lines.length; i++) {
    lines[i] = lines[i].replaceAll(/\s+/g, " ");
  }

  const cleanLines = lines.filter((l) => l !== " ");

  if (text.str === "") {
    return text.str;
  }

  return text.str.replace(
    cleanLines[cleanLines.findIndex((l) => l === text.str)],
    (value: string) => `<mark>${value}</mark>`,
  );
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
            customTextRenderer={(textItem) => textRenderer(textItem)}
          />
        ))}
      </Document>
    </div>
  );
}
