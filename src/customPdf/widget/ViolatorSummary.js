import React from "react";
import SectionCard from "./SectionCard";
import { colors } from "../colors";

const ViolatorSummary = ({
  title,
  imageAlt,
  imageSrc,
  centerLabel1 = "",
  centerLabel2 = "",
  total = "",
  branches = [], // Array of { x: number, cardTopY: number, color: string, direction: 'left' | 'right', number: string, label: string }
  status,
  data,
  forceLeftPosition = false,
}) => {
  const centerX = 250;
  const centerY = 160;
  const centerBottomY = 296;
  const horizontalY = 370;

  // Calculate horizontal line span based on branch xs (if branches exist)
  const branchXs = branches.map((b) => b.x);
  const minX = branchXs.length ? Math.min(...branchXs) : centerX - 50;
  const maxX = branchXs.length ? Math.max(...branchXs) : centerX + 50;

  const Card = ({ centerX, cardTopY, color, direction, number, label }) => {
    const height = 50;
    const bottomY = cardTopY + height;
    const slantX = 12;
    const slantY = 12;
    const bottomWidth = 180;
    const verticalPart = height - slantY; // 38

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
        <path d={d} fill={color} stroke={colors.border} />
        <text x={centerX} y={bottomY - 15} textAnchor="middle" fontWeight="bold" fontSize="20">
          {number}
        </text>
        <text x={centerX} y={bottomY + 22} textAnchor="middle" fontSize="18">
          {label}
        </text>
      </g>
    );
  };

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      isImageWithBorder={true}
      loadingHeight="396px"
      forceLeftPosition={forceLeftPosition}
      chart={
        <div
          style={{
            overflowX: "auto",
            padding: "0px",
            maxWidth: "100%",
          }}
        >
          <svg
            viewBox="-130 -95 740 695"
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          >
            {/* Outer Circle with Gap */}
            <circle
              cx={centerX}
              cy={centerY}
              r="170"
              stroke="#d3d3d3"
              strokeWidth="25"
              fill="none"
              strokeDasharray={`${Math.PI * 2 * 140 * 0.8} ${Math.PI * 2 * 140 * 0.2}`}
              strokeDashoffset={Math.PI * 2 * 140 * 0.49}
              strokeLinecap="round"
            />
            {/* Inner Circle with Gap */}
            <circle
              cx={centerX}
              cy={centerY}
              r="115"
              stroke="#d3d3d3"
              strokeWidth="25"
              fill="none"
              strokeDasharray={`${Math.PI * 2 * 95 * 0.8} ${Math.PI * 2 * 95 * 0.25}`}
              strokeDashoffset={Math.PI * 2 * 95 * 0.2}
              strokeLinecap="round"
            />
            {/* Center Text */}
            <text x={centerX - 45} y={centerY - 65} textAnchor="middle" fontSize="18" fill="red" fontWeight="bold">
              {centerLabel1}
            </text>
            <text x={centerX - 46} y={centerY - 40} textAnchor="middle" fontSize="18" fill="red" fontWeight="bold">
              {centerLabel2}
            </text>
            <text x={centerX} y={centerY + 25} textAnchor="middle" fontSize="32" fill="red" fontWeight="bold">
              {total}
            </text>
      
            {/* Trunk vertical line */}
            <line x1={centerX} y1={centerBottomY+40} x2={centerX} y2={horizontalY} stroke={colors.border} strokeWidth="2" />
            {/* Horizontal line */}
            <line x1={minX} y1={horizontalY} x2={maxX} y2={horizontalY} stroke={colors.border} strokeWidth="2" />
            {/* Dynamic branches: vertical arrows and cards */}
            {branches.map((branch, index) => (
              <g key={index}>
                <line
                  x1={branch.x}
                  y1={horizontalY}
                  x2={branch.x}
                  y2={branch.cardTopY - 5}
                  stroke={colors.border}
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
                <Card
                  centerX={branch.x}
                  cardTopY={branch.cardTopY}
                  color={branch.color}
                  direction={branch.direction}
                  number={branch.number}
                  label={branch.label}
                />
              </g>
            ))}
          </svg>
        </div>
      }
      status={status}
      data={data}
    />
  );
};

export default ViolatorSummary;