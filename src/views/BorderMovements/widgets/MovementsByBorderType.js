import PropTypes from "prop-types"
import { useState, useRef, useContext, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { formatNumber, checkRtl, resolveTernary } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import ExpectedTraveller from "@/svgr/ExpectedTravelerIcon";
import { getBorderMovementsByBorderType, getBorderPortMovementsByBorderType } from "@/services/borderMovementService";
import {
  Row, Col, Text, Title, theme, Table, Skeleton,
  PhosphorIcons, Avatar, Scrollbars, Tooltip,
  AntIcons
} from "re-usable-design-components";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import Tabs from "@/components/Tabs";


const { SearchOutlined } = AntIcons;

const { Car, AirplaneTakeoff, Boat, Swap, SignIn, SignOut, AirplaneInFlight, Info } = PhosphorIcons;

const borderTypeMap = {
  LAND: {
    icon: <Car size={24} color="var(--colorPrimaryBase)" />,
    labelKey: "Land Border"
  },
  AIR: {
    icon: <AirplaneTakeoff size={24} color="var(--colorPrimaryBase)" />,
    labelKey: "Airports"
  },
  SEA: {
    icon: <Boat size={24} color="var(--colorPrimaryBase)" />,
    labelKey: "Seaports"
  },
  EXPECTED: {
    icon: <ExpectedTraveller size={24} color="var(--colorPrimaryBase)" />,
    labelKey: "Port Name"
  },
  // PRIVATE: {
  //   icon: <Crown size={32} color="var(--colorPrimaryBase)" />
  // }
}


function ResidentsByRegionWrapper({
  filter,
  icon,
  title,
  dateRange,
  isPreview,
  movementsByBorderRef,
  space,
  isPrint,
  rows,
  callback,
  offset,
  pageRef
}) {
  const intl = useIntl();
  const [showBy, setShowBy] = useState(isPreview ? pageRef?.current?.movementsByBorderType?.showBy : movementsByBorderRef.current.showBy || "AIR");

  useEffect(() => {
    pageRef.current.movementsByBorderType = {
      ...pageRef.current.movementsByBorderType,
      showBy
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy])

  useEffect(() => {
    if (showBy !== filter?.port_type && !isPreview) {
      movementsByBorderRef.current.showBy = filter?.port_type || "AIR";
      setShowBy(filter?.port_type || "AIR")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const {
    execute: invokeGetBorderMovementsByBorderType,
    status: borderMovementsStatus,
    value: borderMovementsValue,
  } = useAsync({ asyncFunction: getBorderMovementsByBorderType });

  useEffect(() => {
    invokeGetBorderMovementsByBorderType({
      filter: { ...filter, ...dateRange }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    dateRange
  ]);

  const isLoading =
    borderMovementsStatus === "idle" ||
    borderMovementsStatus === "pending";

  return (
    <ResidentsByRegion
      icon={icon}
      title={title}
      showBy={showBy}
      pageRef={pageRef}
      isPreview={isPreview}
      filter={filter}
      movementsByBorderRef={movementsByBorderRef}
      dateRange={dateRange}
      setShowBy={setShowBy}
      isLoading={isLoading}
      space={space}
      isPrint={isPrint}
      rows={rows}
      callback={callback}
      offset={offset}
      data={borderMovementsValue?.data?.borderTypes}
      tableConfig={{
        title: {
          secondColumn: intl?.formatMessage({ id: "Number of Population" })
        }
      }}
    />
  );
}

ResidentsByRegionWrapper.propTypes = {
  filter: PropTypes.any,
  pageRef: PropTypes.any,
  icon: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
  movementsByBorderRef: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  offset: PropTypes.any,
}

export default ResidentsByRegionWrapper;


const { useToken } = theme;

function RegionWrap({ keyLabel, label, value, iconLabel, isPreview }) {
  const themeVariables = useToken();
  const intl = useIntl();
  
  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        {borderTypeMap[keyLabel]?.icon}
      </Col>
      <Col flex="auto">
        <Row gutter={[0, 4]}>
          <Col>
            <Row align="middle" wrap={false} justify="space-between">
              <Col flex="none">
                <Text color="var(--colorTextLabel)" size="sm">
                  {label}
                </Text>
              </Col>
              {
                !isPreview &&
                <Col flex="none">
                  <Tooltip
                    title={intl?.formatMessage({ id: iconLabel })}
                  >
                    <span>
                      <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                    </span>
                  </Tooltip>
                </Col>
              }
            </Row>
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
  value: PropTypes.any,
  iconLabel: PropTypes.any,
  isPreview: PropTypes.any
}

function handleMouseOver() {
  if (this?.options?.isHoverDisabled) {
    this.setState('normal');
  }
}

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function StatCard({ label, value, icon, iconBgColor, bgColor }) {
  const getResponsive = useResponsive();
  return (
    <Row
      wrap={false}
      style={{
        backgroundColor: bgColor,
        padding: "var(--paddingPx)",
        borderRadius: "var(--borderRadiusPx)",
        minHeight: "86px"
      }}
    >
      <Col flex="auto">
        <Row>
          <Col>
            <Text
              color="var(--colorTextLabel)"
            >
              {label}
            </Text>
          </Col>
          <Col>
            <Title
              level={getResponsive({
                default: 3, tablet: 4
              })}
            >
              {value}
            </Title>
          </Col>
        </Row>
      </Col>
      <Col flex="none">
        {!!icon && (
          <Avatar
            backgroundColor={iconBgColor}
            icon={icon}
          />
        )}
      </Col>
    </Row>
  )
}

StatCard.propTypes = {
  label: PropTypes.any,
  value: PropTypes.any,
  icon: PropTypes.any,
  iconBgColor: PropTypes.any,
  bgColor: PropTypes.any,
}

function ResidentsByRegion({
  data,
  isPreview,
  filter,
  dateRange,
  showBy,
  setShowBy = () => { },
  title,
  isLoading: _isLoading = false,
  movementsByBorderRef,
  space,
  isPrint,
  rows,
  callback,
  offset,
}) {
  const intl = useIntl();  
  const [isLoadingInnerTable, setIsLoadingInnerTable] = useState(false);
  const isLoading = _isLoading;
  const hiddenContainerRef = useRef()
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const {
    execute: invokeGetBorderPortMovementsByBorderType,
    status: borderMovementsStatus,
    value: borderMovementsValue,
  } = useAsync({ asyncFunction: getBorderPortMovementsByBorderType });

  async function loadPortValues() {
    await invokeGetBorderPortMovementsByBorderType({ filter: { ...filter, ...dateRange, port_type: showBy } })
  }

  useEffect(() => {
    setIsLoadingInnerTable(true);
    loadPortValues()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, filter, dateRange])
 
  useEffect(() => {
    if (["success", "error"]?.includes(borderMovementsStatus)) {
      setTimeout(() => {
        setIsLoadingInnerTable(false)
      }, 0)
    }
  }, [borderMovementsStatus])

  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  const getResponsive = useResponsive();
  const patchedGetResponsiveFn = patchedGetResponsive(getResponsive, isPreview, false);
  const [localeStore] = useContext(LocaleContext);
  const themeVariables = useToken();

  const isRtl = checkRtl(localeStore);

  useEffect(() => {
    setSearchText(undefined);
    setAppliedSearchText(undefined)
  }, [showBy])
  
  const landStat = data?.find((v) => v?.type === "LAND");
  const airStat = data?.find((v) => v?.type === "AIR");
  const seaStat = data?.find((v) => v?.type === "SEA");
  const expectedStat = data?.find((v) => v?.type === "EXPECTED");
  
  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(borderMovementsStatus)) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
          } else if (printRows?.to >= borderMovementsValue?.data?.ports?.length) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to, isAllRendered: true } } });
          } else if (height < space) {
            const elementsCount = (Math?.floor((space - height) / 47) + 2) || 0;
            setPrintRows((v) => ({ ...v, from: printRows?.from, to: v?.to + elementsCount }))
          } else if (height >= space) {
            callback({ info: { printRows: { from: printRows?.from, to: printRows?.to - 2 } } });
          }
        }
      }, [200]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printRows, borderMovementsStatus])


  useEffect(() => {
    const scrollDiv = document?.querySelector('#border-movement-bordertype .ant-table-body');
    if (scrollDiv) {
      scrollDiv.addEventListener('scroll', (e) => {
        const scrollTop = e.target.scrollTop;
        movementsByBorderRef.current.scrollTop = scrollTop;
      });
    }

    const scrollToDiv = document?.querySelector('#border-movement-bordertype-preview .ant-table-body');

    if (scrollToDiv) {
      setTimeout(() => {
        scrollToDiv.scrollTop = movementsByBorderRef?.current?.scrollTop || 0;
      }, 2000)
    }
    
    return () => {
      if (scrollDiv) {
        scrollDiv.removeEventListener('scroll', () => {});
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  
  const tableData = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(borderMovementsValue?.data?.ports);
    }
    return borderMovementsValue?.data?.ports?.filter((v) => {
      return appliedSearchText?.includes(v?.[resolveTernary(isRtl, "name_ar", "name_en")])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, borderMovementsValue]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedSearchText}
        appliedSearchText={appliedSearchText}
        setSearchText={setSearchText}
        searchText={searchText}
        data={borderMovementsValue?.data?.ports}
      >
        {
          (d) => (
            <InputWrap
              data={d}
              setAppliedSearchText={setAppliedSearchText}
              arKey="name_ar"
              enKey="name_en"
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
    filterIcon: <SearchOutlined style={{ color: resolveTernary(appliedSearchText, 'var(--colorPrimaryBase)', undefined) }} />,
  });

  const landColumns = [
    {
      title: intl?.formatMessage({ id: borderTypeMap[showBy]?.labelKey }),
      sorter: {
        compare: (a, b) => a?.[resolveTernary(isRtl, "name_ar", "name_en")]?.localeCompare(b?.[resolveTernary(isRtl, "name_ar", "name_en")]),
      },
      width: patchedGetResponsiveFn({ default: "350px", desktop: "240px", tablet: "250px", midTablet: "283px", mobile: "132px" }),
      // ellipsis: true,
      render: (v) => {
        return (
          <Text ellipsis={{ tooltip: resolveTernary(isRtl, v?.name_ar, v?.name_en) }}>
            {resolveTernary(isRtl, v?.name_ar, v?.name_en)}
          </Text>
        )
      },
      ...getColumnSearchProps()
    },
    {
      title: <Row><Col style={{ maxHeight: "22px" }}><Text strong>{intl?.formatMessage({ id: "Traveler" })}</Text></Col></Row>,
      className: 'border-bottom-table-column',
      children: [
        {
          title: intl?.formatMessage({ id: "Entries" }),
          ...patchedGetResponsiveFn({ default: "false", desktop: "true", bigTablet: "false" }) === "true" && { width: "105px" },
          sorter: {
            compare: (a, b) => (a.traveller_entries || a?.entries) - (b.traveller_entries || b?.entries),
          },
          render: (v) => {
            return (
              <Row align="middle" gutter={patchedGetResponsiveFn({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                <Col>
                  <Text>
                    {
                      resolveTernary([undefined, null]?.includes(v?.traveller_entries), '-', formatNumber(v?.traveller_entries))
                    }
                  </Text>
                </Col>
              </Row>
            )
          }
        },
        {
          title: intl?.formatMessage({ id: "Exits" }),
          ...getResponsive({ default: "false", desktop: "true", bigTablet: "false" }) === "true" && { width: "105px" },
          sorter: {
            compare: (a, b) => (a.traveller_exits || a?.exits) - (b.traveller_exits || b?.exits),
          },
          render: (v) => {
            return (
              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                <Col>
                  <Text>
                    {
                      resolveTernary([undefined, null]?.includes(v?.traveller_exits), '-', formatNumber(v?.traveller_exits))
                    }
                  </Text>
                </Col>
              </Row>
            )
          }
        },
        {
          title: intl?.formatMessage({ id: "Total Movements" }),
          width: getResponsive({ default: "auto", tablet: "140px" }),
          sorter: {
            compare: (a, b) => (a.total_movements) - (b.total_movements),
          },
          ...getResponsive({ default: "false", desktop: "true", bigTablet: "false" }) === "true" && { width: "115px" },
          render: (v) => {
            return (
              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                <Col>
                  <Text>
                    {
                      resolveTernary([undefined, null]?.includes(v?.total_movements), '-', formatNumber(v?.total_movements))
                    }
                  </Text>
                </Col>
              </Row>
            )
          }
        }
      ]
    },
    {
      title: <Row><Col><Text style={{ maxHeight: "22px" }} strong>{intl?.formatMessage({ id: "Truck" })}</Text></Col></Row>,
      className: 'border-bottom-table-column',
      children: [
        {
          title: intl?.formatMessage({ id: "Entries" }),
          ...getResponsive({ default: "false", desktop: "true", bigTablet: "false" }) === "true" && { width: "105px" },
          sorter: {
            compare: (a, b) => (a.truck_entries) - (b.truck_entries),
          },
          render: (v) => {
            return (
              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                <Col>
                  <Text>
                    {
                      resolveTernary([undefined, null]?.includes(v?.truck_entries), '-', formatNumber(v?.truck_entries))
                    }
                  </Text>
                </Col>
              </Row>
            )
          }
        },
        {
          title: intl?.formatMessage({ id: "Exits" }),
          ...getResponsive({ default: "false", desktop: "true", bigTablet: "false" }) === "true" && { width: "105px" },
          sorter: {
            compare: (a, b) => (a.truck_exits) - (b.truck_exits),
          },
          render: (v) => {
            return (
              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                <Col>
                  <Text>
                    {
                      resolveTernary([undefined, null]?.includes(v?.truck_exits), '-', formatNumber(v?.truck_exits))
                    }
                  </Text>
                </Col>
              </Row>
            )
          }
        },
        {
          title: intl?.formatMessage({ id: "Total Movements" }),
          width: getResponsive({ default: "auto", tablet: "140px" }),
          sorter: {
            compare: (a, b) => (a.truck_movements) - (b.truck_movements),
          },
          ...getResponsive({ default: "false", desktop: "true", bigTablet: "false" }) === "true" && { width: "115px" },
          render: (v) => {
            return (
              <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                <Col>
                  <Text>
                    {
                      resolveTernary([undefined, null]?.includes(v?.truck_movements), '-', formatNumber(v?.truck_movements))
                    }
                  </Text>
                </Col>
              </Row>
            )
          }
        }
      ]
    },
  ]
  const columns = [
    {
      title: intl?.formatMessage({ id: borderTypeMap[showBy]?.labelKey }),
      sorter: {
        compare: (a, b) => a?.[resolveTernary(isRtl, "name_ar", "name_en")]?.localeCompare(b?.[resolveTernary(isRtl, "name_ar", "name_en")]),
      },
      ellipsis: true,
      width: getResponsive({ default: "350px", desktop: "300px", tablet: "220px", midTablet: "200px", mobile: "200px" }),
      render: (v) => {
        return (
          <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
            <Col>
              <Text ellipsis={{ title: resolveTernary(isRtl, v?.name_ar, v?.name_en) }}>
                {resolveTernary(isRtl, v?.name_ar, v?.name_en)}
              </Text>
            </Col>
          </Row>
        )
      },
      ...getColumnSearchProps()
    },
    ...(showBy === "AIR")
      ? [{
        title: intl?.formatMessage({ id: "Emirates" }),
        sorter: {
          compare: (a, b) => a?.[isRtl ? "emirate_ar" : "emerate_en"]?.localeCompare(b?.[isRtl ? "emirate_ar" : "emerate_en"]),
        },
        render: (v) => {
          return (
            <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
              <Col>
                <Text>
                  {resolveTernary(isRtl, v?.emirate_ar, v?.emerate_en) || "-"}
                </Text>
              </Col>
            </Row>
          )
        }
      }]
      : [],
    ...(showBy === "EXPECTED")
      ? [{
        title: intl?.formatMessage({ id: "Port Type" }),
        sorter: {
          compare: (a, b) => a?.[isRtl ? "port_type_ar" : "port_type_en"]?.localeCompare(b?.[isRtl ? "port_type_ar" : "port_type_en"]),
        },
        ellipsis: true,
        render: (v) => {
          return (
            <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
              <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 100%", midTablet: "0 0 95px", mobile: "0 0 100%" })}>
                <Text>
                  {isRtl ? v?.port_type_ar : v?.port_type_en}
                </Text>
              </Col>
            </Row>
          )
        }
      }]
      : [],
    {
      title: intl?.formatMessage({ id: resolveTernary(showBy === "EXPECTED", "Expected Entries", "Entries") }),
      sorter: {
        compare: (a, b) => (a.traveller_entries || a?.entries) - (b.traveller_entries || b?.entries),
      },
      render: (v) => {
        return (
          <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
            <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 100%", midTablet: "0 0 95px", mobile: "0 0 100%" })}>
              <Text>
                {
                  showBy === "LAND"
                    ? resolveTernary([undefined, null]?.includes(v?.traveller_entries), '-', formatNumber(v?.traveller_entries))
                    : resolveTernary([undefined, null]?.includes(v?.entries), '-', formatNumber(v?.entries))
                }
              </Text>
            </Col>
          </Row>
        )
      }
    },
    {
      title: intl?.formatMessage({ id: resolveTernary(showBy === "EXPECTED", "Expected Exits", "Exits") }),
      sorter: {
        compare: (a, b) => (a.traveller_exits || a?.exits) - (b.traveller_exits || b?.exits),
      },
      render: (v) => {
        return (
          <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
            <Col>
              <Text>
                {
                  showBy === "LAND"
                    ? resolveTernary([undefined, null]?.includes(v?.traveller_exits), '-', formatNumber(v?.traveller_exits))
                    : resolveTernary([undefined, null]?.includes(v?.exits), '-', formatNumber(v?.exits))
                }
              </Text>
            </Col>
          </Row>
        )
      }
    },
    {
      title: intl?.formatMessage({ id: resolveTernary(showBy === "EXPECTED", "Expected Total", "Total Movements") }),
      sorter: {
        compare: (a, b) => (a.total_movements || a?.total) - (b.total_movements || b?.total),
      },
      width: getResponsive({ default: "auto", tablet: "170px" }),
      render: (v) => {
        return (
          <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
            <Col>
              <Text>
                {
                  resolveTernary(
                    showBy === "LAND",
                    resolveTernary([undefined, null]?.includes(v?.total_movements), '-', formatNumber(v?.total_movements)),
                    resolveTernary([undefined, null]?.includes(v?.total), '-', formatNumber(v?.total))
                  )
                }
              </Text>
            </Col>
          </Row>
        )
      }
    }
  ]
  
  if (showBy !== "SEA" && showBy !== "EXPECTED" && showBy !== "AIR") {
    columns.push({
      title: intl?.formatMessage({ id: showBy === "AIR" ? "Total Expected" : "Truck Movements" }),
      sorter: {
        compare: (a, b) => (a.total_expected || a?.truck_movements) - (b.total_expected || b?.truck_movements),
      },
      render: (v) => {
        return (
          <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
            <Col>
              <Text>
                {
                  resolveTernary(
                    showBy === "AIR",
                    resolveTernary([undefined, null]?.includes(v?.total_expected), '-', formatNumber(v?.total_expected)),
                    resolveTernary([undefined, null]?.includes(v?.truck_movements), '-', formatNumber(v?.truck_movements))
                  )
                }
              </Text>
            </Col>
          </Row>
        )
      }
    })
  }

  const ele = (printRows) => (
    <DashboardCard
      cardBodyHeight={resolveTernary(isPreview, "auto", patchedGetResponsiveFn({ default: "505px", desktop: "499px", midTablet: "auto" }))}
      title={title}
      icon={<Swap size={32} />}
      headerBorder={false}
      cardBodyPadding="0px"
      bodyBackgroundColor={"transparent"}
      bodyWrapStyle={{
        paddingTop: "0px"
      }}
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
        <Col isFlex>
          {
            !printRows?.from &&
            <Row gutter={[0, themeVariables?.token?.margin]}>
              <Col>
                {
                  resolveTernary(
                    isLoading,
                    (
                      <Skeleton paragraph={{ rows: 1 }} />
                    ),
                    (
                      <Tabs
                        isCustom
                        customCardWidth={resolveTernary(isRtl, 236, 206)}
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
                          if (isPreview) {
                            return;
                          }
                          movementsByBorderRef.current.showBy = key;
                          setShowBy(key)
                        }}
                        options={[
                          {
                            key: "AIR",
                            disabled: filter?.port_type && filter?.port_type !== "AIR",
                            children: (
                              <RegionWrap
                                isPreview={isPreview}
                                keyLabel="AIR"
                                iconLabel={`Specifically refers to movements at Airports`}
                                label={intl?.formatMessage({ id: "Airports" })}
                                value={formatNumber(resolveTernary(airStat?.total, airStat?.total, 0))}
                              />
                            )
                          },
                          {
                            key: "SEA",
                            disabled: filter?.port_type && filter?.port_type !== "SEA",
                            children: (
                              <RegionWrap
                                isPreview={isPreview}
                                keyLabel="SEA"
                                label={intl?.formatMessage({ id: "Seaports" })}
                                iconLabel={`Specifically refers to movements at Seaports`}
                                value={formatNumber(resolveTernary(seaStat?.total, seaStat?.total, 0))}
                              />
                            )
                          },
                          {
                            key: "LAND",
                            disabled: filter?.port_type && filter?.port_type !== "LAND",
                            children: (
                              <RegionWrap
                                isPreview={isPreview}
                                iconLabel={`Specifically refers to movements at land entry points`}
                                keyLabel="LAND"
                                label={intl?.formatMessage({ id: "Land Borders" })}
                                value={formatNumber(resolveTernary(landStat?.total, landStat?.total, 0))}
                              />
                            )
                          },
                          {
                            key: "EXPECTED",
                            disabled: filter?.port_type,
                            children: (
                              <RegionWrap
                                isPreview={isPreview}
                                keyLabel="EXPECTED"
                                label={intl?.formatMessage({ id: "Expected Travelers" })}
                                iconLabel={`Number of passengers expected to arrive at Airports and Seaports in the next 48 hours`}
                                value={formatNumber(resolveTernary(expectedStat?.total, expectedStat?.total, 0))}
                              />
                            )
                          }
                        ]}
                      />
                    )
                  )
                }
              </Col>
            </Row>
          }
          
          <>
            {
              !printRows?.from &&
              <div
                style={{
                  height: "92px"
                }}
              >
                {
                  resolveTernary(
                    showBy === "LAND",
                    (
                      <Scrollbars>
                        <div
                          style={{
                            paddingRight: resolveTernary((!isRtl && showBy !== "LAND"), "0px", "10px"),
                            paddingLeft: resolveTernary((isRtl && showBy === "LAND" ), "10px", "0px")
                          }}
                        >
                          <Row
                            wrap={false}
                            gutter={[16]}
                            style={{
                              minWidth: resolveTernary(showBy === "LAND", "866px", "auto")
                            }}
                          >
                            <Col span={resolveTernary((showBy !== "SEA" && showBy !== "AIR" && showBy !== "EXPECTED"), 6, 12)}>
                              <StatCard
                                label={intl?.formatMessage({ id: resolveTernary(showBy === "LAND", "Traveler Entries", "Entries") })}
                                bgColor={"var(--green-1)"}
                                iconBgColor={"var(--green-2)"}
                                value={formatNumber(borderMovementsValue?.data?.total_entries) || "-"}
                                icon={<SignIn weight="duotone" color={"var(--green-6)"} size={24} />}
                              />
                            </Col>
                            <Col span={resolveTernary((showBy !== "SEA" && showBy !== "AIR" && showBy !== "EXPECTED"), 6, 12)}>
                              <StatCard
                                label={intl?.formatMessage({ id: resolveTernary(showBy === "LAND", "Traveler Exits", "Exits") })}
                                bgColor={"var(--orange-1)"}
                                iconBgColor={"var(--orange-2)"}
                                value={formatNumber(borderMovementsValue?.data?.total_exits) || "-"}
                                icon={<SignOut weight="duotone" color={"var(--orange-6)"} size={24} />}
                              />
                            </Col>
                            {
                              (showBy === "LAND") &&
                            <Col span={6}>
                              <StatCard
                                label={intl?.formatMessage({ id: resolveTernary(showBy === "LAND", "Truck Entries", "Total Expected") })}
                                bgColor={"var(--green-1)"}
                                iconBgColor={"var(--green-2)"}
                                value={formatNumber(resolveTernary(showBy === "LAND", (borderMovementsValue?.data?.total_truck_entries), borderMovementsValue?.data?.total_expected)) || "-"}
                                icon={
                                  resolveTernary(
                                    showBy === "LAND",
                                    <SignIn weight="duotone" color={"var(--green-6)"} size={24} />,
                                    <AirplaneInFlight weight="duotone" color={"var(--purple-6)"} size={24} />
                                  )
                                }
                              />
                            </Col>
                            }
                            {
                              showBy === "LAND" && (
                                <Col span={6}>
                                  <StatCard
                                    label={intl?.formatMessage({ id: "Truck Exits" })}
                                    bgColor={"var(--orange-1)"}
                                    iconBgColor={"var(--orange-2)"}
                                    value={formatNumber(borderMovementsValue?.data?.total_truck_exits) || "-"}
                                    icon={<SignOut weight="duotone" color={"var(--orange-6)"} size={24} />}
                                  />
                                </Col>
                              )
                            }
                          </Row>
                        </div>
                      </Scrollbars>
                    ),
                    (
                      <div
                        style={{
                          paddingRight: resolveTernary((!isRtl && showBy !== "LAND"), "0px", "10px"),
                          paddingLeft: resolveTernary((isRtl && showBy === "LAND" ), "10px", "0px")
                        }}
                      >
                        <Row
                          wrap={false}
                          gutter={[16]}
                          style={{
                            minWidth: resolveTernary(showBy === "LAND", "866px", "auto")
                          }}
                        >
                          <Col span={resolveTernary((showBy !== "SEA" && showBy !== "AIR" && showBy !== "EXPECTED"), 6, 12)}>
                            <StatCard
                              label={intl?.formatMessage({ id: resolveTernary(showBy === "LAND", "Traveler Entries", "Entries") })}
                              bgColor={"var(--green-1)"}
                              iconBgColor={"var(--green-2)"}
                              value={formatNumber(borderMovementsValue?.data?.total_entries) || "-"}
                              icon={<SignIn weight="duotone" color={"var(--green-6)"} size={24} />}
                            />
                          </Col>
                          <Col span={resolveTernary((showBy !== "SEA" && showBy !== "AIR" && showBy !== "EXPECTED"), 6, 12)}>
                            <StatCard
                              label={intl?.formatMessage({ id: resolveTernary(showBy === "LAND", "Traveler Exits", "Exits") })}
                              bgColor={"var(--orange-1)"}
                              iconBgColor={"var(--orange-2)"}
                              value={formatNumber(borderMovementsValue?.data?.total_exits) || "-"}
                              icon={<SignOut weight="duotone" color={"var(--orange-6)"} size={24} />}
                            />
                          </Col>
                          {
                            (showBy === "LAND") &&
                            <Col span={6}>
                              <StatCard
                                label={intl?.formatMessage({ id: resolveTernary(showBy === "LAND", "Truck Entries", "Total Expected") })}
                                bgColor={"var(--green-1)"}
                                iconBgColor={"var(--green-2)"}
                                value={formatNumber(resolveTernary(showBy === "LAND", (borderMovementsValue?.data?.total_truck_entries), borderMovementsValue?.data?.total_expected)) || "-"}
                                icon={
                                  resolveTernary(
                                    showBy === "LAND",
                                    <SignIn weight="duotone" color={"var(--green-6)"} size={24} />,
                                    <AirplaneInFlight weight="duotone" color={"var(--purple-6)"} size={24} />
                                  )
                                }
                              />
                            </Col>
                          }
                          {
                            showBy === "LAND" && (
                              <Col span={6}>
                                <StatCard
                                  label={intl?.formatMessage({ id: "Truck Exits" })}
                                  bgColor={"var(--orange-1)"}
                                  iconBgColor={"var(--orange-2)"}
                                  value={formatNumber(borderMovementsValue?.data?.total_truck_exits) || "-"}
                                  icon={<SignOut weight="duotone" color={"var(--orange-6)"} size={24} />}
                                />
                              </Col>
                            )
                          }
                        </Row>
                      </div>
                    )
                  )
                }
              </div>
            }
            <Row isFlexGrow>
              <Col
                paddingBlock={resolveTernary(window?.innerWidth > 1200,  "9px 0px", "8px 0px")}
              >
                <Row
                  gutter={patchedGetResponsiveFn({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                  wrap={patchedGetResponsiveFn({ default: false, midTablet: true })}
                  isFullHeight
                >
                  <Col
                    {
                      ...!isPreview ? ({
                        id: "border-movement-bordertype"
                      })
                        : ({
                          id: "border-movement-bordertype-preview"
                        })
                    }
                  >
                    {
                      isLoading || ["idle", "pending"]?.includes(borderMovementsStatus) || isLoadingInnerTable
                        ? <Skeleton paragraph={{ rows: 4 }} />
                        : <Table
                          key={appliedSearchText}
                          className="table-with-header-border"
                          loading={isLoading || ["idle", "pending"]?.includes(borderMovementsStatus) || isLoadingInnerTable}
                          borderRadiusOnSides={patchedGetResponsiveFn({ default: "top" })}
                          columns={resolveTernary(showBy === "LAND", landColumns, columns)}
                          scroll={resolveTernary(
                            isPreview,
                            undefined,
                            {
                              y: ((borderMovementsValue?.data?.ports?.length > patchedGetResponsiveFn({ default: 4, midTablet: 6, mobile: 4 })) && !isPreview) ? patchedGetResponsiveFn({ default: resolveTernary(showBy === "LAND", 210, 250), desktop: resolveTernary(showBy === "LAND", 180, 250), tablet: resolveTernary(showBy === "LAND", 200, 260), bigTablet: resolveTernary(showBy === "LAND", 180, resolveTernary(showBy === "SEA", 255, 240)) }) : {},
                              x: resolveTernary(showBy === "LAND", 950, patchedGetResponsiveFn({ default: null, tablet: 850, midTablet: 700 }))
                            }
                          )
                          }
                          pagination={false}

                          dataSource={resolveTernary(isPreview, tableData?.slice(printRows?.from, printRows?.to), tableData)}
                        />
                    }
                    
                  </Col>
                </Row>
              </Col>
            </Row>
          </>
        </Col>
      </Row>
    </DashboardCard>
  )


  return (
    resolveTernary(
      (!isPreview || isPrint),
      ele(printRows),
      <div
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
  )
}

ResidentsByRegion.propTypes = {
  data: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  setShowBy: PropTypes.func,
  showBy: PropTypes.string,
  tableConfig: PropTypes.object,
  title: PropTypes.string,
  tooltipValueText: PropTypes.any,
  movementsByBorderRef: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  offset: PropTypes.any,
  isPreview: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  totalMapping: PropTypes.object
}

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
