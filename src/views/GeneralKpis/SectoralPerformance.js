import PropTypes from "prop-types"
import {
  Row, Col, theme, Title,
  Tooltip, Select, Drawer, Dropdown, Scrollbars, Button, PhosphorIcons,
  Text, Slider, RadioGroup, Card, Modal, DateRangePicker
} from "re-usable-design-components"
import dayjs from "dayjs";
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import { useIntl } from "react-intl";
import React, { useState, useEffect, useMemo, useContext, memo, useCallback, useRef } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, cleanObject, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";
import Print, { usePrint } from "@/components/Print";
import AppliedFilters from "@/components/AppliedFilters";
import _ from "lodash";
import PageSectionsScrollWrap from '@/components/PageSectionsScrollWrap';
import PrintModalWrap from "@/components/Print/PrintModalWrap";
import withHook from "@/hocs/withHook";
import Segmented from "@/components/Segmented";
import useLaborTurnover from "./sectoralPerformanceHooks/useLaborTurnover";
import useExpatriateWorkers from "./sectoralPerformanceHooks/useExpatriateWorkers";
import useWomensWorkforce from "./sectoralPerformanceHooks/useWomensWorkforce";
import useHighlySkilledWorkers from "./sectoralPerformanceHooks/useHighlySkilledWorkers";
import useNewEmploymentRate from "./sectoralPerformanceHooks/useNewEmploymentRate";
import useEmploymentDistribution from "./sectoralPerformanceHooks/useEmploymentDistribution";
import MenStars from "@/svgr/MenStars";
import Table from "./widgets/Table";
import GlobleCircleHome from "@/svgr/GlobleCircleHome";
import GirlLaptop from "@/svgr/GirlLaptop";
import BagWithCheck from "@/svgr/BagWithCheck";
import HandOnUsers from "@/svgr/HandOnUsers";
import OrganisationalHierarchy from "@/svgr/OrganisationalHierarchy";
import MainContentWrapDashboards from "@/components/MainContentWrapDashboards";


dayjs.extend(quarterOfYear);

const { ChartPie } = PhosphorIcons;


const LabourTurnover = withHook({ Component: Table, useHook: useLaborTurnover })
const ExpatriateWorkers = withHook({ Component: Table, useHook: useExpatriateWorkers })
const WomensWorkforce = withHook({ Component: Table, useHook: useWomensWorkforce })
const HighlySkilledWorkers = withHook({ Component: Table, useHook: useHighlySkilledWorkers })
const NewEmploymentRate = withHook({ Component: Table, useHook: useNewEmploymentRate })
const EmploymentDistribution = withHook({ Component: Table, useHook: useEmploymentDistribution })

const { Funnel, CheckCircle, ArrowSquareOut, Info, CalendarBlank, CalendarCheck } = PhosphorIcons;
const { useToken } = theme;
const MemoModal = memo(Modal)

function getLabel(data, value, isRtl) {
  if (Array.isArray(value)) {
    const names = (value || [])?.map((val) => data?.find((v) => v?.value === val)?.[isRtl ? "ar" : "en"]);
    return (
      <Tooltip
        title={names?.length > 4 ? names?.join(", ") : null}
      >
        {`${names?.slice(0, 4)?.join(", ")} ${names?.length - 4 > 0 ? ', +' + (names?.length - 4) : ''}`}
      </Tooltip>
    )
  }
  return data?.find((v) => v?.value === value)?.[isRtl ? "ar" : "en"];
}

function RadioGroupWrap({ value, onChange, ...props }) {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (value !== state) {
      setState(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <RadioGroup
      value={state}
      onChange={(e) => {
        setState(e?.target?.value)
        setTimeout(() => {
          onChange(e)
        }, 100)
      }}
      {...props}
    />
  )
}

RadioGroupWrap.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.any
}

const MemoisedRadioGroup = memo(RadioGroupWrap, (prev, next) => {
  return _.isEqual(prev, next)
})

function SliderWrap({ value, onChange, ...props }) {
  const [ageRange, setAgeRange] = useState([0, 65]);

  useEffect(() => {
    if (!value) {
      setAgeRange([0, 65]);
    }
  }, [value]);

  const debouncedOnChange = useMemo(() => {
    return _.debounce(onChange, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Slider
      value={ageRange}
      onChange={(val) => {
        if (val[1] - val[0] >= 1) {
          setAgeRange(val);
          debouncedOnChange(val);
        }
      }}
      tooltipVisible={false} // Hides the tooltip
      {...props}
    />
  );
}

SliderWrap.propTypes = {
  onChange: PropTypes.any,
  value: PropTypes.any
}

function getDropdownContent(dropContent) {
  return () => (
    dropContent
  )
}

function FiltersWrap({
  setApplyAt, showAppliedFilters,
  transformedEmirates, intl, isRtl, filters,
  transformedNationalities, filtersData, setFilters, getResponsive,
  setIsPreviewOpen,
  setIsLoadingExport,
}) {
  const nationalityOptions = useMemo(() => {
    return filtersData?.nationalities?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))?.sort((a, b) => a?.label?.localeCompare(b?.label))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedNationalities]);
  const [isDrawer, setIsDrawer] = useState(false)
  const [isDropOpen, setIsDropOpen] = useState(false)
  const [isApplyDisabled, setIsApplyDisabled] = useState(false)
  const [localFilters, setLocalFilters] = useState({})


  useEffect(() => {
    if (!_.isEqual(filters, localFilters)) {
      setLocalFilters(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  useEffect(() => {
    if (isApplyDisabled) {
      setIsApplyDisabled(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localFilters])

  const isFiltersLoading = false

  const isFilterDisabled = _.isEqual(filters, localFilters);

  const applyEle = (
    <Button
      disabled={isFilterDisabled || isApplyDisabled}
      type="primary"
      icon={<CheckCircle />}
      size="default"
      onClick={() => {
        setIsApplyDisabled(true)
        setTimeout(() => {
          setApplyAt(new Date().getTime())
          setIsDropOpen(false)
          setFilters(localFilters);
          if (getResponsive({ mobile: "true" }) === "true") {
            setIsDrawer(false)
          }
        }, 200)
      }}
    >
      {intl?.formatMessage({ id: getResponsive({ default: "Apply", mobile: "Apply" }) })}
    </Button>
  )

  const segmentedEle = (
    <Segmented
      isSelectedBold
      className={(getResponsive({ default: "true", tablet: "false" }) === "true") ? "ant-segmented-default" : ""}
      block={getResponsive({ default: false, tablet: true })}
      size={getResponsive({ default: "default", tablet: "large" })}
      value={localFilters?.period || "year"}
      style={{
        maxHeight: "40px"
      }}
      onChange={(e) => {
        setLocalFilters(v => ({
          ...v,
          date_range: undefined,
          date_val: undefined,
          period: e
        }))
      }}
      options={[
        {
          icon: resolveTernary((getResponsive({ default: "true", tablet: "true" }) === "true"), (!localFilters?.period || localFilters?.period === "year") ? <CalendarBlank style={{ marginBottom: '2px' }} size={16} weight="bold" /> : <CalendarBlank style={{ marginBottom: '2px' }} size={16} />, null),
          label: intl?.formatMessage({ id: "Yearly" }),
          value: "year"
        },
        {
          icon: resolveTernary((getResponsive({ default: "true", tablet: "true" }) === "true"), localFilters?.period === "quarter" ? <CalendarBlank style={{ marginBottom: '2px' }} size={16} weight="bold" /> : <CalendarBlank style={{ marginBottom: '2px' }} size={16} />, null),
          label: intl?.formatMessage({ id: "Quarterly" }),
          value: "quarter"
        },
      ]}
    />
  );

  const dateRangeEle = ({ size = "default" }) => (
    <DateRangePicker
      dropdownClassName="mobile-calendar-dropdown"
      placement="bottomLeft"
      picker={localFilters?.period || "year"}
      getPopupContainer={() => document.body}
      value={localFilters?.date_val}
      disabledDate={disableFutureDates}
      size={size}
      block={getResponsive({ default: false, tablet: true })}
      {
        ...(localFilters?.period || "year") === "year" && ({
          placeholder: [
            intl.formatMessage({ id: "Start year" }),
            intl.formatMessage({ id: "End year" })
          ]
        })
      }
      onChange={(val, val1) => {
        setLocalFilters((v) => ({
          ...v,
          date_range: val1?.[0] ? val1 : null,
          date_val: val,
        }))
      }}
    />
  );

  const genderEle = (
    <MemoisedRadioGroup
      value={localFilters?.gender}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            gender: e?.target?.value,
          }))
        }, 100)
      }}
      style={
        getResponsive({
          default: {},
        })
      }
      options={filtersData?.genders?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))}
    />
  )

  const residencyEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Residency Type" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="large"
      value={localFilters?.residencyType}
      allowClear
      showSearch
      filterOption={(input, option) => {
        return option?.label
          ?.toLowerCase()
          ?.includes(input?.toLowerCase());
      }}
      popupMatchSelectWidth={false}
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({ default: "100%" })
      }}
      loading={isFiltersLoading}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            residencyType: e,
          }))
        }, 100)
      }}
      options={filtersData?.residencyTypes?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))}
    />
  )

  const nationalityEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Country" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="default"
      value={localFilters?.nationalityCodes}
      allowClear
      mode="multiple"
      maxTagCount={4}
      showSearch
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({ default: "100%" })
      }}
      loading={isFiltersLoading}
      filterOption={(input, option) => {
        return option?.label
          ?.toLowerCase()
          ?.includes(input?.toLowerCase());
      }}
      popupMatchSelectWidth={true}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            nationalityCodes: e,
          }))
        }, 100)
      }}
      options={nationalityOptions}
    />
  )
  const disableFutureDates = (current) => {
    // Disable dates greater than today
    return current && current > dayjs().endOf('day');
  };

  const emirateOptions = useMemo(() => {
    return filtersData?.emiratesTypes?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))?.sort((a, b) => a?.label?.localeCompare(b?.label))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transformedEmirates])

  const emirateEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Emirate" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="default"
      mode="multiple"
      maxTagCount={4}
      popupMatchSelectWidth={true}
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({ default: "100%", })
      }}
      value={localFilters?.emirates}
      allowClear
      showSearch
      filterOption={(input, option) => {
        return option?.label
          ?.toLowerCase()
          ?.includes(input?.toLowerCase());
      }}
      loading={isFiltersLoading}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            emirates: e,
          }))
        }, 100)
      }}
      options={emirateOptions}
    />
  )

  const filterItems = (getResponsive({ default: "true", tablet: "false" }) === "true")
    ? [
      {
        label: intl?.formatMessage({ id: "Residency Type" }),
        comp: residencyEle
      },
      {
        label: intl?.formatMessage({ id: "Country" }),
        comp: nationalityEle
      },
      {
        label: intl?.formatMessage({ id: "Emirate" }),
        comp: emirateEle
      }
    ]
    : [
      {
        comp: segmentedEle
      },
      {
        label: intl?.formatMessage({ id: "Residency Type" }),
        comp: residencyEle
      },
      {
        label: intl?.formatMessage({ id: "Select Date" }),
        comp: dateRangeEle({ size: "large" })
      },
      {
        label: intl?.formatMessage({ id: "Emirate" }),
        comp: emirateEle
      },
      {
        label: intl?.formatMessage({ id: "Country" }),
        comp: nationalityEle
      },
    ]

  const Wrap = (getResponsive({ default: "true", mobile: "false" }) === "true") ? Scrollbars : React.Fragment;

  const dropContent = (
    <Row
      style={{
        maxWidth: getResponsive({ default: "350px", mobile: "100%" }),
        minWidth: getResponsive({ default: "350px", mobile: "100%" })
      }}
    >
      <Col
        paddingInline={getResponsive({ default: "0px", mobile: "0px" })}
        paddingBlock={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
        style={
          getResponsive({
            default: {
              borderRadius: "8px",
              backgroundColor: "var(--colorBgElevated)",
              boxShadow: getResponsive({ default: "var(--boxShadowSecondary)" }),
            },
            mobile: {}
          })
        }
      >

        <Row gutter={[0, 8]}>
          {
            getResponsive({ default: "true", mobile: "false" }) === "true" && (
              <Col
                paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
              >
                <Text strong>{intl?.formatMessage({ id: "Filter by" })}</Text>
              </Col>
            )
          }
          <Col>
            <Wrap
              style={{
                height: "300px",
              }}
            >
              <Row gutter={[0, 16]}>
                {
                  filterItems?.map((val) => (
                    <Col
                      key={val?.label}
                      paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                    >
                      <Row gutter={[0, 8]}>
                        <Col>
                          <Text>
                            {val?.label}
                          </Text>
                        </Col>
                        <Col>
                          {val?.comp}
                        </Col>
                      </Row>
                    </Col>
                  ))
                }
                {
                  !!filtersData?.genders?.length &&
                  <Col
                    paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                  >
                    <Row gutter={[0, 8]}>
                      <Col>
                        <Text>
                          {intl?.formatMessage({ id: "Gender" })}
                        </Text>
                      </Col>
                      <Col>
                        {genderEle}
                      </Col>
                    </Row>
                  </Col>
                }
              </Row>
            </Wrap>
            {
              getResponsive({ default: "false", tablet: "true" }) === "true" && (
                <Row>
                  <Col
                    paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                    paddingBlock={"var(--paddingPx) 0px"}
                  >
                    <Row gutter={[12]}>
                      <Col
                        flex="none"
                      >
                        {applyEle}
                      </Col>
                      <Col
                        flex="none"
                      >
                        <Button
                          disabled={!showAppliedFilters}
                          type="default"
                          size="default"
                          danger
                          onClick={() => {
                            setIsApplyDisabled(true)
                            setTimeout(() => {
                              setIsDropOpen(false)
                              if (getResponsive({ default: "true" }) === "true") {
                                setLocalFilters({});
                                setFilters({});
                                setIsDrawer(false)
                              }
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
  return (
    <>
      <Col flex="none">
        <Row align="middle" gutter={12}>
          {getResponsive({
            default: "true",
            tablet: "false",
          }) === "true" && (
            <>
              <Col flex="none">
                {segmentedEle}
              </Col>

              <Col flex="none">
                {dateRangeEle({ size: "default" })}
              </Col>
            </>
          )}
          <Col flex="none">
            {
              getResponsive({ mobile: "true", default: "false" }) === "true"
                ? (
                  <Row>
                    <Col>
                      <Button
                        size={"default"}
                        type="default"
                        onClick={() => {
                          setIsDrawer((v) => !v)
                        }}
                        style={{
                          ...(getResponsive({
                            default: "false",
                            tablet: "true",
                          }) === "true" && {
                            paddingInline: "var(--paddingXSPx)",
                          }),
                        }}
                      >
                        <Row align="middle" gutter={8}>
                          <Col flex="none">
                            <Funnel
                              color="currentColor"
                              weight="bold"
                              size={16}
                            />
                          </Col>
                        </Row>
                      </Button>
                    </Col>
                  </Row>
                )
                : (
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
                    dropdownRender={getDropdownContent(dropContent)}
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
            }
          </Col>
          {
            getResponsive({ default: "true", tablet: "false" }) === "true" &&
            <Col
              flex="none"
            >
              {applyEle}
            </Col>
          }
          <Col flex="none">
            <Button
              size={"default"}
              type="default"
              icon={<ArrowSquareOut size={16} weight="bold" />}
              onClick={() => {
                setIsLoadingExport(true)
                setIsPreviewOpen(true)
              }}
              style={{
                ...(getResponsive({
                  default: "false",
                  tablet: "true",
                }) === "true" && {
                  paddingInline: "var(--paddingXSPx)",
                }),
              }}
            >
              <Row align="middle" gutter={8}>
                {
                  getResponsive({ default: "true", mobile: "false" }) === "true" &&
                  <Col flex="none">
                    <Text color="currentColor">{intl.formatMessage({ id: getResponsive({ default: "Export" }) })}</Text>
                  </Col>
                }
              </Row>
            </Button>
          </Col>
        </Row>
      </Col>
      <Drawer
        getPopupContainer={(trigger) => trigger.parentNode}
        open={isDrawer}
        onClose={() => {
          setIsDrawer(false)
        }}
        title={intl.formatMessage({ id: "Filter By" })}
        width={"100%"}
      >
        {dropContent}
      </Drawer>
    </>
  )
}

FiltersWrap.propTypes = {
  filters: PropTypes.any,
  setApplyAt: PropTypes.any,
  filtersData: PropTypes.any,
  getResponsive: PropTypes.func,
  intl: PropTypes.any,
  isRtl: PropTypes.any,
  setFilters: PropTypes.func,
  showAppliedFilters: PropTypes.any,
  transformedEmirates: PropTypes.any,
  transformedNationalities: PropTypes.any,
  setIsPreviewOpen: PropTypes.any,
  setIsLoadingExport: PropTypes.any,
}
function DemographicKpis({ nationalitiesConfigValueObj, residencyTypeValues, emiratesConfigValue }) {
  const themeVariables = useToken();

  const [localeStore] = useContext(LocaleContext);
  const [filters, setFilters] = useState({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [applyAt, setApplyAt] = useState(true)
  const [isLoadingExport, setIsLoadingExport] = useState(true);
  const intl = useIntl();
  const titleText = intl.formatMessage({ id: "Sectoral Performance" });
  const {
    isCreatingPdf,
    printDocument,
    printDocumentCanvas,
    handleGeneratePdf
  } = usePrint({ name: titleText });

  const pageRef = useRef({});

  const patchedGetResponsive = (config) => {
    if (isPreviewOpen && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };
  useEffect(() => {
    if (applyAt) {
      setTimeout(() => {
        setApplyAt(false);
      }, 200);
    }
  }, [applyAt]);

  const getResponsive = useResponsive();

  const cleanedObject = cleanObject(filters);

  const isRtl = checkRtl(localeStore);

  const filtersData = {}
  filtersData.genders = [
    { value: 'Male', en: 'Male', ar: 'ذكر' },
    { value: 'Female', en: 'Female', ar: 'أنثى' },  ];

  const transformedNationalities = useMemo(() => {
    if (Object?.keys(nationalitiesConfigValueObj)?.length) {
      return Object?.keys(nationalitiesConfigValueObj)?.map((key) => {
        const val = nationalitiesConfigValueObj[key];
        return {
          value: val?.country_alpha3,
          en: val?.country_en,
          ar: val?.country_ar,
        }
      })
    }
    return []
  }, [nationalitiesConfigValueObj]);

  const transformedResidentsType = useMemo(() => {
    if (residencyTypeValues?.data?.length) {
      return residencyTypeValues?.data?.map((val) => {
        return {
          value: val?.residency_type_code,
          en: val?.residency_type_en,
          ar: val?.residency_type_ar,
        }
      })
    }
    return []
  }, [residencyTypeValues]);

  const transformedEmirates = useMemo(() => {
    if (emiratesConfigValue?.data?.length) {
      return emiratesConfigValue?.data?.map((val) => {
        return {
          value: val?.emirate_code,
          en: val?.emirate_name_en,
          ar: val?.emirate_name_ar,
        }
      })
    }
    return []
  }, [emiratesConfigValue]);

  filtersData.nationalities = transformedNationalities
  filtersData.emiratesTypes = transformedEmirates;
  filtersData.residencyTypes = transformedResidentsType;
  filtersData.emiratesConfigValue = emiratesConfigValue?.data;
  filtersData.genders = [
    { value: 'Male', en: 'Male', ar: 'ذكر' },
    { value: 'Female', en: 'Female', ar: 'أنثى' },  ]

  const showAppliedFilters = !_.isEmpty(cleanedObject)

  const firstRowEle = () => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={patchedGetResponsive({ default: 8, tablet: 12, midTablet: 24 })}>
        <LabourTurnover
          icon={<OrganisationalHierarchy />}
          isRtl={isRtl}
          filters={filters}
          title={intl?.formatMessage({ id: "Sectoral Labor Turnover Rate" })}
          tooltipKey={intl?.formatMessage({ id: "Sectoral_Labor_Turnover_Rate_Tooltip" })}
          pageRef={pageRef}
          isPreviewOpen={isPreviewOpen}
        />
      </Col>
      <Col span={patchedGetResponsive({ default: 8, tablet: 12, midTablet: 24 })}>
        <ExpatriateWorkers
          icon={<GlobleCircleHome />}
          isRtl={isRtl}
          filters={filters}
          title={intl?.formatMessage({ id: "Expatriate Workers by Sector" })}
          tooltipKey={intl?.formatMessage({ id: "Expatriate_Workers_by_Sector_Tooltip" })}
          pageRef={pageRef}
          isPreviewOpen={isPreviewOpen}
        />
      </Col>
      {
        patchedGetResponsive({ default: "true", tablet: "false" }) === "true" &&
        skilledWorkerEle
      }
    </Row>
  )

  const secondRowEle = () => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      {
        patchedGetResponsive({ default: "false", tablet: "true" }) === "true" &&
        skilledWorkerEle
      }
      <Col span={patchedGetResponsive({ default: 8, tablet: 12, midTablet: 24 })}>
        <HighlySkilledWorkers
          icon={<MenStars />}
          isRtl={isRtl}
          filters={filters}
          title={intl?.formatMessage({ id: "Highly Skilled Workers by Sector" })}
          tooltipKey={intl?.formatMessage({ id: "Highly_Skilled_Workers_by_Sector_Tooltip" })}
          pageRef={pageRef}
          isPreviewOpen={isPreviewOpen}
        />
      </Col>
      {
        patchedGetResponsive({ default: "true", tablet: "false" }) === "true" &&
        womenParticipationEle
      }
      {
        patchedGetResponsive({ default: "true", tablet: "false" }) === "true" && (
          economicSectorEle
        )
      }
    </Row>
  )

  const thirdRowEle = () => (
    patchedGetResponsive({ default: "false", tablet: "true" }) === "true" && (
      <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
        {womenParticipationEle}
        {economicSectorEle}
      </Row>
    )
  )

  const skilledWorkerEle = (
    <Col span={patchedGetResponsive({ default: 8, tablet: 12, midTablet: 24 })}>
      <WomensWorkforce
        icon={<GirlLaptop />}
        isRtl={isRtl}
        filters={filters}
        title={intl?.formatMessage({ id: "Women Participation by Sector" })}
        tooltipKey={intl?.formatMessage({ id: "Women_Participation_by_Sector_Tooltip" })}
        pageRef={pageRef}
        isPreviewOpen={isPreviewOpen}
      />
    </Col>
  )

  const womenParticipationEle = (
    <Col span={patchedGetResponsive({ default: 8, tablet: 12, midTablet: 24 })}>
      <NewEmploymentRate
        icon={<BagWithCheck />}
        isRtl={isRtl}
        filters={filters}
        title={intl?.formatMessage({ id: "New Employment Rate by Sector" })}
        tooltipKey={intl?.formatMessage({ id: "New_Employment_Rate_by_Sector_Tooltip" })}
        pageRef={pageRef}
        isPreviewOpen={isPreviewOpen}
      />
    </Col>
  )

  const economicSectorEle = (
    <Col span={patchedGetResponsive({ default: 8, tablet: 12, midTablet: 24 })}>
      <EmploymentDistribution
        icon={<HandOnUsers />}
        isRtl={isRtl}
        filters={filters}
        tooltipKey={intl?.formatMessage({ id: "Employment_Rate_by_Economic_Sector_Tooltip" })}
        title={intl?.formatMessage({ id: "Employment Rate by Economic Sector" })}
        pageRef={pageRef}
        isPreviewOpen={isPreviewOpen}
      />
    </Col>
  )

  const scrollableElements = (
    <>
      <Col>
        {firstRowEle()}
      </Col>

      <Col>
        {secondRowEle()}
      </Col>

      <Col>
        {thirdRowEle()}
      </Col>
    </>
  )

  let dateRange;
  if (filters?.date_range) {
    dateRange = {};
    dateRange.start = filters?.date_range?.[0];
    dateRange.end = filters?.date_range?.[1];
  }

  const titleEle = (
    <Row gutter={8} align="middle">
      <Col flex="none" style={{ color: "var(--colorText)" }}>
        <ChartPie size={getResponsive({ default: "32px", tablet: "24px" })} />
      </Col>
      <Col flex="none">

        <Row
          wrap={false}
          align={window?.innerWidth < 420 ? "start" : "middle"}
          gutter={4}
        >
          <Col
            flex="none"
            style={{
              ...window?.innerWidth < 420 && {
                width: "198px"
              }
            }}
          >
            <Title level={getResponsive({ default: 4, mobile: 5 })}>
              <span>
                {intl?.formatMessage({ id: "Sectoral Performance" })}
              </span>
              <Tooltip
                title={intl?.formatMessage({ id: "Sectoral_Performance_Title_Tooltip" })}
                placement="bottom"
              >
                <span style={{ marginInline: "4px" }}>
                  <Info color="var(--colorIcon)" size={14} weight="bold" />
                </span>
              </Tooltip>
            </Title>
          </Col>
        </Row>
      </Col>
    </Row>
  )

  const appliedFiltersEle = showAppliedFilters && (
    <Col>
      <AppliedFilters
        data={[
          ...(cleanedObject?.period
            ? [
              {
                label: intl?.formatMessage({ id: "Period" }),
                value: intl?.formatMessage({ id: cleanedObject?.period === "quarter" ? "Quarterly" : "Yearly" }),
                key: "period",
                closable: true,
              },
            ]
            : []),
          ...(dateRange?.start
            ? [
              {
                label: intl?.formatMessage({ id: "Date Range" }),
                value: `${dateRange?.start} - ${dateRange?.end}`,
                key: "date_range",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject?.nationalityCodes
            ? [
              {
                label: intl?.formatMessage({ id: "Country" }),
                value: getLabel(filtersData?.nationalities, cleanedObject?.nationalityCodes, isRtl),
                key: "nationalityCodes",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject?.emirates
            ? [
              {
                label: intl?.formatMessage({ id: "Emirate" }),
                value: getLabel(filtersData?.emiratesTypes, cleanedObject?.emirates, isRtl),
                key: "emirates",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject?.residencyType
            ? [
              {
                label: intl?.formatMessage({ id: "Residency Type" }),
                value: getLabel(filtersData?.residencyTypes, cleanedObject?.residencyType, isRtl),
                key: "residencyType",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject.gender
            ? [
              {
                label: intl?.formatMessage({ id: "Gender" }),
                value: getLabel(filtersData?.genders, cleanedObject?.gender, isRtl),
                key: "gender",
                closable: true,
              },
            ]
            : []),
        ]}
        onTagCross={(value) => {
          setFilters((f) => {
            if (value.key === "date_range") {
              delete f?.[value.key]
              delete f?.["date_val"]
            } else if (value.key === "period") {
              delete f?.[value.key]
              delete f?.["date_range"]
              delete f?.["date_val"]
            } else {
              delete f?.[value.key]
            }
            return { ...f }
          })
        }}
        onClear={() => {
          setApplyAt(new Date()?.getTime())
          setFilters({});
        }}
        isPreviewOpen={isPreviewOpen}
      />
    </Col>
  )

  const mainContentEle = (
    <Col
      isFlex
    >

      <Row gutter={[0, getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })]}>
        <Col>
          <Row wrap={false} align="middle" justify="space-between">
            <Col flex="none">
              {titleEle}
            </Col>

            <FiltersWrap
              transformedNationalities={transformedNationalities}
              filters={filters}
              setApplyAt={setApplyAt}
              setFilters={setFilters}
              getResponsive={getResponsive}
              filtersData={filtersData}
              isRtl={isRtl}
              intl={intl}
              transformedEmirates={transformedEmirates}
              showAppliedFilters={showAppliedFilters}
              setIsLoadingExport={setIsLoadingExport}
              setIsPreviewOpen={setIsPreviewOpen}
            />

          </Row>
        </Col>

        {appliedFiltersEle}
      </Row>

      {
        applyAt
          ? (
            <Card
              loading={!!applyAt}
              style={{
                height: "350px"
              }}
            />
          )
          : resolveTernary(
            getResponsive({ default: "true", tablet: "false" }) === "true",
            (
              <PageSectionsScrollWrap isRtl={isRtl} getResponsive={getResponsive} themeVariables={themeVariables}>
                {scrollableElements}
              </PageSectionsScrollWrap>
            ),
            (
              <Row
                style={{
                  marginTop: getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })
                }}
                gutter={[0, getResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM })]}
              >
                {scrollableElements}
              </Row>
            )
          )
      }
    </Col>
  )
  const handleExportLoading = useCallback((v) => {
    setIsLoadingExport(v)
  }, [])

  const printingElements = [
    titleEle,
    ...(showAppliedFilters ? [appliedFiltersEle] : []),
    firstRowEle(),
    secondRowEle()
  ];

  return (
    <Row
      isFullHeight
    >
      <PrintModalWrap
        open={isPreviewOpen}
        isLoadingExport={isLoadingExport}
        isPreviewOpen={isPreviewOpen}
        isCreatingPdf={isCreatingPdf}
        setIsPreviewOpen={setIsPreviewOpen}
        printDocument={printDocument}
        printDocumentCanvas={printDocumentCanvas}
        setIsLoadingExport={setIsLoadingExport}
        handleGeneratePdf={handleGeneratePdf}
      >
        <Print
          printElements={printingElements}
          setIsLoading={handleExportLoading}
        />
      </PrintModalWrap>
      <MainContentWrapDashboards isPreviewOpen={isPreviewOpen}>
        {mainContentEle}
      </MainContentWrapDashboards>
    </Row>
  )
}

DemographicKpis.propTypes = {
  emiratesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  residencyTypeValues: PropTypes.any
}

export default DemographicKpis;
