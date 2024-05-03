"use client";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./PDFViewer.module.css";

import invariant from "tiny-invariant";
import { usePageContext } from "react-pdf";

import type { RenderParameters } from "pdfjs-dist/types/src/display/api.js";

function CustomRenderer({ transform }: { transform?: number[][] }) {
  console.log(transform);

  // const t = transform![0];

  const pageContext = usePageContext();

  invariant(pageContext, "Unable to find Page context.");

  const { _className, page, rotate, scale } = pageContext;

  invariant(page, "Attempted to render page canvas, but no page was specified.");

  const imageElement = useRef<HTMLImageElement>(null);

  const viewport = useMemo(() => page.getViewport({ scale, rotation: rotate }), [page, rotate, scale]);

  function drawPageOnImage() {
    if (!page) {
      return;
    }

    const { current: image } = imageElement;

    if (!image) {
      return;
    }

    const canvas = document.createElement("canvas");
    const canvas2 = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas2.width = viewport.width;
    canvas2.height = viewport.height;

    const ctx = canvas.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;
    const ctx2 = canvas2.getContext("2d", { alpha: false }) as CanvasRenderingContext2D;

    ctx.transform(1, 0.5, -0.5, 1, 30, 10);
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 250, 100);

    // ctx.translate(-viewport.width / 2, -viewport.height / 2);

    // console.log(t);

    ctx2.drawImage(canvas, 0, 0);

    const renderContext: RenderParameters = {
      canvasContext: ctx2,
      viewport,
      // pageColors:
      // intent: "display",
    };

    const cancellable = page.render(renderContext as any);
    const runningTask = cancellable;

    cancellable.promise
      .then(() => {
        image.src = canvas2.toDataURL();
      })
      .catch(() => {
        // Intentionally empty
      });

    return () => {
      runningTask.cancel();
    };
  }

  useEffect(drawPageOnImage, [imageElement, page, viewport]);

  return <img className={`${_className}__image`} height={viewport.height} ref={imageElement} width={viewport.width} />;
}

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
  searchQuery?: { content: string; pageNumber: number; transforms?: number[][] };
}) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const docRef = useRef<HTMLDivElement | null>(null);

  console.log("searchQuery", searchQuery);

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
            scale={1.2}
            // renderMode="custom"
            // customRenderer={() => <CustomRenderer transform={searchQuery?.transforms} />}
            pageNumber={index + 1}
            customTextRenderer={(textItem) => textRenderer(textItem)}
            // renderAnnotationLayer={false}
            // renderTextLayer={true}
          />
        ))}
      </Document>
    </div>
  );
}

/*
1). First we have to loop through each page of a pdf and detect if it's scanned or not, for which I have to do some research as to how it's done.
2). For scanned pages we will have to create a url for the image or extract the image buffer data, on which 
3). Google's OCR will be applied to each page that is scanned (i.e. in the form of image)
4). For the scanned pages we will have to manually create something called "Documents" (i.e a chunk of a page content with proper metadata) that we later use to create embeddings.
5). 

*/
