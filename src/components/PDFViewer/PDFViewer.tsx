"use client";
import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PDFViewer.module.css";
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function highlightPattern(text: string, pattern: string) {
  return text.replace(pattern, (value) => `<mark>${value}</mark>`);
}

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [searchText, setSearchText] = useState(``);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }
  const textRenderer = useCallback(
    (textItem: any) => {
      return highlightPattern(textItem.str, searchText);
    },
    [searchText],
  );

  return (
    <div style={{ width: "100%", height: "95vh", overflow: "auto" }}>
      <Document file={url} onLoadSuccess={onDocumentLoadSuccess} className={styles.pdfDoc}>
        {Array.from(new Array(numPages), (el, index) => (
          <Page key={`page_${index + 1}`} pageNumber={index + 1} customTextRenderer={textRenderer} />
        ))}
      </Document>
    </div>
  );
}
