import React from "react";
import PropTypes from "prop-types";
import SectionCard from "./SectionCard";
import { colors } from "../colors";
import { formatNumber } from "@/utils/helper";
import translation from "@/views/CustomizedPdf/translation.json";

const LINE_COLOR = colors.border;
const LINE_WIDTH = 1;

/**
 * Pure SVG tree for "Resident cancellation movements".
 *
 * Left-to-right flow:
 *
 *   [SectionCard icon+title]  [Prohibition] → [Total box] → trunk → [4 branch boxes]
 *                                                                         |
 *                                                               (last row sub-breakdown)
 */
export default function ResidentBreakdownTree({ data, status, language = "en" }) {
  const t = (key) => translation[language]?.[key] || key;
  const fmt = (num) => {
    if (num === null || num === undefined || num === "") return "-";
    return formatNumber(Number(num) || 0);
  };

  const isRtl = language === "ar";
  const textFlipStyle = isRtl ? { transform: "scaleX(-1)" } : undefined;
  const stroke = LINE_COLOR;
  const NOTCH = 6;

  const branches = [
    { key: "other_resident_visas", label: t("Other residency holders"), bg: colors.nationalityOtherResidentsBg },
    { key: "golden_visa_holders", label: t("Golden Visa Holders"), bg: colors.nationalityGoldenVisaBg },
    { key: "resident_outside_country", label: t("Outside the country"), bg: colors.nationalityOutsideCountryBg },
    { key: "resident_inside_country", label: t("Inside the country"), bg: colors.nationalityInsideCountryBg },
  ];

  // --- Layout constants (viewBox units) ---
  const ROW_H = 28;
  const ROW_GAP = 15;
  const BOX_W = 100;
  const TOTAL_BOX_W = 80;
  const TOTAL_BOX_H = 36;
  const TRUNK_GAP = 14;
  const PAD_X = 6;
  const PAD_Y = 3;
  const ICON_SIZE = 20;
  const ICON_GAP = 8;

  const SUB_BOX_W = 80;
  const SUB_BOX_H = 24;
  const SUB_GAP = 14;
  const SUB_DROP = 20;

  const rowCount = branches.length;
  const totalRowsH = rowCount * ROW_H + (rowCount - 1) * ROW_GAP;
  const blockCY = totalRowsH / 2;

  // Prohibition icon is leftmost
  const iconCX = ICON_SIZE / 2;
  const iconCY = blockCY;

  // Total box after icon
  const totalX = ICON_SIZE + ICON_GAP;
  const totalCY = blockCY;
  const totalY = totalCY - TOTAL_BOX_H / 2;

  // Trunk X
  const trunkX = totalX + TOTAL_BOX_W + TRUNK_GAP;
  const cellsLeft = trunkX + TRUNK_GAP;

  const getRowCY = (i) => i * (ROW_H + ROW_GAP) + ROW_H / 2;

  // Sub-breakdown
  const lastRowBottom = (rowCount - 1) * (ROW_H + ROW_GAP) + ROW_H;
  const subRowCY = lastRowBottom + SUB_DROP + SUB_BOX_H / 2;
  const sub1X = cellsLeft;
  const sub2X = cellsLeft + SUB_BOX_W + SUB_GAP;

  const SUB_LABEL_H = 12;

  const STANDARD_VIEW_W = 330;
  const viewW = STANDARD_VIEW_W;
  const LABEL_W = viewW - (cellsLeft + BOX_W + 6);
  const viewH = subRowCY + SUB_BOX_H / 2 + SUB_LABEL_H + 10;

  // Helper: flag/tab path (notched top-right corner)
  const flagPath = (x, y, w, h) => [
    `M${x},${y}`,
    `L${x + w - NOTCH},${y}`,
    `L${x + w},${y + NOTCH}`,
    `L${x + w},${y + h}`,
    `L${x},${y + h}`,
    "Z",
  ].join(" ");

  // --- Build SVG ---
  const svgLines = [];
  const svgElements = [];

  // 1. Prohibition icon (leftmost, before the root box)
  const iconR = ICON_SIZE / 2 - 1;
  svgElements.push(
    <g key="prohibition-icon">
      <circle cx={iconCX} cy={iconCY} r={iconR} fill="none" stroke={colors.nationalityProhibitionRed} strokeWidth={1.5} />
      <line
        x1={iconCX - iconR * 0.7}
        y1={iconCY - iconR * 0.7}
        x2={iconCX + iconR * 0.7}
        y2={iconCY + iconR * 0.7}
        stroke={colors.nationalityProhibitionRed}
        strokeWidth={1.5}
      />
    </g>,
  );

  // Connector: icon → total box
  svgLines.push(
    <line key="icon-to-total" x1={ICON_SIZE} y1={totalCY} x2={totalX} y2={totalCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
  );

  // 2. Total box — flag/tab shape
  svgElements.push(
    <g key="total-box">
      <path d={flagPath(totalX, totalY, TOTAL_BOX_W, TOTAL_BOX_H)} fill="transparent" stroke={colors.border} strokeWidth={0.8} strokeLinejoin="round" />
      <foreignObject x={totalX} y={totalY} width={TOTAL_BOX_W} height={TOTAL_BOX_H}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            ...textFlipStyle,
          }}
        >
          <span style={{ fontSize: colors.fontSizeMedium, fontWeight: "bold", color: colors.textBlack }}>
            {fmt(data?.resident_cancellation_movements)}
          </span>
        </div>
      </foreignObject>
    </g>,
  );

  // 3. Connector: total right edge → trunk
  svgLines.push(
    <line key="total-to-trunk" x1={totalX + TOTAL_BOX_W} y1={totalCY} x2={trunkX} y2={totalCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
  );

  // 4. Vertical trunk spanning all 4 rows
  const firstRowCY = getRowCY(0);
  const lastRowCY = getRowCY(rowCount - 1);
  svgLines.push(
    <line key="trunk-v" x1={trunkX} y1={firstRowCY} x2={trunkX} y2={lastRowCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
  );

  // 5. Branch lines + row boxes (flag/tab shape) + labels
  branches.forEach((branch, i) => {
    const cy = getRowCY(i);
    const rowY = cy - ROW_H / 2;
    const isTerminal = i !== rowCount - 1;

    svgLines.push(
      <line
        key={`branch-${i}`}
        x1={trunkX}
        y1={cy}
        x2={cellsLeft}
        y2={cy}
        stroke={stroke}
        strokeWidth={LINE_WIDTH}
        markerEnd={isTerminal ? "url(#rbt-arrow)" : undefined}
      />
    );

    svgElements.push(
      <g key={`row-${i}`}>
        <path
          d={flagPath(cellsLeft, rowY, BOX_W, ROW_H)}
          fill={branch.bg}
          stroke={colors.border}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        <foreignObject x={cellsLeft + PAD_X} y={rowY + PAD_Y} width={BOX_W - PAD_X * 2} height={ROW_H - PAD_Y * 2}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              ...textFlipStyle,
            }}
          >
            <span style={{
              fontSize: colors.fontSizeXxs,
              fontWeight: "bold",
              color: colors.textBlack,
              whiteSpace: "nowrap",
            }}>
              {fmt(data?.[branch.key])}
            </span>
          </div>
        </foreignObject>
        <foreignObject x={cellsLeft + BOX_W + 6} y={rowY} width={LABEL_W} height={ROW_H}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              ...textFlipStyle,
            }}
          >
            <span style={{
              fontSize: colors.fontSizeXxs,
              color: colors.textSecondary,
              lineHeight: "1.2",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}>
              {branch.label}
            </span>
          </div>
        </foreignObject>
      </g>,
    );
  });

  // 6. Sub-breakdown connectors from "Inside the country" (last row)
  const insideBoxBottom = getRowCY(rowCount - 1) + ROW_H / 2;
  const subJunctionY = insideBoxBottom + SUB_DROP / 2;
  const subBoxY = subRowCY - SUB_BOX_H / 2;

  svgLines.push(
    <line key="sub-drop-v" x1={cellsLeft + BOX_W / 2} y1={insideBoxBottom} x2={cellsLeft + BOX_W / 2} y2={subJunctionY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
  );

  const subMidX1 = sub1X + SUB_BOX_W / 2;
  const subMidX2 = sub2X + SUB_BOX_W / 2;
  svgLines.push(
    <line key="sub-junction-h" x1={subMidX1} y1={subJunctionY} x2={subMidX2} y2={subJunctionY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
  );
  svgLines.push(
    <line key="sub-drop-1" x1={subMidX1} y1={subJunctionY} x2={subMidX1} y2={subBoxY} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#rbt-arrow)" />,
  );
  svgLines.push(
    <line key="sub-drop-2" x1={subMidX2} y1={subJunctionY} x2={subMidX2} y2={subBoxY} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#rbt-arrow)" />,
  );

  // 7. Sub-breakdown boxes
  const subColors = [
    { bg: colors.uaeNationalsColor, border: colors.nationalitySubBorderBlue },
    { bg: colors.nationalitySubBgPink, border: colors.nationalitySubBorderPink },
  ];
  const subValues = [data?.sub_breakdown_1, data?.sub_breakdown_2];

  const subLabels = [t("Grace Period"), t("Illegal")];

  subValues.forEach((val, i) => {
    const sx = i === 0 ? sub1X : sub2X;
    const sc = subColors[i];
    svgElements.push(
      <g key={`sub-${i}`}>
        <path
          d={flagPath(sx, subBoxY, SUB_BOX_W, SUB_BOX_H)}
          fill={sc.bg}
          stroke={sc.border}
          strokeWidth={0.8}
          strokeLinejoin="round"
        />
        <foreignObject x={sx} y={subBoxY} width={SUB_BOX_W} height={SUB_BOX_H}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              ...textFlipStyle,
            }}
          >
            <span style={{ fontSize: colors.fontSizeXxs, fontWeight: "bold", color: colors.textBlack }}>
              {fmt(val)}
            </span>
          </div>
        </foreignObject>
        <foreignObject x={sx} y={subBoxY + SUB_BOX_H + 4} width={SUB_BOX_W} height={SUB_LABEL_H}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              height: "100%",
              ...textFlipStyle,
            }}
          >
            <span style={{ fontSize: colors.fontSizeXxs, color: colors.textSecondary, textAlign: "center" }}>
              {subLabels[i]}
            </span>
          </div>
        </foreignObject>
      </g>,
    );
  });

  const chart = (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`-2 -2 ${viewW + 4} ${viewH + 4}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <marker
            id="rbt-arrow"
            markerWidth="4"
            markerHeight="4"
            refX="3.5"
            refY="2"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M0,0 L4,2 L0,4 z" fill={stroke} />
          </marker>
        </defs>
        <g transform={isRtl ? `translate(${viewW}, 0) scale(-1, 1)` : undefined}>
          {svgLines}
          {svgElements}
        </g>
      </svg>
    </div>
  );

  return (
    <SectionCard
      title={t("Resident cancellation movements")}
      imageSrc="/customPdf/riskRegister/risk.png"
      showTitleBesideIcon
      titleStyle={{ textAlign: isRtl ? 'right' : 'left' }}
      imageAlt="Summary"
      isImageWithBorder
      status={status}
      data={data}
      chartColStyle={isRtl ? { paddingRight: "40px", paddingTop: "30px" } : { paddingLeft: "40px", paddingTop: "30px" }}
      loadingHeight="265px"
      chart={chart}
      titleWrapperStyle={{ maxWidth: '300px' }}
    />
  );
}

ResidentBreakdownTree.propTypes = {
  data: PropTypes.object,
  status: PropTypes.string,
  language: PropTypes.string,
};
