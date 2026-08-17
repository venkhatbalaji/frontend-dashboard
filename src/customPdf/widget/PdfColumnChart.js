import SectionCard from "./SectionCard";
import { Row, Col } from "re-usable-design-components";
import ColumnChart from "@/components/ColumnChart";

const PdfColumnChart = ({
  isImageWithBorder = false,
  title ,
  imageSrc,
  imageAlt,
  chartProps = {},
  chartColStyle = { },
  status,
  data,
  loadingHeight,
  forceLeftPosition = false
}) => {
  // Override RTL transformations to keep chart orientation consistent
  const overriddenChartProps = {
    ...chartProps,
    xAxis: {
      ...chartProps.xAxis,
      reversed: false, // Prevent RTL reversal - must be last to override
    },
    yAxis: {
      ...chartProps.yAxis,
      opposite: false, // Prevent RTL y-axis movement - must be last to override
    },
  };

  return (
    <SectionCard
      title={title}
      imageSrc={imageSrc}
      imageAlt={imageAlt}
      isImageWithBorder={isImageWithBorder}
      titleWrapperStyle={{ maxWidth: "300px" }}
      showTitleBesideIcon
      loadingHeight={loadingHeight}
      chart={
        <Row
          style={{
            width: "calc(100% - 125px)",
            marginLeft: "125px",
            height: "220px",
            position: "relative",
            direction: "ltr", // Force LTR direction for chart area
            ...chartColStyle
          }}
        >
          <Col style={{ position: "relative", zIndex: 1, width: "100%" }}>
            <ColumnChart {...overriddenChartProps} />
          </Col>
        </Row>
      }
      status={status}
      data= {data}
      forceLeftPosition={forceLeftPosition}
    />
  );
};

export default PdfColumnChart;

