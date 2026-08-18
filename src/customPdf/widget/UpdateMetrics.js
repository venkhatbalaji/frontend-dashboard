import React, { useMemo } from "react";
import PropTypes from "prop-types";
import TreeFlow from "./TreeFlow";
import SectionCard from "./SectionCard";
import { colors } from "../colors";
import translation from "@/views/CustomizedPdf/translation.json";

const DirectionArrow = ({ value }) => {
  if (value === 0 || value == null) return null;
  const isNegative = value < 0;
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        transform: isNegative ? "rotate(180deg)" : "none",
        marginLeft: "2px",
        verticalAlign: "middle",
      }}
    >
      <path
        d="M12 4L12 20M12 4L6 10M12 4L18 10"
        stroke={isNegative ? colors.nationalityProhibitionRed : colors.primary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const PercentIcon = ({ value }) => {
  const isPositive = value != null && value >= 0;
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      {isPositive ? (
        <>
          {/* Wider triangle top, pointing up */}
          <polygon points="1,15 23,15 12,1" fill={colors.nationalityIconFill} stroke={colors.border} strokeWidth="0.8" strokeLinejoin="round" />
          {/* Rectangle bottom */}
          <rect x="4" y="15" width="16" height="14" rx="1" fill={colors.nationalityIconFill} stroke={colors.border} strokeWidth="0.8" />
          {/* Cover seam */}
          <rect x="4.5" y="12.5" width="15" height="4" fill={colors.nationalityIconFill} />
          <text x="12" y="21" textAnchor="middle" dominantBaseline="central" fontSize={colors.fontSizeSvgIcon} fontWeight="bold" fill={colors.nationalityIconText}>%</text>
        </>
      ) : (
        <>
          {/* Rectangle top */}
          <rect x="4" y="1" width="16" height="14" rx="1" fill={colors.nationalityIconFill} stroke={colors.border} strokeWidth="0.8" />
          {/* Wider triangle bottom, pointing down */}
          <polygon points="1,15 23,15 12,29" fill={colors.nationalityIconFill} stroke={colors.border} strokeWidth="0.8" strokeLinejoin="round" />
          {/* Cover seam */}
          <rect x="4.5" y="13.5" width="15" height="4" fill={colors.nationalityIconFill} />
          <text x="12" y="9" textAnchor="middle" dominantBaseline="central" fontSize={colors.fontSizeSvgIcon} fontWeight="bold" fill={colors.nationalityIconText}>%</text>
        </>
      )}
    </svg>
  );
};

export default function UpdateMetrics({ totalUpdates, increasePercentage, language = "en", status }) {
  const t = (key) => translation[language]?.[key] || key;
  const isRtl = language === "ar";

  const rows = useMemo(
    () => {
      const tr = (key) => translation[language]?.[key] || key;
      return [
        {
          key: "total_updates",
          label: tr("Total updates"),
          formatFn: (val) => (val != null ? val.toLocaleString() : "-"),
        },
        {
          key: "increase_pct",
          label: tr("Increase percentage"),
          formatFn: (val) => (val != null ? (val === 0 ? "0" : `${val.toFixed(2)}%`) : "-"),
          suffixElement: <DirectionArrow value={increasePercentage} />,
          borderColor: increasePercentage < 0 ? colors.nationalityProhibitionRed : colors.primary,
        },
      ];
    },
    [language, increasePercentage],
  );

  const dataMap = useMemo(
    () => ({
      total_updates: totalUpdates,
      increase_pct: increasePercentage,
    }),
    [totalUpdates, increasePercentage],
  );

  const percentIcon = <PercentIcon value={increasePercentage} />;

  return (
    <SectionCard
      title={t("Increase percentage and variances")}
      imageSrc="/customPdf/borderStatistics/summary.png"
      imageAlt="Update Metrics"
      data={dataMap}
      status={status}
      chartColStyle={isRtl ? { paddingRight: "40px", paddingTop: "36px" } : { paddingLeft: "40px", paddingTop: "36px" }}
      isImageWithBorder={true}
      loadingHeight="88px"
      showTitleBesideIcon={true}
      titleStyle={{ textAlign: isRtl ? 'right' : 'left' }}
      titleWrapperStyle={{ maxWidth: '300px' }}
      chart={
        <TreeFlow
          columns={[]}
          rows={rows}
          data={dataMap}
          badge={percentIcon}
          isRtl={isRtl}
          viewWidth={330}
          cellStyle={{
            borderColor: colors.nationalityProhibitionRed,
            bgColor: "transparent",
            labelFontSize: colors.fontSizeXxs,
            valueFontSize: colors.fontSizeMedium,
            style: { minHeight: "24px" },
          }}
          containerStyle={{ padding: "4px 0" }}
        />
      }
    />
  );
}

UpdateMetrics.propTypes = {
  totalUpdates: PropTypes.number,
  increasePercentage: PropTypes.number,
  language: PropTypes.string,
};
