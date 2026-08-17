import { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { getAgeDistributionStatistics } from "@/services/generalIndicatorsService";
import { Dropdown, Button, PhosphorIcons, Row, Col, Text, Input } from "re-usable-design-components";
import { useBaseHook } from "../utils/hookUtils";
import useResponsive from "@/hooks/useResponsive";

const { Funnel, CheckCircle } = PhosphorIcons;

function useAgeDistribution({ filters }) {
  const [isDropOpen, setIsDropOpen] = useState(false);
  const [finalFilters, setFinalFilters] = useState(null);
  const [values, setValues] = useState({ minAge: undefined, maxAge: undefined });
  const [appliedValues, setAppliedValues] = useState(null);
  
  const intl = useIntl();

  const getResponsive = useResponsive();

  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getAgeDistributionStatistics,
    filters: finalFilters,
    dataPath: 'populationAgeDistribution',
    chartNameId: 'Age Group'
  });

  useEffect(() => {
    if (![undefined, null]?.includes(appliedValues?.minAge) && ![undefined, null]?.includes(appliedValues?.maxAge)) {
      setAppliedValues({ minAge: undefined, maxAge: undefined })
      setValues({ minAge: undefined, maxAge: undefined })
    } else {
      setFinalFilters({ ...filters })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (appliedValues) {
      setFinalFilters({ ...filters, ...appliedValues })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedValues]);

  const formattedData = useMemo(() => {
    return (value?.data?.populationAgeDistribution || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.population);
      acc?.categories?.push(v?.ageGroup);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.populationAgeDistribution]);

  const dropContent = (
    <Row
      style={{
        maxWidth: getResponsive({ default: "265px", mobile: "100%" }),
        minWidth: getResponsive({ default: "265px", mobile: "100%" })
      }}
    >
      <Col
        paddingInline={getResponsive({ default: "0px" })}
        paddingBlock={getResponsive({ default: "var(--paddingPx)" })}
        style={
          getResponsive({
            default: {
              borderRadius: "8px",
              backgroundColor: "var(--colorBgElevated)",
              boxShadow: getResponsive({ default: "var(--boxShadowSecondary)" }),
            }
          })
        }
      >

        <Row gutter={[0, 8]}>
          {
            getResponsive({ default: "true" }) === "true" && (
              <Col
                paddingInline={getResponsive({ default: "var(--paddingPx)" })}
              >
                <Text strong>{intl?.formatMessage({ id: "Filters Age Group" })}</Text>
              </Col>
            )
          }
          <Col>
            <Row gutter={[0, 16]}>
              <Col
                paddingInline={getResponsive({ default: "var(--paddingPx)" })}
              >
                <Row gutter={[12]}>
                  <Col span={12}>
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>
                          {intl?.formatMessage({ id: "Min Age" })}
                        </Text>
                      </Col>
                      <Col>
                        <Text>
                          <Input
                            type="number"
                            placeholder={intl?.formatMessage({ id: "Min Age" })}
                            value={values?.minAge}
                            onChange={(e) => {
                              const input = e.target.value;
                              if (/^\d*$/.test(input)) {
                                if (Number(input) < 100) {
                                  setValues({ minAge: input, maxAge: undefined })
                                }
                              }
                            }}
                          />
                        </Text>
                      </Col>
                    </Row>
                  </Col>

                  <Col span={12}>
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>
                          {intl?.formatMessage({ id: "Max Age" })}
                        </Text>
                      </Col>
                      <Col>
                        <Text>
                          <Input
                            type="number"
                            value={values?.maxAge}
                            disabled={!values?.minAge}
                            placeholder={intl?.formatMessage({ id: "Max Age" })}
                            onChange={(e) => {
                              const input = e.target.value;
                              if (/^\d*$/.test(input)) {
                                setValues(v => {
                                  if (Number(input) < 100) {
                                    return ({ ...v, maxAge: input })
                                  }
                                  return v;
                                })
                              }
                            }}
                          />
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
            {
              getResponsive({ default: "true", tablet: "true" }) === "true" && (
                <Row>
                  <Col
                    paddingInline={getResponsive({ default: "var(--paddingPx)" })}
                    paddingBlock={"var(--paddingPx) 0px"}
                  >
                    <Row gutter={[12]}>
                      <Col
                        span={12}
                      >
                        <Button
                          disabled={[undefined, null]?.includes(values?.minAge) || [undefined, null]?.includes(values?.maxAge) || Number(values?.minAge) > Number(values?.maxAge) || (values?.minAge === appliedValues?.minAge && values?.maxAge === appliedValues?.maxAge)}
                          type="primary"
                          size="default"
                          block
                          icon={<CheckCircle />}
                          onClick={() => {
                            // setIsApplyDisabled(true)
                            setTimeout(() => {
                              setIsDropOpen(false)
                              setAppliedValues(values);
                            }, 200)
                          }}
                        >
                          {intl?.formatMessage({ id: getResponsive({ default: "Apply" }) })}
                        </Button>
                      </Col>
                      <Col
                        span={12}
                      >
                        <Button
                          // disabled={!showAppliedFilters}
                          type="default"
                          size="default"
                          block
                          danger
                          onClick={() => {
                            // setIsApplyDisabled(true)
                            setTimeout(() => {
                              setValues({ minAge: undefined, maxAge: undefined })
                              setAppliedValues({ minAge: undefined, maxAge: undefined })
                              setIsDropOpen(false)
                              
                            }, 200)
                          }}
                        >
                          {intl?.formatMessage({ id: getResponsive({ default: "Reset" }) })}
                        </Button>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            }
          </Col>
        </Row>
      </Col>
    </Row>
  )
  const actionEle = (
    <Dropdown
      style={{
        backgroundColor: "var(--colorBgContainer)"
      }}
      onOpenChange={(v) => {
        setIsDropOpen(v)
      }}
      open={isDropOpen}
      {
        ...getResponsive({ default: "false", midTablet: "true" }) === "true" && {
          trigger: ["click"],
        }
      }
      dropdownRender={() => dropContent}
    >
      <Row>
        <Col>
          <Button
            size={"default"}
            type="default"
            style={{
              ...getResponsive({ default: "false", tablet: "true" }) === "true" && {
                paddingInline: "var(--paddingXSPx)"
              }

            }}
            {
              ...getResponsive({ default: "false", midTablet: "true" }) === "true" && {
                onClick: () => {
                  setIsDropOpen((v) => !v)
                }
              }
            }
          >
            <Row align="middle" gutter={8}>
              {
                getResponsive({ default: "true", mobile: "false" }) === "true" &&
                <Col flex="none">
                  <Text color="currentColor">{intl.formatMessage({ id: getResponsive({ default: "Filters", tablet: "Filters" }) })}</Text>
                </Col>
              }
              <Col flex="none">
                <Funnel color="currentColor" weight="bold" size={16} />
              </Col>
            </Row>
          </Button>
        </Col>
      </Row>
    </Dropdown>
  )
  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisValue: value?.data?.currentRateChange,
    actionEle: false && !isLoading && !isEmpty ? actionEle : null,
  };
}

export default useAgeDistribution;
