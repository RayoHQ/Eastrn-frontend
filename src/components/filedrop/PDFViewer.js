import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import * as pdfjsLib from 'pdfjs-dist';

// Use a local worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

const PDFViewer = forwardRef(({ fileUrl }, ref) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const scale = 1.5; // Keep scale fixed
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: "" });
  const containerRef = useRef(null);
  const renderedPages = useRef(new Map()); // Map to track rendered pages and their containers
  const renderingPages = useRef(new Set()); // Set to track pages being rendered
  const pdfDocumentRef = useRef(null); // Store the PDF document reference
  const orderedPageContainers = useRef([]); // Array to maintain the correct DOM order of pages

  // Expose functions to parent components
  useImperativeHandle(ref, () => ({
    goToPage,
    searchAndHighlight, // Expose highlight function
  }));

  // Load the PDF document
  const loadPDF = useCallback(async () => {
    if (!fileUrl) return;
    setLoading(true);

    try {
      console.log("Loading PDF from:", fileUrl);

      // Clear the container completely and reset renderedPages tracking
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      renderedPages.current.clear();
      renderingPages.current.clear();
      orderedPageContainers.current = [];

      const loadingTask = pdfjsLib.getDocument(fileUrl);
      const pdf = await loadingTask.promise;

      pdfDocumentRef.current = pdf; // Store the loaded PDF document
      setNumPages(pdf.numPages);

      // Initialize ordered placeholders
      for (let i = 1; i <= pdf.numPages; i++) {
        const placeholder = document.createElement("div");
        placeholder.style.position = "relative";
        containerRef.current.appendChild(placeholder);
        orderedPageContainers.current[i - 1] = placeholder; // Maintain order
      }

      await renderAllPages(pdf); // Render all pages sequentially
    } catch (error) {
      console.error("Error loading PDF:", error);
    } finally {
      setLoading(false);
    }
  }, [fileUrl]); 

  useEffect(() => {
    if (fileUrl) {
      loadPDF();
    }
  }, [fileUrl, loadPDF]);

  // Render all pages in sequence
  const renderAllPages = useCallback(async (pdf) => {
    if (!pdf) return;
  
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      if (!renderedPages.current.has(pageNumber)) {
        await renderPage(pdf, pageNumber);
      }
    }
  }, []);

  // Render a single page and return a Promise
  const renderPage = async (pdf, pageNumber) => {
    if (renderedPages.current.has(pageNumber) || renderingPages.current.has(pageNumber)) {
      console.log(`Page ${pageNumber} already rendered.`);
      return renderedPages.current.get(pageNumber); // Return existing page data
    }

    try {
      renderingPages.current.add(pageNumber); // Mark the page as being rendered

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      // Render the page canvas
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderContext = { canvasContext: context, viewport };

      // Render the PDF page into the canvas
      await page.render(renderContext).promise;
      
      // Append the rendered page to the container
      const pageContainer = document.createElement("div");
      pageContainer.style.marginBottom = "20px";
      pageContainer.style.position = "relative";
      pageContainer.setAttribute("data-page-number", pageNumber);
      pageContainer.appendChild(canvas);

      // Replace the placeholder with the rendered page
      const placeholder = orderedPageContainers.current[pageNumber - 1];
      if (placeholder && containerRef.current) {
        containerRef.current.replaceChild(pageContainer, placeholder);
        orderedPageContainers.current[pageNumber - 1] = pageContainer; // Update reference
      }

      const pageData = { canvas, viewport, pageContainer }; // Include both container and data
      renderedPages.current.set(pageNumber, pageData); // Store page data and container in render Map
      
      // Debug log to verify all rendered pages
      console.log("Rendered pages:", Array.from(renderedPages.current.keys()));
      
      return pageContainer; // Return the page container for scrolling
    } catch (error) {
      console.error(`Error rendering page ${pageNumber}:`, error);
      return null;
    } finally {
      renderingPages.current.delete(pageNumber); // Remove from rendering set
    }
  };

  // Ensure pages are rendered
  const ensurePageRendered = async (pageNumber) => {
    let pageData = renderedPages.current.get(pageNumber);
    if (!pageData) {
      await renderPage(pdfDocumentRef.current, pageNumber);
      pageData = renderedPages.current.get(pageNumber);
    }
    return pageData;
  };

  // Go to a specific page
  const goToPage = async (pageNumber) => {
    const pageData = await ensurePageRendered(pageNumber);
    if (pageData?.pageContainer) {
      pageData.pageContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Highlight search results on the PDF
  const searchAndHighlight = async (results) => {
    console.log("Received results for highlighting:", results);

    for (const { page, coordinates } of results) {
      // Normalize coordinates to always be an array
      const normalizedCoordinates = Array.isArray(coordinates) ? coordinates : [coordinates];
      const pageData = await ensurePageRendered(page);

      if (!pageData) {
        console.error(`Failed to render page ${page} for highlighting.`);
        continue; // Skip highlighting for this page
      }

      const { canvas, viewport } = pageData;

      if (!canvas || !viewport) {
        console.error(`Canvas or viewport not found for page ${page}`);
        continue; // Skip highlighting if data is incomplete
      }

      const context = canvas.getContext("2d");

      if (!context) {
        console.error(`Unable to get context for canvas on page ${page}`);
        continue; // Skip highlighting if context is unavailable
      }

      console.log("Highlighting on page:", page, "Coordinates:", coordinates);

      normalizedCoordinates.forEach(({ x0, y0, x1, y1 }) => {
        const [xStart, yStart, xEnd, yEnd] = viewport.convertToViewportRectangle([x0, y0, x1, y1]);
        const adjustedYStart = canvas.height - yEnd;
        const adjustedHeight = yEnd - yStart;

        console.log("Drawing rectangle:", {
          xStart,
          adjustedYStart,
          width: xEnd - xStart,
          height: adjustedHeight,
        });

        context.fillStyle = "rgba(255, 255, 0, 0.5)";
        context.fillRect(xStart, adjustedYStart, xEnd - xStart, adjustedHeight);
      });
    }
  };

  // Text selection for tooltip
  const handleTextSelection = (event) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        console.log("Selected text:", selectedText);
        setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            text: `You selected: ${selectedText}`,
        });
    }
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: "" });
  };

  useEffect(() => {
    const container = containerRef.current;
  
    const handleMouseUp = (event) => handleTextSelection(event);
    const handleMouseDown = () => hideTooltip();
  
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousedown', handleMouseDown);
  
    return () => {
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseUp={handleTextSelection}
      onMouseDown={hideTooltip}
      style={{
        overflowY: "auto",
        height: "100vh",
        backgroundColor: "#f0f0f0",
        position: "relative",
      }}
    >
      {loading && <p>Loading...</p>}
      {numPages && !loading && <p>Total pages: {numPages}</p>}
      {tooltip.visible && (
        <div
            style={{
                position: "absolute",
                top: tooltip.y,
                left: tooltip.x,
                backgroundColor: "white",
                border: "1px solid gray",
                padding: "8px",
                borderRadius: "4px",
                zIndex: 1000,
            }}
        >
            {tooltip.text}
        </div>
    )}
</div>
);
});

export default PDFViewer;