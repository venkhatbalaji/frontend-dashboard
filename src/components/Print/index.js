import React, { useState, useRef, useEffect, memo, useContext } from "react";
import html2canvas from "html2canvas";
import { theme } from "re-usable-design-components";
import { toPng } from 'html-to-image';
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import Header from "../Header";
import jsPDF from "jspdf";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";


const { useToken } = theme;

function getAllCSS() {
  let css = '';

  // Loop through all stylesheets
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];

    try {
      // Loop through all rules in the stylesheet
      for (let j = 0; j < sheet.cssRules.length; j++) {
        const rule = sheet.cssRules[j];
        css += rule.cssText + '\n'; // Append the CSS rule to the string
      }
    } catch (e) {
      console.warn(`Could not access stylesheet: ${sheet.href}`);
      // Some stylesheets may be cross-origin and cannot be accessed
    }
  }

  return css;
}


export function usePrint(val = {}) {
  const { name = "Border-movement.pdf" } = val;
  const [isCreatingPdf, setIsCreatingPdf] = useState(false);
  const themeVariables = useToken();
  const [localeStore] = useContext(LocaleContext); // <-- ensure this is defined at the top
  const printDocumentCanvas = async () => {
    setIsCreatingPdf(true);
    setTimeout(async () => {
      const inputs = document.getElementsByClassName("export-pdf");
      const elementsArray = Array.from(inputs);

      const pdf = new jsPDF("p", "pt", "a4"); // Standard A4 size

      for (let i = 0; i < elementsArray.length; i++) {
        const input = elementsArray[i];

        // Render element to canvas
        const canvas = await html2canvas(input, {
          scrollY: -window.scrollY,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) {
          pdf.addPage(); // Add a new page except for the first one
        }

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save(name);
      setIsCreatingPdf(false);
    }, 400);
  };

  const handleGeneratePdf = async () => {
    const htmlContent = document.getElementById('pdf_container')?.innerHTML;
    setIsCreatingPdf(true);
    // Determine language and direction
    let lang = 'en';
    let direction = 'ltr';
    if (localeStore && localeStore.projectTranslation) {
      lang = localeStore.projectTranslation;
      direction = checkRtl(localeStore) ? 'rtl' : 'ltr';
    } else {
      lang = document.documentElement.lang || 'en';
      direction = document.documentElement.dir || 'ltr';
    }
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: htmlContent, css: getAllCSS(), tokens: themeVariables?.token, lang, direction }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const pdfBlob = await response.blob(); // Convert response to a Blob
      const url = window.URL.createObjectURL(pdfBlob); // Create a URL for the Blob

      // Create an anchor element and trigger the download
      const a = document.createElement('a');
      a.style.display = 'none'; // Hide the anchor element
      a.href = url; // Set the href to the Blob URL
      a.download = `${name}`; // Set the default file name
      document.body.appendChild(a); // Append the anchor to the body
      a.click(); // Programmatically click the anchor to trigger the download
      window.URL.revokeObjectURL(url); // Clean up the URL object
      document.body.removeChild(a); // Remove the anchor from the document
      setTimeout(() => {
        setIsCreatingPdf(false);
      }, 800)
    } catch (error) {
      setTimeout(() => {
        setIsCreatingPdf(false);
      }, 400)
      console.error("Failed to convert element to image:", error);
    }
  };
  const printDocument = async () => {
    setIsCreatingPdf(true);

    const inputs = document.getElementsByClassName("export-pdf");
    const elementsArray = Array.from(inputs);

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();

    for (let i = 0; i < elementsArray.length; i++) {
      const input = elementsArray[i];

      try {
        const dataUrl = await toPng(input, {
          cacheBust: true,
          backgroundColor: "#ffffff",
        });

        const img = new Image();
        img.src = dataUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            const imgWidth = pageWidth;
            const imgHeight = (img.height * imgWidth) / img.width;

            if (i > 0) {
              pdf.addPage();
            }

            pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
            resolve();
          };
        });
      } catch (error) {
        console.error("Failed to convert element to image:", error);
      }
    }

    pdf.save(name);
    setIsCreatingPdf(false);
  };
  return {
    isCreatingPdf,
    setIsCreatingPdf,
    printDocument,
    printDocumentCanvas,
    handleGeneratePdf
  }
}

const PaginateElements = ({ elements, loadProgressCb = () => { }, onLoad = () => { } }) => {
  const [localeStore] = useContext(LocaleContext);
  const processingRef = useRef(0);
  const isRtl = checkRtl(localeStore);
  const containerRef = useRef();

  const pageHeight = 1754; // Height of each block/page
  const [pages, setPages] = useState([]);
  const [current, setCurrent] = useState([]);
  const [processingIndex, setProcessingIndex] = useState(0)
  const hiddenContainerRef = useRef(null);
  const [tableElement, setTableElement] = useState(null);
  const [tableInProgressFlag, setTableInProgressFlag] = useState(false)

  useEffect(() => {
    const val = Number((processingIndex / elements?.length) * 100);
    if (val > processingRef?.current && val < 100) {
      processingRef.current = val;
      loadProgressCb(val);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingIndex]);

  useEffect(() => {
    let timeout = null
    if (processingIndex >= (elements?.length) && !tableInProgressFlag) {
      timeout = setTimeout(() => {
        onLoad();
      }, 1000)

    }
    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableInProgressFlag, processingIndex])

  function paginateElements() {
    const currentIndex = processingIndex;
    const elementToProcessed = elements[currentIndex];
    if (typeof elementToProcessed === "function") {
      const height = hiddenContainerRef?.current?.offsetHeight ? hiddenContainerRef.current.offsetHeight : 0;
      const space = (pageHeight - 88) - (height + 20);
      const element = elementToProcessed({
        space,
        offset: [true]?.includes(tableInProgressFlag) ? 0 : tableInProgressFlag,
        callback: ({ info }) => {
          if (info?.isNextPage) {
            setTableInProgressFlag(true);
            setPages((p) => ([...p, current?.slice(0, current?.length)]));
            setTableElement(null)
            setCurrent([])
          } else if (info?.printRows?.isAllRendered) {
            const elementToPrint = elementToProcessed({ rows: { ...info?.printRows }, isPrint: true })
            setTableInProgressFlag(false)
            setTableElement(null)
            setCurrent((c) => {
              return [...c, elementToPrint]
            })
          } else {
            setTableInProgressFlag(info?.printRows?.to);
            const elementToPrint = elementToProcessed({ rows: { ...info?.printRows, to: info?.printRows?.to }, isPrint: true })
            setTableElement(null);
            setCurrent((c) => {
              return [...c, elementToPrint]
            })
          }
        }
      })
      setTableElement(element);
    } else if (elementToProcessed) {
      setCurrent((c) => {
        return [...c, elementToProcessed]
      })
    }
  }

  useEffect(() => {
    if (elements) {
      paginateElements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elements, processingIndex]);

  useEffect(() => {
    if (elements && (tableInProgressFlag && !current?.length)) {
      paginateElements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    if (containerRef?.current?.offsetWidth < 1240) {
      containerRef.current.style.transform = `scale(${containerRef?.current?.offsetWidth / 1240})`;
      containerRef.current.style.maxHeight = `${(pages?.length * 1754 * (containerRef?.current?.offsetWidth / 1240))}px`;
      containerRef.current.style.margin = "auto";
      containerRef.current.style.transformOrigin = isRtl ? "top right" : "top left";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages])

  useEffect(() => {
    if (current?.length) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height > (pageHeight - 88)) {
            setPages((p) => ([...p, current?.slice(0, current?.length - 1)]));
            setCurrent([current?.slice(current?.length - 1, current?.length)]);
          } else {
            if (tableInProgressFlag) {
              setPages((p) => ([...p, current?.slice(0, current?.length)]));
              setCurrent([]);
            }
            if (!tableInProgressFlag) {
              // all done
              if (processingIndex >= (elements?.length - 1)) {
                setPages((p) => ([...p, current]));
              }
              setProcessingIndex((i) => i + 1)
            }
          }
        }
      }, 1500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  return (
    <>
      <div
        style={{
          width: "100%",
        }}
      >
        <div
          ref={containerRef}
          id="pdf_container"
        >
          {pages.map((page, pageIndex) => (
            <div
              key={`${pageIndex}_${pages?.length}`}
              className="export-pdf"
              style={{
                backgroundColor: "var(--colorBgLayout)",
                padding: "24px",
                paddingTop: "82px",
                position: "relative",
                minWidth: "1240px",
                maxWidth: "1240px",
                pointerEvents: "none",
                margin: "auto",
                marginBottom: '20px',
                height: `${pageHeight}px`
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  margin: "auto",
                  width: "100%",
                  top: 0,
                  // transform: `translateX(-${50 - (50 * ((window?.innerWidth - 100) / 1266))}%) scale(${(window?.innerWidth - 100) / 1266})`, /* Scale down to 80% */
                  // transformOrigin: "top center",
                }}
              >
                <Header
                  areActionsHidden
                  isNavigationDisabled
                />
              </div>
              <div>
                {page.map((element, index) => (
                  <div key={`${index}_${page?.length}`} style={{ marginBottom: '10px' }}>
                    {element}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        ref={hiddenContainerRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          minWidth: "1240px",
          maxWidth: "1240px",
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {current.map((c, cIndex) => {
          return (
            <div key={`${cIndex}_${c?.length}`} style={{ marginBottom: '10px' }}>
              {c}
            </div>
          )
        })}
      </div>
      <div
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          minWidth: "1240px",
          maxWidth: "1240px",
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {tableElement}
      </div>
    </>
  );
};

PaginateElements.propTypes = {
  elements: PropTypes.any,
  onLoad: PropTypes.any,
  loadProgressCb: PropTypes.any
}


export function Print({ printElements, loadProgressCb, hiddenContainerRef, setIsLoading = () => { } }) {
  return (
    <PaginateElements onLoad={() => { setIsLoading(false) }} loadProgressCb={loadProgressCb} elements={printElements} hiddenContainerRef={hiddenContainerRef} />
  )
}

Print.propTypes = {
  printElements: PropTypes.any,
  loadProgressCb: PropTypes.any,
  hiddenContainerRef: PropTypes.any,
  setIsLoading: PropTypes.any
}

// Custom deep comparison function for React.memo
const arePropsEqual = (prevProps, nextProps) => {
  // Compare printElements (likely an array)
  if (!isEqual(prevProps.printElements, nextProps.printElements)) {
    return false;
  }

  // Compare hiddenContainerRef (React ref object)
  // Refs should be considered equal if they point to the same element
  if (prevProps.hiddenContainerRef !== nextProps.hiddenContainerRef) {
    return false;
  }

  // Compare setIsLoading (function)
  // Functions are compared by reference, so we assume it's stable
  // If it might change, you might want to skip this comparison
  return (prevProps.setIsLoading === nextProps.setIsLoading);
};

export default memo(Print, arePropsEqual);