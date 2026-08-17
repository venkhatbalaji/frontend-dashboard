import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export PDF with custom dimensions matching the Page component (1292px × 741px)
 * @param {string} fileName - Name of the PDF file to save
 * @param {Function} setIsCreatingPdf - State setter for loading state
 * @returns {Promise<void>}
 */
export const printDocumentCustomSize = async (fileName = "Custom-PDF.pdf", setIsCreatingPdf = () => {}) => {
  setIsCreatingPdf(true);
  
  setTimeout(async () => {
    try {
      const inputs = document.getElementsByClassName("export-pdf");
      const elementsArray = Array.from(inputs);

      if (elementsArray.length === 0) {
        console.warn("No elements with class 'export-pdf' found");
        setIsCreatingPdf(false);
        return;
      }

      // Page dimensions: 1292px × 741px
      // For PDF, we'll use pixel dimensions directly (jsPDF handles conversion)
      // Convert px to pt: at 96 DPI, 1px ≈ 0.75pt, but for accuracy we use 1:1 for screen captures
      const pageWidthPt = 1292; // Use pixel value as points for 1:1 mapping
      const pageHeightPt = 741;
      
      // Create custom PDF with page dimensions matching the Page component
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: [pageWidthPt, pageHeightPt],
        compress: true // Enable compression for reasonable file size
      });

      for (let i = 0; i < elementsArray.length; i++) {
        const input = elementsArray[i];

        // Store original transform to restore later
        const originalTransform = input.style.transform || '';
        
        // Remove CSS transform scaling for PDF export to ensure original size (1292px)
        input.style.transform = 'none';

        try {
          // Render element to canvas with high quality settings
          const scale = 4; // Balanced quality (1.5x resolution)
          const canvas = await html2canvas(input, {
            scrollY: -window.scrollY,
            useCORS: true,
            scale: scale,
            backgroundColor: "#ffffff",
            logging: false,
            allowTaint: false,
            removeContainer: false,
            onclone: (clonedDoc) => {
              // Ensure transform is removed in cloned document as well
              const clonedElements = clonedDoc.querySelectorAll('.export-pdf');
              clonedElements.forEach((el) => {
                el.style.transform = 'none';
              });
              
              // Hide overlay loaders in cloned document to prevent them from appearing in PDF
              const overlayLoaders = clonedDoc.querySelectorAll('.pdf-export-overlay');
              overlayLoaders.forEach((overlay) => {
                overlay.style.display = 'none';
              });
              
              // Ensure mesh/grid backgrounds are visible in the cloned document
              // html2canvas has limited support for repeating-linear-gradient, so we convert to canvas-based pattern
              const meshElements = clonedDoc.querySelectorAll('.pdf-mesh-background');
              meshElements.forEach((el, index) => {
                // Ensure the element is visible and properly rendered
                el.style.visibility = 'visible';
                el.style.opacity = '1';
                el.style.display = el.style.display || 'block';
                
                // Get the original background to extract grid size
                const bgImage = el.style.backgroundImage;
                if (bgImage && bgImage.includes('repeating-linear-gradient')) {
                  // Extract grid step size (default 20px)
                  const stepMatch = bgImage.match(/transparent\s+\d+px\)/);
                  const step = stepMatch ? parseInt(stepMatch[0].match(/\d+/)[0]) : 20;
                  
                  // Create canvas-based mesh pattern (more reliable than SVG for html2canvas)
                  const canvas = clonedDoc.createElement('canvas');
                  canvas.width = step;
                  canvas.height = step;
                  const ctx = canvas.getContext('2d');
                  
                  // Draw grid lines
                  ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
                  ctx.lineWidth = 1;
                  
                  // Vertical line
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(0, step);
                  ctx.stroke();
                  
                  // Horizontal line
                  ctx.beginPath();
                  ctx.moveTo(0, 0);
                  ctx.lineTo(step, 0);
                  ctx.stroke();
                  
                  // Convert canvas to data URL
                  const canvasDataUrl = canvas.toDataURL('image/png');
                  
                  // Use canvas pattern as background image instead of CSS gradient
                  el.style.backgroundImage = `url("${canvasDataUrl}")`;
                  el.style.backgroundRepeat = 'repeat';
                  el.style.backgroundSize = `${step}px ${step}px`;
                  el.style.backgroundPosition = '0 0';
                }
                
                // Ensure z-index is set correctly
                if (!el.style.zIndex || el.style.zIndex === 'auto') {
                  el.style.zIndex = '0';
                }
                
                // Ensure position is set
                if (!el.style.position) {
                  el.style.position = 'absolute';
                }
              });
            },
          });

          // Convert canvas to high-quality image
          const imgData = canvas.toDataURL("image/png", 1.0);
          
          // Calculate dimensions: canvas is scaled, but we fit to exact page size
          // The element should be 1292x741, so canvas will be (1292*scale) x (741*scale)
          // We fit it back to page dimensions
          const imgWidth = pageWidthPt;
          const imgHeight = pageHeightPt;

          if (i > 0) {
            pdf.addPage([pageWidthPt, pageHeightPt], "landscape");
          }

          // Add image at exact page dimensions
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight, undefined, "SLOW");
        } finally {
          // Always restore original transform after capture (even if error occurred)
          if (originalTransform) {
            input.style.transform = originalTransform;
          } else {
            input.style.removeProperty('transform');
          }
        }
      }

      pdf.save(fileName);
      setIsCreatingPdf(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setIsCreatingPdf(false);
    }
  }, 400);
};

