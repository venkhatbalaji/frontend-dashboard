import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  PhosphorIcons,
} from "re-usable-design-components";
import { useIntl } from 'react-intl';
import { useRouter } from 'next/router';
import Tabs from "@/components/Tabs";
import ExpatriateGlobe from "@/svgr/ExpatriateGlobe";
import useResponsive from "@/hooks/useResponsive";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import StorageService from "@/services/storageService";
import { DashboardTabsNoAccess } from "@/components/common/DashboardTabsNoAccess";
import { checkRtl, checkAccess } from "@/utils/helper";
import BorderStatistics from './widgets/BorderStatistics';
import UaePopulationStatistics from './widgets/UaePopulationStatistics';
import RiskRegisterStatistics from './widgets/RiskRegisterStatistics';
import ExpatsStatistics from './widgets/ExpatsStatistics';
import BorderMovements from "@/svgr/BorderMovements";
import WorldWithPopulation from "@/svgr/WorldWithPopulation";
import ViolatorsDashboard from "@/svgr/ViolatorsDashboard";
import ViolatorsStatistics from './widgets/ViolatorsStatistics';
import NationalityStatistics from './widgets/NationalityStatistics';


const { Warning } = PhosphorIcons;

const CUSTOMIZED_PDF_TAB_ORDER = [
  "expats",
  "violators",
  "risk-register",
  "population",
  "borders",
  "nationality-statistics",
];

function getTabVisibility(groups) {
  return {
    expats: checkAccess({ groups, pageName: "Customized_PDF_EXPATS_STATS" }),
    violators: checkAccess({ groups, pageName: "Customized_PDF_VIOLATORS_STATS" }),
    "risk-register": checkAccess({
      groups,
      pageName: "Customized_PDF_RISK_REGISTER_STATS",
    }),
    population: checkAccess({ groups, pageName: "Customized_PDF_POPULATION_STATS" }),
    borders: checkAccess({ groups, pageName: "Customized_PDF_BORDER_STATS" }),
    "nationality-statistics": checkAccess({
      groups,
      pageName: "Customized_PDF_NATIONALITY_STATS",
    }),
  };
}

function getFirstAvailableTabKey(visibility) {
  for (const key of CUSTOMIZED_PDF_TAB_ORDER) {
    if (visibility[key]) {
      return key;
    }
  }
  return null;
}

function resolveDefaultTabKey({ queryType, visibility }) {
  if (!queryType) {
    return getFirstAvailableTabKey(visibility) ?? CUSTOMIZED_PDF_TAB_ORDER[0];
  }
  if (visibility[queryType]) {
    return queryType;
  }
  return getFirstAvailableTabKey(visibility) ?? CUSTOMIZED_PDF_TAB_ORDER[0];
}

export default function CustomizedPdf({ emiratesConfigValue }) {
  const intl = useIntl();
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

  const tabItems = useMemo(() => {
    const items = [];
    if (tabVisibility.expats) {
      items.push({
        key: "expats",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <ExpatriateGlobe fillProp="currentColor" size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Expats in the UAE" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility.violators) {
      items.push({
        key: "violators",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <ViolatorsDashboard size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Statistics of Violators in the UAE" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility["risk-register"]) {
      items.push({
        key: "risk-register",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <Warning size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Risk Register Statistics" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility.population) {
      items.push({
        key: "population",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <WorldWithPopulation size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "UAE Population Statistics" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility.borders) {
      items.push({
        key: "borders",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <BorderMovements size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Borders Statistics" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility["nationality-statistics"]) {
      items.push({
        key: "nationality-statistics",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <ExpatriateGlobe fillProp="currentColor" size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Nationality Statistics" })}
            </Col>
          </Row>
        ),
      });
    }
    return items;
  }, [tabVisibility, intl]);

  const hasAnyTabAccess = useMemo(
    () => getFirstAvailableTabKey(tabVisibility) != null,
    [tabVisibility]
  );

  useEffect(() => {
    if (tabVisibility[selectedTab]) {
      return;
    }
    const fallback = getFirstAvailableTabKey(tabVisibility);
    if (fallback != null) {
      setSelectedTab(fallback);
      router?.replace({
        pathname: '/customized-pdf',
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
        <Row justify="space-between" align="middle" wrap={false}>
          <Col flex="auto">
            <Tabs
              type="line"
              tabBarGutter={isRtl ? 0 : 32}
              bodyPaddingTop="none"
              activeKey={selectedTab}
              onChange={(v) => {
                setSelectedTab(v);
                router?.replace({
                  pathname: '/customized-pdf',
                  query: {
                    type: v
                  }
                })
              }}
              items={tabItems}
            />
          </Col>
        </Row>
      </Col>
      <Col
        style={{
          marginTop: "48px"
        }}
      >
        {
          selectedTab === "expats" && tabVisibility.expats && (
            <ExpatsStatistics emiratesConfigValue={emiratesConfigValue} />
          )
        }
        {
          selectedTab === "borders" && tabVisibility.borders && (
            <BorderStatistics />
          )
        }
        {
          selectedTab === "population" && tabVisibility.population && (
            <UaePopulationStatistics emiratesConfigValue={emiratesConfigValue} />
          )
        }
        {
          selectedTab === "risk-register" && tabVisibility["risk-register"] && (
            <RiskRegisterStatistics />
          )
        }
        {
          selectedTab === "violators" && tabVisibility.violators && (
            <ViolatorsStatistics emiratesConfigValue={emiratesConfigValue} />
          )
        }
        {
          selectedTab === "nationality-statistics" && tabVisibility["nationality-statistics"] && (
            <NationalityStatistics emiratesConfigValue={emiratesConfigValue} />
          )
        }
      </Col>
    </Row>
  );
}
