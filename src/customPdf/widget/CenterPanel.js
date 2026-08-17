import React from 'react';
import PropTypes from 'prop-types';

// Simple wrapper to standardize layout in the middle column (Center Panel)
// Ensures vertical stacking, consistent gaps, and full-height behavior
// Also supports a decorative UAE map background
const CenterPanel = ({
  children,
  gap = 8,
  padded = false,
  showMapBackground = true,
  mapSrc = '/uae_map.svg',
  mapOpacity = 0.38, // subtle like the mock
  mapScale = undefined, // slightly larger than container for edge-to-edge feel
  mapPosition = 'center 8%', // a bit higher like the mock
  style = {},
  className = '',
}) => {
  return (
    <div
      className={`center-panel ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: typeof gap === 'number' ? `${gap}px` : gap,
        height: '100%',
        minHeight: 0,
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        boxSizing: 'border-box',
        padding: padded ? 'var(--paddingSM)' : 0,
        overflow: 'visible',
        ...style,
      }}
    >
      {showMapBackground && (
        <div
          aria-hidden
          className="center-panel-map-background"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${mapSrc})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: mapPosition,
            backgroundSize: 'contain',
            opacity: mapOpacity,
            transform: mapScale ? mapScale : `scale(1.05)`,
            transformOrigin: 'center top',
            filter: 'grayscale(100%)',
            width: "570px",
            marginLeft: "auto",
            marginRight: "auto",
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: typeof gap === 'number' ? `${gap}px` : gap }}>
        {children}
      </div>
    </div>
  );
};

CenterPanel.propTypes = {
  children: PropTypes.node,
  gap: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  padded: PropTypes.bool,
  showMapBackground: PropTypes.bool,
  mapSrc: PropTypes.string,
  mapOpacity: PropTypes.number,
  mapScale: PropTypes.number,
  mapPosition: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
};

export default CenterPanel;
