import PropTypes from "prop-types"
import { useState, useMemo, useRef, useContext, useEffect } from "react";
import _ from "lodash";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { formatNumber, checkRtl, resolveTernary, emiratesFlagMapping, validateInput  } from "@/utils/helper";
import { TableFilterDropdown  } from "@/components/TableFilterWidgets";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { getViolationsEmirates, getViolationsOffices } from "@/services/visaVioloationService";
import {
  Row, Col, Avatar, Text, Title, theme, Skeleton, Empty,
  Progress, Table, Tooltip, PhosphorIcons,
  AntIcons, Select
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import BuildingOffice from "@/svgr/BuildingOffice";
import useResponsive from "@/hooks/useResponsive";
import VisaViolationByEmirate from "./VisaViolationByEmirate";

import Tabs from "@/components/Tabs";


const { Info } = PhosphorIcons;
const { SearchOutlined } = AntIcons;

// Add styles for ant-select-dropdown
const dropdownStyles = `
  [id^="table-filter-dropdown-"] .ant-select-dropdown {
    position: relative !important;
  }
  [id^="table-filter-dropdown-"] .ant-select-dropdown .rc-virtual-list-holder {
    max-height: 200px !important;
    overflow-y: auto !important;
  }
  [id^="table-filter-dropdown-"] .ant-select-dropdown .rc-virtual-list {
    max-height: 200px !important;
  }
`;

function StatCard({ label, value, icon, iconBgColor, bgColor }) {
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
            <Title>
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
  bgColor: PropTypes.any
}

function ResidentsByRegionWrapper({
  filter,
  icon,
  title,
  isPreview,
  pageRef,
  nationalitiesConfigValueObj,
  dateRange,
  isPrint,
  rows,
  callback,
  offset,
  space,
}) {
  const intl = useIntl();

  const [showBy, setShowBy] = useState(isPreview ?  pageRef.current.visaViolationByRegion.showBy : null);

  useEffect(() => {
    if (showBy !== visaEmiratesValue?.data?.emirates?.[0]?.code && !isPreview) {
      setShowBy(visaEmiratesValue?.data?.emirates?.[0]?.code)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    pageRef.current.visaViolationByRegion = {
      ...pageRef.current.visaViolationByRegion,
      showBy
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy])

  const {
    execute: invokeGetVisaEmirates,
    status: visaEmiratesStatus,
    value: visaEmiratesValue,
  } = useAsync({ asyncFunction: getViolationsEmirates });

  useEffect(() => {
    invokeGetVisaEmirates({
      filter: { ...filter, ...dateRange },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    invokeGetVisaEmirates,
  ]);

  const isLoading =
    visaEmiratesStatus === "idle" ||
    visaEmiratesStatus === "pending";


  const data = useMemo(() => {
    if (visaEmiratesStatus !== "success") {
      return []
    }
    return visaEmiratesValue?.data?.emirates;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visaEmiratesValue?.data])
  
  useEffect(() => {
    if (!isLoading) {
      const isAllDisabled = filter?.emirates?.length && filter?.emirates?.length !== 7;
      if (isAllDisabled) {
        const emirate = visaEmiratesValue?.data?.emirates?.find((v) => {
          return filter?.emirates?.find((e) => e == v?.code)
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
  }, [filter, isLoading])

  return (
    <VisaByRegionAndNationality
      icon={icon}
      title={title}
      showBy={showBy}
      setShowBy={setShowBy}
      dateRange={dateRange}
      isLoading={isLoading}
      isPreview={isPreview}
      mapTooltipTitle={intl?.formatMessage({ id: "Total Population" })}
      data={data}
      filter={filter}
      space={space}
      isPrint={isPrint}
      rows={rows}
      offset={offset}
      callback={callback}
      visaEmiratesValue={visaEmiratesValue}
      nationalitiesConfigValueObj={nationalitiesConfigValueObj}
      // totalMapping={totalData}
      tableConfig={{
        title: {
          secondColumn: intl?.formatMessage({ id: "Visa Violations" })
        }
      }}
    />
  );
}

ResidentsByRegionWrapper.propTypes = {
  filter: PropTypes.any,
  icon: PropTypes.any,
  pageRef: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  callback: PropTypes.any,
  offset: PropTypes.any,
  space: PropTypes.any,
  isPreview: PropTypes.any
}

export default ResidentsByRegionWrapper;

const { useToken } = theme;


function RegionWrap({ keyLabel, label, value }) {
  const themeVariables = useToken();

  return (
    <Row wrap={false} gutter={themeVariables?.token?.marginSM}>
      <Col flex="none">
        <Avatar size={34} src={emiratesFlagMapping[keyLabel]} />
      </Col>
      <Col flex="none">
        <Row gutter={[0, 4]}>
          <Col>
            <Text color='var(--colorTextLabel)' size="sm">
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
  return <Text>{`${v}`}</Text>
}

function getTooltip(isRtl, intl) {
  return function () {
    return `
      <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}"><span style="font-weight: bold;">${this?.point?.name}</span></div>
<div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"
}">${intl?.formatMessage({
  id: "Violations",
})}: <span style="font-weight: bold;">${_.isNumber(this?.point?.violations) ? formatNumber(this?.point?.violations) : "-"
}</span></div>
    `;

  }
}

function InputWrap({ onSearch, onChange, typed, showBy, dateRange, setTyped, filter, searchText, appliedSelectedOptions, setAppliedSelectedOptions, searchOptions, selectedOptions, setSelectedOptions }) {
  // Generate unique ID for this component instance
  const uniqueId = useMemo(() => `table-filter-dropdown-${Math.random().toString(36).substr(2, 9)}`, []);
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false)
  const [localeStore] = useContext(LocaleContext);
  const selectRef = useRef();
  const isRtl = checkRtl(localeStore);
  const [value, setValue] = useState(searchText);
  const [options, setOptions] = useState([]);
  const {
    execute,
    status,
    value: departmentValue,
  } = useAsync({ asyncFunction: getViolationsOffices });

  const fetchResults = (value) => {
    execute({ filter: { ...filter, emirates: showBy, ...dateRange, department: value, limit: 20, language: isRtl ? "ar": "en" } });
  };

  useEffect(() => {
    fetchResults()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange, showBy])

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  useEffect(() => {
    if (status === "success") {
      const _data = _.uniqBy(departmentValue?.data?.offices, resolveTernary(isRtl, "name_ar", "name_en"));
      setOptions(_.cloneDeep(_data))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentValue?.data])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(() => _.debounce(fetchResults, 300), []);

  // Call debounced function when input changes
  const handleChange = (e) => {
    if (!e) {
      setOptions(searchOptions)
    } else if (validateInput(e)) {
      debouncedSearch(e);
    }
    setTyped(e)
  };

  const optionValues = useMemo(() => {
    return options?.sort((a, b) => {
      return a?.[isRtl ? "name_ar" : "name_en"]?.localeCompare(b?.[isRtl ? "name_ar" : "name_en"])
    }).map((v) => ({
      value: isRtl ? v?.name_ar : v?.name_en,
      label: isRtl ? v?.name_ar : v?.name_en,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])
  
  useEffect(() => {
    if (selectRef?.current && isOpen) {
      setTimeout(() => {
        selectRef?.current?.focus();
      }, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionValues])

  useEffect(() => {
    if (typed) {
      setTyped(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSelectedOptions])

  return (
    <>
      <style>{dropdownStyles}</style>
      <div
        id={uniqueId}
        className="table-filter-dropdown"
        style={{
          position: "relative",
          width: getResponsive({ default: "100%" })
        }}
      >
        <Select
          virtual={false}
          placeholder={intl?.formatMessage({ id: "Search" })}
          ref={selectRef}
          key={JSON.stringify(optionValues)}
          getPopupContainer={() => document.getElementById(uniqueId)}
          open={isOpen}
          onFocus={() => {
            setIsOpen(true)
          }}
          onBlur={() => {
            setIsOpen(false)
          }}
          searchValue={typed}
          mode={"multiple"}
          loading={status === "pending"}
          options={optionValues}
          value={value}
          suffixIcon={(
            <SearchOutlined
              onClick={() => {
                onSearch()
              }}
            />
          )}
          onChange={(e) => {
            if (!e?.length) {
              setValue(undefined);
              setSelectedOptions(undefined)
              setTimeout(() => {
                onChange(undefined);
              }, 400)
            } else if (validateInput(e)) {
              setValue(e)
              onChange(e)
              setSelectedOptions(e);
            }
          }}
          style={{
            width: "100%"
          }}
          block
          onClear={() => {
            setValue(undefined)
            onChange(undefined)
            setTyped(undefined)
            setSelectedOptions(undefined)
            if (appliedSelectedOptions) {
              setAppliedSelectedOptions(undefined)
            }
          }}
          filterOption={(input, option) => {
            return option?.label
              ?.toLowerCase()
              ?.includes(input?.toLowerCase());
          }}
          maxTagCount={4}
          showSearch
          onSearch={handleChange}
        />
      </div>
    </>
  )
}

InputWrap.propTypes = {
  onSearch: PropTypes.any,
  onChange: PropTypes.any,
  typed: PropTypes.any,
  showBy: PropTypes.any,
  dateRange: PropTypes.any,
  setTyped: PropTypes.any,
  filter: PropTypes.any,
  searchText: PropTypes.any,
  appliedSelectedOptions: PropTypes.any,
  setAppliedSelectedOptions: PropTypes.any,
  searchOptions: PropTypes.any,
  selectedOptions: PropTypes.any,
  setSelectedOptions: PropTypes.any
}

function InputWrapTourismOffice({ searchOptions, selectedDepartments, onSearch, onChange, typed, showBy, dateRange, setTyped, filter, searchText, appliedSelectedOptions, setAppliedSelectedOptions, selectedOptions, setSelectedOptions }) {
  // Generate unique ID for this component instance
  const uniqueId = useMemo(() => `table-filter-dropdown-${Math.random().toString(36).substr(2, 9)}`, []);
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false)
  const [localeStore] = useContext(LocaleContext);
  const selectRef = useRef();
  const isRtl = checkRtl(localeStore);
  const [value, setValue] = useState(searchText);
  const [options, setOptions] = useState(searchOptions);
  const {
    execute,
    status,
    value: departmentValue,
  } = useAsync({ asyncFunction: getViolationsOffices });

  const fetchResults = (value) => {
    execute({ filter: { ...filter, emirates: showBy, ...dateRange, tourism_office: value, department_list: selectedDepartments, language: isRtl ? "ar": "en" }, limit: 20 });
  };

  useEffect(() => {
    fetchResults()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange, showBy, selectedDepartments])

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  // useEffect(() => {
  //   setOptions(searchOptions)
  // }, [searchOptions])

  useEffect(() => {
    if (status === "success") {
      const _data = _.uniqBy(departmentValue?.data?.offices, resolveTernary(isRtl, "tourism_office_ar", "tourism_office_en"));
      
      setOptions(_.cloneDeep(_data))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentValue?.data])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(() => _.debounce(fetchResults, 300), []);

  // Call debounced function when input changes
  const handleChange = (e) => {
    if (!e) {
      setOptions(searchOptions)
    } else if (validateInput(e)) {
      debouncedSearch(e);
    }
    setTyped(e)
  };

  const optionValues = useMemo(() => {
    return options?.sort((a, b) => {
      return a?.[isRtl ? "tourism_office_ar" : "tourism_office_en"]?.localeCompare(b?.[isRtl ? "tourism_office_ar" : "tourism_office_en"])
    }).map((v) => ({
      value: isRtl ? v?.tourism_office_ar : v?.tourism_office_en,
      label: isRtl ? v?.tourism_office_ar : v?.tourism_office_en,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])
  
  useEffect(() => {
    if (selectRef?.current && isOpen) {
      setTimeout(() => {
        selectRef?.current?.focus();
      }, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionValues])

  useEffect(() => {
    if (typed) {
      setTyped(undefined);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSelectedOptions])

  return (
    <>
      <style>{dropdownStyles}</style>
      <div
        id={uniqueId}
        className="table-filter-dropdown"
        style={{
          position: "relative",
          width: getResponsive({ default: "100%" })
        }}
      >
        <Select
          virtual={false}
          placeholder={intl?.formatMessage({ id: "Search" })}
          ref={selectRef}
          key={JSON.stringify(optionValues)}
          getPopupContainer={() => document.getElementById(uniqueId)}
          open={isOpen}
          onFocus={() => {
            setIsOpen(true)
          }}
          onBlur={() => {
            setIsOpen(false)
          }}
          searchValue={typed}
          mode={"multiple"}
          loading={status === "pending"}
          options={optionValues}
          value={value}
          suffixIcon={(
            <SearchOutlined
              onClick={() => {
                onSearch()
              }}
            />
          )}
          onChange={(e) => {
            if (!e?.length) {
              setValue(undefined);
              setSelectedOptions(undefined)
              setTimeout(() => {
                onChange(undefined);
              }, 400)
            } else if (validateInput(e)) {
              setValue(e)
              onChange(e)
              setSelectedOptions(e);
            }
          }}
          style={{
            width: "100%"
          }}
          block
          onClear={() => {
            setValue(undefined)
            onChange(undefined)
            setTyped(undefined)
            setSelectedOptions(undefined)
            if (appliedSelectedOptions) {
              setAppliedSelectedOptions(undefined)
            }
          }}
          filterOption={(input, option) => {
            return option?.label
              ?.toLowerCase()
              ?.includes(input?.toLowerCase());
          }}
          maxTagCount={4}
          showSearch
          onSearch={handleChange}
        />
      </div>
    </>
  )
}

InputWrapTourismOffice.propTypes = {
  onSearch: PropTypes.any,
  selectedDepartments: PropTypes.any,
  onChange: PropTypes.any,
  typed: PropTypes.any,
  showBy: PropTypes.any,
  dateRange: PropTypes.any,
  setTyped: PropTypes.any,
  filter: PropTypes.any,
  searchText: PropTypes.any,
  appliedSelectedOptions: PropTypes.any,
  setAppliedSelectedOptions: PropTypes.any,
  searchOptions: PropTypes.any,
  selectedOptions: PropTypes.any,
  setSelectedOptions: PropTypes.any
}

function VisaByRegionAndNationality({
  data: emiratesData,
  filter,
  dateRange,
  visaEmiratesValue,
  showBy,
  setShowBy = () => { },
  icon,
  isLoading : _isLoading = false,
  tableConfig = {},
  space,
  isPreview,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden
}) {
  const intl = useIntl();
  const [searchText, setSearchText] = useState(undefined)
  const [typed, setTyped] = useState(undefined);
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const [appliedSelectedOptions, setAppliedSelectedOptions] = useState(undefined);

  const [searchTextTourism, setSearchTextTourism] = useState(undefined)
  const [typedTourism, setTypedTourism] = useState(undefined);
  const [selectedOptionsTourism, setSelectedOptionsTourism] = useState(undefined);
  const [appliedSelectedOptionsTourism, setAppliedSelectedOptionsTourism] = useState(undefined);
  const [sorter, setSorter] = useState({});

  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [printRows, setPrintRows] = useState(resolveTernary(offset, { from: offset, to: offset + 1 }, rows || { from: 0, to: 1 }));

  useEffect(() => {
    if (appliedSelectedOptionsTourism) {
      setAppliedSelectedOptionsTourism(undefined);
      setSelectedOptionsTourism(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSelectedOptions])

  const {
    execute: invokeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
    setState
  } = useAsync({ asyncFunction: getViolationsOffices });

  const {
    execute: loadMoreViolationOffices,
    // status: loadMoreResidentsStatus,
    // value: loadMoreResidentsValues,
  } = useAsync({ asyncFunction: getViolationsOffices });

  const isLoading = _isLoading;

  const hiddenContainerRef = useRef()

  useEffect(() => {
    if (![undefined, null]?.includes(showBy)) {
      const sortBy = {};
      if (sorter?.order === "descend") {
        sortBy.order_by = "DSC"
      }
      if (sorter?.order === "ascend") {
        sortBy.order_by = "ASC"
      }
      invokeNationalities({ filter: {
        ...filter,
        emirates: showBy,
        ...dateRange,
        limit: 10,
        ...sortBy,
        department_list: appliedSelectedOptions,
        tourism_office_list: [],
        language: isRtl ? "ar": "en"
      } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedSelectedOptions])

  useEffect(() => {
    if (![undefined, null]?.includes(showBy)) {
      const sortBy = {};
      if (sorter?.order === "descend") {
        sortBy.order_by = "DSC"
      }
      if (sorter?.order === "ascend") {
        sortBy.order_by = "ASC"
      }
      invokeNationalities({ filter: {
        ...filter,
        emirates: showBy,
        ...dateRange,
        limit: 10,
        ...sortBy,
        department_list: appliedSelectedOptions,
        tourism_office_list: appliedSelectedOptionsTourism,
        language: isRtl ? "ar": "en"
      } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy, sorter, filter, dateRange, appliedSelectedOptionsTourism])

  const _data = nationalitiesValue?.data?.offices || [];

  async function loadMoreValues() {
    if (_data?.length < nationalitiesValue?.pagination?.total) {
      const sortBy = {};
      if (sorter?.order === "descend") {
        sortBy.order_by = "DSC"
      }
      if (sorter?.order === "ascend") {
        sortBy.order_by = "ASC"
      }

      const res = await loadMoreViolationOffices({ filter: {
        ...filter,
        emirates: showBy,
        ...dateRange,
        ...sortBy,
        skip: _data?.length,
        limit: 10,
        department_list: appliedSelectedOptions,
        tourism_office_list: appliedSelectedOptionsTourism,
        language: isRtl ? "ar": "en"
      } });
      if (res?.data?.offices?.length) {
        setState((v) => ({
          ...v,
          value: {
            ...v?.value,
            data: {
              offices: [...(v?.value?.data?.offices || []), ...(res?.data?.offices || [])]
            }
          }
        }))
      }
    }
  }

  const data = _data;

  const uniqueDepartments = useMemo(() => {
    return _.uniqBy(_data, resolveTernary(isRtl, "name_ar", "name_en"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data])
  
  const uniqueOffices = useMemo(() => {
    return _.uniqBy(_data, resolveTernary(isRtl, "tourism_office_ar", "tourism_office_en"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data])
  
  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={() => {}}
        appliedSearchText={""}
        setSearchText={setSearchText}
        searchText={searchText}
        data={uniqueDepartments}
        onSearch={() => {
          setSearchTextTourism(undefined)
          setAppliedSelectedOptions(selectedOptions)
        }}
        onReset={() => {
          setAppliedSelectedOptions(undefined)
        }}
      >
        {
          (d) => (
            <InputWrap
              searchOptions={d}
              searchText={searchText}
              key={appliedSelectedOptions}
              size="default"
              filter={filter}
              showBy={showBy}
              dateRange={dateRange}
              selectedOptions={selectedOptions}
              typed={typed}
              setTyped={setTyped}
              setSelectedOptions={setSelectedOptions}
              setAppliedSelectedOptions={setAppliedSelectedOptions}
              appliedSelectedOptions={appliedSelectedOptions}
              onSearch={() => {
                setSearchTextTourism(undefined)
                setAppliedSelectedOptions(selectedOptions)
              }}
              onChange={(v) => {
                setSearchText(v)
                if (!v) {
                  setSelectedOptions(undefined)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: resolveTernary(appliedSelectedOptions, 'var(--colorPrimaryBase)', undefined) }} />,
  });

  const getTourismColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={() => {}}
        appliedSearchText={""}
        setSearchText={setSearchTextTourism}
        searchText={searchTextTourism}
        data={uniqueOffices}
        onSearch={() => {
          setAppliedSelectedOptionsTourism(selectedOptionsTourism)
        }}
        onReset={() => {
          setAppliedSelectedOptionsTourism(undefined)
        }}
      >
        {
          (d) => (
            <InputWrapTourismOffice
              searchOptions={d}
              searchText={searchTextTourism}
              selectedDepartments={appliedSelectedOptions}
              key={appliedSelectedOptionsTourism}
              size="default"
              filter={filter}
              showBy={showBy}
              dateRange={dateRange}
              selectedOptions={selectedOptionsTourism}
              typed={typedTourism}
              setTyped={setTypedTourism}
              setSelectedOptions={setSelectedOptionsTourism}
              setAppliedSelectedOptions={setAppliedSelectedOptionsTourism}
              appliedSelectedOptions={appliedSelectedOptionsTourism}
              onSearch={() => {
                setAppliedSelectedOptionsTourism(selectedOptionsTourism)
              }}
              onChange={(v) => {
                setSearchTextTourism(v)
                if (!v) {
                  setSelectedOptionsTourism(undefined)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: resolveTernary(appliedSelectedOptionsTourism, 'var(--colorPrimaryBase)', undefined) }} />,
  });

  useEffect(() => {
    if (isPreview && !isPrint && !["idle", "pending"]?.includes(nationalitiesStatus) && !isTableHidden) {
      setTimeout(() => {
        if (hiddenContainerRef?.current?.getBoundingClientRect) {
          const height = hiddenContainerRef.current.getBoundingClientRect().height;
          if (height >= space && printRows?.to === 1) {
            callback({ info: { isNextPage: true, printRows: { from: printRows?.from, to: printRows?.to } }});
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
  }, [printRows, nationalitiesStatus])

  const sumTotalViolations = useMemo(() => {
    let sum = 0;
    _data?.forEach((v) => sum += v?.violations)
    return sum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (selectedOptions) {
      setSelectedOptions(undefined)
    }
    if (appliedSelectedOptions) {
      setAppliedSelectedOptions(undefined)
    }
    if (selectedOptionsTourism) {
      setSelectedOptionsTourism(undefined)
    }
    if (setAppliedSelectedOptionsTourism) {
      setAppliedSelectedOptionsTourism(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, showBy])
  
  const getResponsive = useResponsive();
  const chartRef = useRef();
  const themeVariables = useToken();

  function handleScroll(e) {
    const ele = document.querySelector("#VisaViolationTable .ant-table-body");
    const { scrollTop, clientHeight, scrollHeight } = ele || {};
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Example action based on distance from the bottom
    if (distanceFromBottom < 30) {
      loadMoreValues()
    }
  }
  const debouncedScrollHandler = _.debounce(handleScroll, 400);

  useEffect(() => {
    if (data?.length) {
      const ele = document.querySelector("#VisaViolationTable .ant-table-body");
      if (ele) {
        ele.addEventListener('scroll', debouncedScrollHandler);
      }

      // Cleanup on component unmount
      return () => {
        if (ele) {
          ele.removeEventListener('scroll', debouncedScrollHandler);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, appliedSelectedOptions])

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
      <VisaViolationByEmirate
        filter={filter}
        data={(emiratesData || [])?.reduce((acc, v) => {
          acc[v?.name_en] = v?.total || 0;
          return acc;
        }, {})}
        totalValue={visaEmiratesValue?.data?.total || 0}
        loading={isLoading}
        emiratesConfigValue={emiratesData?.filter((v) => v?.code != 0)?.map((v) => ({ ...v, emirate_code: v?.code?.toString(), emirate_name_ar: v?.name_ar, emirate_name_en: v?.name_en }))}
      />
    )
  }

  const isLoadingTable = (nationalitiesStatus === "idle" || nationalitiesStatus === "pending")
  
  const handleTableChange = (newPagination, filters, newSorter) => {
    setSorter(newSorter);
  };

  const tableEle = (
    <DashboardCard
      title={intl?.formatMessage({ id: "By Department & Tourism Office" })}
      bodyBackgroundColor="transparent"
      cardBodyHeight={"auto"}
      cardBodyPadding={resolveTernary(isLoading || isLoadingTable, "16px", "0px")}
      bordered
      bodyWrapStyle={{
        padding: "0px",
      }}
      style={{
        height: getResponsive({ default: "100%", tablet: "100%", midTablet: "449px", mobile: resolveTernary(data?.length, "480px", "365px") }),
      }}
      headStyle={{
        backgroundColor: "var(--brand-gold-1)",
        padding: "var(--paddingSMPx) var(--paddingPx)",
      }}
      loading={isLoading || isLoadingTable}
      titleProps={{
        wrap: getResponsive({ default: false, tablet: true }),
        gutter: getResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
      }}
      actionProps={{
        flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
      }}
    >
      <Table
        key={`${appliedSelectedOptions}_${appliedSelectedOptionsTourism}`}
        id="VisaViolationTable"
        onChange={handleTableChange}
        borderRadiusOnSides={getResponsive({ default: resolveTernary(data?.length > 6, "all", "top"), midTablet: resolveTernary(data?.length > 6, "all", "top"), mobile: resolveTernary(data?.length > 4, "all", "top") })}
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
                if (point && point.colorIndex == undefined ) {
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
              point?.["code"] == record?.["code"]
            );
          }

          function showTooltip(chart, point) {
            if (point) {
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
            title: intl?.formatMessage({ id: "Department" }),
            ellipsis: true,
            width: getResponsive({ default: "40%", tablet: "230px", mobile: "230px" }),
            render: (v) => {
              return (
                <Row>
                  <Col
                    style={{
                      flex: "0 0 100%"
                    }}
                    paddingInline={isRtl ? "0px 16px" : "0 16px"}
                  >
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Avatar
                          size={24}
                          shape="circle"
                          backgroundColor="var(--brand-gold-2)"
                          src={<BuildingOffice color="var(--colorPrimaryBase)" size={14} />}
                        />
                      </Col>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: isRtl ? v?.name_ar : v?.name_en
                          }}
                        >
                          {isRtl ? v?.name_ar : v?.name_en}
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
            title: intl?.formatMessage({ id: "Tourism Office" }),
            ellipsis: true,
            width: getResponsive({ default: "30%", tablet: "170px", mobile: "230px" }),
            render: (v) => {
              return (
                <Row>
                  <Col
                    style={{
                      flex: "0 0 100%"
                    }}
                    paddingInline={isRtl ? "0px 16px" : "0 16px"}
                  >
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: isRtl ? v?.tourism_office_ar : v?.tourism_office_en
                          }}
                        >
                          {isRtl ? v?.tourism_office_ar : v?.tourism_office_en}
                        </Text>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              )
            },
            ...getTourismColumnSearchProps()
          },
          {
            title: tableConfig?.title?.secondColumn || intl?.formatMessage({ id: "Visa Violations" }),
            key: "title",
            sorter: true,
            sortOrder: sorter.columnKey === 'title' ? sorter.order : null,
            width: getResponsive({ default: "30%", tablet: "160px", mobile: "230px" }),
            render: (v) => {
              const percent = ((v?.violations / sumTotalViolations) * 100)?.toFixed(2);
              return (
                <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                  <Col flex="auto">
                    <Progress
                      strokeColor={"var(--brand-gold-5)"}
                      percent={percent}
                      showInfo={true}
                      format={() => FormatText([undefined, null]?.includes(v?.violations) ? '-' : formatNumber(v?.violations))}
                    />
                  </Col>
                </Row>
              )
            }
          }
        ]}  
        scroll={resolveTernary(isPreview, undefined, {
          y: data?.length > getResponsive({ default: 4, tablet: 4, midTablet: 6, mobile: 4 }) ? getResponsive({ default: 377, tablet: 344, mobile: 365 }) : undefined,
          x: getResponsive({ mobile: "690px" })
        })}
        pagination={false}
        dataSource={resolveTernary(isPreview, data?.slice(printRows?.from, printRows?.to), data)}
      />
    </DashboardCard>
  )

  const isAllDisabled = filter?.emirates?.length && filter?.emirates?.length != 7;

  const ele = (printRows) => (
    <DashboardCard
      cardBodyHeight={isPreview ? "auto" : getResponsive({ default: "578px", desktop: "578px", midTablet: "auto" })}
      title={
        <Row gutter={4} align="middle" wrap={false}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Tourist Violations" })}
          </Col>
          <Col flex="none">
            <Tooltip title={intl?.formatMessage({ id: "Details of tourist visa violations organized by Emirate and issuing tourism Department" })}>
              <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
            </Tooltip>
          </Col>
        </Row>
      }
      icon={resolveTernary(icon, icon, <BuildingOffice />)}
      headerBorder={false}
      cardBodyPadding="0px"
      bodyBackgroundColor={"transparent"}
      bodyWrapStyle={{
        paddingTop: "0px"
      }}
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
                        isPreview={isPreview}
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
                        customCardWidth={isRtl ? 205 : undefined}
                        customType={"primary"}
                        activeKey={showBy}
                        onChange={(key) => {
                          setShowBy(key)
                        }}
                        options={
                          (isPreview 
                            ? (emiratesData || []).filter(v => v?.code === showBy)
                            : (emiratesData || [])
                          )?.map((v) => ({
                            key: v?.code,
                            disabled: (v?.code == 0 && isAllDisabled ? true: filter?.emirates?.length && v?.code !== 0 && !filter?.emirates?.find((val) => val == v?.code)),
                            children: (
                              <RegionWrap
                                keyLabel={v?.code}
                                label={isRtl ? v?.["name_ar"] || v?.["nameAr"] : v?.["name_en"] || v?.["nameEn"]}
                                value={(v?.code == 0 && isAllDisabled) ? "-": formatNumber(resolveTernary(![undefined, null]?.includes(v?.total), v?.total, "-"))}
                              />
                            )
                          }))
                        }
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
                gutter={isPreview ? [16, 16] : getResponsive({ default: themeVariables?.token?.margin, desktop: themeVariables?.token?.marginSM, midTablet: [0, 16] })}
                wrap={isPreview ? true : getResponsive({ default: false, midTablet: true })}
                isFullHeight
              >
                {
                  !isPreview &&
                  <Col
                    flex={getResponsive({ default: "0 0 624px", desktop: "0 0 624px", tablet: "0 0 50%", midTablet: "0 0 100%" })}
                  >
                    {tableEle} 
                  </Col>
                }
                {
                  !printRows?.from && !isMapHidden &&
                  <Col
                    flex={isPreview ? "0 0 100%": getResponsive({ default: "0 0 calc(100% - 624px)", desktop: "0 0 calc(100% - 624px)", tablet: "0 0 50%", midTablet: "0 0 100%" })}
                  >
                    <Row isFullHeight>
                      <Col
                        style={{
                          borderRadius: "var(--borderRadiusPx)",
                          border: "1px solid var(--colorSplit)",
                          backgroundColor: "var(--colorBgLayout)",
                          ...getResponsive({ mobile: "true", default: "false" }) === "true" && ({
                            minHeight: "285px"
                          })
                        }}
                        paddingInline={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                        paddingBlock={getResponsive({ default: "var(--paddingLGPx)", desktop: "var(--paddingSMPx)" })}
                      >
                        {
                          (isLoading || isLoadingTable)
                            ? <Skeleton paragraph={{ rows: 10 }} />
                            : (
                              getComponent()
                            )
                        }
                      </Col>
                    </Row>
                  </Col>
                }
                {
                  isPreview && !isTableHidden &&
                  <Col>
                    {tableEle} 
                  </Col>
                }
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  );

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

VisaByRegionAndNationality.propTypes = {
  data: PropTypes.any,
  dateRange: PropTypes?.any,
  isPreview: PropTypes.any,
  space: PropTypes?.any,
  filter: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.bool,
  setShowBy: PropTypes.func,
  showBy: PropTypes.string,
  tableConfig: PropTypes.object,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any,
  visaEmiratesValue: PropTypes.any
}
