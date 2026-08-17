import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types"
import { Row, Col, theme, Table, Tooltip, Progress, Avatar, Text, Empty, AntIcons, PhosphorIcons, Select } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import Flags from 'country-flag-icons/react/1x1'
import { checkRtl, getColorFromPercentage, formatNumber, resolveTernary } from "@/utils/helper";
import Image from "next/image";
import MapWrap from '@/components/MapWrap';
import Segmented from "@/components/Segmented";
import { TableFilterDropdown, InputWrap } from "@/components/TableFilterWidgets";
import { getVisaViolationNationality } from "@/services/borderViolationService";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";


const { useToken } = theme;
const { SearchOutlined } = AntIcons;
const { UsersFour, IdentificationBadge, GlobeHemisphereWest } = PhosphorIcons;

function AllNationality() {
  return <Image width={24} height={24} alt="flag" src={"/All_Nationality.png"} />
}

function handleMouseOver() {
  if (this?.options?.isHoverDisabled) {
    this.setState('normal');
  }
}

function FormatText(v) {
  if (v === "-") {
    return v
  }
  return <Text>{`${v}%`}</Text>
}

function _getTooltip(intl, isRtl, title) {
  return function tooltip() {
    return `
      <div style="font-family: var(--fontFamily);">
          ${isRtl ? this?.point?.nationalityAr : this?.point?.nationalityEn}
      </div>
      <div>
        <span>${intl?.formatMessage({ id: title })}:</span>
        <span style="font-weight: 600;">${[undefined, null]?.includes(this?.point?.totalViolations) ? '-' : formatNumber(this?.point?.totalViolations)}</span>
      </div>
      `;
  }
}


function ViolationsByNationality({
  icon, title = "",
  filter, dateRange,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden,
  pageRef
}) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState(undefined);
  const [showMapBy, setShowMapBy] = useState(isPreview ? pageRef.current.violationsByNationality.showMapBy : "totalViolations")
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  const [localeStore] = useContext(LocaleContext);
  const { geoJsonObj } = useWorldGeoJSON();
  const chartRef = useRef();
  const [printRows, setPrintRows] = useState(resolveTernary(offset, { from: offset, to: offset + 1 }, rows || { from: 0, to: 1 }));
  const hiddenContainerRef = useRef()

  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getVisaViolationNationality });

  useEffect(() => {
    pageRef.current.violationsByNationality = {
      ...pageRef.current.violationsByNationality,
      showMapBy
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMapBy])

  const mapStyle = {
    allAreas: false,
    showInLegend: false,
    borderColor: themeVariables?.token?.Map?.Border, // Or use 'none'
    borderWidth: 1,
    states: {
      hover: {
        enabled: true // Disable hover state
      }
    }
  }

  const _data = isPreview ? value?.data?.nationalities?.slice(0, 20) : value?.data?.nationalities;

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "nationalityAr" : "nationalityEn"])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedSearchText}
        appliedSearchText={appliedSearchText}
        setSearchText={setSearchText}
        searchText={searchText}
        data={_data}
      >
        {
          (d) => (
            <InputWrap
              data={d}
              setAppliedSearchText={setAppliedSearchText}
              searchText={searchText}
              size="default"
              onChange={(v) => {
                setSearchText(v)
                if (!v) {
                  setAppliedSearchText(v)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: appliedSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    invokeApi({ filter: { ...filter, ...dateRange, language: isRtl ? "ar" : "en" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);

  useEffect(() => {
    if (isPreview && !isPrint && isMapHidden && !["pending", "idle"]?.includes(apiStatus)) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } } });
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor(((space - 47) - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          }
        }
      }, [600]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, apiStatus])

  const sumTotal = useMemo(() => {
    let sum = 0;
    let min = 0;
    let max = 0;

    let minViolationRateByPopulation = 0;
    let maxViolationRateByPopulation = 0;

    let minResidentViolationRateByNational = 0;
    let maxResidentViolationRateByNational = 0;

    if (data?.length) {
      min = data?.[0]?.totalViolations;
      max = data?.[0]?.totalViolations;

      minViolationRateByPopulation = data?.[0]?.violation_rate_by_population;
      maxViolationRateByPopulation = data?.[0]?.violation_rate_by_population;
      minResidentViolationRateByNational = data?.[0]?.resident_violations_by_nationality;
      maxResidentViolationRateByNational = data?.[0]?.resident_violations_by_nationality;

      data?.forEach((v) => {
        sum += (v?.totalViolations || 0)
        if (v?.totalViolations < min) {
          min = v?.totalViolations;
        }

        if (v?.totalViolations > max) {
          max = v?.totalViolations;
        }

        if (v?.violation_rate_by_population < minViolationRateByPopulation) {
          minViolationRateByPopulation = v?.violation_rate_by_population;
        }

        if (v?.resident_violations_by_nationality < minResidentViolationRateByNational) {
          minResidentViolationRateByNational = v?.resident_violations_by_nationality;
        }

        if (v?.resident_violations_by_nationality > maxResidentViolationRateByNational) {
          maxResidentViolationRateByNational = v?.resident_violations_by_nationality;
        }

        if (v?.violation_rate_by_population > maxViolationRateByPopulation) {
          maxViolationRateByPopulation = v?.violation_rate_by_population;
        }

      })
    }
    return {
      sum, min, max,
      minViolationRateByPopulation,
      maxViolationRateByPopulation,
      minResidentViolationRateByNational,
      maxResidentViolationRateByNational
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  function getPercent(v) {
    if (showMapBy === "totalViolations") {
      return (v?.totalViolations / sumTotal?.max) * 100
    } else if (showMapBy === "violation_rate_by_population") {
      return (v?.resident_violations_by_nationality ? (v?.resident_violations_by_nationality / sumTotal?.maxResidentViolationRateByNational) * 100 : 0);
    } else if (showMapBy === "resident_violations_by_nationality") {
      return (v?.violation_rate_by_population ? (v?.violation_rate_by_population / sumTotal?.maxViolationRateByPopulation) * 100 : 0);
    }
  }

  const dataSource = useMemo(() => {
    if (data?.length) {
      const json = data?.map((v) => {
        const item = geoJsonObj[v["nationalityCode"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: !item ? themeVariables?.token?.Map?.Default : getColorFromPercentage({ percent: getPercent(v) }),
          label: v?.label,
          value: v?.totalViolations,
          ...item,
          ...v,
        })
      });

      return json;
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, showMapBy])

  function getComponent() {
    if (_.isEmpty(data)) {
      return (
        <Row isFullHeight>
          <Col
            textAlign="center"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <Empty />
          </Col>
        </Row>
      )
    }
    return (
      <MapWrap
        marginTop={60}
        onChartLoad={(chart) => {
          chartRef.current = chart;
        }}
        isRtl={isRtl}
        _getTooltip={(intl, isRtl) => _getTooltip(intl, isRtl, "Total Violations")}
        values={[{
          ...mapStyle,
          data: dataSource,
          point: {
            events: {
              mouseOver: handleMouseOver
            }
          },
        }]}
      />
    )
  }

  const isLoading = ["pending", "idle"]?.includes(apiStatus)
  const tableEle = (
    <DashboardCard
      bodyBackgroundColor="transparent"
      cardBodyHeight={"100%"}
      cardBodyPadding={"0px"}
      bordered
      style={{
        height: "100%",
      }}
      headStyle={{
        display: "none"
      }}
      bodyWrapStyle={{
        padding: "0px",
      }}
      isEmpty={!data?.length}
    >
      <Table
        key={`${appliedSearchText}`}
        borderRadiusOnSides={getResponsive({ default: resolveTernary(data?.length > 6, "all", "top"), midTablet: resolveTernary(data?.length > 6, "all", "top"), mobile: resolveTernary(data?.length > 4, "all", "top") })}
        onRow={(record) => {
          function handleRowClick(record) {
            if (chartRef?.current) {
              const chart = chartRef.current;
              refreshChartTooltip(chart, record);
            }
          }

          function refreshChartTooltip(chart, record) {
            chart.series?.forEach((series) => {
              if (hasData(series)) {
                const point = findPoint(series, record);
                if (point) {
                  showTooltip(chart, point);
                }
              }
            });
          }

          function hasData(series) {
            return series?.data?.length > 0;
          }

          function findPoint(series, record) {
            return series.data.find((point) =>
              point?.options?.properties?.["iso-a3"] === record?.["nationalityCode"]
            );
          }

          function showTooltip(chart, point) {
            if (point && !_.isEmpty(point.geometry)) {
              chart.tooltip.refresh(point); // Show the tooltip for that point
              chart.hoverPoint = point; // Set the hovered point
              chart.zoomOut();
            }
          }
          return {
            style: {
              cursor: "pointer"
            },
            onClick: () => handleRowClick(record)
          };
        }}
        virtual={true}
        columns={[
          {
            title: intl?.formatMessage({ id: "Country" }),
            width: 240,
            ellipsis: true,
            // width: getResponsive({ default: "265px", desktop: "164px", tablet: "148px", midTablet: "283px", mobile: "132px" }),
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.[resolveTernary(isRtl, "nationalityAr", "nationalityEn")]?.localeCompare(b?.[isRtl ? "nationalityAr" : "nationalityEn"]),
              }
            }),
            render: (v) => {
              const country = geoJsonObj[v?.nationalityCode];

              const Comp = Flags[country?.properties?.["iso-a2"]] || AllNationality;
              return (
                <Row>
                  <Col
                    paddingInline={"0px 16px"}
                  >
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Avatar
                          size={16}
                          style={{
                            borderRadius: "4px"
                          }}
                          shape="square"
                          src={<Comp />}
                        />
                      </Col>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: resolveTernary(isRtl, v?.nationalityAr, v?.nationalityEn)
                          }}
                        >
                          {resolveTernary(isRtl, v?.nationalityAr, v?.nationalityEn)}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            },
            ...getColumnSearchProps()
          },
          {
            title: intl?.formatMessage({ id: "Visa" }),
            width: 140,
            ellipsis: true,
            sorter: {
              compare: (a, b) => (a.visaViolations) - (b.visaViolations),
            },
            render: (v) => {
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col>
                    <Text>
                      {resolveTernary([undefined, null]?.includes(v?.visaViolations), '-', formatNumber(v?.visaViolations))}
                    </Text>
                  </Col>
                </Row>
              )
            }
          },
          {
            title: intl?.formatMessage({ id: "Residency" }),
            width: 150,
            ellipsis: true,
            sorter: {
              compare: (a, b) => (a.residencyViolations) - (b.residencyViolations),
            },
            render: (v) => {
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col>
                    <Text>
                      {resolveTernary([undefined, null]?.includes(v?.residencyViolations), '-', formatNumber(v?.residencyViolations))}
                    </Text>
                  </Col>
                </Row>
              )
            }
          },
          {
            title: intl?.formatMessage({ id: "Total - Percentage of Total Violators" }),
            // width: 350,
            ellipsis: true,
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.totalViolations - b?.totalViolations,
              }
            }),
            render: (v) => {
              const percent = v?.violationsPercentage;
              return (
                <Row align="middle" gutter={getResponsive({ default: [8, 0], tablet: [8, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col flex="0 0 90px">
                    <Text>
                      {resolveTernary([undefined, null]?.includes(v?.totalViolations), '-', formatNumber(v?.totalViolations))}
                    </Text>
                  </Col>
                  <Col flex="auto">
                    <Tooltip
                      title={`${percent?.toFixed(2)}%`}
                    >
                      <Progress
                        strokeColor={getColorFromPercentage({ percent: percent ? (percent / sumTotal?.max) * 100 : 0 })}
                        percent={Number(percent)}
                        showInfo={true}
                        format={() => FormatText([undefined, null]?.includes(v?.totalViolations) ? '-' : percent?.toFixed(2))}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              )
            }
          },
          {
            title: intl?.formatMessage({ id: "Percentage of the Total Nationality in the Country" }),
            // width: 350,
            ellipsis: true,
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.resident_violations_by_nationality - b?.resident_violations_by_nationality,
              }
            }),
            render: (v) => {
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col flex="auto">
                    <Tooltip
                      title={`${v?.resident_violations_by_nationality?.toFixed(2)}%`}
                    >
                      <Progress
                        strokeColor={getColorFromPercentage({ percent: (v?.resident_violations_by_nationality ? (v?.resident_violations_by_nationality / sumTotal?.maxResidentViolationRateByNational) * 100 : 0) })}
                        percent={v?.resident_violations_by_nationality}
                        showInfo={true}
                        format={() => FormatText([undefined, null]?.includes(v?.resident_violations_by_nationality) ? '-' : `${v?.resident_violations_by_nationality?.toFixed(2)}`)}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              )
            }
          },
          {
            title: intl?.formatMessage({ id: "Percentage of the Total Population of the Country" }),
            // width: getResponsive({ default: "340px" }),
            ellipsis: true,
            ...!isPreview && ({
              sorter: {
                compare: (a, b) => a?.violation_rate_by_population - b?.violation_rate_by_population,
              }
            }),
            render: (v) => {
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col flex="auto">
                    <Tooltip
                      title={`${v?.violation_rate_by_population?.toFixed(2)}%`}
                    >
                      <Progress
                        strokeColor={getColorFromPercentage({ percent: (v?.violation_rate_by_population ? (v?.violation_rate_by_population / sumTotal?.maxViolationRateByPopulation) * 100 : 0) })}
                        percent={Number(v?.violation_rate_by_population)}
                        showInfo={true}
                        format={() => FormatText([undefined, null]?.includes(v?.violation_rate_by_population) ? '-' : `${v?.violation_rate_by_population?.toFixed(2)}`)}
                      />
                    </Tooltip>
                  </Col>
                </Row>
              )
            }
          }
        ]}
        scroll={isPreview ? undefined : {
          y: data?.length > getResponsive({ default: 8, tablet: 4, midTablet: 6, mobile: 4 }) ? getResponsive({ default: 320, tablet: 344 }) : undefined,
          x: getResponsive({ default: null, tablet: 700 })
        }}
        pagination={false}
        dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
      />
    </DashboardCard>
  )

  const mapEle = (
    <Row
      style={{
        height: getResponsive({ default: "100%", tablet: "391px" })
      }}
    >

      <Col
        paddingInline={"var(--paddingSMPx)"}
        paddingBlock={"var(--paddingSMPx)"}
        style={{
          borderRadius: "var(--borderRadiusPx)",
          border: "1px solid var(--colorSplit)",
          backgroundColor: "var(--colorBgLayout)",
          position: "relative"
        }}
      >
        {
          !_.isEmpty(data) &&
          <div
            style={{
              position: "absolute",
              top: "16px",
              left: "16px",
              zIndex: 9
            }}
          >
            {
              getResponsive({ default: "true", mobile: "false" }) === "true"
                ? (
                  <Segmented
                    size="default"
                    value={showMapBy}
                    onChange={((e) => {
                      setShowMapBy(e)
                    })}
                    options={[
                      {
                        value: "totalViolations",
                        label: intl?.formatMessage({ id: "Total Violations" }),
                        icon: <UsersFour size={16} style={{ marginBottom: "3px" }} />
                      },
                      {
                        value: "violation_rate_by_population",
                        label: intl?.formatMessage({ id: "Percentage of the Total Nationality in the Country" }),
                        icon: <IdentificationBadge size={16} style={{ marginBottom: "3px" }} />
                      },
                      {
                        value: "resident_violations_by_nationality",
                        label: intl?.formatMessage({ id: "Percentage of the Total Population of the Country" }),
                        icon: <GlobeHemisphereWest size={16} style={{ marginBottom: "3px" }} />
                      }
                    ]}
                  />
                )
                : (
                  <Select
                    size="default"
                    style={{
                      width: "200px"
                    }}
                    value={showMapBy}
                    onChange={((e) => {
                      setShowMapBy(e)
                    })}
                    options={[
                      {
                        value: "totalViolations",
                        label: intl?.formatMessage({ id: "Total Violations" }),
                        icon: <UsersFour size={16} style={{ marginBottom: "3px" }} />
                      },
                      {
                        value: "violation_rate_by_population",
                        label: intl?.formatMessage({ id: "Percentage of the Total Population of the Country" }),
                        icon: <IdentificationBadge size={16} style={{ marginBottom: "3px" }} />
                      },
                      {
                        value: "resident_violations_by_nationality",
                        label: intl?.formatMessage({ id: "Percentage of the Total Nationality in the Country" }),
                        icon: <GlobeHemisphereWest size={16} style={{ marginBottom: "3px" }} />
                      }
                    ]}
                  />
                )
            }
          </div>
        }
        {getComponent()}
        {
          !!data?.length &&
          <div
            style={{
              position: "absolute",
              right: 16,
              left: 16,
              bottom: 26,
              margin: "auto",
              width: getResponsive({ default: "365px", mobile: "250px" }),
              height: "7px",
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "4px",
              direction: "ltr",
              background: 'linear-gradient(90deg, #F8F3EB 0%, #816226 100%)'
            }}
          >
            <span>
              <Text size="sm" strong>
                {intl?.formatMessage({ id: "Low Violations" })}
              </Text>
            </span>

            <span>
              <Text size="sm" strong>
                {intl?.formatMessage({ id: "High Violations" })}
              </Text>
            </span>
          </div>
        }
      </Col>
    </Row>
  )

  const ele = (printRows) => {
    return (
      <DashboardCard
        bodyBackgroundColor="transparent"
        cardBodyHeight={"calc(100% - 67px)"}
        title={title}
        icon={icon}
        style={{
          height: isPreview ? "auto" : getResponsive({
            default: "auto",
            tablet: "auto"
          }),
          pointerEvents: isPreview ? "none" : "all"
        }}
        cardBodyPadding={isLoading ? "var(--paddingPx)" : "0px"}
        loading={isLoading}
        titleItemsWrapProps={{
          wrap: getResponsive({ default: "false", mobile: "true" }) === "true",
          ...getResponsive({ default: false, mobile: true }) && {
            style: {
              maxWidth: "77%",
              whiteSpace: "pre-wrap"
            }
          }
        }}
      >
        <Row
          isFullHeight
          gutter={isPreview ? [0, 12] : getResponsive({
            default: [0, themeVariables?.token?.marginLG],
            desktop: [0, themeVariables?.token?.marginSM],
            tablet: [0, themeVariables?.token?.marginSM],
          })}
        >
          <Col
            span={isPreview ? 24 : getResponsive({ default: 24, tablet: 24 })}
          >
            {
              !isPreview && getResponsive({ default: "true" }) === "true"
                ? !isMapHidden && mapEle
                : !isTableHidden && tableEle
            }
          </Col>
          
          {
            !!data?.length &&
            <Col span={isPreview ? 24 : getResponsive({ default: 24, tablet: 24 })}>
              {
                !isPreview && getResponsive({ default: "true" }) === "true"
                  ? !isTableHidden && tableEle
                  : !printRows?.from && !isMapHidden && mapEle
              }
            </Col>
          }

        </Row>
      </DashboardCard>
    )
  }
  return (
    (!isPreview || isPrint || isTableHidden)
      ? ele(printRows)
      : <div
        ref={hiddenContainerRef}
        key={offset}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          width: '100%',
          height: 'auto',
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {ele(printRows)}
      </div>
  )
}

ViolationsByNationality.propTypes = {
  icon: PropTypes.any,
  pageRef: PropTypes.any,
  title: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any
}

export default ViolationsByNationality;
