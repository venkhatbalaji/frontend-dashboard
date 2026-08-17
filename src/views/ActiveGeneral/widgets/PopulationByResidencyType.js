import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Tooltip, Card, Text, theme, Scrollbars } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import PieChart from "@/components/PieChart";
import ExpatriateGlobe from "@/svgr/ExpatriateGlobe";
import { useState, useEffect } from "react";
import { formatNumber, getColorByIndex } from "@/utils/helper";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { getResidentsByResidencyType } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";

const { Info } = PhosphorIcons;
const { useToken } = theme;



function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Residency Type" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? `${formatNumber(this?.point?.y)} (${(this?.point?.percentage || 0)?.toFixed(2)}%)` : '-'}</span>
    </div>
  `;
  }
}

function getBorderColor(selectedOptions, item, themeVariables) {
  return selectedOptions?.resident_type_en === item?.resident_type_en
    ? themeVariables?.token?.colorPrimaryBase
    : themeVariables?.token?.colorBorderSecondary
}

function ResidentsByResidencyType({ filter, isRtl, isPreview, isPreviewOpen }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsByResidencyType });

  useEffect(() => {
    execute({ filter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isLoading = ["idle", "pending"]?.includes(status);
  const data = value?.data || [];
  const isEmpty = !isLoading && !data?.length;

  // Patch getResponsive for preview mode
  const patchedGetResponsive = (config) => {
    if ((isPreview || isPreviewOpen) && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };

  const values = [
    {
      size: '100%',
      showInLegend: false,
      colorByPoint: true,
      data: data?.map((v, index) => ({
        name: patchedGetResponsive({ default: (isRtl ? v?.resident_type_ar : v?.resident_type_en), mobile: (isRtl ? v?.resident_type_ar : v?.resident_type_en)?.split(" ")?.[0] }),
        y: v?.count,
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
        color: !selectedOptions || selectedOptions?.resident_type_en === v?.resident_type_en ? getColorByIndex(index) : "var(--geek-blue-2)",
      }))
    },
  ];


  const props = {
    title: "",
    values,
    style: {},
    type: "basicPie",
    legend: {
      ...(patchedGetResponsive({ default: legendsConfig, mobile: legendsConfig })),
      rtl: isRtl,
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
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Population By Residency Type" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_By_Residence_Type_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<ExpatriateGlobe />}
      loading={isLoading}
      cardBodyHeight={isPreview ? "685px" : patchedGetResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
    >
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
        <Col
          style={patchedGetResponsive({ default: {}, mobile: { maxHeight: "250px", height: data?.length * 60 }})}
          flex={patchedGetResponsive({ default: "0 0 197px", mobile: "0 0 100%" })}
        >
          <Scrollbars>
            <Row style={{ margin: "auto", width: "100%", maxWidth: "100%" }} gutter={[0, themeVariables?.token?.marginXS]}>
              {data?.map((item, index) => {
                return (
                  <Col key={item?.resident_type_en}>
                    <Card
                      bodyStyle={{
                        paddingBlock: `${themeVariables.token?.paddingXXS}px`,
                        paddingInline: `${themeVariables.token?.paddingXS}px ${themeVariables.token?.padding}px`,
                        // height: "32px",
                        display: "flex",
                        borderRadius: themeVariables?.token?.borderRadiusLG,
                        border: `1px solid ${getBorderColor(selectedOptions, item, themeVariables)}`,
                        borderBottomWidth: selectedOptions && selectedOptions?.resident_type_en === item?.resident_type_en
                          ? 2
                          : 1,
                      }}
                      onCardClick={() => {
                        if (selectedOptions?.resident_type_en == item?.resident_type_en) {
                          setSelectedOptions(undefined)
                        } else {
                          setSelectedOptions(item)
                        }
                      }}
                    >
                      <Row
                        align="middle"
                        justify="space-between"
                        style={{ width: "100%" }}
                        wrap={true}
                      >
                        <Col span={24}>
                          <Row wrap={false} isFlex align="middle">
                            <Col
                              isFlex
                              flex="none"
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor: getColorByIndex(index)
                              }}
                            />
                            <Col
                              isFlex
                              flex="none"
                              paddingInline={`${themeVariables?.token?.paddingXXS}px 0px`}
                            >
                              <Text
                                size="sm"
                                ellipsis={{
                                  tooltip: isRtl ? item?.resident_type_ar : item?.resident_type_en
                                }}
                              >
                                {isRtl ? item?.resident_type_ar : item?.resident_type_en}
                              </Text>
                            </Col>
                          </Row>
                        </Col>
                        <Col
                          span={24}
                          paddingInline="12px"
                        >
                          <Text
                            ellipsis={{
                              tooltip: _.isNumber(item?.count)
                                ? formatNumber(item?.count)
                                : "-"
                            }}
                            size="sm"
                            strong
                          >
                            {_.isNumber(item?.count)
                              ? formatNumber(item?.count)
                              : "-"}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </Scrollbars>
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByResidencyType.propTypes = {
  allTypes: PropTypes.any,
  filter: PropTypes.any,
  isRtl: PropTypes.any,
  isPreview: PropTypes.any,
  isPreviewOpen: PropTypes.any
}

export default ResidentsByResidencyType;