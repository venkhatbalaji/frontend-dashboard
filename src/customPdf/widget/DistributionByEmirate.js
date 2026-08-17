import React, { useMemo, useRef, useLayoutEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import SectionCard from './SectionCard';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import customPdfTranslations from "../../views/CustomizedPdf/translation.json";
import { colors } from "../colors";

// DistributionByEmirate renders info cards and connectors on top of the CenterPanel map background
const BOX_WIDTH = 188; // reduced from 220
const BOX_HEIGHT = 111; // reduced from 122;

const defaultEmirates = [
  {
    id: 'abu-dhabi',
    name: 'Abu Dhabi',
    // Southwest (far western region)
    marker: { xPct: 39, yPct: 79 },
    box: { leftPct: 5, topPct: 110, anchor: 'right-top' },
    label: { text: 'Abu Dhabi', dx: -6, dy: 12 },
    data: { expats: '000', percentage: '22.3%', residence: '00', visa: '000' },
  },
  {
    id: 'dubai',
    name: 'Dubai',
    // North of Abu Dhabi (west-central)
    marker: { xPct: 48, yPct: 61 },
    box: { leftPct: 0, topPct: 70, anchor: 'right-top' },
    label: { text: 'Dubai', dx: -4, dy: 10 },
    data: { expats: '000', percentage: '56.4%', residence: '000', visa: '00' },
  },
  {
    id: 'sharjah',
    name: 'Sharjah',
    // North of Dubai (west-central)
    marker: { xPct: 52, yPct: 55 },
    box: { leftPct: 38, topPct: 100, anchor: 'right-mid' },
    label: { text: 'Sharjah', dx: -10, dy: 12 },
    data: { expats: '00', percentage: '11.7%', residence: '00', visa: '000' },
  },
  {
    id: 'ajman',
    name: 'Ajman',
    // North of Sharjah (west-central)
    marker: { xPct: 56, yPct: 47 },
    box: { leftPct: 2, topPct: 30, anchor: 'right-mid' },
    label: { text: 'Ajman', dx: -8, dy: 10 },
    data: { expats: '000', percentage: '3.7%', residence: '00', visa: '000' },
  },
  {
    id: 'umm-al-quwain',
    name: 'Umm Al Quwain',
    // North of Ajman (north-central)
    marker: { xPct: 59, yPct: 41 },
    box: { leftPct: 33, topPct: -2, anchor: 'right-bottom' },
    label: { text: 'Umm Al Quwain', dx: -6, dy: 10 },
    data: { expats: '000', percentage: '0.9%', residence: '000', visa: '000' },
  },
  {
    id: 'ras-al-khaimah',
    name: 'Ras Al Khaima',
    // Northeast (further north than Umm Al Quwain)
    marker: { xPct: 69, yPct: 26 },
    box: { leftPct: 72, topPct: 2, anchor: 'left-mid' },
    label: { text: 'Ras Al Khaima', dx: 16, dy: 14 },
    data: { expats: '000', percentage: '3%', residence: '00', visa: '00' },
  },
  {
    id: 'fujairah',
    name: 'Fujairah',
    // Eastern coast (northeast)
    marker: { xPct: 75, yPct: 48 },
    box: { leftPct: 67, topPct: 90, anchor: 'top-left' },
    label: { text: 'Fujairah', dx: -8, dy: 12 },
    data: { expats: '000', percentage: '0%', residence: '00', visa: '00' },
  },
];
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

const getAnchorPoint = (boxLeft, boxTop, anchor) => {
  const xRight = boxLeft + BOX_WIDTH;
  const xMid = boxLeft + BOX_WIDTH / 2;
  const yBottom = boxTop + BOX_HEIGHT;
  switch (anchor) {
  case 'right-mid':
    return [xRight, boxTop + BOX_HEIGHT / 2];
  case 'right-top':
    return [xRight, boxTop + BOX_HEIGHT * 0.2];
  case 'top-left':
    return [boxLeft + BOX_WIDTH * 0.3, boxTop];
  case 'left-mid':
    return [boxLeft, boxTop + BOX_HEIGHT / 2];
  case 'right-bottom':
    return [xRight, yBottom - 8];
  case 'top-mid':
    return [xMid, boxTop];
  case 'bottom-mid':
    return [xMid, yBottom];
  default:
    return [xRight, boxTop + BOX_HEIGHT / 2];
  }
};

const EmirateCard = ({ name, data, language = "en", translations: trans = customPdfTranslations }) => {
  const rows = [
    { 
      key: 'uae_nationals_total', 
      label: trans[language]?.["UAE Nationals (Total)"] || "UAE Nationals (Total)", 
      count: data.uaeNationalsTotal || '0', 
      percentage: data.uaeNationalsTotalPercentage || '0%' 
    },
    { 
      key: 'males_uae_nationals', 
      label: trans[language]?.["Males (UAE Nationals)"] || "Males (UAE Nationals)", 
      count: data.malesUaeNationals || '0', 
      percentage: data.malesUaeNationalsPercentage || '0%' 
    },
    { 
      key: 'females_uae_nationals', 
      label: trans[language]?.["Females (UAE Nationals)"] || "Females (UAE Nationals)", 
      count: data.femalesUaeNationals || '0', 
      percentage: data.femalesUaeNationalsPercentage || '0%' 
    },
    { 
      key: 'residents', 
      label: trans[language]?.["Number of Residents"] || "Number of Residents", 
      count: data.residents || '0', 
      percentage: data.residentsPercentage || '0%' 
    },
    { 
      key: 'visa_gcc', 
      label: trans[language]?.["Visa Holders & GCC"] || "Visa Holders & GCC", 
      count: data.visaGcc || '0', 
      percentage: data.visaGccPercentage || '0%' 
    },
  ];


  // Use total population from API data, or calculate from rows as fallback
  const totalPopulation = data?.totalPopulation 
    ? parseInt((data.totalPopulation || "0").replace(/,/g, '')) || 0
    : rows.reduce((sum, row) => {
      const count = parseInt((row?.count || "0").replace(/,/g, '')) || 0;
      return sum + count;
    }, 0);
  const formattedTotal = totalPopulation.toLocaleString();

  return (
    <div
      style={{
        width: BOX_WIDTH,
        height: BOX_HEIGHT,
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

        {/* Header row - fixed */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 1fr', 
          borderBottom: '1px solid black',
          position: 'sticky',
          top: 0,
          background: '#DED9C3',
          zIndex: 10,
        }}>
          <div style={{ 
            fontWeight: 700, 
            textAlign: 'center', 
            padding: '2px 0', 
            borderRight: '1px solid black',
            gridColumn: 'span 1',
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {formattedTotal}
          </div>
          <div style={{ 
            fontWeight: 700, 
            textAlign: 'center', 
            padding: '2px 0',
            color: colors.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {trans[language]?.["Population"] || "Population"}
          </div>
        </div>
      </div>

      {/* Scrollable data rows */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {rows.map((r, idx) => {
          return (
            <div 
              key={r.key} 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: '40px 55px 1fr', 
                borderBottom: idx === rows.length - 1 ? 'none' : '1px solid black',
                background: 'transparent',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '2px 0',
                  borderRight: '1px solid black',
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {r.percentage}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '2px 0',
                  borderRight: '1px solid black',
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {r.count}
              </div>
              <div
                style={{
                  padding: '2px',
                  color: colors.text,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {r.label}
              </div>
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
    totalPopulation: PropTypes.string,
    uaeNationalsTotal: PropTypes.string,
    uaeNationalsTotalPercentage: PropTypes.string,
    malesUaeNationals: PropTypes.string,
    malesUaeNationalsPercentage: PropTypes.string,
    femalesUaeNationals: PropTypes.string,
    femalesUaeNationalsPercentage: PropTypes.string,
    residents: PropTypes.string,
    residentsPercentage: PropTypes.string,
    visaGcc: PropTypes.string,
    visaGccPercentage: PropTypes.string,
  }).isRequired,
  language: PropTypes.string,
  translations: PropTypes.object,
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

const DistributionByEmirate = ({ contentStyle = {}, items = defaultEmirates, height = 450, title, imageSrc, imageAlt, status, data, forceLeftPosition = false }) => {
  const [containerRef] = useContainerSize();
  const width = 750;
  const cHeight = 450;
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
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
      const [ax, ay] = getAnchorPoint(boxLeft, boxTop, e.box.anchor);
      const labelX = markerX + (e.label?.dx || 0);
      const labelY = markerY + (e.label?.dy || 0);
      return { ...e, positions: { markerX, markerY, boxLeft, boxTop, anchorX: ax, anchorY: ay, labelX, labelY } };
    });
  }, [items, width]);

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      isImageWithBorder={true}
      forceLeftPosition={forceLeftPosition}
      loadingHeight={height}
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
              const xMid = boxLeft + BOX_WIDTH / 2;
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
            <CityLabel key={`${e.id}-label`} left={e.positions.markerX} top={e.positions.markerY + 4} text={e.name} />
          ))}

          {/* Cards */}
          {computed.map((e) => (
            <div key={`${e.id}-card`} style={{ position: 'absolute', left: e.positions.boxLeft, top: e.positions.boxTop, zIndex: 3 }}>
              <EmirateCard name={e.name} data={e.data} language={language} translations={customPdfTranslations} />
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
};

export default DistributionByEmirate;
