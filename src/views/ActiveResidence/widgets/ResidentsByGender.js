import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Text, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { useEffect, useMemo, useState } from "react";
import Gender from "@/svgr/Gender";
import PieChart from "@/components/PieChart";
import Tabs from "@/components/Tabs"
import TabItemSecondary from "@/components/Tabs/TabItemSecondary"
import { formatNumber } from "@/utils/helper";
import CountrySpecificGender from "./CountrySpecificGender";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { getResidentsByGender } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";
import GenderMale from "@/svgr/GenderMale"
import GenderFemaleOrange from "@/svgr/GenderFemaleOrange"
import Segmented from "@/components/Segmented";


const {
  UsersThree,
  ChartDonut,
  GlobeHemisphereWest,
  Info
} = PhosphorIcons;


function getTooltip(isRtl, intl) {
  return function() {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Gender" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? `${formatNumber(this?.point?.y)} (${(this?.point?.percentage || 0)?.toFixed(2)}%)` : '-'}</span>
    </div>
  `;
  }
}

function ResidentsByGender({ isPreviewOpen, pageRef, filters, isRtl }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsByGender });

  const [showBy, setShowBy] = useState(isPreviewOpen ? pageRef.current?.residentsByGender?.showBy : "overall");

  useEffect(() => {
    pageRef.current.residentsByGender = {
      ...pageRef.current.residentsByGender,
      showBy
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy])
  
  useEffect(() => {
    execute({ filters: { ...filters } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const data = value?.data?.summary || {};
  const countrySpecificData = value?.data?.nationalities || [];
  const isLoading = ["idle", "pending"]?.includes(status);
  const isEmpty = !isLoading && !countrySpecificData?.length;

  const values = useMemo(() => {
    return [
      {
        size: '100%',
        innerSize: '65%',
        showInLegend: true,
        colorByPoint: true,
        data: [
          {
            name: intl.formatMessage({ id: "Male" }),
            y: data?.males,
            color: 'var(--custom-gold-1)',
            dataLabels: {
              enabled: false,
            },
            showInLegend: true
          },
          {
            name: intl.formatMessage({ id: "Female" }),
            y: data?.females,
            color: 'var(--custom-gold-2)',
            dataLabels: {
              enabled: false,
            },
            showInLegend: true
          }
        ]
      },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function getSubtitle() {

    return `
        <div style="text-align: center;">
          <div style="font-size: 20px; font-weight: 600; font-family: var(--fontFamily); color: var(--colorText)">${formatNumber(data?.total || 0)}</div>
          <div style="font-size: 12px; font-weight: 400; font-family: var(--fontFamily); color: var(--colorTextLabel)">${intl?.formatMessage({ id: "Total" })}</div>
        </div>`;
  }

  const props = useMemo(() => {
    return {
      title: "",
      values,
      style: {},
      type: "basicPie",
      legend: {
        ...legendsConfig,
        rtl: isRtl,
      },
      subtitle: {
        useHTML: true,
        text: getSubtitle(),
        floating: true,
        verticalAlign: 'middle',
        y: 15
      },
      tooltip: {
        formatter: getTooltip(isRtl, intl),
        ...tooltipConfig,
      },
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])
  
  // Patch getResponsive for preview mode
  const patchedGetResponsive = (config) => {
    if (isPreviewOpen && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };

  return (
    <DashboardCard
      isPreview={isPreviewOpen}
      isPreviewOpen={isPreviewOpen}
      title={
        <Row align="middle" gutter={4}>
          <Col flex="auto" style={{ maxWidth: isPreviewOpen ? "90%" : window?.innerWidth < 400 ? "calc(100% - 30px)" : "100%", whiteSpace: "break-spaces" }}>
            <span style={{ position: "relative" }}>
              {intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Residents & Visa Holders by Gender" : filters?.residents_category === 'visa' ? "Visa Holder by Gender" : "Residents By Gender" })}
              <span
                style={{ position: "absolute", ...isRtl ? { left: "-20px" } : { right: "-20px" }, bottom: isRtl ? "4px" : "-2px" }}
              >
                <Tooltip
                  title={intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "residents_visa_holders_gender_tooltip" : filters?.residents_category === 'visa' ? "active_visa_holders_gender_tooltip" : "active_residence_residency_gender_tooltip" })}
                >
                  <span>
                    <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                  </span>
                </Tooltip>
              </span>
            </span>
          </Col>
        </Row>
      }
      icon={<Gender />}
      cardBodyHeight={patchedGetResponsive({ default: "440px", desktop: "412px", mobile: showBy !== "overall" ? "412px" : "auto" })}
      loading={isLoading}
      {
        ...showBy !== "overall" && {
          bodyBackgroundColor: "transparent",
          cardBodyPadding: "0px"
        }
      }
      isEmpty={isEmpty}
      action={(
        !isEmpty &&
        <Segmented
          isSegmentedBold
          size="default"
          onChange={(e) => {
            setShowBy(e);
          }}
          block={patchedGetResponsive({
            default: false,
            mobile: true,
          })}
          value={showBy}
          options={[
            {
              icon: <ChartDonut style={{ marginBottom: "3px" }} size={16} />,
              label: <Text>{intl.formatMessage({ id: "Overall" })}</Text>,
              value: "overall"
            },
            {
              icon: <GlobeHemisphereWest style={{ marginBottom: "3px" }} size={16} />,
              label: <Text>{intl.formatMessage({ id: "Country Specific" })}</Text>,
              value: "country_specific"
            }
          ]}
        />
      )}
    >
      <Row isFullHeight>
        <Col>
          {
            showBy === "overall"
              ? (
                <Row
                  isFullHeight
                  gutter={[12, 12]}
                  wrap={patchedGetResponsive({ default: false, mobile: true })}
                >
                  <Col
                    flex={patchedGetResponsive({ default: "auto", mobile: "0 0 100%" })}
                    style={{
                      ...patchedGetResponsive({ default: false, mobile: true }) && {
                        height: "250px"
                      }
                    }}
                  >
                    <PieChart {...props} />
                  </Col>
                  <Col style={{ margin: "auto" }} flex={patchedGetResponsive({ default:  "0 0 174px", mobile: "0 0 100%" })}>
                    <Tabs
                      isCustom
                      customType={"secondary"}
                      tabStyle={{
                        cursor: "normal"
                      }}
                      options={[
                        {
                          key: "all",
                          children: (
                            <TabItemSecondary value={formatNumber(data?.total || 0) || "-"} icon={<UsersThree weight="duotone" size={24} color="var(--colorPrimaryBase)" />} label={intl?.formatMessage({ id: "Total" })} />
                          )
                        },
                        {
                          key: "male",
                          children: (
                            <TabItemSecondary value={formatNumber(data?.males) || "-"} icon={<GenderMale weight="duotone" color="var(--custom-gold-1)" size={24} />} label={intl?.formatMessage({ id: "Male" })} />
                          )
                        },
                        {
                          key: "female",
                          children: (
                            <TabItemSecondary value={formatNumber(data?.females) || "-"} icon={<GenderFemaleOrange weight="duotone" color="var(--custom-gold-2)" size={24} />} label={intl?.formatMessage({ id: "Female" })} />
                          )
                        }
                      ]}
                    />
                  </Col>
                </Row>
              )
              : (
                <CountrySpecificGender
                  filter={filters}
                  data={countrySpecificData}
                />
              )
          }
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByGender.propTypes = {
  filters: PropTypes.any,
  isRtl: PropTypes.any,
  isPreviewOpen: PropTypes.any,
  pageRef: PropTypes.any
}

export default ResidentsByGender;