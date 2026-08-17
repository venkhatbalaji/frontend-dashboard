import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Text } from 're-usable-design-components';
import SectionCard from './SectionCard';
import colors from '../colors';
import { formatNumber } from '@/utils/helper';


// Vertical gold bars with grid, black baseline and small icons, as per mock
export default function DistributionByAgeRange({
  title,
  imageSrc,
  imageAlt,
  ranges,
  height = 220,
  status,
  data,
  forceLeftPosition = false,
  chartStyle = {},
}) {
  const GOLD = colors.primary;
  
  const chartData = useMemo(() => (ranges || []).map((r) => ({
    label: r.label,
    value: typeof r.value === 'string' ? Number(r.value.replace(/[\,\s]/g, '')) || 0 : Number(r.value) || 0,
    iconSrc: r.iconSrc,
    iconHeight: r.iconHeight,
  })), [ranges]);
  const maxVal = useMemo(() => chartData.reduce((m, r) => (r.value > m ? r.value : m), 0) || 1, [chartData]);

  // Layout constants
  const PAD_V = 50; // extra headroom for vertical value labels
  const BASELINE_H = 12; // space reserved for the black baseline area
  const LABEL_H = 20; // space for x labels under baseline
  const CHART_H = height - (PAD_V + BASELINE_H + LABEL_H);
  const GAP = 12;
  const N = chartData.length || 1;
  const barWidth = `calc((100% - ${GAP * (N - 1)}px) / ${N})`;
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
        <div style={{ position: 'relative', width: 'calc(100% - 125px)', marginLeft: "105px", height, direction: 'ltr', ...chartStyle }}>
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
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: CHART_H + PAD_V, display: 'flex', alignItems: 'flex-end', gap: GAP }}>
            {chartData.map((d) => {
              const pct = Math.max(0, Math.min(100, (d.value / maxVal) * 100));
              let h = Math.round((pct / 100) * CHART_H);
              // Ensure minimum height of 3px if value > 0
              if (d.value > 0 && h < 3) {
                h = 3;
              }
              const iconHeight = d?.iconHeight || 16;
              const labelStartPosition = 30 + iconHeight + 2; // icon bottom + icon height + 2px gap
              return (
                <div
                  key={d.label}
                  style={{
                    flex: `0 0 ${barWidth}`,
                    maxWidth: barWidth,
                    position: 'relative',
                    height: CHART_H + PAD_V,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                  }}
                >
                  {/* Bar */}
                  <div
                    style={{
                      width: '70%',
                      height: `${h}px`,
                      borderRadius: 3,
                      backgroundColor: '#CBA54A',
                      backgroundClip: 'padding-box',
                    }}
                  />
                  {/* Value label - vertical */}
                  {d.value > 0 && (
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
                        {typeof d.value === 'number' ? formatNumber(d.value) : d.value}
                      </Text>
                    </div>
                  )}
                  {/* Icon near baseline */}
                  <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
                    {d.iconSrc && (
                      <img src={d.iconSrc} alt={d.label} height={d?.iconHeight || 16} width={"auto"} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Black baseline and labels */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: CHART_H + PAD_V, height: BASELINE_H + LABEL_H }}>
            {/* Baseline */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: -1, height: 2, background: colors.text }} />
            {/* Labels row */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 6, display: 'flex', gap: GAP }}>
              {chartData.map((d) => (
                <div key={`label-${d.label}`} style={{ flex: `0 0 ${barWidth}`, maxWidth: barWidth, textAlign: 'center' }}>
                  <Text style={{ color: GOLD, fontSize: colors.chartAxisLabelFontSize }}>{d.label}</Text>
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
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.elementType,
  })),
  height: PropTypes.number,
  style: PropTypes.object,
  className: PropTypes.string,
  chartStyle: PropTypes.object,
};
