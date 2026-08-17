import PropTypes from "prop-types"
import React, { useState, useContext, useEffect, useRef } from "react";
import {
  Row,
  Col,
  theme,
  Card,
  Text,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import dynamic from "next/dynamic";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, getEmirateData, formatNumber, getColorFromPercentage } from "@/utils/helper";
import UAE_JSON from "@/components/Map/UAE_GEO.json";
import { tooltipConfig } from "@/utils/highchartsConfig";
import _ from "lodash";
import useResponsive from "@/hooks/useResponsive";

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

const FILTER_SECTION_WIDTH = 220;

const DynamicMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

const { useToken } = theme;


function getTooltip(isRtl, intl) {
  return function () {
    return `
      <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Emirate City",
})}: <span style="font-weight: bold;">${this?.key}</span></div>
<div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Value",
})}: <span style="font-weight: bold;">${_.isNumber(this?.point?.value) ? formatNumber(this?.point?.value) : "-"
}</span></div>
    `;

  }
}

function getGlobalFilterItem(globalFilterActiveEmirate, item) {
  if (globalFilterActiveEmirate?.length && globalFilterActiveEmirate?.includes(item?.code)) {
    if (_.isNumber(item?.value)) {
      return formatNumber(item?.value)
    }
    return "-"
  }
  return "-"
}
function getBorderColor(selectedOptions, item, themeVariables) {
  return selectedOptions?.includes(item?.name)
    ? themeVariables?.token?.colorPrimaryBase
    : themeVariables?.token?.colorBorderSecondary
}

function ResidentsByEmirate({
  filter = {},
  data = {},
  title = "",
  subtitle = "",
  icon = null,
  emiratesConfigValue = [],
  segmentProps,
  isLoading,
  totalValue,
  isPreview,
  ...props
}) {
  const intl = useIntl();
  const chartRef = useRef();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  const patchedGetResponsiveFn = patchedGetResponsive(getResponsive, isPreview, false);
  const emirateMap = getEmirateData(themeVariables, emiratesConfigValue, isRtl);

  const [selectedOptions, setSelectedOptions] = useState([]);
  const transformedMapData = Object.keys(emirateMap)?.map((value) => {
    const color =  data[value]
      ? getColorFromPercentage({
        percent: ((data[value] / totalValue) * 100),
      })
      : "var(--geek-blue-2)"
      
    
    return {
      "hc-key": emirateMap[value]?.code,
      value: data[value],
      name: emirateMap[value]?.label,
      color: !selectedOptions?.length || selectedOptions?.includes(emirateMap[value]?.label) ? color : "var(--geek-blue-2)",
      legendColor: emirateMap[value]?.color,
      z: data[value],
      y: data[value],
      code: emirateMap[value]?.emirate_code
    };
  });

  const filteredPieChartData = !filter?.emirates ? transformedMapData : transformedMapData?.filter((v) => filter?.emirates?.includes(v?.code));
  

  const mapProps = {
    chart: {
      margin: [0, 0, 30, 0],
      map: UAE_JSON,
      events: {
        load: async function () {
          const chart = this;
          if (chart) {
            chartRef.current = chart;
          }
        }
      },
    },
    values: [
      {
        data: filteredPieChartData,
        showInLegend: false,
        joinBy: "hc-key",
        name: "",
        nullColor: "var(--geek-blue-2)",
        dataLabels: {
          enabled: false,
          useHTML: true,
          format: "{point.name}",
          style: {
            color: 'black',  // Text color
            textShadow:
              `-1px -1px 0 white,  
                1px -1px 0 white,
                -1px 1px 0 white,
                1px 1px 0 white`,
            // fontFamily: 'var(--fontFamily)', // Ensure the font supports Arabic
            textOutline: '1px white',  // Outline color and width
          }
        },
      },
    ],
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      outside: false,
      ...tooltipConfig,
    },
  };


  const onEmirateClick = (value = {}, options = []) => {
    let _filterData = [];
    if (options?.includes(value?.name)) {
      _filterData = [];
    } else {
      _filterData = [value?.name];
    }
    setSelectedOptions(_filterData);
  };

  const highlightTooltip = (item) => {
    if (chartRef?.current) {
      const chart = chartRef.current;
      chart?.series?.forEach((s) => {
        if (s?.data?.length) {
          const point = _.cloneDeep(s?.data)?.find((v) => {
            return v?.options?.["hc-key"] === (item?.["hc-key"] || item?.["code"])
          })
          // // Ensure that the point exists before refreshing the tooltip
          if (point) {
            setTimeout(() => {
              chart?.tooltip?.refresh(point); // Show the tooltip for that point
            }, 200);
          }
        }
      })
    }
  }

  useEffect(() => {
    if (filter?.emirate?.code) {
      setSelectedOptions([filter?.emirate?.label]);
      highlightTooltip(filter?.emirate)
    } else {
      setSelectedOptions([]);
    }
  }, [filter?.emirate]);

  return (
    <Row
      isFullHeight
      wrap={patchedGetResponsiveFn({
        default: false,
        mobile: true,
      })}
      gutter={patchedGetResponsiveFn({
        default: themeVariables?.token?.marginXS,
        mobile: [0, themeVariables?.token?.marginXS],
      })}
    >
      <Col
        isFlex
        flex={patchedGetResponsiveFn({
          default: "auto",
          mobile: "100%",
        })}
        style={{
          height: patchedGetResponsiveFn({
            default: undefined,
            mobile: "185px",
            position: "relative"
          }),
        }}
      >
        
        <>
          <div
            style={{
              height: "100%"
            }}
          >
            <DynamicMap
              mapNavigation={{
                enabled: true,
                useHTML: true,
                buttonOptions: {
                  align: isRtl ? "right": "left",
                  verticalAlign: 'bottom',
                  y: -4, // Adjust to move buttons if necessary
                  x: isRtl ? -1 : 1,
                  theme: {
                    r: 6, // change border radius here
                  },
                  style: {
                    // Customize styles if needed
                    backgroundColor: 'var(--colorBgContainer)',
                    borderColor: 'var(--colorBorder)',
                    borderRadius: '5px', // Add border radius here
                    padding: '5px', // Optional: Adjust padding for better appearance
                    fontSize: '12px' // Optional: Adjust font size
                  }
                }
              }}
              {...mapProps}
            />
          </div>
          {
            (filteredPieChartData?.length || 0) > 0 &&
            <div
              style={{
                position: "absolute",
                right: patchedGetResponsiveFn({ default: 40, mobile: 3 }),
                left: patchedGetResponsiveFn({ default: 40, mobile: 3 }),
                margin: "auto",
                bottom: 12,
                width: patchedGetResponsiveFn({ default: "auto" }),
                height: "7px",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "4px",
                direction: "ltr",
                background: 'linear-gradient(90deg, #EDE3CF 0%, #684F1E 100%)'
              }}
            >
              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "Fewer Violations" })}
                </Text>
              </span>

              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "More Violations" })}
                </Text>
              </span>
            </div>
          }
        </>
        
      </Col>
      <Col
        flex={patchedGetResponsiveFn({
          default: `${FILTER_SECTION_WIDTH}px`,
          mobile: "100%",
        })}
        style={{
          margin: "auto",
          ...patchedGetResponsiveFn({ mobile: "true" }) === "true" && {
            marginTop: "12px"
          }
        }}
        isFlex
      >
        <Row gutter={[0, themeVariables?.token?.marginXS]}>
          {transformedMapData?.map((item) => {
            const globalFilterApplied = !!filter?.emirates?.length;
            const globalFilterActiveEmirate = filter?.emirates;

            return (
              <Col key={item?.name}>
                <Card
                  bodyStyle={{
                    padding: `${themeVariables.token?.paddingXXS}px ${themeVariables.token?.paddingXS}px`,
                    height: "32px",
                    display: "flex",
                    borderRadius: themeVariables?.token?.borderRadiusLG,
                    border: `1px solid ${getBorderColor(selectedOptions, item, themeVariables)}`,
                    borderBottomWidth: selectedOptions?.includes(item?.name)
                      ? 2
                      : 1,
                  }}
                  {...((!filter?.emirates?.length || filter?.emirates?.includes(item?.code)) && {
                    onCardClick: () => {
                      onEmirateClick(item, selectedOptions)

                      if (chartRef?.current) {
                        highlightTooltip(item)
                      }
                    },
                  })}
                  {...(filter?.emirates?.length &&
                    !filter?.emirates?.includes(item?.code) && {
                    style: {
                      opacity: 0.6,
                    },
                  })}
                >
                  <Row
                    align="middle"
                    justify="space-between"
                    style={{ width: "100%" }}
                    wrap={false}
                  >
                    <Col flex="none">
                      <Row isFlex align="middle">
                        <Col
                          isFlex
                          flex="none"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: getColorFromPercentage({
                              percent: ((item?.value / totalValue) * 100),
                            }) 
                          }}
                        />
                        <Col
                          isFlex
                          flex="none"
                          paddingInline={`${themeVariables?.token?.paddingXXS}px 0px`}
                        >
                          <Text size="sm">{item?.name}</Text>
                        </Col>
                      </Row>
                    </Col>
                    <Col flex="none">
                      {globalFilterApplied ? (
                        <Text size="sm" strong>
                          :&nbsp;
                          {getGlobalFilterItem(globalFilterActiveEmirate, item)}
                        </Text>
                      ) : (
                        <Text
                          ellipsis={{
                            tooltip: _.isNumber(item?.value)
                              ? formatNumber(item?.value)
                              : "-"
                          }}
                          size="sm"
                          strong
                        >
                          :&nbsp;
                          {_.isNumber(item?.value)
                            ? formatNumber(item?.value)
                            : "-"}
                        </Text>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Col>
    </Row>
  );
}

ResidentsByEmirate.propTypes = {
  data: PropTypes.any,
  emiratesConfigValue: PropTypes.any,
  filter: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.any,
  segmentProps: PropTypes.any,
  subtitle: PropTypes.string,
  title: PropTypes.string,
  totalValue: PropTypes.any,
  isPreview: PropTypes.any
}

export default ResidentsByEmirate;
