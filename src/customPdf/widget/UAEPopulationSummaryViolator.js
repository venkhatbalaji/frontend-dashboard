import React from "react";
import SectionCard from "./SectionCard";
import { formatNumber } from "@/utils/helper";
import { colors } from "../colors";

const UAEPopulationSummaryViolator = ({ 
  title,
  imageSrc,
  imageAlt,
  centerLabel1,
  centerLabel2,
  total,
  branches = [],
  status,
  data,
  forceLeftPosition = false,
  chartStyle = {},
  totalTextStyle = {},
  showTitleBesideIcon = false,
  titleStyle = {},
}) => {

  return (
    <SectionCard
      title={title}
      isImageWithBorder={true}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      loadingHeight="250px"
      status={status}
      data={data}
      forceLeftPosition={forceLeftPosition}
      showTitleBesideIcon={showTitleBesideIcon}
      {...titleStyle && { titleStyle }}
      chart={
        <div
          style={{
            overflowX: "auto",
            padding: "0px",
            maxWidth: "100%",
            height: "100%",
            position: "relative",
            top: -40,
            transform: "scale(0.85)",
            width: "100%",
            ...chartStyle,
          }}
        >
          <svg
            viewBox="-130 0 800 650"
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
              stroke="#d3d3d3"
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
              stroke="#d3d3d3"
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
              y="145"
              textAnchor="middle"
              fontSize="20px"
              fontFamily={colors.fontFamily}
            >
              {centerLabel1}
            </text>
            <text
              x="250"
              y="150"
              textAnchor="middle"
              fontSize="20px"
              fontFamily={colors.fontFamily}
            >
              {centerLabel2}
            </text>
            <text
              x="250"
              y="185"
              textAnchor="middle"
              fontSize="26px"
              fontWeight="bold"
              fontFamily={colors.fontFamily}
              {...totalTextStyle}
            >
              {typeof total === 'number' ? formatNumber(total) : total}
            </text>
            {/* Arrow Marker Definition */}
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
                  fill="grey"
                  stroke="grey"
                  strokeWidth="0.5"
                />
              </marker>
            </defs>
            {/* Dynamic branch lines and cards */}
            {branches.length > 0 ? (() => {
              // Calculate the horizontal line span based on branch positions
              const branchXPositions = branches.map(branch => branch.x + 160);
              const minX = Math.min(...branchXPositions);
              const maxX = Math.max(...branchXPositions);
              
              return (
                <>
                  {/* Main lines from center */}
                  <line
                    x1="250"
                    y1="276"
                    x2="250"
                    y2="310"
                    stroke="grey"
                    strokeWidth="0.5"
                  />
                  <line
                    x1={minX}
                    y1="310"
                    x2={maxX}
                    y2="310"
                    stroke="grey"
                    strokeWidth="0.5"
                  />
                  
                  {/* Render each branch */}
                  {branches.map((branch, index) => (
                    <g key={index}>
                      {/* Line to card */}
                      <line
                        x1={branch.x + 160}
                        y1="310"
                        x2={branch.x + 160}
                        y2="350"
                        stroke="grey"
                        strokeWidth="0.5"
                        markerEnd="url(#arrow)"
                      />
                      {/* Card background */}
                      <path
                        d={branch.direction === "left" 
                          ? `M${branch.x + 100},${branch.cardTopY} L${branch.x + 240},${branch.cardTopY} L${branch.x + 240},${branch.cardTopY + 50} L${branch.x + 90},${branch.cardTopY + 50} L${branch.x + 90},${branch.cardTopY + 10} Z`
                          : `M${branch.x + 110},${branch.cardTopY} L${branch.x + 250},${branch.cardTopY} L${branch.x + 260},${branch.cardTopY + 10} L${branch.x + 260},${branch.cardTopY + 50} L${branch.x + 110},${branch.cardTopY + 50} Z`
                        }
                        fill={branch.color}
                        stroke="grey"
                      />
                      {/* Card number */}
                      <foreignObject
                        x={branch.direction === "left" ? branch.x + 100 : branch.x + 110}
                        y={branch.cardTopY + 10}
                        width="140"
                        height="30"
                      >
                        <div
                          style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "22px",
                            fontFamily: colors.fontFamily,
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            lineHeight: "1.2",
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          {typeof branch.number === 'number' ? formatNumber(branch.number) : branch.number}
                        </div>
                      </foreignObject>
                      {/* Card label */}
                      <foreignObject
                        x={branch.direction === "left" ? ( branch?.textXPositon || branch.x + 85) : (branch?.textXPositon || branch.x + 95)}
                        y={branch.cardTopY + 60}
                        width={branch?.width || "170"}
                        height="70"
                      >
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "24px",
                            fontFamily: colors.fontFamily,
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                            lineHeight: "1.3",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-start",
                            paddingTop: "4px",
                          }}
                        >
                          {branch.label}
                        </div>
                      </foreignObject>
                    </g>
                  ))}
                </>
              );
            })() : null}
          </svg>
        </div>
      }
    />
  );
};

export default UAEPopulationSummaryViolator;