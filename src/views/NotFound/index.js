import React, { useContext } from "react";
import {
  Row,
  Col,
  PhosphorIcons,
  Text,
  theme,
  Title,
  Button,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";

const { MagnifyingGlass, CaretLeft, CaretRight } = PhosphorIcons;
const { useToken } = theme;

function NotFound() {
  const themeVariables = useToken();
  const intl = useIntl();
  const router = useRouter();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const { token } = themeVariables;

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window?.history?.length > 2) {
      router?.back();
    } else {
      router?.push("/");
    }
  };

  return (
    <Row
      isFullHeight
      style={{
        backgroundColor: "var(--colorBgContainer)",
        borderRadius: "var(--borderRadiusLGPx)",
      }}
    >
      <Col
        paddingInline="var(--paddingPx)"
        paddingBlock="var(--paddingPx)"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Row gutter={[0, token?.marginSM]}>
          <Col textAlign="center">
            <MagnifyingGlass
              color="var(--colorTextDescription)"
              weight="duotone"
              size="76px"
            />
          </Col>
          <Col textAlign="center">
            <Title level={4}>
              {intl?.formatMessage({ id: "404 - Page Not Found" })}
            </Title>
          </Col>
          <Col
            textAlign="center"
            style={{
              maxWidth: "470px",
              margin: "auto",
            }}
          >
            <Text type="secondary">
              {intl?.formatMessage({
                id: "The page you are looking for does not exist or has been moved. Please go back to continue.",
              })}
            </Text>
          </Col>
          <Col
            textAlign="center"
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              type="primary"
              icon={isRtl ? <CaretRight /> : <CaretLeft />}
              onClick={handleGoBack}
            >
              {intl?.formatMessage({ id: "Go Back" })}
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default NotFound;
