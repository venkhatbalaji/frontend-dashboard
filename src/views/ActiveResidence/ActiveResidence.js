import PropTypes from "prop-types"
import {
  Row, Col, theme, Title,
  Tooltip, Select, Drawer, Dropdown, Scrollbars, Button, PhosphorIcons,
  Text, Slider, RadioGroup, Card, Modal, Switch
} from "re-usable-design-components"
import ActiveResidenceSvg from '@/svgr/ActiveResidence'
import { useIntl } from "react-intl";
import ResidentsByGender from "./widgets/ResidentsByGender";
import ResidentsByResidencyType from "./widgets/ResidentsByResidencyType";
import ResidentsByAge from "./widgets/ResidentsByAge";
import ResidentsByRegionAndNationality from "./widgets/ResidentsByRegionWrapper"
import ResidentsBySponser from "./widgets/ResidentsBySponser";
import ResidentsByEmirate from "./widgets/ResidensByEmiratesWrapper";
import ResidentsByProfession from "./widgets/ResidentsByProfession";
import React, { useState, useEffect, useMemo, useContext, memo, useCallback, useRef } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, cleanObject, resolveTernary } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";
import Print, { usePrint } from "@/components/Print";
import AppliedFilters from "@/components/AppliedFilters";
import RiskByTypeIcon from "@/svgr/RiskByTypeIcon";
import _ from "lodash";
import PageSectionsScrollWrap from '@/components/PageSectionsScrollWrap';
import PrintModalWrap from "@/components/Print/PrintModalWrap";
import MainContentWrapDashboards from "@/components/MainContentWrapDashboards";
import ViolatorsByEmiratesWrapper from "./widgets/ViolatorsByEmiratesWrapper";
import ViolatorsByGender from "./widgets/ViolatorsByGender";
import ViolatorsByType from "./widgets/ViolatorsByType";
import RisksByType from "./widgets/RisksByType";


const { Funnel, CheckCircle, ArrowSquareOut, Info, IdentificationCard } = PhosphorIcons;
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
          setLocalFilters((l) => {
            setFilters({...l});
            return l;
          })
          if (getResponsive({ mobile: "true" }) === "true") {
            setIsDrawer(false)
          }
        }, 400)
      }}
    >
      {intl?.formatMessage({ id: getResponsive({ default: "Apply", mobile: "Apply" }) })}
    </Button>
  )

  function handleSliderChange(val) {
    setLocalFilters((v) => ({
      ...v,
      age_range: `${val?.[0] == 16 ? 18 : val?.[0]}-${val?.[1] === 65 ? 120 : resolveTernary(val?.[1] == 16, 18, val?.[1])}`,
    }));
  }

  const dashboardCategoryEle = (
    <Switch
      checked={localFilters?.residency_type !== "WITHOUT_GCC"}
      onChange={(e) => {
        if (e) {
          setTimeout(() => {
            setLocalFilters((v) => ({
              ...v,
              residency_type: "WITH_GCC"
            }))
          }, 0)
        } else {
          setTimeout(() => {
            setLocalFilters((v) => ({
              ...v,
              residency_type: "WITHOUT_GCC"
            }))
          }, 0)
        }
      }}
    />
  );

  const ageRangeEle = (
    <SliderWrap
      open
      step={null}
      range
      min={0}
      max={65}
      marks={{
        0: <div style={{ paddingTop: "var(--marginXXSPx)" }}>0</div>,
        16: <div style={{ paddingTop: "var(--marginXXSPx)" }}>18</div>,
        21: <div style={{ paddingTop: "var(--marginXXSPx)" }}>21</div>,
        29: <div style={{ paddingTop: "var(--marginXXSPx)" }}>29</div>,
        39: <div style={{ paddingTop: "var(--marginXXSPx)" }}>39</div>,
        49: <div style={{ paddingTop: "var(--marginXXSPx)" }}>49</div>,
        59: <div style={{ paddingTop: "var(--marginXXSPx)" }}>59</div>,
        65: <div style={{ paddingTop: "var(--marginXXSPx)" }}>60+</div>,
      }}
      value={localFilters?.age_range}
      defaultValue={[0, 65]}
      onChange={(v) => {
        handleSliderChange(v);
      }}
    />
  )

  const residentsCategoryEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Residents Category" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="default"
      style={{
        minWidth: "148px",
        maxWidth: getResponsive({ default: "100%", })
      }}
      value={localFilters?.residents_category}
      allowClear
      loading={isFiltersLoading}
      onChange={(e) => {
        setTimeout(() => {
          setLocalFilters((v) => ({
            ...v,
            residents_category: e,
            residency_type: undefined,
            resident_type_code: undefined
          }))
        }, 100)
      }}
      options={filtersData?.residentsCategories}
    />
  )

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

  const nationalityEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Country" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="default"
      value={localFilters?.nationality_code}
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
            nationality_code: e,
          }))
        }, 100)
      }}
      options={nationalityOptions}
    />
  )
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
      value={localFilters?.emirate_code}
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
            emirate_code: e,
          }))
        }, 100)
      }}
      options={emirateOptions}
    />
  )

  const residencyEle = (
    <Select
      placeholder={getResponsive({ default: intl.formatMessage({ id: "Residency Type" }), tablet: intl.formatMessage({ id: "Select" }) })}
      size="large"
      value={localFilters?.resident_type_code}
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
            resident_type_code: e,
          }))
        }, 100)
      }}
      options={filtersData?.residencyTypes?.map((v) => ({ value: v?.value, label: isRtl ? v?.ar : v?.en }))}
    />
  )

  const filterItems = (getResponsive({ default: "true", tablet: "true" }) === "true")
    ? [
      {
        label: intl?.formatMessage({ id: "Residents Category" }),
        comp: residentsCategoryEle,
      },
      // Only show "Include GCC Residents" if category is not "visa"
      ...(localFilters?.residents_category !== "visa" ? [{
        label: intl?.formatMessage({ id: "Include GCC Residents" }),
        comp: dashboardCategoryEle,
      }] : []),
      {
        label: intl?.formatMessage({ id: "Country" }),
        comp: nationalityEle
      },
      {
        label: intl?.formatMessage({ id: "Emirate" }),
        comp: emirateEle
      },
      // Only show "Residency Type" if category is residents
      ...(localFilters?.residents_category === "residents" ? [{
        label: intl?.formatMessage({ id: "Residency Type" }),
        comp: residencyEle
      }] : []),
    ]
    : []

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
                <Col
                  paddingInline={getResponsive({ default: "var(--paddingPx)", mobile: "0px" })}
                >
                  <Row gutter={[0, 0]}>
                    <Col>
                      <Text>
                        {intl?.formatMessage({ id: "Age Range" })}
                      </Text>
                    </Col>
                    <Col>
                      {ageRangeEle}
                    </Col>
                  </Row>
                </Col>
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
              getResponsive({ default: "true", tablet: "true" }) === "true" && (
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
function ActiveResidence({ nationalitiesConfigValueObj, emiratesConfigValue, residencyTypeValues }) {
  const themeVariables = useToken();

  const [localeStore] = useContext(LocaleContext);
  const [filters, setFilters] = useState({})
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [applyAt, setApplyAt] = useState(true)
  const [isLoadingExport, setIsLoadingExport] = useState(true);
  const intl = useIntl();

  const titleText = intl.formatMessage({ id: filters?.residents_category === "residents" ? "Active Residents Dashboard" : filters?.residents_category === "visa" ? "Visa Holders Dashboard" : "Active Residents & Visa Holders Dashboard" });
  
  const {
    isCreatingPdf,
    printDocument,
    printDocumentCanvas,
    handleGeneratePdf
  } = usePrint({ name: titleText });

  const pageRef = useRef({}); 

  useEffect(() => {
    if (applyAt) {
      setTimeout(() => {
        setApplyAt(false);
      }, 200);
    }
  }, [applyAt]);

  const getResponsive = useResponsive();

  const patchedGetResponsive = (config) => {
    if (isPreviewOpen && config && typeof config === 'object') {
      return config.default;
    }
    return getResponsive(config);
  };

  const cleanedObject = cleanObject(filters);

  const isRtl = checkRtl(localeStore);

  const filtersData = {}
  filtersData.genders = [
    { value: "Male", en: 'Male', ar: 'ذكر' },
    { value: "Female", en: 'Female', ar: 'أنثى' },
  ];

  const transformedResidentsType = useMemo(() => {
    if (residencyTypeValues?.data?.length) {
      return residencyTypeValues?.data?.map((val) => {
        return {
          value: val?.resident_type_code,
          en: val?.resident_type_en,
          ar: val?.resident_type_ar,
        }
      })
    }
    return []
  }, [residencyTypeValues]);

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

  filtersData.residentsCategories = [
    { value: "residents", label: intl?.formatMessage({ id: "Residents" }) },
    { value: "visa", label: intl?.formatMessage({ id: "Visa Holder" }) },
    { value: "visa_and_residency", label: intl?.formatMessage({ id: "Residents & Visa Holders" }) }
  ]
  filtersData.nationalities = transformedNationalities
  filtersData.emiratesTypes = transformedEmirates;
  filtersData.emiratesConfigValue = emiratesConfigValue?.data;
  filtersData.residencyTypes = transformedResidentsType;

  const showAppliedFilters = !_.isEmpty(cleanedObject)

  const firstRowEle = (val = {}) => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ResidentsByGender pageRef={pageRef} isRtl={isRtl} filters={filters} {...val} />
      </Col>

      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ResidentsByResidencyType pageRef={pageRef} allTypes={filtersData?.residencyTypes} isRtl={isRtl} filters={filters} {...val} />
      </Col>
    </Row>
  )

  const secondRowEle = (val = {}) => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ResidentsByAge pageRef={pageRef} isRtl={isRtl} filters={filters} {...val} />
      </Col>

      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ResidentsByEmirate pageRef={pageRef} emiratesConfigValue={filtersData?.emiratesConfigValue} filters={filters} isRtl={isRtl} {...val} />
      </Col>
    </Row>
  )

  const thirdRowEle = (val = {}) => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ViolatorsByType
          pageRef={pageRef}
          isRtl={isRtl}
          filters={filters}
          {...val}
          icon={<IdentificationCard size={32} />}
          title={
            <Row align="middle" gutter={4}>
              <Col flex="none">
                {intl.formatMessage({ id: "Violators by Type" })}
              </Col>
              <Col flex="none">
                <Tooltip
                  title={intl?.formatMessage({ id: "active_violators_by_type" })}
                >
                  <span>
                    <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                  </span>
                </Tooltip>
              </Col>
            </Row>
          }
        />
      </Col>
      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <RisksByType
          pageRef={pageRef}
          isRtl={isRtl}
          filters={filters}
          {...val}
          icon={<RiskByTypeIcon />}
          title={
            <Row align="middle" gutter={4}>
              <Col flex="none">
                {intl.formatMessage({ id: "Total Risks by Type" })}
              </Col>
              <Col flex="none">
                <Tooltip
                  title={intl?.formatMessage({ id: "active_total_risks_by_type" })}
                >
                  <span>
                    <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                  </span>
                </Tooltip>
              </Col>
            </Row>
          }
        />
      </Col>
    </Row>
  )

  const fourthRowEle = (val = {}) => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ViolatorsByGender pageRef={pageRef} isRtl={isRtl} filters={filters} {...val} />
      </Col>
      <Col span={patchedGetResponsive({ default: 12, tablet: 24 })}>
        <ViolatorsByEmiratesWrapper pageRef={pageRef} emiratesConfigValue={filtersData?.emiratesConfigValue} filters={filters} isRtl={isRtl} {...val} />
      </Col>
    </Row>
  )

  const residentsByRegionAndNationality = (val = {}) => (
    <ResidentsByRegionAndNationality
      filter={filters}
      pageRef={pageRef}
      {...val}
    />
  )

  const fifthRowEle = (val = {}) => (
    <Row>
      <Col>
        {residentsByRegionAndNationality()}
      </Col>
    </Row>
  )

  const sixthRowEle = (val = {}) => (
    <Row gutter={[patchedGetResponsive({ default: themeVariables?.token?.marginLG, desktop: themeVariables?.token?.marginSM }), themeVariables?.token?.marginSM]}>
      <Col span={patchedGetResponsive({ default: 12, tablet: 12, midTablet: 24 })}>
        <ResidentsByProfession pageRef={pageRef} isRtl={isRtl} filters={filters} {...val} />
      </Col>
      <Col span={patchedGetResponsive({ default: 12, tablet: 12, midTablet: 24 })}>
        <ResidentsBySponser pageRef={pageRef} isRtl={isRtl} filters={filters} {...val} />
      </Col>
    </Row>
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
        {fifthRowEle()}
      </Col>
      {
        filters?.residents_category !== "visa" && (
          <Col>
            {sixthRowEle()}
          </Col>
        )
      }
      <Col>
        {thirdRowEle()}
      </Col>
      <Col>
        {fourthRowEle()}
      </Col>
    </>
  )

  const titleEle = (
    <Row wrap={false} gutter={8} align="middle">
      <Col flex="none" style={{ color: "var(--colorText)" }}>
        <ActiveResidenceSvg size={getResponsive({ default: 32, tablet: 24 })} />
      </Col>
      <Col flex="none">
        <Row
          wrap={true}
          align={(window?.innerWidth < 420 && !isPreviewOpen) ? "start" : "middle"}
          gutter={4}
        >
          <Col
            flex="none"
          >
            <Title level={patchedGetResponsive({ default: 4, mobile: 5 })}>
              <span style={{ position: "relative" }}>
                {titleText}
                <Tooltip
                  title={intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Active_Residence_&_Visa_Holders_Title_Tooltip" : filters?.residents_category === 'visa' ? "Visa_Holders_Dashboard_Title_Tooltip" : "Active_Residence_Title_Tooltip" })}
                  placement="bottom"
                >
                  <span
                    style={{ position: "absolute", ...isRtl ? { left: "-20px" } : { right: "-20px" }, bottom: isRtl ? "4px" : "-2px" }}
                  >
                    <Info style={{ marginBottom: "0px" }} color="var(--colorIcon)" size={14} weight="bold" />
                  </span>
                </Tooltip>
              </span>
            </Title>
          </Col>
        </Row>
      </Col>
    </Row>
  )

  const appliedFilterEle = showAppliedFilters && (
    <Col>
      <AppliedFilters
        data={[
          ...(cleanedObject?.residents_category
            ? [
              {
                label: intl?.formatMessage({ id: "Residents Category" }),
                value: intl?.formatMessage({ id: filtersData?.residentsCategories?.find((v) => v?.value === cleanedObject?.residents_category)?.label }),
                key: "residents_category",
                closable: true,
              },
            ]
            : []
          ),
          ...(![undefined, null]?.includes(cleanedObject?.residency_type)
            ? [
              {
                label: intl?.formatMessage({ id: "Include GCC Residents" }),
                value: cleanedObject?.residency_type === "WITHOUT_GCC" ? intl?.formatMessage({ id: "No" }) : intl?.formatMessage({ id: "Yes" }),
                key: "residency_type",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject?.nationality_code
            ? [
              {
                label: intl?.formatMessage({ id: "Country" }),
                value: getLabel(filtersData?.nationalities, cleanedObject?.nationality_code, isRtl),
                key: "nationality_code",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject?.emirate_code
            ? [
              {
                label: intl?.formatMessage({ id: "Emirate" }),
                value: getLabel(filtersData?.emiratesTypes, cleanedObject?.emirate_code, isRtl),
                key: "emirate_code",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject?.resident_type_code
            ? [
              {
                label: intl?.formatMessage({ id: "Residency Type" }),
                value: getLabel(filtersData?.residencyTypes, cleanedObject?.resident_type_code, isRtl),
                key: "resident_type_code",
                closable: true,
              },
            ]
            : []),
          ...(cleanedObject.age_range
            ? [
              {
                label: intl?.formatMessage({ id: "Age Range" }),
                value: cleanedObject.age_range?.split("-")?.map((v, index) => (index === 1 && v == 120) ? "60+" : v)?.join("-"),
                key: "age_range",
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
            if (value?.key === "residents_category") {
              delete f?.resident_type_code
              delete f?.[value.key]
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
          <Row wrap={false} align="middle" gutter={56} justify="space-between">
            <Col flex="auto">
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

        {appliedFilterEle}
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
    ...(showAppliedFilters ? [appliedFilterEle] : []),
    firstRowEle({ isPreviewOpen }),
    secondRowEle({ isPreviewOpen }),
    residentsByRegionAndNationality({ isTableHidden: true, isPreviewOpen, pageRef }),
    ({ space, isPrint, rows, callback, offset }) => residentsByRegionAndNationality({ isMapHidden: true, isPreviewOpen, pageRef, space, isPrint, rows, callback, offset }),
    ...(filters?.residents_category !== "visa" ? [sixthRowEle({ isPreviewOpen })] : []),
    thirdRowEle({ isPreviewOpen }),
    fourthRowEle({ isPreviewOpen }),
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
      <MainContentWrapDashboards
        isPreviewOpen={isPreviewOpen}
      >
        {mainContentEle}
      </MainContentWrapDashboards>
    </Row>
  )
}

ActiveResidence.propTypes = {
  emiratesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  residencyTypeValues: PropTypes.any
}

export default ActiveResidence;
