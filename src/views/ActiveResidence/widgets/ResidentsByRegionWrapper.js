import PropTypes from "prop-types"
import {
  Row, Col, Avatar, Text, Title, theme, Table, Progress, Skeleton, Empty,
  AntIcons, Tooltip, PhosphorIcons
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { TableFilterDropdown, InputWrap } from "@/components/TableFilterWidgets";
import Image from "next/image";
import useResponsive from "@/hooks/useResponsive";
import MapWrap from '@/components/MapWrap';
import Globe from "@/svgr/Globe";
import Tabs from "@/components/Tabs";
import Flags from 'country-flag-icons/react/1x1';
import { getEmiratesStatistics, getResidentsByRegion } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";
import { useState, useMemo, useRef, useContext, useEffect, useCallback } from "react";
import { formatNumber, getColorFromPercentage, checkRtl, resolveTernary, emiratesFlagMapping } from "@/utils/helper";
import _ from "lodash";


const { useToken } = theme;
const { SearchOutlined } = AntIcons;
const { Info } = PhosphorIcons;

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
  return resolveTernary(v, <Text>{`${formatNumber(v)}`}</Text>, <Text>-</Text>)
}

const TableFooter = ({ isScrollOnTable, intl, minMaxValues, isPreview, getResponsive, formatNumber }) => (
  <Table
    className={`table-for-footer ${isScrollOnTable ? "m-i-e-6" : ""}`}
    isSplitHidden={true}
    columns={[
      {
        width: getResponsive({ default: "50%" }),
        title: intl?.formatMessage({ id: "Total" }),
      },
      // {
      //   width: getResponsive({ default: "18%", mobile: "110px" }),
      //   title: formatNumber(minMaxValues?.totalEntries) || "-"
      // },
      // {
      //   width: getResponsive({ default: "18%", mobile: "110px" }),
      //   title: formatNumber(minMaxValues?.totalExits) || "-"
      // },
      {
        width: getResponsive({ default: "50%" }),
        title: formatNumber(minMaxValues?.count) || "-",
      }
    ]}
  />
);

TableFooter.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired
  }).isRequired,
  minMaxValues: PropTypes.shape({
    totalEntries: PropTypes.number,
    totalExits: PropTypes.number,
    count: PropTypes.number
  }).isRequired,
  isPreview: PropTypes.bool.isRequired,
  getResponsive: PropTypes.func.isRequired,
  formatNumber: PropTypes.func.isRequired,
  isScrollOnTable: PropTypes.any,
};

function RisksByNationality({
  mapTooltipTitle,
  filter,
  tooltipValueText,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden,
  isPreviewOpen: isPreview,
  pageRef,
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  const [showBy, setShowBy] = useState(isPreview ? pageRef.current?.residentsByRegion?.showBy : 0)
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const hiddenContainerRef = useRef()

  useEffect(() => {
    pageRef.current.residentsByRegion = {
      ...pageRef.current.residentsByRegion,
      showBy
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy])
  
  const {
    execute: invokeGetEmirates,
    status: emiratesStatus,
    value: emiratesValue,
  } = useAsync({ asyncFunction: getEmiratesStatistics });

  const {
    execute: invokeGetNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getResidentsByRegion });

  const isLoadingTabs = ["idle", "pending"]?.includes(emiratesStatus);
  const isLoading = isLoadingTabs || ["idle", "pending"]?.includes(nationalitiesStatus);
  
  useEffect(() => {
    const _filter = _.cloneDeep(filter);
    delete _filter?.emirate_code;

    invokeGetEmirates({ filters: { ..._filter } })

    if (searchText) {
      setSearchText(undefined);
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    invokeGetNationalities({ filter: { ...filter, emirate_code: showBy } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, filter])

  useEffect(() => {
    if (!isLoadingTabs) {
      const isAllDisabled = filter?.emirate_code?.length && filter?.emirate_code?.length !== 7;
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

  const emiratesList = emiratesValue?.data || [];

  const _data = nationalitiesValue?.data;

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return isPreview ? _data?.slice(0, 20) : _.cloneDeep(_data);
    }

    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "nationality_ar" : "nationality_en"])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);

  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(nationalitiesStatus) && !isTableHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } } });
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

  const minMaxValues = useMemo(() => {
    let max = 0;
    let count = 0;
    let totalEntries = 0;
    let totalExits = 0
    if (_data?.length) {
      max = _data?.[0]?.percentage || 0;
      _data?.forEach((v) => {
        count += v?.count;
        totalEntries += v?.entries;
        totalExits += v?.exits;

        if (v?.percentage > max) {
          max = v?.percentage;
        }
      })
    }
    return { max, count, totalEntries, totalExits };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data]);

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
        const item = geoJsonObj[v["nationality_code"]];
        return ({
          "iso-a3": item?.properties?.["iso-a3"],
          "iso-a2": item?.properties?.["iso-a2"],
          color: getColorFromPercentage({
            percent: ((v?.percentage / minMaxValues.max) * 100),
          }),
          label: isRtl ? v?.nationality_ar : v?.nationality_en,
          value: v?.count,
          percentage: v?.percentage,
          entries: v?.entries,
          exits: v?.exits,
          ...item
        })
      });

      return json?.sort((a, b) => b?.value - a?.value)
    }
    return []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

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
              setAppliedSearchText={setAppliedSearchText}
              arKey="nationality_ar"
              enKey="nationality_en"
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

  const renderFooter = useCallback(() => (
    <TableFooter
      intl={intl}
      minMaxValues={minMaxValues}
      isScrollOnTable={dataSource?.length > 7}
      isPreview={isPreview}
      getResponsive={patchedGetResponsive}
      formatNumber={formatNumber}
    />
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [intl, minMaxValues, isPreview, patchedGetResponsive, formatNumber]);


  const tableEle = (
    <Col
      flex={resolveTernary(isPreview, "0 0 100%", patchedGetResponsive({ default: "0 0 50%", desktop: "0 0 50%", tablet: "0 0 100%", midTablet: "0 0 100%" }))}
    >
      <DashboardCard
        title={intl?.formatMessage({ id: (!filter?.residents_category || filter?.residents_category === 'visa_and_residency') ? "Residents & Visa Holders List" : filter?.residents_category === 'visa' ? "Visa Holders List" : "Country List" })}
        bodyBackgroundColor="transparent"
        cardBodyHeight={"100%"}
        cardBodyPadding={isLoading ? "16px" : "0px"}
        bordered
        bodyWrapStyle={{
          padding: "0px",
        }}
        style={{
          height: patchedGetResponsive({ default: "100%", tablet: "480px", midTablet: "480px", mobile: data?.length ? "480px" : "365px" }),
        }}
        headStyle={{
          backgroundColor: "var(--brand-gold-1)",
          padding: "var(--paddingSMPx) var(--paddingPx)",
        }}
        isEmpty={!_data?.length}
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
          borderRadiusOnSides={patchedGetResponsive({ default: resolveTernary(data?.length > 6, "all", "top"), midTablet: resolveTernary(data?.length > 6, "all", "top"), mobile: resolveTernary(data?.length > 4, "all", "top") })}
          key={`${appliedSearchText}`}
          className="table-with-total"
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
              width: patchedGetResponsive({ default: "50%" }),
              ellipsis: true,
              sorter: {
                compare: (a, b) => a?.label?.localeCompare(b?.label),
              },
              render: (v) => {
                const Comp = Flags[v?.["iso-a2"]] || AllNationalityImage;
                return (
                  <Row>
                    <Col
                      paddingInline={isRtl ? "0px 16px" : "0 16px"}
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
              title: intl?.formatMessage({ id: (!filter?.residents_category || filter?.residents_category === 'visa_and_residency') ? "Number of Residents & Visa Holders" : filter?.residents_category === 'visa' ? "Number of Visa Holders" : "Number of Residents" }),
              width: patchedGetResponsive({ default: "50%" }),
              ellipsis: true,
              sorter: {
                compare: (a, b) => a?.value - b?.value,
              },
              render: (v) => {
                const percent = v?.percentage?.toFixed(2);
                const percentOutOfMaxValue = ((v?.percentage / minMaxValues.max) * 100);
                return (
                  <Row align="middle" gutter={patchedGetResponsive({ default: [12], tablet: [12], midTablet: [12], mobile: [0, 0] })}>
                    <Col flex="auto">
                      <Tooltip
                        title={!isNaN(Number(percent)) ? `${percent}%` : "-"}
                      >
                        <Progress
                          strokeColor={getColorFromPercentage({
                            percent: percentOutOfMaxValue,
                          })}
                          percent={percent}
                          showInfo={true}
                          format={(val) => FormatText(v?.value)}
                        />
                      </Tooltip>
                    </Col>
                  </Row>
                )
              },
            }
          ]}
          scroll={resolveTernary((isPreview || dataSource?.length <= 7), undefined, {
            y: patchedGetResponsive({ default: 330, tablet: 330, midTablet: 330, mobile: 330 }),
          })}
          pagination={false}
          dataSource={resolveTernary(isPreview, dataSource?.slice(printRows?.from, printRows?.to), dataSource)}
          footer={renderFooter}
        />
      </DashboardCard>
    </Col>
  )
  const mapEle = (
    <Col
      flex={resolveTernary(isPreview, "0 0 100%", patchedGetResponsive({ default: "0 0 50%", desktop: "0 0 50%", tablet: "0 0 100%", midTablet: "0 0 100%" }))}
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
                left: 16,
                margin: "auto",
                bottom: 26,
                width: patchedGetResponsive({ default: "365px", mobile: "250px" }),
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
                  {intl?.formatMessage({ id: "Fewer" })}
                </Text>
              </span>

              <span>
                <Text size="sm" strong>
                  {intl?.formatMessage({ id: "More" })}
                </Text>
              </span>
            </div>
          }
        </Col>
      </Row>
    </Col>
  )

  const isAllDisabled = filter?.emirate_code?.length && filter?.emirate_code?.length !== 7;

  const ele = (printRows) => {
    return (
      <DashboardCard
        cardBodyHeight={resolveTernary(isPreview, "auto", patchedGetResponsive({ default: "578px", desktop: "578px", tablet: "auto", midTablet: "auto" }))}
        title={
          <Row align="middle" gutter={4}>
            <Col flex="none">
              <span style={{ position: "relative" }}>
                {intl?.formatMessage({ id: (!filter?.residents_category || filter?.residents_category === 'visa_and_residency') ? "Residents & Visa Holders by Emirate & Country" : filter?.residents_category === 'visa' ? "Visa Holder by Emirate & Country" : "Residents by Emirate & Country" })}
                <span
                  style={{ position: "absolute", ...isRtl ? { left: "-20px" } : { right: "-20px" }, bottom: isRtl ? "4px" : "-2px" }}
                >
                  <Tooltip
                    title={intl?.formatMessage({ id: (!filter?.residents_category || filter?.residents_category === 'visa_and_residency') ? "residents_visa_holders_nationality_tooltip" : filter?.residents_category === 'visa' ? "active_visa_holders_nationality_tooltip" : "active_residence_residency_nationality_tooltip" })}
                  >
                    <span>
                      <Info style={{ marginBottom: "0px" }} color="var(--colorIcon)" size={14} weight="bold" />
                    </span>
                  </Tooltip>
                </span>
              </span>
            </Col>
          </Row>
        }
        icon={<Globe />}
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
                            disabled: resolveTernary(emirate?.code == 0, isAllDisabled, filter?.emirate_code?.length ? !(filter?.emirate_code || [])?.find((v) => v == emirate?.code) : false),
                            children: <RegionWrap
                              key={emirate?.code}
                              keyLabel={emirate?.code}
                              label={resolveTernary(isRtl, emirate?.name_ar, emirate?.name_en)}
                              value={resolveTernary(emirate?.code == 0 && isAllDisabled, "-", (resolveTernary(emirate?.code != 0 && filter?.emirate_code?.length, !(filter?.emirate_code || [])?.find((v) => v == emirate?.code), false)) ? "-" : formatNumber(emirate?.total))}
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
                  gutter={patchedGetResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, tablet: [0, 16] })}
                  wrap={resolveTernary(isPreview, true, patchedGetResponsive({ default: false, tablet: true }))}
                  isFullHeight
                >
                  {
                    isPreview
                      ? <>
                        {
                          !isMapHidden &&
                          <div style={{ marginBottom: "var(--paddingPx)", width: "100%" }}>
                            {mapEle}
                          </div>
                        }
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
  mapTooltipTitle: PropTypes.any,
  tooltipValueText: PropTypes.any,
  filter: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any,
  isPreviewOpen: PropTypes.any,
  pageRef: PropTypes.any
}

export default RisksByNationality;