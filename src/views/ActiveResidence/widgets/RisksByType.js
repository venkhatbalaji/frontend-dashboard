import React, { useContext, useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types"
import { useIntl } from "react-intl";
import { Row, Col, theme, Table, Tooltip, Progress, Text, AntIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import { TableFilterDropdown, InputWrap } from "@/components/TableFilterWidgets";
import { checkRtl, getColorFromPercentage, formatNumber, resolveTernary } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import { getRiskByType } from "@/services/activeResidenceService";
import _ from "lodash";

const { useToken } = theme;
const { SearchOutlined } = AntIcons;

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function RisksByType({
  icon,
  title,
  filters,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback
}) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const [printRows, setPrintRows] = useState(offset ? { from: offset, to: offset + 1 } : rows || { from: 0, to: 1 });
  const hiddenContainerRef = useRef()
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)

  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getRiskByType });
  const isEmpty = (apiStatus !== "pending" && apiStatus !== "idle") && !value?.data?.length
  const _data = value?.data || [];

  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return resolveTernary(isPreview, _.cloneDeep(_data?.slice(0, 20)), _.cloneDeep(_data));
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "risk_type_ar" : "risk_type_en"])
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSearchText, _data]);
  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    invokeApi({ filters: { ...filters } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const sumTotal = (_data || [])?.reduce((acc, v) => acc + (v?.count || 0), 0);
    

  const minMaxValues = useMemo(() => {
    let min = 0;
    let max = 0;
    if (Array.isArray(value?.data)) {
      min = value?.data?.[0]?.count;
      max = value?.data?.[0]?.count;
      for (const v of value?.data) {
        if (v?.count < min) {
          min = v?.count;
        }
        if (v?.count > max) {
          max = v?.count;
        }
      };
    }
    return { min, max };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.data]);

  const isLoading = ["pending", "idle"]?.includes(apiStatus);

  useEffect(() => {
    if (isPreview && !isPrint && !isLoading) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.offsetHeight) {
          const height = hiddenContainerRef.current.offsetHeight;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } } });
          } else if (printRows?.to >= data?.length) {
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
  }, [printRows, isLoading])

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
          (d) => {
            return (
              <InputWrap
                data={d}
                setAppliedSearchText={setAppliedSearchText}
                arKey="risk_type_ar"
                enKey="risk_type_en"
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
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: appliedSearchText ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  const ele = (printRows) => {
    return (
      <DashboardCard
        bodyBackgroundColor="transparent"
        isEmpty={isEmpty}
        title={title}
        icon={icon}
        style={{
          height: "auto",
          width: "100%"
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
            default: themeVariables?.token?.marginLG,
            desktop: themeVariables?.token?.marginSM,
            tablet: [0, themeVariables?.token?.marginSM],
          })}
        >
          <Col span={getResponsive({ default: 24, tablet: 24 })}>
            <DashboardCard
              bodyBackgroundColor="transparent"
              cardBodyHeight={"auto"}
              cardBodyPadding={"0px"}
              bordered
              style={{
                height: "100%"
              }}
              headStyle={{
                display: "none"
              }}
              bodyWrapStyle={{
                padding: "0px"
              }}
            >
              <Table
                key={`${appliedSearchText}`}
                borderRadiusOnSides={getResponsive({ default: data?.length > 6 ? "all" : "top", midTablet: data?.length > 6 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
                columns={[
                  {
                    title: intl?.formatMessage({ id: "Risk Type" }),
                    width: getResponsive({ default: "50%", mobile: "154px" }),
                    ...!isPreview && ({
                      sorter: {
                        compare: (a, b) => a?.[isRtl ? "risk_type_ar" : "risk_type_en"]?.localeCompare(b?.[isRtl ? "risk_type_ar" : "risk_type_en"]),
                      }
                    }),
                    render: (v) => {
                      return (
                        <Row>
                          <Col
                            paddingInline={isRtl ? "0px 16px" : "0 16px"}
                          >
                            <Row align="middle" wrap={false} gutter={8}>
                              <Col flex="none">
                                <Text
                                  ellipsis={{
                                    tooltip: isRtl ? v?.risk_type_ar : v?.risk_type_en
                                  }}
                                >
                                  {isRtl ? v?.risk_type_ar : v?.risk_type_en}
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
                    title: intl?.formatMessage({ id: "Total Number of Risks Percent" }),
                    width: getResponsive({ default: "50%", mobile: "274px" }),
                    ...!isPreview && ({
                      sorter: {
                        compare: (a, b) => a?.count - b?.count,
                      }
                    }),
                    render: (v) => {
                      const percent = ((v?.count / sumTotal) * 100)?.toFixed(2) || 0;
                      const percentOutOfMaxValue = v?.count / minMaxValues.max * 100;
                      return (
                        <Row wrap={false} align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                          <Col flex={getResponsive({
                            default: "0 0 102px",
                          })}>
                            <Text
                              ellipsis={{
                                tooltip: v?.count
                              }}
                            >
                              {formatNumber(v.count)}
                            </Text>
                          </Col>
                          <Col flex={getResponsive({ default: "auto", tablet: "auto", midTablet: "0 0 180px", mobile: "0 0 180px" })}>
                            <Tooltip
                              title={isNaN(percent) ? "-" : `${percent}%`}
                            >
                              <Progress
                                strokeColor={getColorFromPercentage({
                                  percent:
                                    percentOutOfMaxValue
                                })}
                                percent={percent}
                                showInfo={true}
                                format={() => FormatText([undefined, null]?.includes(v?.count) ? '-' : percent)}
                              />
                            </Tooltip>
                          </Col>
                        </Row>
                      )
                    },
                  }
                ]}  
                scroll={isPreview ? undefined : {
                  y: data?.length > getResponsive({ default: 7, tablet: 7, midTablet: 7, mobile: 7 }) ? getResponsive({ default: 330 }) : undefined,
                  x: getResponsive({ default: null, mobile: 688 })
                }}
                pagination={false}
                dataSource={isPreview ? data?.slice(printRows?.from, printRows?.to) : data}
              />
            </DashboardCard>
          </Col>
        </Row>
      </DashboardCard>
    )
  }

  return (
    (!isPreview || isPrint)
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

RisksByType.propTypes = {
  filters: PropTypes.any,
  icon: PropTypes.any,
  title: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
}

export default RisksByType;
