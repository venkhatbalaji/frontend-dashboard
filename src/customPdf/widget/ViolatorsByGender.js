import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Text } from "re-usable-design-components";
import { colors } from "../colors";
import SectionCard from "./SectionCard";
import { formatNumber } from "@/utils/helper";


export default function ViolatorsByGender({
  title = "",
  titleStyle={},
  imageSrc,
  imageAlt,
  leftImageStyle,
  rightImageStyle,
  chartColStyle = {},
  maleCount = "0",
  femaleCount = "0",
  titleWrapperStyle={},
  malePercent = 0, // 0..100 (also accepts 0..1 or '97%')
  showMarker = true,
  maleLabel,
  femaleLabel,
  malePercentLabel,
  femalePercentLabel,
  loadingHeight = "200px",
  status,
  data,
  maleImageStyle={},
  femaleImageStyle={},
  forceLeftPosition = false,
}) {

  const BAR_H = 18;


  const GREY = colors.textSecondary;
  const TRACK_BG = colors.bgLayout;

  // remove chips to match mock icons without backgrounds
  // const MALE_CHIP_BG = '#F0E1C2';
  // const FEMALE_CHIP_BG = '#E0E0E0';

  // Normalize the incoming percent: supports 97, '97%', 0.97
  const parsePercent = (p) => {
    if (p === undefined || p === null || p === "") return null;
    let n; // avoid useless initial assignment
    if (typeof p === "string") {
      const s = p.trim().replace("%", "");
      n = parseFloat(s);
    } else {
      n = Number(p);
    }
    if (Number.isNaN(n)) return null;
    if (n > 0 && n <= 1) n = n * 100; // treat as ratio
    return Math.max(0, Math.min(100, n));
  };

  let mp = parsePercent(malePercent);
  // If not provided, compute from counts
  if (mp === null) {
    const m = Number(maleCount);
    const f = Number(femaleCount);
    if (!Number.isNaN(m) && !Number.isNaN(f) && m + f > 0) {
      mp = Math.round((m / (m + f)) * 100);
    } else {
      mp = 0;
    }
  }
  const fp = 100 - mp;

  // Format percentage: show 1 decimal place if decimal exists, otherwise whole number
  const formatPercentLabel = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return "0%";
    // Check if value has decimal part (not a whole number)
    const rounded = Math.round(num);
    if (rounded === num) {
      // Whole number, show without decimal
      return `${rounded}%`;
    }
    // Has decimal, show 1 decimal place
    return `${num.toFixed(1)}%`;
  };

  // Display strings (fallback to computed if not provided)
  const mpLabel =
    typeof malePercentLabel === "string"
      ? malePercentLabel
      : formatPercentLabel(mp);
  const fpLabel =
    typeof femalePercentLabel === "string"
      ? femalePercentLabel
      : formatPercentLabel(fp);

  const ViolatorsByGenderData = (
    <>
      <Row>
        <Col>
          

          <Row align="middle" gutter={8} style={{position:"relative", direction: "ltr"}}>
            {/* Left image (Male) */}
            <Col
              flex="none"
              style={{
                display: "flex",
                marginBottom: "23px",
                alignItems: "center",
                gap: 6,
                minWidth: 40,
                ...leftImageStyle
              }}
            >
              <Text style={{ color: colors.male, fontSize: 12 }}>
                {maleLabel}
              </Text>
              <img src="/customPdf/male.svg" alt="male" style={{ width: "auto", height: "40px", ...maleImageStyle }} />
            </Col>

            {/* Bar area */}
            <Col flex="auto" style={{ position: "relative", minWidth: 0 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: BAR_H,
                  background: TRACK_BG,
                  borderRadius: 0,
                  overflow: "visible",
                }}
              >
                {/* Male segment with sharp corners */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: `${mp}%`,
                    height: "100%",
                    background: colors.male,
                  }}
                />
                {/* Female segment with sharp corners */}
                <div
                  style={{
                    position: "absolute",
                    left: `${mp}%`,
                    top: 0,
                    width: `${fp}%`,
                    height: "100%",
                    background: colors.female,
                    opacity: 0.9,
                  }}
                />

                {/* Male percent label centered within gold segment */}
                {mp > 2 && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: `${mp}%`,
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Text
                        style={{ color: "#fff", fontSize: 12, letterSpacing: 0.2, paddingLeft: "10px" }}
                      >
                        {mpLabel}
                      </Text>
                    </div>
                  </div>
                )}

                {/* Female percent centered within remaining (grey) segment with same style as male */}
                {fp > 2 && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${mp}%`,
                      top: 0,
                      width: `${fp}%`,
                      height: "100%",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 12,
                          letterSpacing: 0.2,
                          paddingRight: "10px"
                        }}
                      >
                        {fpLabel}
                      </Text>
                    </div>
                  </div>
                )}

                {/* Indicator above the bar, pointing downward */}
                {showMarker && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${mp}%`, // position at male percent
                      transform: "translateX(-50%)", // center the triangle
                      top: -10, // small gap above the bar similar to mock
                      width: 0,
                      height: 0,
                      borderLeft: "6px solid transparent",
                      borderRight: "6px solid transparent",
                      borderTop: `8px solid ${colors.progressIndicator}`, // point triangle downward
                      zIndex: 2,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>

              {/* Counts under bar with side colors */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                <Text
                  style={{ color: colors.male, fontSize: 12, fontWeight: 700 }}
                >
                  {typeof maleCount === 'number' ? formatNumber(maleCount) : (maleCount || "0")}
                </Text>
                <Text
                  style={{
                    color: colors.female,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {typeof femaleCount === 'number' ? formatNumber(femaleCount) : (femaleCount || "0")}
                </Text>
              </div>
            </Col>

            {/* Right image (Female) */}
            <Col
              flex="none"
              style={{
                display: "flex",
                marginBottom: "23px",
                alignItems: "center",
                gap: 6,
                minWidth: 44,
                justifyContent: "flex-end",
                ...rightImageStyle
              }}
            >
              <img src="/customPdf/female.svg" alt="male" style={{ width: "auto", height: "40px", ...femaleImageStyle }} />
              <Text style={{ color: GREY, fontSize: 12 }}>{femaleLabel}</Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
  
  return (
    <SectionCard
      title={title}
      titleStyle={titleStyle}
      titleWrapperStyle={titleWrapperStyle}
      isImageWithBorder={true}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      status={status}
      data={data}
      forceLeftPosition={forceLeftPosition}
      loadingHeight={loadingHeight}
      chart={
        
        <Row
          style={{
            width: "100%",
            marginTop: "50px",
            ...chartColStyle
          }}
        >
          <Col>{ViolatorsByGenderData}</Col>
        </Row>
        
      }
    />
  );
}

ViolatorsByGender.propTypes = {
  title: PropTypes.string,
  maleCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  femaleCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  malePercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  showMarker: PropTypes.bool,
  // New props
  maleLabel: PropTypes.string,
  femaleLabel: PropTypes.string,
  malePercentLabel: PropTypes.string,
  femalePercentLabel: PropTypes.string,
  titleWrapperStyle: PropTypes.object,
};
