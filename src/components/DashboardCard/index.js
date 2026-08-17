import PropTypes from "prop-types"
import { Row, Col, Text, Empty } from "re-usable-design-components"
import Card from '@/components/Card'
import { resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";


function DashboardCard({ isEmpty, titleEle, actionProps, titleStyle = {}, titleItemsWrapProps, titleProps, headStyle, cardBodyHeight, bodyBackgroundColor, cardBodyPadding, bodyWrapStyle, children, subtitle, title, icon, action, isPreview, isPreviewOpen, ...props }) {
  const getResponsive = useResponsive();
  const preview = isPreview || isPreviewOpen;
  const patchedGetResponsive = (config) => {
    if (preview && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };
  return (
    <Card
      cardBodyHeight={cardBodyHeight || patchedGetResponsive({ default: "440px", desktop: "412px" })}
      title={
        <Row>
          <Col>
            {
              resolveTernary(
                titleEle
                , titleEle
                , (
                  <Row
                    style={{ zIndex: 1, position: "relative" }}
                    gutter={patchedGetResponsive({ default: [8], mobile: [0, 8] })}
                    justify="space-between"
                    align="middle"
                    wrap={patchedGetResponsive({ default: false, mobile: true })}
                    {...titleProps}
                  >
                    <Col flex="auto">
                      <Row
                        align={subtitle ? "start" : "middle"}
                        gutter={patchedGetResponsive({ default: [8] })}
                        wrap={false}
                        {...titleItemsWrapProps}
                      >
                        {
                          (!!icon && patchedGetResponsive({ default: "true", mobile: "false" }) === "true") &&
                          <Col flex="none">
                            {icon}
                          </Col>
                        }

                        <Col flex="none" {...titleStyle}>
                          <Row gutter={[0, patchedGetResponsive({ default: 0, desktop: 0 })]}>
                            <Col>
                              <Text strong>
                                {title}
                              </Text>
                            </Col>
                            {
                              !!subtitle &&
                              <Col
                                style={{
                                  whiteSpace: "break-spaces"
                                }}
                              >
                                <Text type="secondary">
                                  {subtitle}
                                </Text>
                              </Col>
                            }
                          </Row>
                        </Col>
                      </Row>
                    </Col>

                    {
                      !!action &&
                      <Col
                        flex={patchedGetResponsive({ default: "none", mobile: "0 0 100%" })}
                        {
                          ...actionProps
                        }
                      >
                        {action}
                      </Col>
                    }
                  </Row>
                )
              )
            }

          </Col>
        </Row>
      }
      headStyle={{
        padding: patchedGetResponsive({ default: "var(--paddingPx) var(--paddingLGPx)", desktop: "var(--paddingPx)" }),
        ...headStyle
      }}
      cardBodyPadding={cardBodyPadding || patchedGetResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingPx)" })}
      {...props}
    >
      <Row isFullHeight>
        <Col
          isFlex
          style={{
            backgroundColor: bodyBackgroundColor || "var(--colorBgLayout)",
            borderRadius: "var(--borderRadiusPx)",
            padding: patchedGetResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingPx)" }),
            ...bodyWrapStyle
          }}
        >
          {
            isEmpty
              ? (
                <Row isFullHeight>
                  <Col style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Empty />
                  </Col>
                </Row>
              )
              : children
          }
        </Col>
      </Row>
    </Card>
  )
}

DashboardCard.propTypes = {
  action: PropTypes.any,
  actionProps: PropTypes.any,
  bodyBackgroundColor: PropTypes.string,
  bodyWrapStyle: PropTypes.any,
  cardBodyHeight: PropTypes.string,
  cardBodyPadding: PropTypes.any,
  children: PropTypes.any,
  titleStyle: PropTypes.any,
  headStyle: PropTypes.any,
  icon: PropTypes.any,
  isEmpty: PropTypes.any,
  subtitle: PropTypes.any,
  title: PropTypes.any,
  titleItemsWrapProps: PropTypes.any,
  titleProps: PropTypes.any,
  titleEle: PropTypes.any,
  isPreview: PropTypes.bool,
  isPreviewOpen: PropTypes.bool
}

export default DashboardCard;