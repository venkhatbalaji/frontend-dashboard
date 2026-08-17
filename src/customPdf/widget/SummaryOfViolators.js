import SectionCard from "./SectionCard";
import BarChart from "@/components/BarChart";
import { Row, Col } from "re-usable-design-components";

const IssuedVisa = ({
  title,
  imageSrc,
  imageAlt,
  chartProps = {},
  chartColStyle = {},
  status,
  data,
  flags = [], // Array of { countryCode, countryName, position }
  forceLeftPosition = false,
  meshRight = 0,
  loadingHeight = "284px",
}) => {
  
  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      isImageWithBorder={true}
      meshRight={meshRight}
      loadingHeight={loadingHeight}
      forceLeftPosition={forceLeftPosition}
      chart={
        <Row
          style={{
            width: "calc(100% - 175px)",
            marginLeft: "125px",
            marginRight: "50px",
            height: "110px",
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
              left: 0,
              right: meshRight || 0,
              top: 0,
              bottom: 0,
              backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 20px), repeating-linear-gradient(to right, rgba(0,0,0,0.06), rgba(0,0,0,0.06) 1px, transparent 1px, transparent 20px)`,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <Col style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <BarChart {...chartProps} />
          </Col>
          {/* Render flags outside chart */}
          {flags?.length > 0 && (
            <div 
              style={{ 
                position: "absolute", 
                right: "-42px", 
                top: 0, 
                bottom: 0, 
                height: "105px",
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "space-between", 
                alignItems: "flex-start",
                paddingTop: "10px",
                zIndex: 2,
              }}
            >
              {flags.map((flag, index) => {
                if (!flag?.FlagComponent) {
                  // Render label only if no flag
                  return (
                    <div
                      key={`flag-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                    </div>
                  );
                }
                const FlagComponent = flag.FlagComponent;
                return (
                  <div
                    key={`flag-${index}`}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FlagComponent
                      style={{
                        width: "20px",
                        height: "15px",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </Row>
      }
      status={status}
      data= {data}
    />
  );
};

export default IssuedVisa;
