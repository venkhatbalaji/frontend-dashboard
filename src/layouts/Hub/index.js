import PropTypes from "prop-types"
import React from "react";
import { Row, Col, Scrollbars, Spin } from "re-usable-design-components";
import { useIntl } from "react-intl";
import Header from "@/components/Header";
import StorageService from "@/services/storageService";
import useResponsive from "@/hooks/useResponsive";

function Hub({ children }) {
  const intl = useIntl();
  const authorization = StorageService.get("authorization");
  const getResponsive = useResponsive();

  if (!authorization?.tokenParsed) {
    return (
      <Row isFullHeight={true}>
        <Col
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </Col>
      </Row>
    );
  }

  return (
    <Row style={{ maxWidth: "1920px" }} isFullHeight isFlex>
      <Col isFlex>
        <Row style={{ zIndex: 99 }}>
          <Col>
            <Header showUaeLogo title={intl.formatMessage({ id: "Dashboard Hub" })} />
          </Col>
        </Row>
        <Row
          isFlexGrow
          id="hubContainerScroll"
          style={{ backgroundColor: "var(--colorBgLayout)" }}
        >
          <Col isFlex style={{ width: "100%" }}>
            <Scrollbars id="hubLayoutScroll" autoHide>
              <Row isFullHeight={true}>
                <Col
                  style={{
                    maxWidth: "1360px",
                    margin: "0 auto",
                    width: "100%",
                    padding: getResponsive({
                      default: "var(--paddingXLPx) var(--paddingLGPx) var(--paddingXXLPx)",
                      tablet: "var(--paddingLGPx)",
                      midTablet: "var(--paddingPx)",
                    }),
                  }}
                >
                  {children}
                </Col>
              </Row>
            </Scrollbars>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

Hub.propTypes = {
  children: PropTypes.any,
}

export default Hub;
