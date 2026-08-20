/* eslint-disable @next/next/no-img-element */
import React, { useContext } from "react";
import { Row, Col, Text, Spin, Empty } from "re-usable-design-components";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";
import { colors } from "../colors";
import translation from "@/views/CustomizedPdf/translation.json";


const SectionCard = ({
  title = "",
  imageSrc = "",
  imageAlt = "",
  imageStyle = {},
  chart,
  containerStyle = {},
  titleStyle = {},
  chartColStyle = {},
  overlayStyle = {},
  status,
  data,
  isImageWithBorder = false,
  showTitleBesideIcon = false,
  titleWrapperStyle = {},
  loadingHeight,
  forceLeftPosition = false, // Force left positioning regardless of RTL
}) => {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const language = localeStore?.projectTranslation || "en";

  const isLoading = status && ["idle", "pending"].includes(status);
  // Check if data is empty - handle both arrays and objects
  const isEmpty = status && status === "success" && (
    !data || 
    (Array.isArray(data) && data.length === 0) ||
    (data && typeof data === 'object' && !Array.isArray(data) && 
     ((data.categories && data.categories.length === 0) || 
      (data.data && Array.isArray(data.data) && data.data.length === 0)))
  );
  const hasError = status && status === "error";

  const renderContent = () => {
    const loadingMinHeight = loadingHeight || '150px';
    
    if (isLoading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '50px',
          height: loadingMinHeight
        }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (isEmpty) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '50px',
          height: loadingMinHeight
        }}>
          <div style={{ transform: 'scale(0.7)' }}>
            <Empty description={<Text color={colors.textDescription}>{translation[language]?.["No data"] || "No data"}</Text>} />
          </div>
        </div>
      );
    }

    if (hasError) {
      return (
        <div style={{ textAlign: 'center', padding: '50px', color: colors.textSecondary }}>
          {translation[language]?.["Error loading data"] || "Error loading data"}
        </div>
      );
    }
    
    return chart;
  };

  const renderIconWithTitle = () => {
    if (showTitleBesideIcon) {
      // Show title beside icon horizontally
      // In RTL, keep icon on left and text on right (don't reverse)
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
            direction: forceLeftPosition ? "ltr" : undefined, // Force LTR direction to keep icon left, text right
          }}
        >
          {imageSrc && (
            isImageWithBorder
              ? (
                <img
                  src={typeof imageSrc === "string" ? imageSrc : imageSrc.src}
                  alt={imageAlt}
                  style={{
                    height: "auto",
                    width: "34px",
                    zIndex: 2,
                    ...imageStyle,
                  }}
                />
              )
              : (
                <div
                  style={{
                    width: "35px",
                    height: "38px",
                    background: colors.bgSpotlight,
                    borderRadius: "10px",
                    border: `1.5px solid #57585A`,
                    position: "relative",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={typeof imageSrc === "string" ? imageSrc : imageSrc.src}
                    alt={imageAlt}
                    style={{
                      maxWidth: "33px",
                      height: "100%",
                      maxHeight: "36px",
                      position: "absolute",
                      borderRadius: "8px",
                      top: "-3px",
                      left: "-4px",
                      zIndex: 2,
                      ...imageStyle,
                    }}
                  />
                </div>
              ))}
          {title && (
            <Text size="sm" style={{ color: colors.textSecondary, lineHeight: "1.2", fontFamily: colors.fontFamily, ...titleStyle }}>{title}</Text>
          )}
        </div>
      );
    }

    // Default: Show title below icon vertically
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {imageSrc && (
          isImageWithBorder
            ? (
              <img
                src={typeof imageSrc === "string" ? imageSrc : imageSrc.src}
                alt={imageAlt}
                style={{
                  ...imageStyle,
                  maxWidth: "33px",
                  height: "100%",
                }}
              />
            )
            : (
              <div
                style={{
                  width: "35px",
                  height: "40px",
                  background: colors.bgSpotlight,
                  borderRadius: "12px",
                  border: `2px solid ${colors.border}`,
                  position: "relative",
                }}
              >
                <img
                  src={typeof imageSrc === "string" ? imageSrc : imageSrc.src}
                  alt={imageAlt}
                  style={{
                    ...imageStyle,
                    maxWidth: "33px",
                    height: "100%",
                    maxHeight: "38px",
                    position: "absolute",
                    borderRadius: "8px",
                    top: "-3px",
                    left: "-5px",
                    zIndex: 2
                  }}
                />
              </div>
            ))}
        {title && (
          <Text size="sm" style={{ color: colors.textSecondary, marginTop: "10px", lineHeight: "1.2", fontFamily: colors.fontFamily, ...titleStyle }}>{title}</Text>
        )}
      </div>
    );
  };

  return (
    <Row
      isFlex
      isFullHeight
      wrap={false}
      justify="space-between"
      align="center"
      gutter={[12, 12]}
      style={{ position: "relative", ...containerStyle }}
    >
      {
        (imageSrc || title) && (
          <Col
            flex="none"
            align="center"
            style={{
              position: "absolute",
              [forceLeftPosition ? "left" : (isRtl ? "right" : "left")]: 0,
              top: 0,
              maxWidth: showTitleBesideIcon ? "200px" : "100px",
              paddingInline: "12px",
              direction: forceLeftPosition ? "ltr" : undefined, // Force LTR when forcing left position
              ...titleWrapperStyle
            }}
          >
            {renderIconWithTitle()}
          </Col>
        )}
      

      <Col
        flex={"auto"}
        style={chartColStyle}
      >
        {renderContent()}
      </Col>
    </Row>
  );
};

export default SectionCard;
