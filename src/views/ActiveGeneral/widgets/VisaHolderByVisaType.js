import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Text, theme, Table, Progress, Tooltip, AntIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import { useMemo, useEffect, useState } from "react";
import _ from "lodash";
import { TableFilterDropdown, InputWrap  } from "@/components/TableFilterWidgets";
import { formatNumber, getColorFromPercentage, resolveTernary } from "@/utils/helper";
import { getVisaHolderByVisaType } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";

const { IdentificationCard, Info } = PhosphorIcons;
const { SearchOutlined } = AntIcons;

const { useToken } = theme;

function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Residency Type" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? formatNumber(this?.point?.y) : '-'}</span>
    </div>
  `;
  }
}

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function VisaHolderByVisaType({
  filter, isRtl, isPreview, isPreviewOpen,
}) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getVisaHolderByVisaType });
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
    execute({ filter })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const isLoading = ["idle", "pending"]?.includes(status);
  const { data: _data = {} } = value || {};
  const isEmpty = !isLoading && !_data?.visa_categories?.length;
  if (isPreview && _data.visa_categories) {
    _data.visa_categories = _data.visa_categories?.slice(0, 20);
  }

  // Patch getResponsive for preview mode
  const patchedGetResponsive = (config) => {
    if ((isPreview || isPreviewOpen) && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };

  const data = useMemo(() => {
    let val = {
      visa_categories: []
    }
    if (!appliedSearchText?.length) {
      return _.cloneDeep(_data);
    }

    val.visa_categories = (_data?.visa_categories || [])?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "visa_category_ar" : "visa_category_en"])
    });
    return val;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data, appliedSearchText])
  
  const minMaxValues = useMemo(() => {
    let min = 0;
    let max = 0;
    let total = 0;

    if (_data?.visa_categories?.length) {
      min = _data?.visa_categories?.[0]?.holders_count;
      max = _data?.visa_categories?.[0]?.holders_count;
      (_data?.visa_categories || [])?.forEach((v) => {
        total += v?.holders_count;

        if (v?.holders_count < min) {
          min = v?.holders_count;
        }

        if (v?.holders_count > max) {
          max = v?.holders_count;
        }
      })
    }
    return { min, max, total };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedSearchText}
        appliedSearchText={appliedSearchText}
        setSearchText={setSearchText}
        searchText={searchText}
        data={_data?.visa_categories || []}
      >
        {
          (d) => (
            <InputWrap
              data={_.uniqBy(d, resolveTernary(isRtl, "visa_category_ar", "visa_category_en"))}
              arKey="visa_category_ar"
              enKey="visa_category_en"
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
  

  return (
    <DashboardCard
      isPreview={isPreview}
      isPreviewOpen={isPreviewOpen}
      bodyBackgroundColor="transparent"
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Visa Holders by Visa Type" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_Visa_Holders_by_Visa_Type_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<IdentificationCard size={32} weight="light" />}
      loading={isLoading}
      cardBodyPadding={isEmpty ? "16px" : "0px"}
      bodyWrapStyle={{
        padding: "1px 0px 0px 0px",
      }}
      
      cardBodyHeight={patchedGetResponsive({ default: "440px", desktop: "412px", mobile: "auto" })}
      isEmpty={isEmpty}
    >
      <Row
        isFullHeight
        gutter={[12, 12]}
        wrap={patchedGetResponsive({ default: false, mobile: true })}
      >
        <Col>
        
          <Table
            key={`${appliedSearchText}`}
            borderRadiusOnSides={patchedGetResponsive({ default: data?.length > 4 ? "all" : "top", midTablet: data?.length > 4 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
            columns={[
              {
                title: intl?.formatMessage({ id: "Visa Type" }),
                width: patchedGetResponsive({ default: "50%", mobile: "165px" }),
                ellipsis: true,
                sorter: {
                  compare: (a, b) => a?.[isRtl ? "visa_category_ar" : "visa_category_en"]?.localeCompare(b?.[isRtl ? "visa_category_ar" : "visa_category_en"]),
                },
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
                                tooltip: isRtl ? v?.visa_category_ar : v?.visa_category_en
                              }}
                            >
                              {isRtl ? v?.visa_category_ar : v?.visa_category_en}
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
                title: intl?.formatMessage({ id: "Number of Holders & %" }),
                width: patchedGetResponsive({ default: "50%", mobile: "260px" }),
                ellipsis: true,
                sorter: {
                  compare: (a, b) => a?.holders_count - b?.holders_count,
                },
                render: (v) => {
                  const percent = ((v?.holders_count / minMaxValues.total) * 100)?.toFixed(2);
                  const percentOutOfMaxValue = ((v?.holders_count / minMaxValues.max) * 100);
                  return (
                    <Row align="middle" gutter={patchedGetResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                      <Col flex={patchedGetResponsive({ default: "0 0 105px", mobile: "0 0 105px" })}>
                        <Text
                          ellipsis={{
                            tooltip: v?.holders_count ? formatNumber(v?.holders_count) : '-'
                          }}
                        >
                          {v?.holders_count ? formatNumber(v?.holders_count) : '-'}
                        </Text>
                      </Col>

                      <Col flex="auto">
                        <Progress
                          strokeColor={getColorFromPercentage({
                            percent: percentOutOfMaxValue,
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
              y: data?.visa_categories?.length > patchedGetResponsive({ default: 8, tablet: 8, midTablet: 8, mobile: 8 }) ? patchedGetResponsive({ default: 380, desktop: 360 }) : undefined,
              x: patchedGetResponsive({ default: null, mobile: 400 })
            }}
            pagination={false}
            dataSource={data?.visa_categories}
          />
            
        </Col>
      </Row>
    </DashboardCard>
  )
}

VisaHolderByVisaType.propTypes = {
  filter: PropTypes.any,
  isRtl: PropTypes.any,
  isPreview: PropTypes.any,
  isPreviewOpen: PropTypes.any
}

export default VisaHolderByVisaType;