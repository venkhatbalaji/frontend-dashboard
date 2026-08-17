import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Text, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { useState, useContext, useRef, useEffect, useMemo } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { tooltipConfig, legendsConfig } from "@/utils/highchartsConfig";
import { formatNumber, checkRtl, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";
import Segmented from "@/components/Segmented";
import LineChart from "@/components/LineChart";
import ColumnChart from "@/components/ColumnChart";
import _ from "lodash";


const {
  LineSegments,
  ChartBar,
  Info
} = PhosphorIcons;


function getTooltip(title, isRtl, intl, isBarChartOnly) {
  return function () {
    const seriesName = this?.series?.name?.includes("(%") ? this?.series?.name?.split("(%")?.[0] : this?.series?.name?.includes("%") ? this?.series?.name?.split("%")?.[0] : this?.series?.name;
    return `
      <div
        style="font-family: var(--fontFamily); text-align: ${resolveTernary(isRtl, "right", "left")}"
      >
        <div>${title}</div>
        ${!isBarChartOnly ?
    `<div>
      ${intl?.formatMessage({ id: "Year" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>`
    : `
    <div>
      ${this?.series?.name}: <span style="font-weight: bold;">${this?.x}</span>
    </div>
    `
}
        <div style="font-family: var(--fontFamily); direction: ${isRtl ? 'rtl' : 'ltr'}">
        <span>
            ${isBarChartOnly ? `${intl?.formatMessage({ id: "Value" })}` : seriesName}:
        </span>
          <span dir="${isRtl ? 'rtl' : 'ltr'}" style="font-weight: bold;">
                        ${_.isNumber(this?.point?.y) ?
    resolveTernary(
      this?.series?.name?.includes("%"),
      `${formatNumber(this?.point?.y, { decimals: 2 })}%`,
      formatNumber(this?.point?.y, { decimals: 2 })
    )
    : "-"
}
          </span>
        </div>
      </div>
    `;
  }
}

function LineBarChart({ actionEle, axisValue, axisText, isBarChartOnly, title, chartName = "", data, icon, isLoading, isEmpty, tooltipKey, pageRef, isPreviewOpen }) {
  const intl = useIntl();
  const contentRef = useRef();
  const getResponsive = useResponsive();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)

  const [showBy, setShowBy] = useState(
    resolveTernary(
      isPreviewOpen,
      pageRef.current?.[chartName]?.showBy,
      resolveTernary(isBarChartOnly, "bar", "trend")
    )
  );

  // Calculate maximum and minimum values from data for consistent chart scaling
  const { maxValue, minValue } = useMemo(() => {
    if (!data?.values || !Array.isArray(data.values)) return { maxValue: null, minValue: null };
    const validValues = data.values.filter(val => typeof val === 'number' && !isNaN(val));
    if (validValues.length === 0) return { maxValue: null, minValue: null };

    const calculatedMax = Math.max(...validValues);
    const calculatedMin = Math.min(...validValues);
    const finalMax = Math.ceil(calculatedMax * 1.10); // Add 10% padding
    const finalMin = calculatedMin < 0 ? calculatedMin : 0; // Use minValue if less than 0, else 0
    return { maxValue: finalMax, minValue: finalMin };
  }, [data?.values]);

  // Custom legend formatter to handle text wrapping
  const getLegendFormatter = useMemo(() => {
    return function () {
      const name = this.name;
      if (!name) return '';

      // If the name is longer than 30 characters, break it into multiple lines
      if (name.length > 40) {
        const words = name.split(' ');
        const lines = [];
        let currentLine = '';

        for (const word of words) {
          if ((currentLine + word).length > 40 && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
          } else {
            currentLine += word + ' ';
          }
        }

        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }

        return lines.join('<br/>');
      }

      return name;
    };
  }, []);

  useEffect(() => {
    pageRef.current[chartName] = {
      ...pageRef.current[chartName],
      showBy
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy])

  return (
    <DashboardCard
      titleEle={
        <Row style={{ minHeight: "44px" }} wrap={false} align="middle" gutter={20}>
          <Col flex="auto">
            <Row style={{ maxWidth: "100%" }} wrap={false} align="middle" gutter={8}>
              {
                getResponsive({ default: "true", mobile: "false" }) === "true" &&
                <Col flex="none">
                  {icon}
                </Col>
              }
              <Col flex="auto">
                <Row style={{ position: "relative", width: "fit-content" }} wrap={false} align="start" gutter={4}>
                  <Col
                    flex="none"
                    style={{
                      whiteSpace: "normal"
                    }}
                  >
                    <div
                      ref={contentRef}
                    >
                      <span style={{ position: "relative" }}>
                        {title}
                        <span>
                          <Tooltip
                            title={tooltipKey}
                          >
                            <span style={{
                              position: "absolute",
                              ...isRtl
                                ? { left: "-20px" }
                                : { right: "-20px" }
                            }}>
                              <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                            </span>
                          </Tooltip>
                        </span>
                      </span>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>

          <Col flex="none">
            {
              resolveTernary(
                actionEle,
                actionEle,
                (!isEmpty && !isBarChartOnly) &&
                <Segmented
                  isSegmentedBold
                  size="default"
                  onChange={(e) => {
                    setShowBy(e);
                  }}
                  block={getResponsive({
                    default: false,
                    mobile: false,
                  })}
                  value={showBy}
                  options={[
                    {
                      icon: <LineSegments style={{ marginBottom: "3px" }} size={16} />,
                      ...getResponsive({ default: "true", mobile: "false" }) === "true" && {
                        label: <Text>{intl.formatMessage({ id: "Trend" })}</Text>
                      },
                      value: "trend"
                    },
                    {
                      icon: <ChartBar style={{ marginBottom: "3px" }} size={16} />,
                      ...getResponsive({ default: "true", mobile: "false" }) === "true" && {
                        label: <Text>{intl.formatMessage({ id: "Bar" })}</Text>
                      },
                      value: "bar"
                    }
                  ]}
                />
              )
            }
          </Col>
        </Row>
      }
      icon={icon}
      cardBodyHeight={getResponsive({ default: "440px", desktop: "412px" })}
      loading={isLoading}
      bodyBackgroundColor="transparent"
      cardBodyPadding={resolveTernary(isLoading, "16px", "0px")}
      isEmpty={isEmpty}
    >
      <Row isFullHeight>
        <Col>
          {
            axisText &&
            <Row
              style={{
                marginBottom: "12px"
              }}
            >
              <Col>
                <Row align="middle">
                  <Col flex="none">
                    <Text style={{ fontSize: "16px", lineHeight: "24px" }} strong>{axisValue}</Text>&nbsp;
                  </Col>
                  <Col style={{ lineHeight: "14px", maxHeight: "24px" }} flex="none">
                    <Text size="sm">{axisText}</Text>
                  </Col>
                </Row>
              </Col>
            </Row>
          }
          {
            resolveTernary(
              showBy === "trend",
              (
                <Row
                  style={{
                    height: !axisText ? "100%" : "calc(100% - 40px)"
                  }}
                  gutter={[12, 12]}
                  wrap={getResponsive({ default: false, mobile: true })}
                >
                  <Col>
                    <LineChart
                      xAxis={{
                        categories: data?.categories,
                        endOnTick: false,
                        type: 'category',
                        labels: {
                          rotation: isRtl ? 45 : -45, // or -30
                          style: {
                            color: "var(--colorText)",
                            whiteSpace: 'nowrap',
                          }
                        },
                        ...(data?.categories?.length > 7 && !isPreviewOpen) && {
                          min: 0,
                          max: 7,
                          scrollbar: {
                            enabled: true
                          },
                        }
                      }}
                      yAxis={{
                        ...(maxValue && minValue !== null && {
                          max: maxValue,
                          min: minValue,
                          startOnTick: false,
                          endOnTick: true,
                          allowDecimals: false
                        })
                      }}
                      legend={{
                        ...legendsConfig,
                        floating: false,
                        rtl: isRtl,
                        useHTML: true,
                        labelFormatter: getLegendFormatter,
                        itemStyle: {
                          ...legendsConfig.itemStyle,
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          textAlign: isRtl ? 'right' : 'left',
                          maxWidth: '250px'
                        }
                      }}
                      tooltip={{
                        formatter: getTooltip(title, isRtl, intl, isBarChartOnly),
                        ...tooltipConfig,
                      }}
                      values={[{
                        data: data?.values,
                        color: "var(--brand-gold-6)",
                        name: chartName,
                        showInLegend: false,
                        marker: {
                          enabled: true,
                          lineColor: "var(--brand-gold-6)",
                          fillColor: 'var(--colorBgContainer)',     // Hollow (white or background color)
                          lineWidth: 2,             // Thickness of the border
                        }
                      },
                      {
                        data: [],
                        color: "var(--brand-gold-6)",
                        name: chartName,
                        marker: {
                          enabled: true,
                          lineColor: "var(--brand-gold-6)",
                          fillColor: 'var(--brand-gold-6',
                          lineWidth: 2,             // Thickness of the border
                        },
                        showInLegend: true,
                      }
                      ]}
                    />
                  </Col>
                </Row>
              ),
              (
                <Row
                  style={{
                    height: !axisText ? "100%" : "calc(100% - 40px)"
                  }}
                  gutter={[12, 12]}
                  wrap={getResponsive({ default: false, mobile: true })}
                >
                  <Col>
                    <ColumnChart
                      xAxis={{
                        categories: data?.categories,
                        endOnTick: false,
                        labels: {
                          rotation: isRtl ? 45 : -45, // or -30
                          style: {
                            color: "var(--colorText)",
                            whiteSpace: 'nowrap',
                          }
                        },
                        ...(data?.categories?.length > 7 && !isPreviewOpen) && {
                          min: 0,
                          max: 7,
                          scrollbar: {
                            enabled: true
                          },
                        }

                      }}
                      yAxis={{
                        ...(maxValue && minValue !== null && {
                          max: maxValue,
                          min: minValue,
                          startOnTick: false,
                          endOnTick: true,
                          allowDecimals: false
                        })
                      }}
                      legend={{
                        ...legendsConfig,
                        floating: false,
                        rtl: isRtl,
                        useHTML: true,
                        labelFormatter: getLegendFormatter,
                        itemStyle: {
                          ...legendsConfig.itemStyle,
                          whiteSpace: 'normal',
                          wordWrap: 'break-word',
                          maxWidth: '200px'
                        }
                      }}
                      tooltip={{
                        formatter: getTooltip(title, isRtl, intl, isBarChartOnly),
                        ...tooltipConfig,
                      }}
                      isYAxisLine={true}
                      isXAxisLine={true}
                      values={[{
                        data: data?.values,
                        name: chartName,
                        color: "var(--brand-gold-6)",
                      }]}
                    />
                  </Col>
                </Row>
              )
            )
          }
        </Col>
      </Row>
    </DashboardCard>
  )
}

LineBarChart.propTypes = {
  axisValue: PropTypes.any,
  axisText: PropTypes.any,
  isBarChartOnly: PropTypes.any,
  title: PropTypes.any,
  chartName: PropTypes.any,
  data: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.any,
  isEmpty: PropTypes.any,
  tooltipKey: PropTypes.any,
  actionEle: PropTypes.any,
  pageRef: PropTypes.any,
  isPreviewOpen: PropTypes.any,
};

LineBarChart.defaultProps = {
  axisValue: null,
  axisText: null,
  isBarChartOnly: false,
  title: '',
  chartName: '',
  data: null,
  icon: null,
  isLoading: false,
  isEmpty: false,
  tooltipKey: '',
  pageRef: undefined,
  isPreviewOpen: false,
};

export default LineBarChart;