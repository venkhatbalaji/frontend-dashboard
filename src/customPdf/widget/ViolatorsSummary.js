import React from "react";
import PropTypes from "prop-types";
import SectionCard from "./SectionCard";
import { Row, Col, Text, Card } from "re-usable-design-components";
import { colors } from "../colors";
import { formatNumber } from "@/utils/helper";

export default function ViolatorsSummary({
  totalViolators = "0",
  visaViolators = "0",
  totalViolatorsLabel1,
  visaViolatorsLabel1,
  totalViolatorsLabel2,
  visaViolatorsLabel2,
  residencyViolators = "0",
  title ,
  centerLabel1,
  imageAlt,
  imageSrc = summaryViolator,
  status,
  data
}) {
 
  // Format number helper
  const formatNumberForDisplay = (num) => {
    if (num === null || num === undefined) return '0';
    return formatNumber(Number(num) || 0);
  };
 
  // Layout constants for chart + connectors + cards
  const CHART_W = 330; // increased width to accommodate cards
  const CHART_H = 240; // increased height to accommodate cards
  const CONTAINER_H = 170; // increased height to accommodate cards
  // Visual ring settings
  const strokeWidth = 10;
  const radius = 78; // ring radius
  const centerX = CHART_W / 2; // center horizontally
  const centerY = 82; // center vertically within upper half

  // Card colors
  const VISA_BG = colors.chipPrimary;
  const RES_BG = colors.chipSecondary;

  // Box dimensions - easy to control!
  const BOX_WIDTH = 100;
  const BOX_HEIGHT = 40;

  // Card component similar to ViolatorSummary.js
  const Card = ({ centerX, cardTopY, color, direction, number, label1, label2 }) => {
    const height = BOX_HEIGHT;
    const bottomY = cardTopY + height;
    const slantX = 10;
    const slantY = 10;
    const bottomWidth = BOX_WIDTH;
    const verticalPart = height - slantY;

    let d = "";
    if (direction === "left") {
      const leftBottomX = centerX - bottomWidth / 2;
      const rightBottomX = centerX + bottomWidth / 2;
      const leftTopX = leftBottomX + slantX;
      const rightTopX = rightBottomX;
      const slantPointY = bottomY - verticalPart;
      d = `M${leftTopX},${cardTopY} L${rightTopX},${cardTopY} L${rightBottomX},${bottomY} L${leftBottomX},${bottomY} L${leftBottomX},${slantPointY} Z`;
    } else { // right
      const leftBottomX = centerX - bottomWidth / 2;
      const rightBottomX = centerX + bottomWidth / 2;
      const leftTopX = leftBottomX;
      const rightTopX = rightBottomX - slantX;
      const slantPointY = cardTopY + slantY;
      d = `M${leftTopX},${cardTopY} L${rightTopX},${cardTopY} L${rightBottomX},${slantPointY} L${rightBottomX},${bottomY} L${leftBottomX},${bottomY} Z`;
    }

    return (
      <g>
        <path d={d} fill={color} stroke={colors.chipBorder} strokeWidth={0.5} />
        <text
          x={centerX}
          y={2 + cardTopY + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontWeight="bold"
          fontSize="14"
          fontFamily={colors.fontFamily}
          fill={colors.text}
        >
          {number}
        </text>
        <foreignObject
          x={centerX - 60}
          y={bottomY + 12}
          width="110"
          height="40"
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              fontSize: "13px",
              color: colors.text,
              textAlign: "center",
              maxWidth: "90px",
              width: "90px",
              wordWrap: "break-word",
              lineHeight: "1.2"
            }}
          >
            <div>{label1}</div>
            <div style={{ marginTop: "3px" }}>{label2}</div>
          </div>
        </foreignObject>
      </g>
    );
  };

  // Helpers
  const getPointOnCircle = (angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180; // -90 to start from top
    const x = centerX + radius * Math.cos(angleInRadians);
    const y = centerY + radius * Math.sin(angleInRadians);
    return { x, y };
  };

  // Segments with gaps
  const segments = [0, 60, 120, 180, 240, 300].map((startAngle, index) => {
    const visualArc = 60;
    const capAngleDeg = (strokeWidth / 2 / radius) * (180 / Math.PI);
    const epsilon = 0.25;
    const pathStartAngle = startAngle + capAngleDeg + epsilon;
    const pathEndAngle = startAngle + visualArc - capAngleDeg - epsilon;
    const sp = getPointOnCircle(pathStartAngle);
    const ep = getPointOnCircle(pathEndAngle);
    const largeArcFlag = visualArc > 180 ? 1 : 0;
    return {
      id: index + 1,
      d: `M ${sp.x} ${sp.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${ep.x} ${ep.y}`,
    };
  });

  // Connector geometry (elbows go outward from ring -> down to cards)
  const ARROW_Y = 110; // fixed position for arrow tip to ensure cards are visible
  const STUB = 30; // horizontal distance moving outward before dropping
  const ANCHOR_Y = centerY; // start from the vertical middle of the ring

  // Ring outer edge (just outside ring stroke)
  const RING_OUTER = radius + strokeWidth / 2;
  const LEFT_ANCHOR_X = centerX - (RING_OUTER + 2); // a hair outside left ring edge
  const RIGHT_ANCHOR_X = centerX + (RING_OUTER + 2); // a hair outside right ring edge

  // Vertical legs positioned outward from the ring
  const LEFT_VERTICAL_X = LEFT_ANCHOR_X - STUB; // move further left (outward)
  const RIGHT_VERTICAL_X = RIGHT_ANCHOR_X + STUB; // move further right (outward)

  const connectors = [
    {
      key: "visa",
      path: `M ${LEFT_ANCHOR_X} ${ANCHOR_Y} L ${LEFT_VERTICAL_X} ${ANCHOR_Y} L ${LEFT_VERTICAL_X} ${ARROW_Y}`,
      arrow: `M ${LEFT_VERTICAL_X - 4} ${ARROW_Y - 6
      } L ${LEFT_VERTICAL_X} ${ARROW_Y} L ${LEFT_VERTICAL_X + 4} ${ARROW_Y - 6
      }`,
    },
    {
      key: "residency",
      path: `M ${RIGHT_ANCHOR_X} ${ANCHOR_Y} L ${RIGHT_VERTICAL_X} ${ANCHOR_Y} L ${RIGHT_VERTICAL_X} ${ARROW_Y}`,
      arrow: `M ${RIGHT_VERTICAL_X - 4} ${ARROW_Y - 6
      } L ${RIGHT_VERTICAL_X} ${ARROW_Y} L ${RIGHT_VERTICAL_X + 4} ${ARROW_Y - 6
      }`,
    },
  ];

  const ViolatorChart = (
    <>
      {/* Chart + Connectors + Cards */}
      <Row justify="center" style={{ marginBottom: 12 }}>
        <Col>
          <div
            style={{
              width: CHART_W,
              height: CONTAINER_H,
              position: "relative",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                position: "relative",
                transform: "scale(0.75)",
                transformOrigin: "top right",
              }}
            >
              <svg
                width={CHART_W}
                height={CHART_H}
                viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                style={{ position: "absolute", inset: 0 }}
              >
                {/* Connectors behind the ring */}
                <g
                  stroke={colors.border}
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity="0.35"
                >
                  {connectors.map((c) => (
                    <path key={`c-${c.key}`} d={c.path} />
                  ))}
                </g>

                {/* Ring on top */}
                {segments.map((s) => (
                  <path
                    key={s.id}
                    d={s.d}
                    stroke={colors.textDescription}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Left side card and lines */}
                <line
                  x1={LEFT_VERTICAL_X}
                  y1={ARROW_Y}
                  x2={LEFT_VERTICAL_X}
                  y2={ARROW_Y + 34}
                  stroke={colors.border}
                  strokeWidth="0.7"
                  markerEnd="url(#arrow)"
                />
                <Card
                  centerX={LEFT_VERTICAL_X}
                  cardTopY={154}
                  color={VISA_BG}
                  direction="left"
                  number={formatNumberForDisplay(visaViolators)}
                  label1={totalViolatorsLabel1}
                  label2={totalViolatorsLabel2}
                />

                {/* Right side card and lines */}
                <line
                  x1={RIGHT_VERTICAL_X}
                  y1={ARROW_Y}
                  x2={RIGHT_VERTICAL_X}
                  y2={ARROW_Y + 34}
                  stroke={colors.border}
                  strokeWidth="0.7"
                  markerEnd="url(#arrow)"
                />
                <Card
                  centerX={RIGHT_VERTICAL_X}
                  cardTopY={154}
                  color={RES_BG}
                  direction="right"
                  number={formatNumberForDisplay(residencyViolators)}
                  label1={visaViolatorsLabel1}
                  label2={visaViolatorsLabel2}
                />
              </svg>

              {/* Center labels */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: centerY - 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  pointerEvents: "none",
                  textAlign: "center",
                }}
              >
                <Text style={{ color: colors.text, fontSize: "13px" }}>
                  {centerLabel1}
                </Text>
                <Text style={{ color: colors.text }} strong size="lg">
                  {formatNumberForDisplay(totalViolators)}
                </Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </>
  );

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      isImageWithBorder={true}
      forceLeftPosition={true}
      imageAlt={imageAlt}
      chart={ViolatorChart}
      loadingHeight={"170px"}
      status={status}
      data={data}
    />
  );
}

ViolatorsSummary.propTypes = {
  totalViolators: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  visaViolators: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  residencyViolators: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
