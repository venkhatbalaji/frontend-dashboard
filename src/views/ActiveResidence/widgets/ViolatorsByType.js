import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { Row, Col, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl, formatNumber } from "@/utils/helper";
import { getViolatorsByType } from "@/services/activeResidenceService";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import Tabs from "@/components/Tabs"
import TabItemSecondary from "@/components/Tabs/TabItemSecondary"
import PieChart from "@/components/PieChart";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";

const {
  UsersThree,
  IdentificationCard,
  Buildings
} = PhosphorIcons;

function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? `${formatNumber(this?.point?.y)} (${(this?.point?.percentage || 0)?.toFixed(2)}%)` : '-'}</span>
    </div>
  `;
  }
}

function getTabsOptions(filters, data, intl) {
  const tabConfig = {
    all: {
      value: formatNumber(data?.total_violators) || 0,
      icon: <UsersThree weight="duotone" size={24} color="var(--colorPrimaryBase)" />,
      label: intl?.formatMessage({ id: "Total" })
    },
    visa: {
      value: formatNumber(data?.visa_violators) || 0,
      icon: <IdentificationCard weight="duotone" color="var(--custom-gold-2)" size={24} />,
      label: intl?.formatMessage({ id: "Visa Violators" })
    },
    residency: {
      value: formatNumber(data?.residency_violators) || "-",
      icon: <Buildings weight="duotone" color="var(--custom-gold-1)" size={24} />,
      label: intl?.formatMessage({ id: "Residency Violators" })
    }
  };

  const makeTab = key => ({
    key,
    children: (
      <TabItemSecondary
        value={tabConfig[key].value}
        icon={tabConfig[key].icon}
        label={tabConfig[key].label}
      />
    )
  });

  let keysToShow;
  if (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') {
    keysToShow = ['all', 'visa', 'residency'];
  } else if (filters?.residents_category === 'visa') {
    keysToShow = ['visa'];
  } else if (filters?.residents_category === 'residents') {
    keysToShow = ['residency'];
  } else {
    keysToShow = [];
  }

  return keysToShow.map(makeTab);
}

function ViolatorsByType({
  icon, title = "",
  filters,
  isPreview,
  isPreviewOpen
}) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive();
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getViolatorsByType });

  useEffect(() => {
    invokeApi({ filters: { ...filters, language: isRtl ? "ar": "en" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const data = value?.data || {};
  const isLoading = ["pending", "idle"]?.includes(apiStatus);
  const isEmpty = !isLoading && !data?.visa_violators && !data?.residency_violators;

  // Patch getResponsive for preview mode
  const patchedGetResponsive = (config) => {
    if ((isPreview || isPreviewOpen) && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };

  // Prepare pie chart data
  const pieValues = [
    {
      size: '100%',
      showInLegend: true,
      colorByPoint: true,
      data: [
        {
          name: intl.formatMessage({ id: "Visa Violators" }),
          y: data?.visa_violators || 0,
          color: 'var(--custom-gold-2)',
        },
        {
          name: intl.formatMessage({ id: "Residency Violators" }),
          y: data?.residency_violators || 0,
          color: 'var(--custom-gold-1)',
        }
      ],
      dataLabels: {
        enabled: false,
      },
    },
  ];

  const pieProps = {
    title: "",
    values: pieValues,
    style: {},
    type: "basicPie",
    legend: {
      ...legendsConfig,
      rtl: isRtl,
      enabled: true,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  return (
    <DashboardCard
      isPreview={isPreview}
      isPreviewOpen={isPreviewOpen}
      title={title}
      icon={icon}
      cardBodyHeight={patchedGetResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
      loading={isLoading}
      titleItemsWrapProps={{
        wrap: patchedGetResponsive({ default: "false", mobile: "true" }) === "true",
        ...patchedGetResponsive({ default: false, mobile: true }) && {
          style: {
            maxWidth: "77%",
            whiteSpace: "pre-wrap"
          }
        }
      }}
    >
      <Row isFullHeight>
        <Col flex="auto">
          <PieChart {...pieProps} />
        </Col>
        <Col
          flex={patchedGetResponsive({ default: "0 0 162px", mobile: "0 0 100%" })}
          style={{
            display: "flex",
            alignItems: "center"
          }}
        >
          <Tabs
            isCustom
            customType={"secondary"}
            tabStyle={{
              cursor: "normal",
            }}
            onChange={() => {}}
            options={getTabsOptions(filters, data, intl)}
          />
        </Col>
      </Row>
    </DashboardCard>
  )
}

ViolatorsByType.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any,
  filters: PropTypes.any,
  isPreview: PropTypes.any,
  isPreviewOpen: PropTypes.any
}

export default ViolatorsByType;
