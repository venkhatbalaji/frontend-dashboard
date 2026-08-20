import SectionCard from "./SectionCard";
import { Row, Col } from "re-usable-design-components";
import BarChart from "@/components/BarChart";
import { colors } from "../colors";

const PdfBarChart = ({
  isImageWithBorder = false,
  title ,
  imageSrc,
  imageAlt,
  imageStyle = {},
  chartProps = {},
  chartColStyle = { },
  status,
  data,
  showTitleBesideIcon = false,
  titleStyle = {},
  titleWrapperStyle = {},
  chartImageSrc,
  chartImageAlt = "",
  chartImageStyle = {},
  chartImageSubtitle = "",
  chartImageLabel = "",
  loadingHeight: loadingHeightProp,
  meshLeft = 0,
  meshRight = 115,
  chartWrapperStyle = {},
  forceLeftPosition = false
}) => {
  // Extract height from chartColStyle to use for loading state
  const loadingHeight = loadingHeightProp || chartColStyle?.height || '150px';
  return (
    <SectionCard
      title={title}
      titleStyle={titleStyle}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      isImageWithBorder={isImageWithBorder}
      imageStyle={imageStyle}
      showTitleBesideIcon={showTitleBesideIcon}
      titleWrapperStyle={{ maxWidth: "100%", width: "100%", ...titleWrapperStyle }}
      chart={
        <Row
          style={{
            width: "calc(100% - 125px)",
            marginLeft: "125px",
            height: "120px",
            position: "relative",
            ...chartColStyle
          }}
        >
          {/* Mesh background */}
          <div
            aria-hidden
            className="pdf-mesh-background"
            style={{
              position: "absolute",
              left: meshLeft,
              right: meshRight,
              top: 0,
              bottom: 0,
              backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 20px)`,
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            {chartImageSrc && (
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2, pointerEvents: "none", ...chartImageStyle }}>
                <img src={chartImageSrc} alt={chartImageAlt} style={{ width: "auto", height: "40px", objectFit: "contain", marginBottom: chartImageSubtitle || chartImageLabel ? "8px" : "0" }} />
                {(chartImageSubtitle || chartImageLabel) && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                    {chartImageSubtitle && (
                      <div style={{ fontSize: "10px", color: colors.textDescription, marginBottom: "4px", fontFamily: colors.fontFamily }}>
                        {chartImageSubtitle}
                      </div>
                    )}
                    {chartImageLabel && (
                      <div style={{ fontSize: "13px", fontWeight: colors.fontWeightBold, color: colors.textSecondary, fontFamily: colors.fontFamily }}>
                        {chartImageLabel}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <Col style={{ position: "relative", zIndex: 1, width: "100%", ...chartWrapperStyle }}>
            <BarChart {...chartProps} />
          </Col>
        </Row>
      }
      status={status}
      data= {data}
      loadingHeight={loadingHeight}
      forceLeftPosition={forceLeftPosition}
    />
  );
};

export default PdfBarChart;

