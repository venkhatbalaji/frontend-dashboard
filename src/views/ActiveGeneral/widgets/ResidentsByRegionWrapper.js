import PropTypes from "prop-types"
import {
  Row, Col, Avatar, Text, Title, theme, Table, Progress, Skeleton, Empty,
  AntIcons
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import MapWrap from '@/components/MapWrap';
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import Tabs from "@/components/Tabs";
import Flags from 'country-flag-icons/react/1x1';
import { getResidentsEmirates, getNationalityByEmirates } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import { formatNumber, getColorFromPercentage, checkRtl, resolveTernary, emiratesFlagMapping } from "@/utils/helper";
import _ from "lodash";


const { useToken } = theme;
const { SearchOutlined } = AntIcons;

function AllNationalityImage() {
  return <Image width={24} height={24} alt="flag" src={"/All_Nationality.png"} />
}

function RegionWrap({ keyLabel, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        <Avatar size={34} src={emiratesFlagMapping[keyLabel]} />
      </Col>
      <Col flex="auto">
        <Row gutter={[0, 4]}>
          <Col>
            <Text size="sm" ellipsis={{ tooltip: label }} >
              {label}
            </Text>
          </Col>
          <Col>
            <Title level={5}>
              {value}
            </Title>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

RegionWrap.propTypes = {
  keyLabel: PropTypes.any,
  label: PropTypes.any,
  value: PropTypes.any
}

function handleMouseOver() {
  if (this?.options?.isHoverDisabled) {
    this.setState('normal');
  }
}

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function RisksByNationality({
  mapTooltipTitle,
  filter,
  tooltipValueText,
  title,
  icon,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden,
  pageRef,
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  const [showBy, setShowBy] = useState(isPreview ? pageRef.current.populationByRegion.showBy : 0)
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [printRows, setPrintRows] = useState(resolveTernary(offset, { from: offset, to: offset + 1 }, rows || { from: 0, to: 1 }));
  const hiddenContainerRef = useRef()

  useEffect(() => {
    pageRef.current.populationByRegion = {
      ...pageRef.current.populationByRegion,
      showBy
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy]);

  const {
    execute: invokeGetEmirates,
    status: emiratesStatus,
    value: emiratesValue,
  } = useAsync({ asyncFunction: getResidentsEmirates });

  const {
    execute: invokeGetNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getNationalityByEmirates });

  const isLoadingTabs = ["idle", "pending"]?.includes(emiratesStatus);
  const isNationalitiesLoading = ["idle", "pending"].includes(nationalitiesStatus);

  const isLoading = isLoadingTabs || isNationalitiesLoading;

  
  useEffect(() => {
    invokeGetEmirates({ filter })

    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    if (!isLoadingTabs) {
      const emirateCodeLength = filter?.emirate_code?.length ?? 0;
      const isAllDisabled = emirateCodeLength > 0 && emirateCodeLength !== 7;

      if (isAllDisabled) {
        const emirate = emiratesValue?.data?.find((v) => {
          return filter?.emirate_code?.find((e) => e == v?.code)
        });

        if (emirate && !isPreview) {
          setShowBy((emirate?.code))
        }
        // (emirate?.code != 0 && filter?.emirate_code?.length ? !(filter?.emirate_code || [])?.find((v) => v == emirate?.code) : false) ? "-" : formatNumber(emirate?.total)
      } else if (!isPreview) {
        setShowBy(0)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, isLoadingTabs])

  useEffect(() => {
    invokeGetNationalities({ filter: { ...filter, emirate_code: showBy, } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, filter])

  const emiratesList = emiratesValue?.data || [];

  const _data = isPreview ? nationalitiesValue?.data?.slice(0, 20) : nationalitiesValue?.data;

  // get max percentage for color coding
  const maxPercentage = useMemo(() => {
    if (!nationalitiesValue?.data?.length) return 0;

    return Math.max(...(nationalitiesValue?.data || [])?.map((item) => item?.percentage || 0));
  }, [nationalitiesValue?.data]);


  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }

    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[resolveTernary(isRtl, "name_ar", "name_en")])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);

  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(nationalitiesStatus) && !isTableHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          } else if (printRows?.to >= data?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor((space - 40 - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          }
        }
      }, [200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, nationalitiesStatus])

  const getResponsive = useResponsive();
  // Patched version of getResponsive for preview mode
  const patchedGetResponsive = (config) => {
    if (isPreview && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };
  const chartRef = useRef();
  const themeVariables = useToken();
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


  const dataSource = useMemo(() => {
    if (data?.length) {
      const json = data?.map((v) => {
        const item = geoJsonObj[v["code"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: getColorFromPercentage({
            percent: (v?.percentage ? (v?.percentage / maxPercentage) * 100 : 0)
          }),
          label: resolveTernary(isRtl, v?.name_ar, v?.name_en),
          value: v?.total,
          percentage: v?.percentage,
          ...item
        })
      });

      return json?.sort((a, b) => b?.value - a?.value)
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const emirateCodeLength = filter?.emirate_code?.length ?? 0;
  const isAllDisabled = emirateCodeLength > 0 && emirateCodeLength !== 7;

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
        valueText={tooltipValueText}
        mapTooltipTitle={mapTooltipTitle}
        onChartLoad={(chart) => {
          chartRef.current = chart;
        }}
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
              arKey="name_ar"
              enKey="name_en"
              setAppliedSearchText={setAppliedSearchText}
              searchText={searchText}
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
  const tableEle = (
    <Col
      flex={resolveTernary(isPreview, "0 0 100%", patchedGetResponsive({ default: "0 0 50%", desktop: "0 0 500px", tablet: "0 0 337px", midTablet: "0 0 100%" }))}
    >
      <DashboardCard
        title={intl?.formatMessage({ id: "Country List" })}
        bodyBackgroundColor="transparent"
        cardBodyHeight={"auto"}
        cardBodyPadding={resolveTernary(isLoading, "16px", "0px")}
        bordered
        bodyWrapStyle={{
          padding: "0px",
        }}
        style={{
          height: patchedGetResponsive({ default: "100%", tablet: "100%", midTablet: "449px", mobile: resolveTernary(data?.length, "480px", "365px") }),
        }}
        headStyle={{
          backgroundColor: "var(--brand-gold-1)",
          padding: "var(--paddingSMPx) var(--paddingPx)",
        }}
        loading={isLoading}
        titleProps={{
          wrap: patchedGetResponsive({ default: false, tablet: true }),
          gutter: patchedGetResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
        }}
        actionProps={{
          flex: patchedGetResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
        }}
      >
        <Table
          key={`${appliedSearchText}`}
          borderRadiusOnSides={patchedGetResponsive({ default: resolveTernary(data?.length > 6, "all", "top"), midTablet: resolveTernary(data?.length > 6, "all", "top"), mobile: resolveTernary(data?.length > 4, "all", "top") })}
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
                point?.options?.properties?.["iso-a3"] === record?.["iso-a3"]
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
          columns={[
            {
              title: intl?.formatMessage({ id: "Country" }),
              width: patchedGetResponsive({ default: "50%", mobile: "175px" }),
              ellipsis: true,
              sorter: {
                compare: (a, b) => a?.label?.localeCompare(b?.label),
              },
              render: (v) => {
                const Comp = Flags[v?.["iso-a2"]] || AllNationalityImage;
                return (
                  <Row>
                    <Col
                      paddingInline={resolveTernary(isRtl, "0px 16px", "0 16px")}
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
                              tooltip: v?.label
                            }}
                          >
                            {v?.label}
                          </Text>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                )
              },
              ...getColumnSearchProps(),
            },
            {
              title: intl?.formatMessage({ id: "Number of Population" }),
              width: patchedGetResponsive({ default: "50%", mobile: "225px" }),
              ellipsis: true,
              sorter: {
                compare: (a, b) => a?.value - b?.value,
              },
              render: (v) => {
                const percent = v?.percentage ? v?.percentage : 0;
                const percentOutOfMaxValue = ((v?.percentage ? v?.percentage : 0) / maxPercentage) * 100;
                return (
                  <Row align="middle" gutter={patchedGetResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                    <Col flex={patchedGetResponsive({ default: "0 0 105px", mobile: "0 0 105px" })}>
                      <Text
                        ellipsis={{
                          tooltip: v?.value ? formatNumber(v?.value) : '-'
                        }}
                      >
                        {v?.value ? formatNumber(v?.value) : '-'}
                      </Text>
                    </Col>

                    <Col flex="auto">
                      <Progress
                        strokeColor={getColorFromPercentage({
                          percent: percentOutOfMaxValue
                        })}
                        percent={percent}
                        showInfo={true}
                        format={FormatText}
                      />
                    </Col>
                  </Row>
                )
              }
            }
          ]}
          scroll={{
            y: resolveTernary((isPreview || dataSource?.length <= 8), undefined, patchedGetResponsive({ default: 370, tablet: 370, midTablet: 370, mobile: 370 })),
            x: 400
          }}
          pagination={false}
          dataSource={isPreview ? dataSource?.slice(printRows?.from, printRows?.to) : dataSource}

        />
      </DashboardCard>
    </Col>
  )
  const mapEle = (
    <Col
      flex={isPreview ? "0 0 100%" : patchedGetResponsive({ default: "0 0 50%", desktop: "0 0 calc(100% - 500px)", tablet: "0 0 calc(100% - 337px)", midTablet: "0 0 100%" })}
    >
      <Row isFullHeight>
        <Col
          style={{
            borderRadius: "var(--borderRadiusPx)",
            border: "1px solid var(--colorSplit)",
            backgroundColor: "var(--colorBgLayout)",
            ...patchedGetResponsive({ mobile: "true", default: "false" }) === "true" && ({
              minHeight: "225px",
              height: '340px'
            })
          }}
          paddingInline={patchedGetResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
          paddingBlock={patchedGetResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
        >
          {
            isLoading
              ? <Skeleton paragraph={{ rows: 10 }} />
              : (
                !printRows?.from &&
                getComponent()
              )
          }
          {
            (data?.length || 0) > 0 &&
            <div
              style={{
                position: "absolute",
                right: 16,
                bottom: 26,
                width: patchedGetResponsive({ default: "365px", mobile: "250px" }),
                height: "7px",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "4px",
                direction: "ltr",
                background: 'linear-gradient(90deg, rgb(237, 227, 207) 0%, rgb(104, 79, 30) 100%)'
              }}
            >
              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "Low Population" })}
                </Text>
              </span>

              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "High Population" })}
                </Text>
              </span>
            </div>
          }
        </Col>
      </Row>
    </Col>
  )

  const ele = (printRows) => {
    return (
      <DashboardCard
        cardBodyHeight={isPreview ? "auto" : patchedGetResponsive({ default: "578px", desktop: "578px", midTablet: "auto" })}
        title={title}
        icon={icon}
        headerBorder={false}
        cardBodyPadding="0px"
        bodyBackgroundColor={"transparent"}
        bodyWrapStyle={{
          paddingTop: "0px"
        }}
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
        <Row
          isFullHeight
        >
          <Col isFlex>
            {
              !printRows?.from && !isMapHidden &&
              <Row gutter={[0, themeVariables?.token?.margin]}>
                <Col>
                  {
                    resolveTernary(
                      isLoadingTabs,
                      (
                        <Skeleton paragraph={{ rows: 1 }} />
                      ),
                      (
                        <Tabs
                          isCustom
                          carouselButtonStyle={{
                            position: "absolute",
                            top: "-42px",
                            zIndex: 1,
                            ...(
                              resolveTernary(
                                isRtl,
                                {
                                  left: 0
                                },
                                {
                                  right: 0
                                }
                              ))
                          }}
                          customType={"primary"}
                          activeKey={showBy}
                          onChange={(key) => {
                            setShowBy(key)
                          }}
                          options={(isPreview 
                            ? (emiratesList || []).filter(emirate => emirate?.code === showBy)
                            : (emiratesList || [])
                          )?.map((emirate) => ({
                            key: emirate?.code,
                            disabled: resolveTernary(isAllDisabled && emirate?.code == 0, true, emirate?.code != 0 && filter?.emirate_code?.length ? !(filter?.emirate_code || [])?.find((val) => val == emirate?.code) : false),
                            children: <RegionWrap
                              key={emirate?.code}
                              keyLabel={emirate?.code}
                              label={isRtl ? emirate?.name_ar : emirate?.name_en}
                              value={resolveTernary(isAllDisabled && emirate?.code == 0, "-", !filter?.emirate_code?.length || (filter?.emirate_code || [])?.find((val) => val == emirate?.code) ? formatNumber(emirate?.total) : "-")}
                            />
                          }))}
                        />
                      )
                    )
                  }
                </Col>
              </Row>
            }
            <Row isFlexGrow>
              <Col>
                <Row
                  gutter={patchedGetResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                  wrap={isPreview ? true : patchedGetResponsive({ default: false, midTablet: true })}
                  isFullHeight
                >
                  {
                    isPreview
                      ? <>
                        <div style={{ marginBottom: "var(--paddingPx)", width: "100%" }}>
                          {!isMapHidden && mapEle}
                        </div>
                        
                        {!isTableHidden && tableEle}
                      </>
                      : <>
                        {tableEle}
                        {mapEle}    
                      </>
                  }
                </Row>
              </Col>
            </Row>
          </Col>
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

RisksByNationality.propTypes = {
  pageRef: PropTypes.any,
  icon: PropTypes.any,
  mapTooltipTitle: PropTypes.any,
  showBy: PropTypes.number,
  title: PropTypes.string,
  tooltipValueText: PropTypes.any,
  filter: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any,
}

export default RisksByNationality;