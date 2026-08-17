import PropTypes from "prop-types";
import {
  Row,
  Col,
  PhosphorIcons,
  Text,
  Title,
} from "re-usable-design-components";
import { useIntl } from "react-intl";

const { Warning } = PhosphorIcons;

export const DashboardTabsNoAccess = ({ className }) => {
  const intl = useIntl();
  return (
    <Row
      className={className}
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
        <Row gutter={[0, 16]}>
          <Col textAlign="center">
            <Warning
              color="var(--colorTextDescription)"
              weight="duotone"
              size="76px"
            />
          </Col>
          <Col textAlign="center">
            <Title level={4}>
              {intl.formatMessage({ id: "Access Denied" })}
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
              {intl.formatMessage({
                id:
                  "You do not have permission to view any sections on this dashboard. Please contact your administrator.",
              })}
            </Text>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

DashboardTabsNoAccess.propTypes = {
  className: PropTypes.string,
};
