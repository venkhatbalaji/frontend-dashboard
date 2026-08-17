/* eslint-disable @next/next/no-img-element */
import React from "react";
import PropTypes from "prop-types";
import { colors } from "../colors";

const LINE_COLOR = colors.border;
const LINE_WIDTH = 1;

/**
 * Pure SVG tree visualization flowing left-to-right:
 *
 *   [SourceNode] --- [trunk] --+-- [totalCell?] -- [col1Cell] [col2Cell]
 *                              +-- [totalCell?] -- [col1Cell] [col2Cell]
 *
 * All coordinates are computed from row/column counts and fixed layout
 * constants within a viewBox. No DOM measurement needed.
 */
export default function TreeFlow({
  columns = [],
  rows = [],
  data = {},
  showTotal = false,
  totalValue,
  totalLabel,
  badge,
  footer,
  connectorColor,
  cellStyle = {},
  totalCellStyle = {},
  containerStyle = {},
  formatValue,
  columnHeaderStyle = {},
  middleIcon,
  isRtl = false,
  viewWidth,
}) {
  const stroke = connectorColor || LINE_COLOR;
  const textFlipStyle = isRtl ? { transform: "scaleX(-1)" } : undefined;

  const defaultFormat = (val) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "number") return val.toLocaleString();
    return val;
  };
  const fmt = formatValue || defaultFormat;

  const hasColumns = columns.length > 0;
  const hasSingleTotal = totalValue !== undefined && totalValue !== null;
  const hasPerRowTotals = showTotal && !hasSingleTotal && hasColumns;
  const rowCount = rows.length;

  const getRowTotal = (rowKey) => {
    if (!hasColumns) return 0;
    return columns.reduce((sum, col) => {
      const v = data?.[col.key]?.[rowKey];
      return sum + (typeof v === "number" ? v : 0);
    }, 0);
  };

  // --- Layout constants (viewBox units) ---
  const ROW_H = 28;
  const ROW_GAP = 15;
  const COL_GAP = 10;
  const HEADER_H = hasColumns ? 28 : 0;
  const TOTAL_W = hasSingleTotal ? 80 : hasPerRowTotals ? 80 : 0;
  const TRUNK_GAP = 10;
  const CELL_PAD_X = 6;
  const CELL_PAD_Y = 3;
  const FOOTER_H = footer ? 40 : 0;

  const colCount = hasColumns ? columns.length : 1;
  const totalRowsH = rowCount * ROW_H + (rowCount - 1) * ROW_GAP;
  const contentH = HEADER_H + totalRowsH + FOOTER_H;

  const isStringBadge = typeof badge === "string";
  const BADGE_H = badge ? (isStringBadge ? 14 : 36) : 0;
  const BADGE_W = badge ? (isStringBadge ? 32 : 24) : 0;
  const BADGE_GAP = badge ? 6 : 0;
  const rootLeft = BADGE_W + BADGE_GAP;
  const trunkX = rootLeft;
  const totalLeft = rootLeft + TRUNK_GAP;
  const cellsLeft = TOTAL_W > 0 ? totalLeft + TOTAL_W + TRUNK_GAP + 4 : rootLeft + TRUNK_GAP;

  const STANDARD_VIEW_W = viewWidth || 250;
  const CONTENT_AREA_W = Math.max(STANDARD_VIEW_W - cellsLeft - 4, 200);
  const ROW_LABEL_W = hasColumns ? 100 : 0;
  const CELL_AREA_W = CONTENT_AREA_W - ROW_LABEL_W;
  const NO_COL_BOX_W = 100;
  const NO_COL_LABEL_LEFT = cellsLeft + NO_COL_BOX_W + 6;
  const cellW = (CELL_AREA_W - (colCount - 1) * COL_GAP) / colCount;

  const viewW = STANDARD_VIEW_W;
  const viewH = Math.max(contentH + 10, 60);

  const sourceCY = HEADER_H + totalRowsH / 2;

  const getRowCY = (rowIndex) => HEADER_H + rowIndex * (ROW_H + ROW_GAP) + ROW_H / 2;

  // --- Render helpers ---
  const renderValueBox = (x, y, w, h, value, bgColor, borderColor) => {
    const bg = bgColor || "transparent";
    const border = borderColor || colors.border;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={2} fill={bg} stroke={border} strokeWidth={0.8} />
        <foreignObject x={x + CELL_PAD_X} y={y + CELL_PAD_Y} width={w - CELL_PAD_X * 2} height={h - CELL_PAD_Y * 2}>
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
              fontSize: cellStyle.valueFontSize || colors.fontSizeXs,
              fontWeight: "bold",
              color: cellStyle.textColor || colors.textBlack,
              whiteSpace: "nowrap",
            }}>
              {value}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  const renderTotalCell = (x, y, w, h, value) => {
    const notch = 6;
    const d = [
      `M${x},${y}`,
      `L${x + w - notch},${y}`,
      `L${x + w},${y + notch}`,
      `L${x + w},${y + h}`,
      `L${x},${y + h}`,
      "Z",
    ].join(" ");

    return (
      <g>
        <path d={d} fill="transparent" stroke={colors.border} strokeWidth={0.8} strokeLinejoin="round" />
        <foreignObject x={x} y={y} width={w} height={h}>
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
              {value}
            </span>
          </div>
        </foreignObject>
      </g>
    );
  };

  // --- Build SVG ---
  const svgLines = [];
  const svgElements = [];

  // Badge as the root element — leftmost point of the tree
  if (badge) {
    if (typeof badge === "string") {
      svgElements.push(
        <g key="badge">
          <rect
            x={0}
            y={sourceCY - BADGE_H / 2}
            width={BADGE_W}
            height={BADGE_H}
            rx={BADGE_H / 2}
            fill={colors.primary}
          />
          <foreignObject x={0} y={sourceCY - BADGE_H / 2} width={BADGE_W} height={BADGE_H}>
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
              <span style={{ fontSize: colors.fontSizeXxs, fontWeight: "bold", color: colors.bgContainer }}>{badge}</span>
            </div>
          </foreignObject>
        </g>,
      );
    } else {
      svgElements.push(
        <foreignObject
          key="badge"
          x={0}
          y={sourceCY - BADGE_H / 2}
          width={BADGE_W}
          height={BADGE_H}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...textFlipStyle,
            }}
          >
            {badge}
          </div>
        </foreignObject>,
      );
    }

    // Connector from badge to trunk
    svgLines.push(
      <line key="badge-to-trunk" x1={BADGE_W} y1={sourceCY} x2={trunkX} y2={sourceCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
    );
  }

  if (hasSingleTotal) {
    const totalCellW = TOTAL_W;
    const totalCellH = Math.min(totalRowsH, 36);
    const totalX = totalLeft;
    const totalY = sourceCY - totalCellH / 2;

    svgLines.push(
      <line key="trunk-to-total" x1={trunkX} y1={sourceCY} x2={totalX} y2={sourceCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
    );

    svgElements.push(
      <g key="single-total">{renderTotalCell(totalX, totalY, totalCellW, totalCellH, fmt(totalValue))}</g>,
    );

    const branchStartX = totalX + totalCellW;
    const branchTrunkX = branchStartX + 6;
    const firstRowCY = getRowCY(0);
    const lastRowCY = getRowCY(rowCount - 1);

    svgLines.push(
      <line key="total-trunk-h" x1={branchStartX} y1={sourceCY} x2={branchTrunkX} y2={sourceCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
    );

    if (rowCount > 1) {
      svgLines.push(
        <line key="total-trunk-v" x1={branchTrunkX} y1={firstRowCY} x2={branchTrunkX} y2={lastRowCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
      );
    }

    rows.forEach((_, i) => {
      const cy = getRowCY(i);
      svgLines.push(
        <line key={`total-branch-${i}`} x1={branchTrunkX} y1={cy} x2={cellsLeft} y2={cy} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#treeflow-arrow)" />,
      );
    });
  } else if (hasPerRowTotals) {
    const firstRowCY = getRowCY(0);
    const lastRowCY = getRowCY(rowCount - 1);

    if (rowCount > 1) {
      svgLines.push(
        <line key="trunk-v" x1={trunkX} y1={firstRowCY} x2={trunkX} y2={lastRowCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
      );
    }

    rows.forEach((row, i) => {
      const cy = getRowCY(i);
      const totalCellX = totalLeft;
      const totalCellW2 = TOTAL_W;
      const totalCellH2 = ROW_H;
      const totalY2 = cy - totalCellH2 / 2;

      svgLines.push(
        <line key={`trunk-to-total-${i}`} x1={trunkX} y1={cy} x2={totalCellX} y2={cy} stroke={stroke} strokeWidth={LINE_WIDTH} />,
      );

      svgElements.push(
        <g key={`per-row-total-${i}`}>{renderTotalCell(totalCellX, totalY2, totalCellW2, totalCellH2, fmt(getRowTotal(row.key)))}</g>,
      );

      svgLines.push(
        <line key={`total-to-cells-${i}`} x1={totalCellX + totalCellW2} y1={cy} x2={cellsLeft} y2={cy} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#treeflow-arrow)" />,
      );
    });
  } else {
    const firstRowCY = getRowCY(0);
    const lastRowCY = getRowCY(rowCount - 1);

    if (rowCount > 1) {
      svgLines.push(
        <line key="trunk-v" x1={trunkX} y1={firstRowCY} x2={trunkX} y2={lastRowCY} stroke={stroke} strokeWidth={LINE_WIDTH} />,
      );
    }

    if (middleIcon && rowCount > 1) {
      const iconSize = 30;
      const firstCY = getRowCY(0);
      const lastCY = getRowCY(rowCount - 1);
      const iconCY = (firstCY + lastCY) / 2;

      // Vertical trunk: top row to icon, then icon to bottom row
      svgLines.push(
        <line key="trunk-v-top" x1={trunkX} y1={firstCY} x2={trunkX} y2={iconCY - iconSize / 2} stroke={stroke} strokeWidth={LINE_WIDTH} />,
      );
      svgLines.push(
        <line key="trunk-v-bottom" x1={trunkX} y1={iconCY + iconSize / 2} x2={trunkX} y2={lastCY} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#treeflow-arrow)" />,
      );

      svgElements.push(
        <foreignObject
          key="middle-icon"
          x={trunkX - iconSize / 2}
          y={iconCY - iconSize / 2}
          width={iconSize}
          height={iconSize}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...textFlipStyle,
            }}
          >
            {middleIcon}
          </div>
        </foreignObject>,
      );

      rows.forEach((_, i) => {
        const cy = getRowCY(i);
        svgLines.push(
          <line key={`trunk-to-row-${i}`} x1={trunkX} y1={cy} x2={cellsLeft} y2={cy} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#treeflow-arrow)" />,
        );
      });
    } else {
      rows.forEach((_, i) => {
        const cy = getRowCY(i);
        svgLines.push(
          <line key={`trunk-to-row-${i}`} x1={trunkX} y1={cy} x2={cellsLeft} y2={cy} stroke={stroke} strokeWidth={LINE_WIDTH} markerEnd="url(#treeflow-arrow)" />,
        );
      });
    }
  }

  // Column headers
  if (hasColumns) {
    columns.forEach((col, ci) => {
      const x = cellsLeft + ci * (cellW + COL_GAP);
      svgElements.push(
        <foreignObject
          key={`col-header-${ci}`}
          x={x}
          y={0}
          width={cellW}
          height={HEADER_H}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              textAlign: "center",
              ...textFlipStyle,
            }}
          >
            <span style={{
              fontSize: colors.fontSizeXs,
              fontWeight: "500",
              color: colors.textSecondary,
              lineHeight: "1.2",
              wordWrap: "break-word",
              ...columnHeaderStyle,
            }}>
              {col.label}
            </span>
          </div>
        </foreignObject>,
      );
    });
  }

  // Data rows
  rows.forEach((row, ri) => {
    const rowY = HEADER_H + ri * (ROW_H + ROW_GAP);

    if (!hasColumns) {
      const val = data?.[row.key];
      const displayVal = row.formatFn ? row.formatFn(val) : fmt(val);
      let suffix = "";
      if (row.suffix) suffix = row.suffix;

      const borderCol = cellStyle.borderColor || colors.border;
      const bgCol = cellStyle.bgColor || "transparent";

      const boxX = cellsLeft;
      const labelX = NO_COL_LABEL_LEFT;
      const labelW = CELL_AREA_W - NO_COL_BOX_W - 6;

      svgElements.push(
        <g key={`row-${ri}`}>
          {/* Value box (left, small) — flag/tab shape matching Summary card */}
          <path
            d={`M${boxX},${rowY} L${boxX + NO_COL_BOX_W - 6},${rowY} L${boxX + NO_COL_BOX_W},${rowY + 6} L${boxX + NO_COL_BOX_W},${rowY + ROW_H} L${boxX},${rowY + ROW_H} Z`}
            fill={bgCol}
            stroke={borderCol}
            strokeWidth={0.8}
            strokeLinejoin="round"
          />
          <foreignObject x={boxX + CELL_PAD_X} y={rowY + CELL_PAD_Y} width={NO_COL_BOX_W - CELL_PAD_X * 2} height={ROW_H - CELL_PAD_Y * 2}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                gap: "2px",
                ...textFlipStyle,
              }}
            >
              <span style={{
                fontSize: cellStyle.valueFontSize || colors.fontSizeXs,
                fontWeight: "bold",
                color: cellStyle.textColor || colors.textBlack,
                display: "flex",
                alignItems: "center",
                gap: "2px",
              }}>
                {displayVal}{suffix}
                {row.suffixElement}
              </span>
            </div>
          </foreignObject>
          {/* Label outside the box */}
          <foreignObject x={labelX} y={rowY} width={labelW} height={ROW_H}>
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                height: "100%",
                paddingLeft: "2px",
                ...textFlipStyle,
              }}
            >
              <span style={{
                fontSize: cellStyle.labelFontSize || colors.fontSizeXs,
                color: colors.textSecondary,
                lineHeight: "1.2",
              }}>
                {row.label}
              </span>
            </div>
          </foreignObject>
        </g>,
      );
    } else {
      columns.forEach((col, ci) => {
        const x = cellsLeft + ci * (cellW + COL_GAP);
        const val = data?.[col.key]?.[row.key];
        const bgCol = col.cellBg || cellStyle.bgColor || "transparent";
        const borderCol = col.cellBorder || cellStyle.borderColor || colors.border;

        svgElements.push(
          <g key={`row-${ri}-col-${ci}`}>
            {renderValueBox(x, rowY, cellW, ROW_H, fmt(val), bgCol, borderCol)}
          </g>,
        );
      });

      // Row label once, after all value boxes
      const labelX = cellsLeft + CELL_AREA_W + 6;
      svgElements.push(
        <foreignObject key={`row-${ri}-label`} x={labelX} y={rowY} width={ROW_LABEL_W - 6} height={ROW_H}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              height: "100%",
              ...textFlipStyle,
            }}
          >
            <span style={{
              fontSize: cellStyle.labelFontSize || colors.fontSizeXs,
              color: colors.textSecondary,
              lineHeight: "1.2",
            }}>
              {row.label}
            </span>
          </div>
        </foreignObject>,
      );
    }
  });

  // Dividers between columns and rows
  if (hasColumns && columns.length > 1) {
    // Vertical divider always present in COL_GAP between columns
    columns.slice(1).forEach((_, di) => {
      const divX = cellsLeft + (di + 1) * (cellW + COL_GAP) - COL_GAP / 2;
      const topY = HEADER_H;
      const bottomY = HEADER_H + totalRowsH;
      svgElements.push(
        <line key={`col-vdiv-${di}`} x1={divX} y1={topY} x2={divX} y2={bottomY} stroke={colors.border} strokeWidth={0.6} />,
      );
    });

    // Horizontal divider between rows — only for per-row totals (different roots)
    if (hasPerRowTotals && rows.length > 1) {
      rows.slice(1).forEach((_, ri) => {
        const divY = HEADER_H + (ri + 1) * (ROW_H + ROW_GAP) - ROW_GAP / 2;
        const leftX = cellsLeft;
        const rightX = cellsLeft + CELL_AREA_W;
        svgElements.push(
          <line key={`row-hdiv-${ri}`} x1={leftX} y1={divY} x2={rightX} y2={divY} stroke={colors.border} strokeWidth={0.6} />,
        );
      });
    }
  }

  // Footer
  if (footer) {
    const footerY = HEADER_H + totalRowsH + 15;
    svgElements.push(
      <foreignObject key="footer" x={0} y={footerY} width={cellsLeft + CONTENT_AREA_W} height={FOOTER_H}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            fontSize: colors.fontSizeXxs,
            color: colors.textDescription,
            lineHeight: "1.3",
            ...textFlipStyle,
          }}
        >
          {footer}
        </div>
      </foreignObject>,
    );
  }

  return (
    <div style={{ width: "100%", ...containerStyle }}>
      <svg
        viewBox={`-2 -2 ${viewW + 4} ${viewH + 4}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <marker
            id="treeflow-arrow"
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
}

TreeFlow.propTypes = {
  badge: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      cellBg: PropTypes.string,
      cellBorder: PropTypes.string,
    }),
  ),
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      suffix: PropTypes.string,
      suffixElement: PropTypes.node,
      formatFn: PropTypes.func,
    }),
  ),
  data: PropTypes.object,
  showTotal: PropTypes.bool,
  totalValue: PropTypes.number,
  totalLabel: PropTypes.string,
  footer: PropTypes.node,
  connectorColor: PropTypes.string,
  cellStyle: PropTypes.object,
  totalCellStyle: PropTypes.object,
  containerStyle: PropTypes.object,
  formatValue: PropTypes.func,
  columnHeaderStyle: PropTypes.object,
  middleIcon: PropTypes.node,
  isRtl: PropTypes.bool,
};
