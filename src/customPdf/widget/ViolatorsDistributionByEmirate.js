import React, { useMemo, useRef, useLayoutEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import SectionCard from './SectionCard';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import customPdfTranslations from "../../views/CustomizedPdf/translation.json";
import { colors } from "../colors";

// DistributionByEmirate renders info cards and connectors on top of the CenterPanel map background
const BOX_WIDTH = 140; // reduced from 220
const BOX_HEIGHT_EN = 82;
const BOX_HEIGHT_AR = 82.2;

function useContainerSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;
    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    ro.observe(el);
    // initial
    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}

const getAnchorPoint = (boxLeft, boxTop, anchor, boxHeight, boxWidth) => {
  const xRight = boxLeft + boxWidth;
  const xMid = boxLeft + boxWidth / 2;
  const yBottom = boxTop + boxHeight;
  switch (anchor) {
  case 'right-mid':
    return [xRight, boxTop + boxHeight / 2];
  case 'right-top':
    return [xRight, boxTop + boxHeight * 0.2];
  case 'top-left':
    return [boxLeft + boxWidth * 0.3, boxTop];
  case 'left-mid':
    return [boxLeft, boxTop + boxHeight / 2];
  case 'right-bottom':
    return [xRight, yBottom - 8];
  case 'top-mid':
    return [xMid, boxTop];
  case 'bottom-mid':
    return [xMid, yBottom];
  default:
    return [xRight, boxTop + boxHeight / 2];
  }
};

const EmirateCard = ({ name, data, language = "en", translations: trans = customPdfTranslations, boxHeight, boxWidth, rows: customRows, gridColumns = '60px 1fr' }) => {
  // Format number helper
  const formatNumber = (num) => {
    if (typeof num === 'string') {
      const parsed = parseInt(num.replace(/,/g, '')) || 0;
      return parsed.toLocaleString();
    }
    return (num || 0).toLocaleString();
  };

  // Format percentage helper
  const formatPercentage = (num) => {
    if (typeof num === 'number') {
      return num === 0 ? '0%' : `${num.toFixed(2)}%`;
    }
    if (typeof num === 'string') {
      const parsed = parseFloat(num) || 0;
      return parsed === 0 ? '0%' : `${parsed.toFixed(2)}%`;
    }
    return '0%';
  };

  // Default rows configuration
  const defaultRowsConfig = [
    { 
      key: 'residence_violators', 
      label: trans[language]?.["Residents Violators Emirates"] || "Residents Violators Emirates", 
      dataField: 'total_residents_violators',
      formatType: 'number',
      bgColor: '#E7BB62',
    },
    { 
      key: 'visa_violators', 
      label: trans[language]?.["Visa Violators"] || "Visa Violators", 
      dataField: 'total_visa_violators',
      formatType: 'number',
      bgColor: '#FCD6B5',
    },
    { 
      key: 'residence_violators_percentage', 
      label: trans[language]?.["Residence Violators %"] || "Residence Violators %", 
      dataField: 'total_residents_violators_percentage',
      formatType: 'percentage',
      bgColor: '#E7BB62',
    },
    { 
      key: 'visa_violators_percentage', 
      label: trans[language]?.["Visa Violators %"] || "Visa Violators %", 
      dataField: 'total_visa_violators_percentage',
      formatType: 'percentage',
      bgColor: '#FCD6B5',
    },
  ];

  // Use custom rows if provided, otherwise use default rows
  const rowsConfig = customRows || defaultRowsConfig;

  // Process rows to extract values from data
  const rows = rowsConfig.map(row => {
    if (row.buildCells) {
      return { ...row, cells: row.buildCells(data) };
    }

    let value;
    if (row.value !== undefined) {
      value = row.value;
    } else if (row.dataField) {
      const rawValue = data?.[row.dataField] || 0;
      if (row.formatType === 'percentage') {
        value = formatPercentage(rawValue);
      } else if (row.formatType === 'raw') {
        value = rawValue;
      } else {
        value = formatNumber(rawValue);
      }
    } else {
      value = '0';
    }
    
    return {
      ...row,
      value
    };
  });

  // Use total violators from API data
  const totalViolators = data?.total_violators 
    ? parseInt((data.total_violators || "0").toString().replace(/,/g, '')) || 0
    : 0;
  const formattedTotal = totalViolators.toLocaleString();

  return (
    <div
      style={{
        width: boxWidth,
        height: boxHeight,
        background: 'transparent',
        border: '1px solid black',
        borderRadius: 3,
        boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        fontSize: 8, // reduced from 10
        color: colors.text,
        display: 'flex',
        flexDirection: 'column',
        direction: 'ltr', // Force LTR to prevent table orientation change in RTL mode
      }}
    >
      {/* Fixed header section */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            background: 'linear-gradient(180deg, #8d6a2b 0%, #6f5220 100%)',
            color: 'var(--colorWhite, #fff)',
            fontWeight: 700,
            padding: '2px', // reduced
            textAlign: 'center',
            fontSize: 9, // smaller header text
          }}
        >
          {name}
        </div>

        {/* Header row - removed */}
      </div>

      {/* Scrollable data rows */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {rows.map((r, idx) => {
          const cells = r.cells || [
            { content: r.value, bold: true, align: 'center', borderRight: true },
            { content: r.label, bgColor: r.bgColor, align: 'center' },
          ];
          return (
            <div 
              key={r.key} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: gridColumns, 
                borderBottom: idx === rows.length - 1 ? 'none' : '1px solid black',
              }}
            >
              {cells.map((cell, cellIdx) => (
                <div
                  key={cellIdx}
                  style={{
                    fontWeight: cell.bold ? 700 : 'normal',
                    textAlign: cell.align || 'center',
                    padding: '2px',
                    borderRight: cell.borderRight ? '1px solid black' : 'none',
                    color: colors.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: cell.align || 'center',
                    background: cell.bgColor || 'transparent',
                  }}
                >
                  {cell.content}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

EmirateCard.propTypes = {
  name: PropTypes.string.isRequired,
  data: PropTypes.shape({
    total_violators: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    total_residents_violators: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    total_visa_violators: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    total_residents_violators_percentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    total_visa_violators_percentage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  language: PropTypes.string,
  translations: PropTypes.object,
  boxHeight: PropTypes.number,
  boxWidth: PropTypes.number,
  rows: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataField: PropTypes.string,
    formatType: PropTypes.oneOf(['number', 'percentage', 'raw']),
    bgColor: PropTypes.string,
    cells: PropTypes.arrayOf(PropTypes.shape({
      content: PropTypes.node,
      bold: PropTypes.bool,
      align: PropTypes.string,
      borderRight: PropTypes.bool,
      bgColor: PropTypes.string,
    })),
  })),
  gridColumns: PropTypes.string,
};

const Marker = ({ left, top }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: 'linear-gradient(180deg, #8d6a2b 0%, #6f5220 100%)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      transform: 'translate(-50%, -50%)',
      zIndex: 2,
    }}
  />
);

Marker.propTypes = { left: PropTypes.number, top: PropTypes.number };

const CityLabel = ({ left, top, text }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top,
      transform: 'translate(-50%, 40%)',
      fontSize: 11,
      color: colors.text,
      textShadow: '0 1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.25)',
      zIndex: 2,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}
  >
    {text}
  </div>
);

CityLabel.propTypes = { left: PropTypes.number, top: PropTypes.number, text: PropTypes.string };

const DistributionByEmirate = ({ contentStyle = {}, items = [], height = 380, title, imageSrc, imageAlt, status, data, forceLeftPosition = false, rows, customBoxHeight, customBoxWidth, gridColumns, showTitleBesideIcon = false, titleStyle = {}, titleWrapperStyle = {} }) => {
  const [containerRef] = useContainerSize();
  const width = 750;
  const cHeight = 380;
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  
  // Use custom box dimensions if provided, otherwise use defaults
  const BOX_HEIGHT = customBoxHeight !== undefined ? customBoxHeight : (language === "ar" ? BOX_HEIGHT_AR : BOX_HEIGHT_EN);
  const RESOLVED_BOX_WIDTH = customBoxWidth !== undefined ? customBoxWidth : BOX_WIDTH;
  
  // Fixed reference height for consistent marker positioning
  const REFERENCE_HEIGHT = 300;
  const computed = useMemo(() => {
    return items.map((e) => {
      const markerX = (e.marker.xPct / 100) * width;
      // Use fixed reference height for marker positioning to prevent shifting
      const markerY = (e.marker.yPct / 100) * REFERENCE_HEIGHT;
      const boxLeft = (e.box.leftPct / 100) * width;
      // Use fixed reference height for box positioning as well
      const boxTop = (e.box.topPct / 100) * REFERENCE_HEIGHT;
      const [ax, ay] = getAnchorPoint(boxLeft, boxTop, e.box.anchor, BOX_HEIGHT, RESOLVED_BOX_WIDTH);
      const labelX = markerX + (e.label?.dx || 0);
      const labelY = markerY + (e.label?.dy || 0);
      return { ...e, positions: { markerX, markerY, boxLeft, boxTop, anchorX: ax, anchorY: ay, labelX, labelY } };
    });
  }, [items, width, BOX_HEIGHT, RESOLVED_BOX_WIDTH]);

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      isImageWithBorder={true}
      forceLeftPosition={forceLeftPosition}
      loadingHeight={height}
      showTitleBesideIcon={showTitleBesideIcon}
      titleStyle={titleStyle}
      titleWrapperStyle={titleWrapperStyle}
      chart={
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: '100%',
            height,
            minHeight: height,
            // backgroundColor: "transparent",
            ...contentStyle,
          }}
        >

          {/* SVG connectors with arrowheads */}
          <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'visible' }}>
            <defs>
              <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill="rgba(0,0,0,0.28)" />
              </marker>
            </defs>
            {computed.map((e) => {
              const boxLeft = e.positions.boxLeft;
              const boxTop = e.positions.boxTop;
              const xMid = boxLeft + RESOLVED_BOX_WIDTH / 2;
              const yBottom = boxTop + BOX_HEIGHT;
              const topMid = [xMid, boxTop];
              const bottomMid = [xMid, yBottom];
              const anchor = e.box?.anchor || 'right-mid';
              
              // Determine which connector to show based on anchor
              let connectorStart;
              if (anchor === 'top-mid') {
                connectorStart = topMid;
              } else if (anchor === 'bottom-mid') {
                connectorStart = bottomMid;
              } else {
                // Use the original anchor point for all other anchor types
                connectorStart = [e.positions.anchorX, e.positions.anchorY];
              }
              
              return (
                <g key={`${e.id}-line`}>
                  <line x1={connectorStart[0]} y1={connectorStart[1]} x2={e.positions.markerX} y2={e.positions.markerY}
                    stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" markerEnd="url(#arrowHead)" />
                </g>
              );
            })}
          </svg>

          {/* Markers */}
          {computed.map((e) => (
            <Marker key={`${e.id}-marker`} left={e.positions.markerX} top={e.positions.markerY} />
          ))}

          {/* City labels */}
          {computed.map((e) => (
            <CityLabel key={`${e.id}-label`} left={e.positions.markerX} top={e.positions.markerY + 3} text={e.name} />
          ))}

          {/* Cards */}
          {computed.map((e) => (
            <div key={`${e.id}-card`} style={{ position: 'absolute', left: e.positions.boxLeft, top: e.positions.boxTop, zIndex: 3 }}>
              <EmirateCard name={e.name} data={e.data} language={language} translations={customPdfTranslations} boxHeight={BOX_HEIGHT} boxWidth={RESOLVED_BOX_WIDTH} rows={rows} gridColumns={gridColumns} />
            </div>
          ))}
        </div>
      }
      status={status}
      data={data}
    />
  );
};

DistributionByEmirate.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    marker: PropTypes.shape({ xPct: PropTypes.number, yPct: PropTypes.number }),
    box: PropTypes.shape({ leftPct: PropTypes.number, topPct: PropTypes.number, anchor: PropTypes.string }),
    label: PropTypes.shape({ text: PropTypes.string, dx: PropTypes.number, dy: PropTypes.number }),
    data: PropTypes.shape({ expats: PropTypes.string, percentage: PropTypes.string, residence: PropTypes.string, visa: PropTypes.string }),
  })),
  height: PropTypes.number,
  title: PropTypes.string,
  contentStyle: PropTypes.object,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
  status: PropTypes.string,
  data: PropTypes.object,
  forceLeftPosition: PropTypes.bool,
  customBoxHeight: PropTypes.number,
  customBoxWidth: PropTypes.number,
  gridColumns: PropTypes.string,
  rows: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dataField: PropTypes.string,
    formatType: PropTypes.oneOf(['number', 'percentage', 'raw']),
    bgColor: PropTypes.string,
    cells: PropTypes.arrayOf(PropTypes.shape({
      content: PropTypes.node,
      bold: PropTypes.bool,
      align: PropTypes.string,
      borderRight: PropTypes.bool,
      bgColor: PropTypes.string,
    })),
  })),
};

export default DistributionByEmirate;
