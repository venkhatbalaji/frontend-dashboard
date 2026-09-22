import PropTypes from "prop-types"
import { Row, Col, Text, Title, Button, theme } from "re-usable-design-components";
import { useRouter } from "next/router";
import { useIntl } from "react-intl";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Card from "@/components/Card";
import StorageService from "@/services/storageService";

dayjs.extend(relativeTime);

const { useToken } = theme;
const LAST_ACCESSED_STORAGE_KEY = "dashboardLastAccessed";

function recordDashboardOpened(dashboardKey) {
  if (!dashboardKey) return;
  const existing = StorageService.get(LAST_ACCESSED_STORAGE_KEY) || {};
  StorageService.set(LAST_ACCESSED_STORAGE_KEY, { ...existing, [dashboardKey]: Date.now() });
}

function getLastAccessedLabel(intl, dashboardKey) {
  const stored = StorageService.get(LAST_ACCESSED_STORAGE_KEY) || {};
  const timestamp = dashboardKey && stored[dashboardKey];
  if (!timestamp) {
    return intl.formatMessage({ id: "Not opened yet" });
  }
  return intl.formatMessage({ id: "Last opened {time}" }, { time: dayjs(timestamp).fromNow() });
}

export default function DashboardTile({ dashboard = {} }) {
  const intl = useIntl();
  const router = useRouter();
  const themeVariables = useToken();
  const Icon = dashboard?.icon;

  const handleOpen = () => {
    recordDashboardOpened(dashboard?.key);
    if (!dashboard?.href) return;
    if (dashboard?.openType === "external") {
      window.location.href = dashboard.href;
      return;
    }
    router.push(dashboard.href);
  };

  return (
    <Card
      style={{
        height: "100%",
        boxShadow: themeVariables?.token?.boxShadow,
      }}
      cardBodyPadding="var(--paddingLGPx)"
    >
      <Row style={{ height: "100%" }}>
        <Col isFlex style={{ width: "100%", height: "100%" }}>
          <Row>
            <Col
              flex="none"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "var(--borderRadiusPx)",
                backgroundColor: "var(--colorPrimaryBg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {Icon && <Icon size={dashboard?.iconSize ?? 24} color="var(--colorPrimaryBase)" />}
            </Col>
          </Row>
          <Row style={{ marginTop: "var(--marginPx)" }}>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                {intl.formatMessage({ id: dashboard?.nameIntlId })}
              </Title>
            </Col>
          </Row>
          {dashboard?.descriptionIntlId && (
            <Row style={{ marginTop: "var(--marginXXSPx)" }}>
              <Col>
                <Text color="var(--colorTextSecondary)">
                  {intl.formatMessage({ id: dashboard.descriptionIntlId })}
                </Text>
              </Col>
            </Row>
          )}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginTop: "auto", paddingTop: "var(--paddingLGPx)" }}
          >
            <Col flex="none">
              <Text color="var(--colorTextTertiary)" style={{ fontSize: "12px" }}>
                {getLastAccessedLabel(intl, dashboard?.key)}
              </Text>
            </Col>
            <Col flex="none">
              <Button type="primary" onClick={handleOpen}>
                {intl.formatMessage({ id: "Open" })}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
}

DashboardTile.propTypes = {
  dashboard: PropTypes.object,
}
