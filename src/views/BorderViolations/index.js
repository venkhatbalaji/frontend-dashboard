import PropTypes from "prop-types"
import {
  Row,
  Col,
  PhosphorIcons,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs"
import Risks from "./Risks";
import Violations from "./Violations";
import useResponsive from "@/hooks/useResponsive";
import { useRouter } from "next/router";
import ViolatorsDashboardSvg from "@/svgr/ViolatorsDashboard";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useState, useContext, useEffect, useMemo } from "react";
import { checkRtl, checkAccess } from "@/utils/helper";
import StorageService from "@/services/storageService";
import { DashboardTabsNoAccess } from "@/components/common/DashboardTabsNoAccess";
import withPageLoadDelay from '@/hocs/withPageLoadDelay';


const PageWithDelayHOCRisks = withPageLoadDelay(Risks);
const PageWithDelayHOCViolations = withPageLoadDelay(Violations);

const { Warning } = PhosphorIcons;

const BORDER_VIOLATIONS_TAB_ORDER = ["violations", "risks"];

function getTabVisibility(groups) {
  return {
    violations: checkAccess({
      groups,
      pageName: "Border_Violations_VIOLATORS_TAB",
    }),
    risks: checkAccess({
      groups,
      pageName: "Border_Violations_RISKS_TAB",
    }),
  };
}

function getFirstAvailableTabKey(visibility) {
  for (const key of BORDER_VIOLATIONS_TAB_ORDER) {
    if (visibility[key]) {
      return key;
    }
  }
  return null;
}

function resolveDefaultTabKey({ queryType, visibility }) {
  if (!queryType) {
    return getFirstAvailableTabKey(visibility) ?? BORDER_VIOLATIONS_TAB_ORDER[0];
  }
  if (visibility[queryType]) {
    return queryType;
  }
  return getFirstAvailableTabKey(visibility) ?? BORDER_VIOLATIONS_TAB_ORDER[0];
}


function BorderViolationsWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
  const intl = useIntl()
  const router = useRouter();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const getResponsive = useResponsive();
  const groups = StorageService.get('authorization')?.tokenParsed?.groups;
  const tabVisibility = useMemo(() => getTabVisibility(groups), [groups]);

  const [selectedTab, setSelectedTab] = useState(() =>
    resolveDefaultTabKey({
      queryType: router?.query?.type,
      visibility: tabVisibility,
    })
  );

  const hasAnyTabAccess = useMemo(
    () => getFirstAvailableTabKey(tabVisibility) != null,
    [tabVisibility]
  );

  const tabItems = useMemo(() => {
    const items = [];
    if (tabVisibility.violations) {
      items.push({
        key: "violations",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <ViolatorsDashboardSvg size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Violators" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility.risks) {
      items.push({
        key: "risks",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <Warning size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Risks" })}
            </Col>
          </Row>
        ),
      });
    }
    return items;
  }, [tabVisibility, intl]);

  useEffect(() => {
    if (tabVisibility[selectedTab]) {
      return;
    }
    const fallback = getFirstAvailableTabKey(tabVisibility);
    if (fallback != null) {
      setSelectedTab(fallback);
      router?.replace({
        pathname: '/violators-dashboard',
        query: { type: fallback },
      });
    }
  }, [tabVisibility, selectedTab, router]);

  if (!hasAnyTabAccess) {
    return <DashboardTabsNoAccess />;
  }

  return (
    <Row
      isFullHeight
      style={{
        position: "relative"
      }}
    >
      <Col
        style={{
          position: "absolute",
          left: getResponsive({ default: "-24px", midTablet: "-16px" }),
          right: getResponsive({ default: "-24px", midTablet: "-16px" }),
          top: getResponsive({ default: "-24px", midTablet: "-16px" }),
          paddingInline: "24px",
          backgroundColor: "var(--colorPrimaryBg)",
          minWidth: getResponsive({ default: "calc(100% + 48px)", midTablet: "calc(100% + 32px)" }),
          borderBottom: "1px solid var(--colorPrimaryBase)"
        }}
      >
        <Tabs
          type="line"
          tabBarGutter={isRtl ? 0: 32}
          bodyPaddingTop="none"
          activeKey={selectedTab}
          onChange={(v) => {
            setSelectedTab(v);
            router?.replace({
              pathname: '/violators-dashboard',
              query: {
                type: v
              }
            })
          }}
          items={tabItems}
        />
      </Col>
      <Col
        style={{
          marginTop: "48px"
        }}
      >
        {
          selectedTab === "violations" && tabVisibility.violations && (
            <PageWithDelayHOCViolations
              nationalitiesConfigValue={nationalitiesConfigValue}
              nationalitiesConfigValueObj={nationalitiesConfigValueObj}
              emiratesConfigValue={emiratesConfigValue}
            />
          )
        }
        {
          selectedTab === "risks" && tabVisibility.risks && (
            <PageWithDelayHOCRisks
              emiratesConfigValue={emiratesConfigValue}
              nationalitiesConfigValue={nationalitiesConfigValue}
              nationalitiesConfigValueObj={nationalitiesConfigValueObj}
            />
          )
        }
      </Col>
    </Row>
  );
}
export default BorderViolationsWrap;

BorderViolationsWrap.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  emiratesConfigValue: PropTypes.any
}
