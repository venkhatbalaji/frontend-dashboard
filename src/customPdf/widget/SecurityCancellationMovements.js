import React, { useMemo } from "react";
import PropTypes from "prop-types";
import TreeFlow from "./TreeFlow";
import SectionCard from "./SectionCard";
import { colors } from "../colors";
import translation from "@/views/CustomizedPdf/translation.json";

const ShieldIcon = () => (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L3 7V14C3 20.08 6.84 25.71 12 27.5C17.16 25.71 21 20.08 21 14V7L12 2Z"
      fill={colors.nationalityProhibitionRed}
      opacity="0.15"
      stroke={colors.nationalityProhibitionRed}
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <rect
      x="9"
      y="12"
      width="6"
      height="5"
      rx="0.5"
      fill="none"
      stroke={colors.nationalityProhibitionRed}
      strokeWidth="1"
    />
    <path
      d="M10.5 12V10.5C10.5 9.67 11.17 9 12 9C12.83 9 13.5 9.67 13.5 10.5V12"
      fill="none"
      stroke={colors.nationalityProhibitionRed}
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

export default function SecurityCancellationMovements({
  data,
  status,
  language = "en",
}) {
  const t = (key) => translation[language]?.[key] || key;
  const isRtl = language === "ar";

  const rows = useMemo(
    () => [
      {
        key: "security_cancellation_movements",
        label: t("Security record movements after Cancellation"),
      },
    ],
    [language],
  );

  const dataMap = useMemo(
    () => ({
      security_cancellation_movements:
        data?.security_cancellation_movements ?? 0,
    }),
    [data],
  );

  return (
    <SectionCard
      title={t("Security Cancellation movements")}
      imageSrc="/customPdf/expatsStatistics/people_cross.png"
      imageAlt="Security Cancellation"
      data={dataMap}
      status={status}
      chartColStyle={isRtl ? { paddingRight: "40px", paddingTop: "36px" } : { paddingLeft: "40px", paddingTop: "36px" }}
      isImageWithBorder={true}
      loadingHeight="45px"
      showTitleBesideIcon={true}
      titleStyle={{ textAlign: isRtl ? 'right' : 'left' }}
      titleWrapperStyle={{ maxWidth: '300px' }}
      chart={
        <TreeFlow
          columns={[]}
          rows={rows}
          data={dataMap}
          badge={<ShieldIcon />}
          isRtl={isRtl}
          viewWidth={330}
          cellStyle={{
            borderColor: colors.nationalityProhibitionRed,
            bgColor: "transparent",
            labelFontSize: colors.fontSizeXxs,
            valueFontSize: colors.fontSizeMedium,
            style: { minHeight: "24px" },
          }}
          containerStyle={{ padding: "0", maxHeight: "32px" }}
        />
      }
    />
  );
}

SecurityCancellationMovements.propTypes = {
  data: PropTypes.object,
  status: PropTypes.string,
  language: PropTypes.string,
};
