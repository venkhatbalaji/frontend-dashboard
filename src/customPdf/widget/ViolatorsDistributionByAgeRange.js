import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Text } from 're-usable-design-components';
import SectionCard from './SectionCard';
import colors from '../colors';
import { formatNumber } from '@/utils/helper';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import customPdfTranslations from "../../views/CustomizedPdf/translation.json";

// Vertical grouped bars with grid, black baseline and small icons, as per mock
export default function DistributionByAgeRange({
  isRtlEnabled = false,
  title,
  imageSrc,
  imageAlt,
  ranges,
  height = 220,
  status,
  data,
  forceLeftPosition = false,
  leftLegendLabel,
  rightLegendLabel,
}) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const trans = customPdfTranslations;
  
  const GOLD = '#E7BB62'; // Gold color for Resident Visa
  const PEACH = '#FCD6B5'; // Light peach color for Visa
  
  const chartData = useMemo(() => {
    if (!ranges || !Array.isArray(ranges)) return [];
    
    return ranges.map((r) => ({
      label: r.label,
      visaValue: typeof r.visaValue === 'string' ? Number(r.visaValue.replace(/[\,\s]/g, '')) || 0 : Number(r.visaValue) || 0,
      residencyValue: typeof r.residencyValue === 'string' ? Number(r.residencyValue.replace(/[\,\s]/g, '')) || 0 : Number(r.residencyValue) || 0,
      iconSrc: r.iconSrc,
      iconHeight: r.iconHeight,
    }));
  }, [ranges]);
  
  const maxVal = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.visaValue, d.residencyValue]);
    return Math.max(...allValues, 1);
  }, [chartData]);

  // Layout constants
  const PAD_V = 20; // extra headroom for value labels above bars
  const BASELINE_H = 12; // space reserved for the black baseline area
  const LABEL_H = 20; // space for x labels under baseline
  const CHART_H = height - (PAD_V + BASELINE_H + LABEL_H);
  const GAP = 12;
  const N = chartData.length || 1;
  const MAX_BAR_WIDTH = 80; // Maximum width for each bar group
  const groupWidth = `min(calc((100% - ${GAP * (N - 1)}px) / ${N}), ${MAX_BAR_WIDTH}px)`;
  const barWidth = '50%'; // Each bar takes 50% of the group width, no gap between them
  // Grid density to match mock (square cells)
  const GRID_STEP = 16; // px
  const GRID_COLOR = 'rgba(0,0,0,0.06)';

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      isImageWithBorder={true}
      imageAlt={imageAlt}
      status={status}
      data={data}
      loadingHeight={height}
      forceLeftPosition={forceLeftPosition}
      chart={
        <div style={{ 
          position: 'relative', 
          width: 'calc(100% - 125px)', 
          maxWidth: '600px', 
          marginLeft: isRtlEnabled && language === "ar" ? "0px" : "105px", 
          marginRight: isRtlEnabled && language === "ar" ? "115px" : "20px",
          height, 
          direction: 'ltr' 
        }}>
          {/* Grid background */}
          <div
            aria-hidden
            className="pdf-mesh-background"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: CHART_H + PAD_V,
              // Square grid: same step for horizontal and vertical lines
              backgroundImage: `repeating-linear-gradient(to bottom, ${GRID_COLOR}, ${GRID_COLOR} 1px, transparent 1px, transparent ${GRID_STEP}px), repeating-linear-gradient(to right, ${GRID_COLOR}, ${GRID_COLOR} 1px, transparent 1px, transparent ${GRID_STEP}px)`,
            }}
          />

          {/* Bars layer */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: CHART_H + PAD_V, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: GAP }}>
            {chartData.map((d) => {
              const visaPct = Math.max(0, Math.min(100, (d.visaValue / maxVal) * 100));
              const residencyPct = Math.max(0, Math.min(100, (d.residencyValue / maxVal) * 100));
              const visaH = Math.round((visaPct / 100) * CHART_H);
              const residencyH = Math.round((residencyPct / 100) * CHART_H);
              const labelOffset = 6; // space between bar top and value label
              const iconHeight = d?.iconHeight || 16;
              
              // With transformOrigin: 'left center' and rotate(-90deg):
              // - The left center becomes the bottom point of the vertical text
              // - Text extends upward automatically from this point
              // - Simply position the bottom where we want the text to start: just above the icon
              const labelStartPosition = 27 + iconHeight + 2; // icon bottom + icon height + 2px gap
              return (
                <div
                  key={d.label}
                  style={{
                    flex: `0 0 ${groupWidth}`,
                    maxWidth: groupWidth,
                    position: 'relative',
                    height: CHART_H + PAD_V,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    gap: '0px',
                  }}
                >
                  {/* Visa Bar (Peach) - LEFT */}
                  <div style={{ position: 'relative', width: barWidth, height: CHART_H + PAD_V, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${visaH}px`,
                        borderRadius: 3,
                        backgroundColor: PEACH,
                        backgroundClip: 'padding-box',
                      }}
                    />
                    {/* Value label for Visa */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: labelStartPosition,
                        pointerEvents: 'none',
                        transform: 'translateX(-50%) rotate(-90deg)',
                        transformOrigin: 'center center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Text style={{ fontSize: colors.chartAxisLabelFontSize, fontWeight: colors.fontWeightBold, color: colors.text, textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>
                        {formatNumber(d.visaValue || 0)}
                      </Text>
                    </div>
                  </div>
                  
                  {/* Resident Visa Bar (Gold) - RIGHT */}
                  <div style={{ position: 'relative', width: barWidth, height: CHART_H + PAD_V, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${residencyH}px`,
                        borderRadius: 3,
                        backgroundColor: GOLD,
                        backgroundClip: 'padding-box',
                      }}
                    />
                    {/* Value label for Resident Visa */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: labelStartPosition,
                        pointerEvents: 'none',
                        transform: 'translateX(-50%) rotate(-90deg)',
                        transformOrigin: 'center center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Text style={{ fontSize: colors.chartAxisLabelFontSize, fontWeight: colors.fontWeightBold, color: colors.text, textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>
                        {formatNumber(d.residencyValue || 0)}
                      </Text>
                    </div>
                  </div>
                  
                  {/* Icon near baseline - centered between bars */}
                  <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                    {d.iconSrc && (
                      <img src={d.iconSrc} alt={d.label} height={d?.iconHeight || 16} width={"auto"} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend - Left side */}
          <div
            style={{
              position: 'absolute',
              direction: language === "ar" ? 'rtl' : 'ltr',
              left: isRtlEnabled && language === "ar" ? '0px' : '-94px',
              right: isRtlEnabled && language === "ar" ? '-94px' : undefined,
              top: '90px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 2 }}
          >
            {/* Left Legend (Visa/Male) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: PEACH }} />
              <Text style={{ fontSize: '10px', color: colors.text }}>
                {leftLegendLabel || trans[language]?.["Visa"] || "Visa"}
              </Text>
            </div>
            {/* Right Legend (Resident Visa/Female) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: GOLD }} />
              <Text style={{ fontSize: '10px', color: colors.text }}>
                {rightLegendLabel || trans[language]?.["Resident Visa"] || "Resident Visa"}
              </Text>
            </div>
          </div>

          {/* Black baseline and labels */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: CHART_H + PAD_V, height: BASELINE_H + LABEL_H }}>
            {/* Baseline */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: -1, height: 2, background: colors.text }} />
            {/* Labels row */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 6, display: 'flex', justifyContent: 'center', gap: GAP }}>
              {chartData.map((d) => (
                <div key={`label-${d.label}`} style={{ flex: `0 0 ${groupWidth}`, maxWidth: groupWidth, textAlign: 'center' }}>
                  <Text style={{ color: colors.primary, fontSize: colors.chartAxisLabelFontSize }}>{d.label}</Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}

DistributionByAgeRange.propTypes = {
  title: PropTypes.string,
  ranges: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    visaValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    residencyValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    iconSrc: PropTypes.string,
    iconHeight: PropTypes.number,
  })),
  height: PropTypes.number,
  status: PropTypes.string,
  data: PropTypes.any,
  forceLeftPosition: PropTypes.bool,
  leftLegendLabel: PropTypes.string,
  rightLegendLabel: PropTypes.string,
};
