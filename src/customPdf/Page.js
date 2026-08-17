import React, { useContext, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Title, Spin } from "re-usable-design-components";
import dayjs from 'dayjs';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import translation from "@/views/CustomizedPdf/translation.json";
import { checkRtl } from "@/utils/helper";

const Page = ({ children, style = {}, className = "", title = "", isCreatingPdf = false }) => {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);

  // Track window width for responsive scaling
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Calculate scale factor for window width > 1440px
  const scaleFactor = useMemo(() => {
    const BREAKPOINT = 1440;
    const MAX_TARGET_WIDTH = 1920;
    
    if (windowWidth <= BREAKPOINT) {
      return 1;
    }
    
    // Scale proportionally from 1440px to 1920px window width
    // At 1440px window: scale = 1 (page width = 1292px)
    // At 1920px window: scale = 1920 / 1292 ≈ 1.486 (page width = 1920px)
    const maxScale = MAX_TARGET_WIDTH / BREAKPOINT;
    
    // Linear interpolation between breakpoint and max window width
    // Scale from 1 at 1440px to maxScale at 1920px
    const scaleRange = maxScale - 1;
    const windowRange = MAX_TARGET_WIDTH - BREAKPOINT;
    const progress = Math.min((windowWidth - BREAKPOINT) / windowRange, 1);
    const scale = 1 + (scaleRange * progress);
    
    return Math.min(scale, maxScale);
  }, [windowWidth]);
  
  // Format current date and time based on language
  const formattedTimestamp = useMemo(() => {
    const now = dayjs();
    if (isRtl) {
      // Arabic format: "09/11/2024 في الساعة 9:40 مساءاً"
      const dateStr = now.format('DD/MM/YYYY');
      const timeStr = now.format('h:mm');
      const amPm = now.format('A');
      // Convert AM/PM to Arabic
      const amPmAr = amPm === 'AM' ? 'صباحاً' : 'مساءاً';
      return `${dateStr} ${translation[language]["at"]} ${timeStr} ${amPmAr}`;
    } else {
      // English format: "DD/MM/YYYY at hh:mm AM/PM"
      return now.format(`DD/MM/YYYY [${translation[language]["at"]}] hh:mm A`);
    }
  }, [language, isRtl]);
  
  // Swap logos in RTL mode
  const leftLogo = isRtl ? "/uae_logo.svg" : "/icp_logo.svg";
  const rightLogo = isRtl ? "/icp_logo.svg" : "/uae_logo.svg";
  // Calculate scaled dimensions for wrapper
  const scaledWidth = 1292 * scaleFactor;
  const scaledHeight = 741 * scaleFactor;

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "visible",
        backgroundColor: "white",
        marginBottom: "20px",
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        // Force scrollbar to be visible
        scrollbarWidth: "auto", // For Firefox
        msOverflowStyle: "auto", // For IE/Edge
        // Ensure the container can scroll
        position: "relative",
        // Prevent parent constraints
        minWidth: 0,
        // Ensure wrapper can accommodate scaled page
        minHeight: scaleFactor !== 1 ? `${scaledHeight}px` : 'auto',
      }}
      className="custom-pdf-page-scroll-wrapper"
    >
      <div
        className={`custom-pdf-page export-pdf ${className}`}
        style={{
          width: "1292px",
          backgroundColor: "var(--colorBgLayout)",
          padding: "0px",
          paddingTop: "0px",
          position: "relative",
          minWidth: "1292px",
          maxWidth: "1292px",
          minHeight: "741px",
          maxHeight: "741px",
          overflow: "hidden",
          height: "741px",
          pointerEvents: "auto",
          margin: "0 auto",
          marginBottom: '12px',
          flexShrink: 0,
          transform: scaleFactor !== 1 ? `scale(${scaleFactor})` : 'none',
          transformOrigin: 'top center',
          ...style
        }}
      >

        <Row
          style={{
            height: "80px",
            backgroundColor: "white",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <Col flex={"none"}>
            <img src={leftLogo} alt="logo" height={55} width={"auto"} />
          </Col>
          <div
            style={{
              textAlign: "center",
              marginBottom: "8px",
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#999999",
                marginRight: "8px",
              }}
            >
              {translation[language]["Updated on"]} {formattedTimestamp} –
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#FF0000",
              }}
            >
              {translation[language]["Top Secret"]}
            </span>
          </div>
          <Col flex={"none"}>
            <img src={rightLogo} alt="logo" height={55} width={"auto"} />
          </Col>
        </Row>

        <Row
          style={{
            backgroundColor: "white",
          }}
        >
          <Col>
            <div
              style={{
                textAlign: "center",
                marginBottom: "20px",
                fontSize: "24px",
                fontWeight: 500,
              }}
            >
              {title}
            </div>
          </Col>
        </Row>

        {/* Golden decorative block */}

        <div
          style={{
            position: "absolute",
            left: "0px",
            top: "80px",
            width: "20px",
            height: "17px",
            backgroundColor: "#9A6E23",
            borderRadius: "0 0px 10px 0",
            zIndex: 1,
          }}
        />

        <div style={{
          height: "calc(100% - 80px)",
          overflow: "hidden",
          pointerEvents: "auto",
          backgroundColor: "white",
        }}>
          {children}
          {/* White overlay loader for PDF export */}
          {isCreatingPdf && (
            <div
              className="pdf-export-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                pointerEvents: "auto",
              }}
            >
              <Spin size="large" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Page.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  className: PropTypes.string,
  title: PropTypes.string,
  isCreatingPdf: PropTypes.bool,
};

export default Page;
