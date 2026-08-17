import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Tooltip, Text, Table, Progress, AntIcons, theme, Scrollbars, Card } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import PieChart from "@/components/PieChart";
import ResidencyType from "@/svgr/ResidencyType";
import React, { useState, useEffect, useMemo } from "react";
import { formatNumber, getColorByIndex } from "@/utils/helper";
import { legendsConfig, tooltipConfig } from "@/utils/highchartsConfig";
import { TableFilterDropdown, InputWrap } from "@/components/TableFilterWidgets";
import { getResidentsByResidencyType } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";
import Segmented from "@/components/Segmented";
import useResponsive from "@/hooks/useResponsive";
import PlusIconOutlined from "@/svgr/PlusIconOutlined";

const { Info, ListBullets, ChartPie } = PhosphorIcons;
const { MinusSquareOutlined, SearchOutlined } = AntIcons;

const { useToken } = theme;

function getBorderColor(selectedOptions, item, themeVariables) {
  return selectedOptions?.type_en === item?.type_en
    ? themeVariables?.token?.colorPrimaryBase
    : themeVariables?.token?.colorBorderSecondary
}

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

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

const ExpandIcon = ({ expanded, onExpand, record }) => (
  expanded ? (
    <MinusSquareOutlined style={{ color: "var(--colorPrimaryBase)" }} onClick={e => onExpand(record, e)} />
  ) : (
    <PlusIconOutlined style={{ cursor: "pointer" }} onClick={e => onExpand(record, e)} />
  )
);

ExpandIcon.propTypes = {
  expanded: PropTypes.any,
  onExpand: PropTypes.any,
  record: PropTypes.any,
}

function ResidentsByResidencyType({ filters, isRtl, isPreviewOpen, pageRef }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [showBy, setShowBy] = useState(isPreviewOpen ? pageRef.current?.residentsByResidencyType?.showBy : "overview");
  const themeVariables = useToken();
  const [selectedOptions, setSelectedOptions] = useState(undefined);

  const [expandedRowKeys] = useState(undefined);

  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)

  useEffect(() => {
    pageRef.current.residentsByResidencyType = {
      ...pageRef.current.residentsByResidencyType,
      showBy
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy])

  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsByResidencyType });

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined);
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined);
    }
    execute({ filters: { ...filters } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const isLoading = ["idle", "pending"]?.includes(status);
  
  const _data = value?.data || [];
  const data = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }
    return _data?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "type_ar" : "type_en"])
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data, appliedSearchText]);

  const isEmpty = !isLoading && !data?.length;

  const values = [
    {
      size: '100%',
      showInLegend: false,
      colorByPoint: true,
      data: data?.map((v, index) => ({
        name: getResponsive({ default: (isRtl ? v?.type_ar : v?.type_en), mobile: (isRtl ? v?.type_ar : v?.type_en)?.split(" ")?.[0] }),
        y: v?.count,
        dataLabels: {
          enabled: false,
        },
        showInLegend: true,
        color: !selectedOptions || selectedOptions?.type_en === v?.type_en ? getColorByIndex(index) : "var(--geek-blue-2)",
      }))
    },
  ];


  const props = {
    title: "",
    values,
    style: {},
    type: "basicPie",
    legend: {
      ...(getResponsive({ default: legendsConfig, mobile: legendsConfig })),
      rtl: isRtl,
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };

  const totalCount = _data?.reduce((acc, v) => {
    acc += (v?.count || 0);
    return acc;
  }, 0);

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
                arKey="type_ar"
                enKey="type_en"
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
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="auto" style={{ maxWidth: window?.innerWidth < 400 ? "calc(100% - 30px)" : "100%", whiteSpace: "break-spaces" }}>
            <span style={{ position: "relative" }}>
              {intl.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Residents & Visa Holders By Type" : filters?.residents_category === 'visa' ? "Visa Holder By Visa Type" : "Residents By Residency Type" })}
              <span
                style={{ position: "absolute", ...isRtl ? { left: "-20px" } : { right: "-20px" }, bottom: isRtl ? "4px" : "-2px" }}
              >
                <Tooltip
                  placement="bottom"
                  title={intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "residents_visa_holders_residency_type_tooltip" : filters?.residents_category === 'visa' ? "active_visa_holders_residency_type_tooltip" : "active_residence_residency_type_tooltip" })}
                >
                  <span>
                    <Info style={{ marginBottom: "0px" }} color="var(--colorIcon)" size={14} weight="bold" />
                  </span>
                </Tooltip>
              </span>
            </span>
          </Col>
        </Row>
      )}
      {
        ...showBy !== "overview" && {
          bodyBackgroundColor: "transparent",
          bodyWrapStyle: {
            padding: '0px'
          }
        }
      }
      icon={<ResidencyType />}
      loading={isLoading}
      cardBodyHeight={patchedGetResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
      action={(
        !isEmpty &&
        <Segmented
          isSegmentedBold
          size="default"
          block={patchedGetResponsive({
            default: false,
            mobile: true,
          })}
          onChange={(e) => {
            setShowBy(e);
          }}
          value={showBy}
          options={[
            {
              icon: <ChartPie style={{ marginBottom: "3px" }} size={16} />,
              label: <Text>{intl.formatMessage({ id: "Chart" })}</Text>,
              value: "overview"
            },
            {
              icon: <ListBullets style={{ marginBottom: "3px" }} size={16} />,
              label: <Text>{intl.formatMessage({ id: "List" })}</Text>,
              value: "sub-categories"
            }
          ]}
        />
      )}
    >
      {
        showBy == "overview"
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
              <Col
                style={patchedGetResponsive({ default: {}, mobile: { maxHeight: "250px", height: data?.length * 60 } })}
                flex={patchedGetResponsive({ default: "0 0 197px", mobile: "0 0 100%" })}
              >
                <Scrollbars>
                  <Row style={{ margin: "auto", width: "100%", maxWidth: "100%" }} gutter={[0, themeVariables?.token?.marginXS]}>
                    {data?.map((item, index) => {
                      return (
                        <Col key={item?.type_en}>
                          <Card
                            bodyStyle={{
                              paddingBlock: `${themeVariables.token?.paddingXXS}px`,
                              paddingInline: `${themeVariables.token?.paddingXS}px ${themeVariables.token?.padding}px`,
                              // height: "32px",
                              display: "flex",
                              borderRadius: themeVariables?.token?.borderRadiusLG,
                              border: `1px solid ${getBorderColor(selectedOptions, item, themeVariables)}`,
                              borderBottomWidth: selectedOptions && selectedOptions?.type_en == item?.type_en
                                ? 2
                                : 1,
                            }}
                            onCardClick={() => {
                              if (selectedOptions?.type_en == item?.type_en) {
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
                                        tooltip: isRtl ? item?.type_ar : item?.type_en
                                      }}
                                    >
                                      {isRtl ? item?.type_ar : item?.type_en}
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
          )
          : (
            <Row
              isFullHeight
              wrap={patchedGetResponsive({ default: false, mobile: true })}
            >
              <Col
                style={{
                  border: "1px solid var(--colorSplit)",
                  borderRadius: "6px"
                }}
              >
                <Table
                  key={appliedSearchText}
                  className="expanded-table"
                  columns={[
                    {
                      title: intl?.formatMessage({ id: "Residency Type" }),
                      width: "50%",
                      sorter: {
                        compare: (a, b) => (isRtl ? a?.type_ar : a?.type_en)?.localeCompare(isRtl ? b?.type_ar : b?.type_en),
                      },
                      key: "key",
                      render: (v) => {
                        return isRtl ? v?.type_ar : v?.type_en
                      },
                      ...getColumnSearchProps()
                    },
                    {
                      title: intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Number of Residents & Visa Holders" : filters?.residents_category === 'visa' ? "Number of Visa Holders" : "Number of Residents" }),
                      width: "50%",
                      key: "key",
                      sorter: {
                        compare: (a, b) => (a?.count - b?.count),
                      },
                      render: (v) => {
                        const percent = ((v?.count / totalCount) * 100)?.toFixed(2);
                        return (
                          <Row align="middle" gutter={patchedGetResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                            <Col flex={patchedGetResponsive({ default: "0 0 105px", mobile: "0 0 105px" })}>
                              <Text
                                ellipsis={{
                                  tooltip: v?.count ? formatNumber(v?.count) : '-'
                                }}
                              >
                                {v?.count ? formatNumber(v?.count) : '-'}
                              </Text>
                            </Col>

                            <Col flex="auto">
                              <Progress
                                // strokeColor={getColorFromPercentage({
                                //   percent: percentOutOfMaxValue,
                                // })}
                                strokeColor={"var(--colorPrimaryBase)"}
                                percent={percent}
                                showInfo={true}
                                format={FormatText}
                              />
                            </Col>
                          </Row>
                        )
                      },
                    }
                  ]}
                  scroll={{
                    y: patchedGetResponsive({ default: 330, tablet: 330, midTablet: 300, mobile: 330 }),
                  }}
                  pagination={false}
                  rowClassName={(record) => record?.key === expandedRowKeys ? "expanded-row" : ""}
                  expandable={{
                    // expandedRowRender: (record) => expandedRowRender(record),
                    // rowExpandable: (_record) => !!_record?.sub_types?.length,
                    // expandRowByClick: true,
                    // expandedRowKeys,
                    // onExpand: (expanded, record) => {
                    //   if (record?.key === expandedRowKeys) {
                    //     setExpandedRowKeys(undefined)
                    //   } else {
                    //     setExpandedRowKeys(record?.key)
                    //   }
                    // },
                    // expandIcon: ExpandIcon
                  }}
                  dataSource={data?.map((v, index) => ({ ...v, key: `${v?.type_en}-${index}` }))}
                />
              </Col>
            </Row>
          )
      }
    </DashboardCard>
  )
}

ResidentsByResidencyType.propTypes = {
  allTypes: PropTypes.any,
  filters: PropTypes.any,
  isRtl: PropTypes.any,
  isPreviewOpen: PropTypes.any,
  pageRef: PropTypes.any
}

export default ResidentsByResidencyType;