import React, { useMemo, useState } from "react";
import { Row, Col, Title, Text, Input, AntIcons } from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs";
import EmptyWrap from "@/components/Empty";
import StorageService from "@/services/storageService";
import { checkAccess } from "@/utils/helper";
import { HUB_PLATFORM_TABS, HUB_DASHBOARDS } from "@/config/hubDashboards";
import DashboardCardGrid from "./widgets/DashboardCardGrid";

const { SearchOutlined } = AntIcons;

function getVisibleDashboards(groups) {
  return HUB_DASHBOARDS.filter(
    (dashboard) =>
      dashboard.enabled &&
      dashboard.pageNames?.some((pageName) => checkAccess({ groups, pageName }))
  );
}

export default function Hub() {
  const intl = useIntl();
  const authorization = StorageService.get("authorization");
  const groups = authorization?.tokenParsed?.groups;

  const visibleDashboards = useMemo(() => getVisibleDashboards(groups), [groups]);

  const availablePlatformKeys = useMemo(() => {
    return new Set(visibleDashboards.map((dashboard) => dashboard.platform));
  }, [visibleDashboards]);

  const platformTabs = useMemo(
    () => HUB_PLATFORM_TABS.filter((tab) => tab.key === "all" || availablePlatformKeys.has(tab.key)),
    [availablePlatformKeys]
  );

  const [selectedTab, setSelectedTab] = useState("all");
  const activeTab = platformTabs?.find((tab) => tab.key === selectedTab) ? selectedTab : "all";

  const [searchTerm, setSearchTerm] = useState("");

  const tabFilteredDashboards = useMemo(() => {
    if (activeTab === "all") return visibleDashboards;
    return visibleDashboards.filter((dashboard) => dashboard.platform === activeTab);
  }, [visibleDashboards, activeTab]);

  const filteredDashboards = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return tabFilteredDashboards;
    return tabFilteredDashboards.filter((dashboard) =>
      intl.formatMessage({ id: dashboard.nameIntlId }).toLowerCase().includes(term)
    );
  }, [tabFilteredDashboards, searchTerm, intl]);

  const tabItems = platformTabs?.map((tab) => ({
    key: tab.key,
    label: intl.formatMessage({ id: tab.labelId }),
  }));

  return (
    <Row>
      <Col style={{ width: "100%" }}>
        <Row
          justify="space-between"
          align="top"
          wrap
          style={{ marginBottom: "var(--marginLGPx)", gap: "var(--marginPx)" }}
        >
          <Col flex="none">
            <Title level={3} style={{ margin: 0 }}>
              {intl.formatMessage({ id: "My Dashboards" })}
            </Title>
            <Text color="var(--colorTextSecondary)">
              {intl.formatMessage({ id: "Select a dashboard to get started" })}
            </Text>
          </Col>
          {!!visibleDashboards?.length && (
            <Col flex="none" style={{ width: "300px", maxWidth: "100%" }}>
              <Input
                allowClear
                prefix={<SearchOutlined style={{ color: "var(--colorTextTertiary)" }} />}
                placeholder={intl.formatMessage({ id: "Search dashboards..." })}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e?.target?.value || "")}
              />
            </Col>
          )}
        </Row>

        {!visibleDashboards?.length ? (
          <EmptyWrap
            type="primary"
            description={intl.formatMessage({ id: "No dashboards available" })}
          />
        ) : (
          <>
            {platformTabs?.length > 1 && (
              <Row
                style={{
                  marginBottom: "var(--marginLGPx)",
                  borderBottom: "1px solid var(--colorSplit)",
                }}
              >
                <Col style={{ width: "100%" }}>
                  <Tabs type="line" tabBarGutter={32} activeKey={activeTab} onChange={setSelectedTab} items={tabItems} />
                </Col>
              </Row>
            )}
            <Row style={{ marginBottom: "var(--marginPx)" }}>
              <Col>
                <Text
                  strong
                  style={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                    color: "var(--colorTextTertiary)",
                  }}
                >
                  {intl.formatMessage(
                    { id: "Available to you {count}" },
                    { count: filteredDashboards?.length }
                  )}
                </Text>
              </Col>
            </Row>
            <DashboardCardGrid dashboards={filteredDashboards} />
          </>
        )}
      </Col>
    </Row>
  );
}
