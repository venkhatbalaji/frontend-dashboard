import React, { useContext, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { Row, Col, Text, Scrollbars, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl, resolveTernary, formatNumber as formatNumberUtil } from "@/utils/helper";
import { getVisaViolationDepartment } from "@/services/borderViolationService";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";

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

function getAxisTicks(min, max, divisions = 6) {
  const range = max - min;
  const step = Math?.ceil(range / (divisions));
  const ticks = [{
    value: 0,
    label: '0'
  }];

  if (range <= 0 || range < divisions) {
    ticks?.push(
      {
        value: Number((divisions / 2)?.toFixed(1)),
        label: formatNumber(Number((divisions / 2)?.toFixed(1)))
      },
      {
        value: Number((divisions)?.toFixed(1)),
        label: formatNumber(Number((divisions)?.toFixed(1)))
      }
    );
  } else {
    for (let i = 0; i < divisions; i++) {
      const value = step + step * i;
      ticks.push({
        value,
        label: formatNumber(value)
      });
    }
  }
  return { ticks, max: ticks[ticks?.length - 1]?.value };
}

function formatNumber(num) {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'm';
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + 'k';
  } else {
    return num.toString();
  }
}

function ViolatorElement({
  isRtl,
  department_name_ar,
  department_name_en,
  max,
  intl,
  ...props
}) {
  const withToolTip = (ele, placement) => (
    <Tooltip
      getPopupContainer={(triggerNode) => triggerNode.parentNode}
      placement={placement || isRtl ? "topLeft": "topRight"}
      title={(
        <Row>
          <Col>
            <Text style={{ lineHeight: "14px" }} size="sm" color="var(--colorTextSolid)" strong>
              {isRtl ? department_name_ar : department_name_en}
            </Text>
          </Col>
          <Col>
            <Text size="sm" color="var(--colorTextSolid)">
              {intl?.formatMessage({ id: "Visa Violators" })}:&nbsp;
            </Text>
            <Text size="sm" color="var(--colorTextSolid)" strong>
              {formatNumberUtil(props?.visa_violations) || '-'}
            </Text>
          </Col>
          <Col>
            <Text size="sm" color="var(--colorTextSolid)">
              {intl?.formatMessage({ id: "Residency Violators" })}:&nbsp;
            </Text>
            <Text size="sm" color="var(--colorTextSolid)" strong>
              {formatNumberUtil(props?.residency_violations) || '-'}
            </Text>
          </Col>
          <Col>
            <Text size="sm" color="var(--colorTextSolid)">
              {intl?.formatMessage({ id: "Total Violators" })}:&nbsp;
            </Text>
            <Text size="sm" color="var(--colorTextSolid)" strong>
              {formatNumberUtil(props?.residency_violations + props?.visa_violations) || '-'}
            </Text>
          </Col>
        </Row>
      )}
    >
      {ele}
    </Tooltip>
  )
  return (
    <Row>
      <Col>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: "4px",
            position: "relative"
          }}
        >
          {
            withToolTip(
              <div
                style={{
                  position: "absolute",
                  top: 22,
                  minHeight: "20px",
                  bottom: 0,
                  minWidth: "20px",
                  left: isRtl ? "auto": 0,
                  right: isRtl ? 0: "auto",
                }}
              />,
              isRtl ? "topRight": "topLeft"
            )
          }
          <div>
            <Text size="sm">
              {isRtl ? department_name_ar : department_name_en}
            </Text>
          </div>
          {
            withToolTip(
              <div
                style={{
                  height: "10px",
                  backgroundColor: "#D1B580",
                  borderBottomRightRadius: "4px",
                  borderTopRightRadius: "4px",
                  width: `${(props?.visa_violations / max) * 100}%`
                }}
              />
            )
          }
          {
            withToolTip(
              <div
                style={{
                  height: "10px",
                  backgroundColor: "#9B752D",
                  borderBottomRightRadius: "4px",
                  borderTopRightRadius: "4px",
                  width: `${(props?.residency_violations / max) * 100}%`
                }}
              />
            )
          }

        </div>
      </Col>
    </Row>
  )
}

ViolatorElement.propTypes = {
  isRtl: PropTypes.any,
  department_name_ar: PropTypes.any,
  department_name_en: PropTypes.any,
  max: PropTypes.any,
  intl: PropTypes.any,
  residency_violations: PropTypes.any,
  visa_violations: PropTypes.any,
  props: PropTypes.any
}


function ViolatorsByDepartment({
  icon, title = "",
  filter, dateRange, isPreview
}) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const patchedGetResponsiveFn = patchedGetResponsive(getResponsive, isPreview, false);
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getVisaViolationDepartment });

  useEffect(() => {
    invokeApi({ filter: { ...filter, ...dateRange, language: isRtl ? "ar" : "en" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);


  const isLoading = ["pending", "idle"]?.includes(apiStatus);

  const departments = value?.data?.departments;

  const max = useMemo(() => {
    let _max = 0
    departments?.forEach((d) => {
      if (d?.residency_violations > _max) {
        _max = d?.residency_violations;
      }

      if (d?.visa_violations > _max) {
        _max = d?.visa_violations;
      }
    })
    return _max + (Math?.ceil(_max * 0.1));
  }, [departments])

  const { ticks, max: newMax } = getAxisTicks(0, max, patchedGetResponsiveFn({ default: 6, mobile: 5 }));

  return (
    <DashboardCard
      cardBodyHeight={"calc(100% - 67px)"}
      cardBodyPadding={!isLoading ? "0px" : "var(--paddingPx)"}
      bodyBackgroundColor="transparent"
      title={title}
      icon={icon}
      style={{
        height: "100%"
      }}
      isEmpty={!departments?.length}
      loading={isLoading}
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
      <Row isFullHeight style={{ position: "relative" }}>
        <Row style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "calc(100% - 52px)" }} justify="space-between">
          {
            ticks?.map((v) => (
              <Col style={{ height: "100%" }} textAlign={v?.value == 0 ? resolveTernary(isRtl, "right", "left") : "center"} key={v?.value} flex="0 0 50px">
                <div style={{ display: "flex", height: "100%", justifyContent: v?.value == 0 ? resolveTernary(isRtl, "right", "left") : "center" }}>
                  <div style={{ height: "100%", borderLeft: `1px dashed var(--colorBorderSecondary)` }} />
                </div>
              </Col>
            ))
          }
        </Row>

        <Col>
          <Row
            style={{
              height: "calc(100% - 70px)"
            }}
          >
            <Col>
              <Scrollbars>
                <Row
                  gutter={[0, 14]}
                >
                  {
                    departments?.map((v) => (
                      <Col key={v?.department_name_en}>
                        <ViolatorElement {...v} max={newMax} isRtl={isRtl} intl={intl} />
                      </Col>
                    ))
                  }
                </Row>
              </Scrollbars>
            </Col>
          </Row>

          <Row
            style={{
              height: "70px"
            }}
          >
            <Col
              paddingBlock="12px 0px"
            >
              <div
                style={{
                  borderTop: `1px solid var(--colorBorderSecondary)`,
                  width: "100%"
                }}
              />
              <Row wrap={false} justify="space-between">
                {
                  ticks?.map((v) => (
                    <Col textAlign={v?.value == 0 ? resolveTernary(isRtl, "right", "left") : "center"} key={v?.value} flex="0 0 50px">
                      <div style={{ display: "flex", justifyContent: v?.value === 0 ? resolveTernary(isRtl, "right", "left") : "center" }}>
                        <div style={{ height: "6px", borderLeft: `2px solid var(--colorBorderSecondary)` }} />
                      </div>
                      <Text size="sm">
                        {v?.label}
                      </Text>
                    </Col>
                  ))
                }
              </Row>
              <Row style={{ marginTop: "12px" }} align="middle" justify="center" gutter={18}>
                <Col flex="none">
                  <Row align="middle" gutter={4}>
                    <Col flex="none">
                      <div style={{ width: "12px", minWidth: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#D1B580" }} />
                    </Col>
                    <Col flex="none">
                      <Text size="sm">
                        {intl?.formatMessage({ id: "Visa Violators" })}
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col flex="none">
                  <Row align="middle" gutter={4}>
                    <Col flex="none">
                      <div style={{ width: "12px", minWidth: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#9B752D" }} />
                    </Col>
                    <Col flex="none">
                      <Text size="sm">
                        {intl?.formatMessage({ id: "Residency Violators" })}
                      </Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </ DashboardCard>
  )
}

ViolatorsByDepartment.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
}

export default ViolatorsByDepartment;
