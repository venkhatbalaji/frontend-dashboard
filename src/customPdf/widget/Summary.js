import React from "react";
import SectionCard from "./SectionCard";
import { colors } from "../colors";

const Branches = ({
  startX,
  startY,
  verticalLength,
  branches,
  direction = "right",
  horizontalLength = 50,
}) => {
  // Calculate vertical line start and end points only if there are multiple branches
  const verticalLineStartY = branches.length > 1 ? startY - verticalLength / 2 : startY;
  const verticalLineEndY = branches.length > 1 ? startY + verticalLength / 2 : startY;
  const gap = 5;
  const boxWidth = 90;
  const labelOffset = 25;

  const horizontalLineStartX =
    direction === "right" ? startX - horizontalLength + 25 : startX + horizontalLength;

  return (
    <>
      {/* Short horizontal line from main point */}
      {
        direction === "left" && (
          <line
            x1={horizontalLineStartX}
            y1={startY}
            x2={startX}
            y2={startY}
            stroke={colors.border}
            strokeWidth="1"
          />
        )}
      {
        direction === "right" && (
          <line
            x1={415}
            y1={345}
            x2={430}
            y2={345}
            stroke={colors.border}
            strokeWidth="1"
          />
        )
      }
      {/* Vertical line (only if multiple branches) */}
      {branches.length > 1 && (
        <line
          x1={428}
          y1={280}
          x2={428}
          y2={410}
          stroke={colors.border}
          strokeWidth="1"
        />
      )}
      {/* Branches */}
      {branches.map(({ offsetY, boxText, boxLabel, offsetX = 0, labelY = 0 }, i) => {
        const lineX2 =
          direction === "right" ? startX + horizontalLength : startX - horizontalLength;
        const boxX =
          direction === "right"
            ? startX + horizontalLength + gap
            : startX - horizontalLength - gap - boxWidth;
        const textX = boxX + boxWidth / 2;
        const labelX =
          direction === "right" ? boxX + boxWidth + labelOffset : boxX - labelOffset;
        // const labelTransform = direction === "left" ? `rotate(-125 ${labelX})` : null;

        return (
          <g
            key={i}
            transform={`translate(${offsetX}, ${verticalLineStartY + offsetY})`}
          >
            {/* Horizontal branch line with arrow */}
            <line
              x1={startX}
              y1={0}
              x2={lineX2}
              y2={0}
              stroke={colors.border}
              strokeWidth="1"
              markerEnd="url(#arrow)"
            />
            {/* Grey box */}
            <rect
              x={boxX}
              y={-17}
              width={boxWidth}
              height={30}
              fill="#d3d3d3"
              stroke="none"
            />
            {/* Box number */}
            <text
              x={textX}
              y={0}
              fontWeight="bold"
              fontSize="15"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="black"
            >
              {boxText}
            </text>
            {/* Box label */}
            <foreignObject
              x={direction === "left" ? labelX - 90 : labelX - 20}
              y={direction === "left" ? -33 : labelY || -15}
              width={100}
              height={75}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontSize: "16px",
                  color: colors.text,
                  textAlign: "center",
                  maxWidth: "106px",
                  margin: "0",
                  wordWrap: "break-word",
                  lineHeight: "1.2"
                }}
              >
                {boxLabel}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </>
  );
};

const Summary = ({ branchesData = [], leftBranchesData = [], totalViolators, title, imageSrc, imageAlt, CountryFlag, countryName, centerLabel1, centerLabel2, leftBranchLabel, rightBranchLabel, leftBranchValue = "0", rightBranchValue = "0", status, data }) => {

  const branches = branchesData;
  const leftBranches = leftBranchesData;

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      titleWrapperStyle={{ width: "100px" }}
      imageAlt={imageAlt}
      loadingHeight="220px"
      isImageWithBorder={true}
      forceLeftPosition={true}
      chart={
        <div
          style={{
            overflowX: "auto",
            padding: "0px",
            maxWidth: "100%",
          }}
        >
          {
            CountryFlag && (
              <div style={{ 
                position: 'absolute', 
                top: 30, 
                right: 25, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ 
                  width: '50px', 
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  {CountryFlag}
                </div>
                {countryName && (
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '400',
                    color: colors.text,
                    textAlign: 'center',
                    marginTop: '3px'
                  }}>
                    {countryName}
                  </div>
                )}
              </div>
            )
          }
          <svg
            viewBox="-190 19 845 430"
            preserveAspectRatio="xMidYMid meet"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              paddingLeft: "2px",
              paddingRight: "2px"
            }}
          >
            {/* Outer Circle with Gap */}
            <circle
              cx="235"
              cy="150"
              r="124"
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
              cx="235"
              cy="150"
              r="84"
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
              x="205"
              y="105"
              textAnchor="middle"
              fontSize="15"
            >
              {centerLabel1}
            </text>
            <text
              x="207"
              y="127"
              textAnchor="middle"
              fontSize="15"
            >
              {centerLabel2}
            </text>
            <text
              x="230"
              y="162"
              textAnchor="middle"
              fontSize="26"
              fontWeight="bold"
            >
              {totalViolators}
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
                  fill={colors.border}
                  stroke={colors.border}
                  strokeWidth="1"
                />
              </marker>
            </defs>
            {/* Left side card and lines */}
            <line
              x1="235"
              y1="276"
              x2="235"
              y2="292"
              stroke={colors.border}
              strokeWidth="1"
            />
            <line
              x1="135"
              y1="292"
              x2="335"
              y2="292"
              stroke={colors.border}
              strokeWidth="1"
            />
            <line
              x1="135"
              y1="292"
              x2="135"
              y2="310"
              stroke={colors.border}
              strokeWidth="1"
              markerEnd="url(#arrow)"
            />
            <path
              d="M75,320 L205,320 L205,370 L65,370 L65,330 Z"
              fill="#fbe9e7"
              stroke={colors.border}
            />
            <text
              x="135"
              y="347"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
              fontSize="20"
            >
              {leftBranchValue}
            </text>
            <foreignObject x="78" y="378" width="120" height="70">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontSize: "18px",
                  color: colors.text,
                  textAlign: "center",
                  maxWidth: "120px",
                  margin: "0 auto",
                  wordWrap: "break-word",
                  lineHeight: "1.2"
                }}
              >
                {leftBranchLabel}
              </div>
            </foreignObject>
            {/* Right card */}
            <line
              x1="335"
              y1="292"
              x2="335"
              y2="310"
              stroke={colors.border}
              strokeWidth="1"
              markerEnd="url(#arrow)"
            />
            <path
              d="M265,320 L405,320 L415,330 L415,370 L265,370 Z"
              fill="rgb(231, 187, 98)"
              stroke={colors.border}
            />
            <text
              x="338"
              y="347"
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight="bold"
              fontSize="20"
            >
              {rightBranchValue}
            </text>
            <foreignObject x="297" y="378" width="90" height="70">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontSize: "18px",
                  color: colors.text,
                  textAlign: "center",
                  maxWidth: "90px",
                  margin: "0 auto",
                  wordWrap: "break-word",
                  lineHeight: "1.2"
                }}
              >
                {rightBranchLabel}
              </div>
            </foreignObject>
            {/* Reusable branching lines and boxes (left side) */}
            {leftBranches && leftBranches.length > 0 && (
              <Branches
                startX={135}
                startY={390}
                verticalLength={leftBranches.length > 1 ? 100 : 0}
                branches={leftBranches}
                direction="left"
                horizontalLength={25} // Adjust this value, e.g., 25 to shorten
              />
            )}

            {/* Reusable branching lines and boxes (right side) */}
            {branches && branches.length > 0 && (
              <Branches
                startX={335}
                startY={440}
                verticalLength={branches.length > 1 ? 100 : 0}
                branches={branches}
                direction="right"
                horizontalLength={25} // Adjust this value, e.g., 25 to shorten
              />
            )}
            
          </svg>
        </div>
      }
      status={status}
      data={data}
    />
  );
};

export default Summary;