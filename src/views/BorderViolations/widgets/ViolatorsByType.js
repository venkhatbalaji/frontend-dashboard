import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { Row, Col, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl, formatNumber } from "@/utils/helper";
import { getVisaViolationSummary } from "@/services/borderViolationService";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import PlotlyChart from "@/components/PlotlyChart";
import Tabs from "@/components/Tabs"
import TabItemSecondary from "@/components/Tabs/TabItemSecondary"

const {
  UsersThree,
  IdentificationCard,
  Buildings
} = PhosphorIcons;

// Utility function to force desktop/default layout values when in preview mode
const patchedGetResponsive = (getResponsive, isPreview, isPreviewOpen) => {
  return (config) => {
    if (isPreview || isPreviewOpen) {
      // Force desktop/default values for layout-related props in preview mode
      return config.default || config.desktop || Object.values(config)[0];
    }
    return getResponsive(config);
  };
};

function ViolatorsByType({
  icon, title = "",
  filter, dateRange,
  isPreview
}) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const patchedGetResponsiveFn = patchedGetResponsive(getResponsive, isPreview, false);
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getVisaViolationSummary });

  const data = value?.data?.chart_data?.data;

  useEffect(() => {
    invokeApi({ filter: { ...filter, ...dateRange, language: isRtl ? "ar": "en" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);

  const isLoading = ["pending", "idle"]?.includes(apiStatus)
  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      cardBodyPadding={!isLoading ? "0px" : "var(--paddingPx)"}
      cardBodyHeight={"calc(100% - 67px)"}
      title={title}
      icon={icon}
      style={{
        height: "100%"
      }}
      isEmpty={!data?.length}
      loading={isLoading}
      titleItemsWrapProps={{
        wrap: patchedGetResponsiveFn({ default: "false", mobile: "true" }) === "true",
        ...patchedGetResponsiveFn({ default: false, mobile: true }) && {
          style: {
            maxWidth: "77%",
            whiteSpace: "pre-wrap"
          }
        }
      }}
      isPreview={isPreview}
      isPreviewOpen={false}
    >
      <Row
        isFullHeight
      >
        <Col
          paddingInline={"var(--paddingSMPx)"}
          paddingBlock={"var(--paddingSMPx)"}
          style={{
            borderRadius: "var(--borderRadiusPx)",
            border: "1px solid var(--colorSplit)",
            backgroundColor: "var(--colorBgLayout)"
          }}
        >
          <Row
            isFullHeight
            wrap={isPreview ? false : patchedGetResponsiveFn({ default: false, mobile: true })}
            gutter={patchedGetResponsiveFn({ default: 8, mobile: [0, 8] })}
            style={{
              height: patchedGetResponsiveFn({ default: "100%", mobile: "367px" })
            }}
          >
            <Col
              flex="auto"
              paddingBlock={patchedGetResponsiveFn({ default: "0px", mobile: "8px 0px" })}
              style={{position: "relative"}}
            >
              <PlotlyChart
                data={data}
                customLegend={true}
              />
            </Col>

            <Col
              flex={patchedGetResponsiveFn({ default: "0 0 162px", mobile: "0 0 100%" })}
              style={{
                display: "flex",
                alignItems: "center"
              }}
            >
              <Tabs
                isCustom
                customType={"secondary"}
                // activeKey={showBy}
                tabStyle={{
                  cursor: "normal",
                }}
                optionsWrapperStyle={{
                  width: "100%"
                }}
                onChange={(key) => {
                  // setShowBy(key)
                }}
                options={[
                  {
                    key: "all",
                    children: (
                      <TabItemSecondary
                        isResponsive={patchedGetResponsiveFn({ default: "false", mobile: "true" }) === "true"}
                        value={formatNumber(value?.data?.total_violators) || 0}
                        icon={<UsersThree weight="duotone" size={24} color="var(--colorPrimaryBase)" />}
                        label={intl?.formatMessage({ id: "Total Violators" })}
                      />
                    )
                  },
                  {
                    key: "male",
                    children: (
                      <TabItemSecondary
                        value={formatNumber(value?.data?.visa_violators) || 0}
                        isResponsive={patchedGetResponsiveFn({ default: "false", mobile: "true" }) === "true"}
                        icon={<IdentificationCard weight="duotone" color="#9B752D" size={24} />}
                        label={intl?.formatMessage({ id: "Visa Violators" })}
                      />
                    )
                  },
                  {
                    key: "female",
                    children: (
                      <TabItemSecondary
                        isResponsive={patchedGetResponsiveFn({ default: "false", mobile: "true" }) === "true"}
                        value={formatNumber(value?.data?.residency_violators) || "-"}
                        icon={<Buildings weight="duotone" color="#D1B580" size={24} />}
                        label={intl?.formatMessage({ id: "Residency Violators" })}
                      />
                    )
                  }
                ]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </ DashboardCard>
  )
}

ViolatorsByType.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any
}

export default ViolatorsByType;
