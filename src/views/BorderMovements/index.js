import PropTypes from "prop-types"
import {
  Row,
  Col,
  PhosphorIcons,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs"
import BorderMovements from "./BorderMovements";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";
import { useRouter } from "next/router";
import BorderMovementsSvg from "@/svgr/BorderMovements";
import { getBorderTypeConfig } from "@/services/commonService";
import VisaResidency from "./VisaResidency";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useState, useContext, useEffect, useMemo } from "react";
import { checkRtl, checkAccess } from "@/utils/helper";
import StorageService from "@/services/storageService";
import { DashboardTabsNoAccess } from "@/components/common/DashboardTabsNoAccess";
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOCVisa = withPageLoadDelay(VisaResidency);
const PageWithDelayHOCBorder = withPageLoadDelay(BorderMovements);

const { IdentificationBadge } = PhosphorIcons;

const BORDER_MOVEMENTS_TAB_ORDER = ["movements", "residency"];

function getTabVisibility(groups) {
  return {
    movements: checkAccess({
      groups,
      pageName: "Border_Movements_BORDER_MOVEMENTS_TAB",
    }),
    residency: checkAccess({
      groups,
      pageName: "Border_Movements_VISA_RESIDENCY_TAB",
    }),
  };
}

function getFirstAvailableTabKey(visibility) {
  for (const key of BORDER_MOVEMENTS_TAB_ORDER) {
    if (visibility[key]) {
      return key;
    }
  }
  return null;
}

function resolveDefaultTabKey({ queryType, visibility }) {
  if (!queryType) {
    return getFirstAvailableTabKey(visibility) ?? BORDER_MOVEMENTS_TAB_ORDER[0];
  }
  if (visibility[queryType]) {
    return queryType;
  }
  return getFirstAvailableTabKey(visibility) ?? BORDER_MOVEMENTS_TAB_ORDER[0];
}


function BorderMovementsWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
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

  const {
    value: borderTypeConfigValue,
  } = useAsync({ asyncFunction: getBorderTypeConfig, immediate: true });

  const hasAnyTabAccess = useMemo(
    () => getFirstAvailableTabKey(tabVisibility) != null,
    [tabVisibility]
  );

  const tabItems = useMemo(() => {
    const items = [];
    if (tabVisibility.movements) {
      items.push({
        key: "movements",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <BorderMovementsSvg size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Border Movements" })}
            </Col>
          </Row>
        ),
      });
    }
    if (tabVisibility.residency) {
      items.push({
        key: "residency",
        label: (
          <Row gutter={12} wrap={false}>
            <Col flex="none">
              <IdentificationBadge size={16} />
            </Col>
            <Col flex="none">
              {intl.formatMessage({ id: "Visa & Residency" })}
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
        pathname: '/border-movements',
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
              pathname: '/border-movements',
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
          selectedTab === "movements" && tabVisibility.movements && (
            <PageWithDelayHOCBorder
              nationalitiesConfigValue={nationalitiesConfigValue}
              nationalitiesConfigValueObj={nationalitiesConfigValueObj}
              borderTypeConfigValue={borderTypeConfigValue}
              emiratesConfigValue={emiratesConfigValue}
            />
          )
        }
        {
          selectedTab === "residency" && tabVisibility.residency && (
            <PageWithDelayHOCVisa
              emiratesConfigValue={emiratesConfigValue}
              nationalitiesConfigValue={nationalitiesConfigValue}
              nationalitiesConfigValueObj={nationalitiesConfigValueObj}
              borderTypeConfigValue={borderTypeConfigValue}
            />
          )
        }
      </Col>
    </Row>
  );
}
export default BorderMovementsWrap;

BorderMovementsWrap.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  emiratesConfigValue: PropTypes.any
}