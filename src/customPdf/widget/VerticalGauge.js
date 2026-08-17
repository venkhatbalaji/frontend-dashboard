import React, { useContext } from "react";
import { colors } from "../colors";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import translation from "@/views/CustomizedPdf/translation.json";

/**
 * VerticalGauge - A vertical progress bar/gauge component
 * @param {number} max - Maximum value (100 by default)
 * @param {number} value - Current value
 * @param {number} height - Height of the gauge in pixels (default: 150)
 * @param {number} width - Width of the bar in pixels (default: 28)
 * @param {object} style - Additional styles for the container
 */
const VerticalGauge = ({
  max = 100,
  value = 0,
  width = 14,
  style = {},
}) => {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const clampedPercentage = percentage;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        direction: "ltr",
        height: "100%",
        zIndex: 10,
        position: "relative",
        ...style,
      }}
    >
      {/* Left labels */}
      {/* <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingRight: "6px",
          fontSize: "10px",
          color: colors.text,
        }}
      >
        <span>{`${max}%`}</span>
        <span>{`${Math.floor(max/2)}%`}</span>
        <span>{`0%`}</span>
      </div> */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          top: "0%",
          bottom: "0%",
          left: "-33px",
          paddingRight: "6px",
          fontSize: "10px",
          color: colors.text,
          transform: "rotate(-90deg)",
        }}
      >
        
        <span>{translation?.[language]?.["Total Risks"] || "Total Risks"}</span>
      </div>
      {/* Gauge bar */}
      <div
        style={{
          width: `${width}px`,
          height: "100%",
          backgroundColor: "#e0e4ec",
          borderRadius: `12px`,
          position: "relative",
          overflow: "hidden",
          marginLeft: "10px",
          border: `1px solid ${colors.text}`,
        }}
      >
        {/* Filled portion */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${clampedPercentage}%`,
            // borderTop: `1px solid ${colors.text}`,
            background: clampedPercentage ? `linear-gradient(to top, ${colors.chartEntryGradientDark}, ${colors.chartEntryGradientLight})` : "transparent",
            borderRadius: `12px`,
            transition: "height 0.3s ease",
          }}
        />
      </div>

      {/* Horizontal line and percentage label */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          height: "100%",
        }}
      >
        {/* Horizontal line */}
        <div
          style={{
            position: "absolute",
            top: `${100 - clampedPercentage}%`,
            left: "-14px",
            width: "20px",
            height: "1px",
            backgroundColor: "#9a7c38",
            transform: "translateY(-50%)",
          }}
        />
        {/* Percentage label */}
        <span
          style={{
            position: "absolute",
            top: `${100 - clampedPercentage}%`,
            left: "7px",
            fontWeight: "bold",
            transform: "translateY(-50%)",
            fontSize: "10px",
            color: "#9a7c38",
            whiteSpace: "nowrap",
          }}
        >
          {value}%
        </span>
      </div>
    </div>
  );
};

export default VerticalGauge;

