import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from "re-usable-design-components";
import { colors } from './colors';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";
import { template } from 'lodash';

const Template = ({ 
  children, 
  footerContent,
  leftColumn,
  leftColumnWidth = "25%",
  rightColumnWidth = "33%",
  middleColumn,
  rightColumn,
  style = {}, 
  className = "",
  showFooter = false,
  showThreeColumns = false,
  templateGutter,
  isRightColumnLeftBorder = false
}) => {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  
  // Swap left and right columns in RTL mode
  const actualLeftColumn = isRtl ? rightColumn : leftColumn;
  const actualRightColumn = isRtl ? leftColumn : rightColumn;
  const actualLeftColumnWidth = isRtl ? rightColumnWidth : leftColumnWidth;
  const actualRightColumnWidth = isRtl ? leftColumnWidth : rightColumnWidth;
  
  // Calculate middle column width based on left and right column widths
  const calculateMiddleColumnWidth = () => {
    const parsePercentage = (value) => {
      if (typeof value === 'string' && value.includes('%')) {
        return parseFloat(value.replace('%', ''));
      }
      return 0;
    };

    const leftPercent = parsePercentage(actualLeftColumnWidth || "27%");
    const rightPercent = parsePercentage(actualRightColumnWidth || "30%");
    const middlePercent = 100 - leftPercent - rightPercent;
    
    // Ensure minimum width of 0%
    return `${Math.max(0, middlePercent)}%`;
  };

  const middleColumnWidth = middleColumn ? calculateMiddleColumnWidth() : "0%";

  return (
    <div className={`custom-pdf-template ${className}`} style={{ padding: "6px", ...style }}>
      {showThreeColumns ? (
        <Row wrap={false} gutter={templateGutter ? templateGutter : [12, 12]} style={{ flex: 1, height: "100%" }}>
          {/* Left Column (swapped in RTL) */}
          <Col flex={`0 0 ${actualLeftColumnWidth || "27%"}`} style={{ overflow: "hidden" }}>
            <div style={{ height: "100%"}} >
              {actualLeftColumn}
            </div>
          </Col>

          {/* Middle Column */}
          {middleColumn && (
            <Col
              flex={`0 0 ${middleColumnWidth}`}
              style={{
                overflow: "hidden",
                borderLeft: isRightColumnLeftBorder ? "none" : `1px solid ${colors.border}`,
                borderRight: isRightColumnLeftBorder ? "none" : `1px solid ${colors.border}`,
              }}
              className="center-panel"
            >
              <div style={{ height: "100%" }}>
                {middleColumn}
              </div>
            </Col>
          )}

          {/* Right Column (swapped in RTL) */}
          <Col
            flex={`0 0 ${actualRightColumnWidth || "30%"}`}
            style={{
              overflow: "auto",
            }}
          >
            <div style={{ height: "100%" }}>
              {actualRightColumn}
            </div>
          </Col>
        </Row>
      ) : (
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      )}
      
      {showFooter && (
        <div style={{
          marginTop: "auto",
          paddingTop: "12px",
          borderTop: `1px solid ${colors.border}`,
          maxHeight: "60px"
        }}>
          {footerContent}
        </div>
      )}  
    </div>
  );
};

Template.propTypes = {
  children: PropTypes.node,
  footerContent: PropTypes.node,
  leftColumn: PropTypes.node,
  middleColumn: PropTypes.node,
  rightColumn: PropTypes.node,
  style: PropTypes.object,
  className: PropTypes.string,
  showFooter: PropTypes.bool,
  showThreeColumns: PropTypes.bool,
  isRightColumnLeftBorder: PropTypes.bool
};

export default Template;
