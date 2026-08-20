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

  // The right-side trunk must stay anchored to the "Number of Residents" box
  // (fixed right edge at x=415, vertical center at y=345 in the parent SVG)
  // and reach out to whichever branch is furthest from it. Its x-position
  // has to track each branch's offsetX (all branches in a group share one),
  // since that's what actually moves the branch lines/boxes — a fixed x
  // here would drift out of alignment whenever offsetX changes.
  const RIGHT_ANCHOR_X = 415;
  const RIGHT_ANCHOR_Y = 345;
  const commonOffsetX = branches[0]?.offsetX || 0;
  const trunkX = direction === "right" ? startX + commonOffsetX : startX - commonOffsetX;
  const branchYs = branches.map((b) => verticalLineStartY + (b?.offsetY || 0));
  const trunkTopY = Math.min(RIGHT_ANCHOR_Y, ...branchYs);
  const trunkBottomY = Math.max(RIGHT_ANCHOR_Y, ...branchYs);

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
            x1={RIGHT_ANCHOR_X}
            y1={RIGHT_ANCHOR_Y}
            x2={trunkX}
            y2={RIGHT_ANCHOR_Y}
            stroke={colors.border}
            strokeWidth="1"
          />
        )
      }
      {/* Vertical line (only if multiple branches) */}
      {branches.length > 1 && (
        <line
          x1={trunkX}
          y1={trunkTopY}
          x2={trunkX}
          y2={trunkBottomY}
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
              fontFamily={colors.fontFamily}
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

const GoldenBranch = ({ boxText, boxLabel }) => {
  // Positioned to the left of the "Total Expats" count, clear of the
  // country flag (CSS-overlaid top-right) and the Inside/Outside UAE boxes.
  const boxCX = -20;
  const boxCY = 220;
  const boxWidth = 104;
  const boxHeight = 36;
  const boxX = boxCX - boxWidth / 2;
  const boxY = boxCY - boxHeight / 2;

  return (
    <g>
      <defs>
        <linearGradient id="goldenBranchFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.goldShineLight} />
          <stop offset="55%" stopColor={colors.goldShineMid} />
          <stop offset="100%" stopColor={colors.goldShineDeep} />
          <animateTransform
            attributeName="gradientTransform"
            type="translate"
            values="-0.3 0; 0.3 0; -0.3 0"
            dur="3.2s"
            repeatCount="indefinite"
          />
        </linearGradient>
        <radialGradient id="goldenBranchGlow">
          <stop offset="0%" stopColor={colors.goldShineGlow} />
          <stop offset="100%" stopColor={colors.goldShineGlow} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Pulsing glow behind the box */}
      <circle cx={boxCX} cy={boxCY} r={boxWidth / 2 + 6} fill="url(#goldenBranchGlow)">
        <animate attributeName="r" values={`${boxWidth / 2 + 4};${boxWidth / 2 + 16};${boxWidth / 2 + 4}`} dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Golden box */}
      <rect
        x={boxX}
        y={boxY}
        width={boxWidth}
        height={boxHeight}
        rx={6}
        ry={6}
        fill="url(#goldenBranchFill)"
        stroke={colors.goldShineDeep}
        strokeWidth="1"
      />
      <text
        x={boxCX}
        y={boxCY}
        fontWeight="bold"
        fontSize="15"
        fontFamily={colors.fontFamily}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={colors.textBlack}
      >
        {boxText}
      </text>
      <foreignObject x={boxX - 8} y={boxY + boxHeight + 4} width={boxWidth + 16} height={50}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: colors.goldShineDeep,
            textAlign: "center",
            wordWrap: "break-word",
            lineHeight: "1.2"
          }}
        >
          {boxLabel}
        </div>
      </foreignObject>

      {/* Sparkle accents — kept clear of the connector's top-right landing
          point and the label text below the box, so they read as accents
          rather than stray marks. */}
      {[
        { x: boxX - 12, y: boxY - 4, s: 5, begin: "0s" },
        { x: boxX - 14, y: boxCY, s: 4, begin: "0.6s" },
        { x: boxX + boxWidth + 10, y: boxY + boxHeight + 30, s: 4.5, begin: "1.2s" },
      ].map((spark, i) => (
        <path
          key={i}
          d={`M${spark.x},${spark.y - spark.s} L${spark.x + spark.s * 0.3},${spark.y - spark.s * 0.3} L${spark.x + spark.s},${spark.y} L${spark.x + spark.s * 0.3},${spark.y + spark.s * 0.3} L${spark.x},${spark.y + spark.s} L${spark.x - spark.s * 0.3},${spark.y + spark.s * 0.3} L${spark.x - spark.s},${spark.y} L${spark.x - spark.s * 0.3},${spark.y - spark.s * 0.3} Z`}
          fill={colors.goldShineLight}
        >
          <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin={spark.begin} repeatCount="indefinite" />
        </path>
      ))}
    </g>
  );
};

const Summary = ({ branchesData = [], leftBranchesData = [], goldenBranchData = null, totalViolators, title, imageSrc, imageAlt, CountryFlag, countryName, centerLabel1, centerLabel2, leftBranchLabel, rightBranchLabel, leftBranchValue = "0", rightBranchValue = "0", status, data }) => {

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
              fontFamily={colors.fontFamily}
            >
              {centerLabel1}
            </text>
            <text
              x="207"
              y="127"
              textAnchor="middle"
              fontSize="15"
              fontFamily={colors.fontFamily}
            >
              {centerLabel2}
            </text>
            <text
              x="230"
              y="162"
              textAnchor="middle"
              fontSize="26"
              fontWeight="bold"
              fontFamily={colors.fontFamily}
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
              fontFamily={colors.fontFamily}
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
              fontFamily={colors.fontFamily}
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

            {/* Golden Visa Holders — standalone shining callout, separated from the plain boxes above */}
            {goldenBranchData && (
              <GoldenBranch boxText={goldenBranchData.boxText} boxLabel={goldenBranchData.boxLabel} />
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