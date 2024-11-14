import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to the file in the public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.mjs`;

const PDFViewer = forwardRef(({ fileUrl }, ref) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scale, setScale] = useState(1.5);
  const containerRef = useRef(null);

  // Expose the goToPage function to parent components
  useImperativeHandle(ref, () => ({
    goToPage
  }));

  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setNumPages(pdf.numPages);

        if (containerRef.current) {
          containerRef.current.innerHTML = ''; // Clear the container before rendering
        }

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          await renderPage(pdf, pageNumber);
        }
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [fileUrl, scale]);

  // Function to render each page as a canvas
  const renderPage = async (pdf, pageNumber) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = { canvasContext: context, viewport };
    await page.render(renderContext).promise;

    // Append each canvas to the container
    if (containerRef.current) {
      const pageContainer = document.createElement('div');
      pageContainer.setAttribute('data-page-number', pageNumber);
      pageContainer.style.marginBottom = '20px';
      pageContainer.appendChild(canvas);
      containerRef.current.appendChild(pageContainer);
    }
  };

  // Function to scroll smoothly to a specific page
  const goToPage = (pageNumber) => {
    const pageElement = containerRef.current.querySelector(`[data-page-number="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      console.error(`Page ${pageNumber} not found`);
    }
  };

  return (
    <div ref={containerRef} style={{ overflowY: 'auto', height: '100vh', backgroundColor: '#f0f0f0' }}>
      {loading && <p>Loading...</p>}
      {numPages && !loading && <p>Total pages: {numPages}</p>}
    </div>
  );
});

export default PDFViewer;
