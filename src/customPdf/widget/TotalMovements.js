import React from "react";
import SectionCard from "./SectionCard";
import { colors } from "../colors";
import { formatNumber } from "@/utils/helper";


const TotalMovements = ({ 
  title,
  imageSrc,
  imageAlt,
  centerLabel1,
  isImageWithBorder = false,
  centerLabel2,
  total,
  branches = [],
  status,
  data,
  loadingHeight
}) => {

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      status={status}
      isImageWithBorder={isImageWithBorder}
      showTitleBesideIcon
      titleStyle={{ maxWidth: "100px" }}
      data={data}
      loadingHeight={loadingHeight}
      chart={
        <div
          style={{
            overflowX: "auto",
            padding: "0px",
            maxWidth: "100%",
          }}
        >
          <svg
            viewBox="-130 0 740 550"
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          >
            {/* Outer Circle with Gap */}
            <circle
              cx="250"
              cy="150"
              r="120"
              stroke={colors.totalMovementsCircleStroke}
              strokeWidth="15"
              fill="none"
              strokeDasharray={`${Math.PI * 2 * 120 * 0.8} ${
                Math.PI * 2 * 120 * 0.2
              }`}
              strokeDashoffset={Math.PI * 2 * 120 * 0.555}
              strokeLinecap="round"
            />
            {/* Inner Circle with Gap */}
            <circle
              cx="250"
              cy="150"
              r="80"
              stroke={colors.totalMovementsCircleStroke}
              strokeWidth="15"
              fill="none"
              strokeDasharray={`${Math.PI * 2 * 80 * 0.8} ${
                Math.PI * 2 * 80 * 0.25
              }`}
              strokeDashoffset={Math.PI * 2 * 80 * 0.34}
              strokeLinecap="round"
            />
            {/* Center Text */}
            <text
              x="250"
              y="115"
              textAnchor="middle"
              fontSize={"16px"}
              fontFamily={colors.fontFamily}
              fill={colors.textBlack}
            >
              {centerLabel1}
            </text>
            <text
              x="250"
              y="135"
              textAnchor="middle"
              fontSize={"16px"}
              fontFamily={colors.fontFamily}
            >
              {centerLabel2}
            </text>
            <text
              x="250"
              y="180"
              textAnchor="middle"
              fontSize={colors.fontSizeLarge}
              fontWeight={colors.fontWeightBold}
              fontFamily={colors.fontFamily}
              fill={colors.textBlack}
            >
              {typeof total === 'number' ? formatNumber(total) : total}
            </text>
            {/* Arrow Marker Definition and Gradients */}
            <defs>
              <marker
                id="arrow"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M0,0 L10,5 L0,10 z"
                  fill={colors.lineSegmentColor}
                  stroke={colors.lineSegmentColor}
                  strokeWidth="0.5"
                />
              </marker>
              {/* Shadow filter for embossed effect */}
              <filter id="boxShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="2" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {/* Gradient definitions for embossed boxes - golden-brown gradient */}
              <linearGradient id="gradient-left" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.totalMovementsGradientLight} />
              </linearGradient>
              <linearGradient id="gradient-right" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colors.totalMovementsGradientLight} />
              </linearGradient>
            </defs>
            {/* Dynamic branch lines and cards */}
            {branches.length > 0 ? (
              <>
                {/* Render each branch */}
                {branches.map((branch, index) => {
                  // Calculate box position: center is at x=250, y=150
                  const centerX = 250;
                  const centerY = 150;
                  const circleRadius = 120; // Outer circle radius
                  const boxWidth = 160;
                  const boxHeight = 40;
                  const borderRadius = 8;
                  
                  // Calculate fork point from left or right vertical center of circle edge
                  const forkX = branch.direction === "left" 
                    ? centerX - circleRadius  // Left vertical center (130)
                    : centerX + circleRadius; // Right vertical center (370)
                  const forkY = centerY; // Vertical center (150)
                  
                  // Add small gap between circle and line
                  const gapFromCircle = 10; // Space between circle edge and line start
                  const lineStartX = branch.direction === "left" 
                    ? forkX - gapFromCircle  // Start line slightly left of circle edge
                    : forkX + gapFromCircle; // Start line slightly right of circle edge
                  
                  // Calculate horizontal extension distance (lengthened)
                  const horizontalExtension = 80; // Distance to extend horizontally from circle edge
                  const horizontalEndX = branch.direction === "left" 
                    ? lineStartX - horizontalExtension  // Extend left
                    : lineStartX + horizontalExtension; // Extend right
                  
                  // Position boxes: left branch goes left, right branch goes right
                  const boxX = branch.direction === "left" 
                    ? horizontalEndX - boxWidth / 2  // Center box on horizontal end point
                    : horizontalEndX - boxWidth / 2;  // Center box on horizontal end point
                  
                  // Shorten vertical lines by moving boxes higher (closer to circle)
                  const boxY = branch.cardTopY ? Math.min(branch.cardTopY, 240) : 300;
                  const boxCenterX = boxX + boxWidth / 2;
                  
                  return (
                    <g key={index}>
                      {/* First: Horizontal line from gap point extending outward */}
                      <line
                        x1={lineStartX}
                        y1={forkY}
                        x2={horizontalEndX}
                        y2={forkY}
                        stroke={colors.lineSegmentColor}
                        strokeWidth="1"
                      />
                      
                      {/* Second: Vertical line from horizontal end point down to top center of box */}
                      <line
                        x1={horizontalEndX}
                        y1={forkY}
                        x2={boxCenterX}
                        y2={boxY - 2}
                        stroke={colors.lineSegmentColor}
                        strokeWidth="1"
                        markerEnd="url(#arrow)"
                      />
                      
                      {/* Horizontal box with rounded corners, gradient, and shadow */}
                      <rect
                        x={boxX}
                        y={boxY}
                        width={boxWidth}
                        height={boxHeight}
                        rx={borderRadius}
                        ry={borderRadius}
                        fill={branch.direction === "left" ? "url(#gradient-left)" : "url(#gradient-right)"}
                        stroke={colors.totalMovementsBorder}
                        strokeWidth="1"
                        filter="url(#boxShadow)"
                      />
                      
                      {/* Number text inside the box */}
                      {branch.number && (
                        <text 
                          x={boxCenterX}
                          y={boxY + boxHeight / 2 + 5}
                          textAnchor="middle"
                          fontSize={"16px"}
                          fontWeight={colors.fontWeightBold}
                          fontFamily={colors.fontFamily}
                          fill={colors.textBlack}
                        >
                          {typeof branch.number === 'number' ? formatNumber(branch.number) : branch.number}
                        </text>
                      )}
                      
                      {/* Label text below the box */}
                      <text 
                        x={boxCenterX}
                        y={boxY + boxHeight + 24}
                        textAnchor="middle"
                        fontSize={"16px"}
                        fontWeight={colors.fontWeightBold}
                        fill={colors.text}
                        fontFamily={colors.fontFamily}
                      >
                        {branch.label}
                      </text>
                    </g>
                  );
                })}
              </>
            ) : null}
          </svg>
        </div>
      }
    />
  );
};

export default TotalMovements;