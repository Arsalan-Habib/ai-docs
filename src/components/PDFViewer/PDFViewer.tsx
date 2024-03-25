"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PDFViewer.module.css";

function highlightPattern(text: any, pattern: string) {
  const lines = pattern.split(/(\s*\n\s*|\s*\n\s*\n|\s*\n\n\s*)/);

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

export default function PdfViewer({
  url,
  searchQuery,
}: {
  url: string;
  searchQuery?: { content: string; pageNumber: number };
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const textRenderer = useCallback(
    (textItem: any) => {
      if (searchQuery) {
        return highlightPattern(textItem, searchQuery.content);
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    if (searchQuery) {
      const _document = document.querySelector("#pdf-docs-pages");
      const pageEl = document.querySelector(`[data-page-number="${searchQuery.pageNumber}"]`);

      console.log("pageEl", pageEl);

      if (pageEl && _document) {
        _document.scrollTo({ top: pageEl.getBoundingClientRect().top - 100, behavior: "smooth" });
      }
    }
  }, [searchQuery, docRef]);

  return (
    <div style={{ width: "100%", height: "95vh", overflow: "auto" }} id="pdf-docs-pages">
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className={`${styles.pdfDoc} pdf-docs-pages`}
        ref={docRef}
      >
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
