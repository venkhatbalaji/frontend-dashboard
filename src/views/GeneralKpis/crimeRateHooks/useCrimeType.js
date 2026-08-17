import { useMemo, useContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { getCrimeTypeStatistics, getCrimeTypes } from "@/services/generalIndicatorsService";
import { Row, Col, Text, Progress, AntIcons, Select } from "re-usable-design-components"
import { useIntl } from "react-intl";
import _ from "lodash";
import { resolveTernary, checkRtl, formatNumber, getColorFromPercentage } from "@/utils/helper";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { TableFilterDropdown } from "@/components/TableFilterWidgets";

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

function InputWrap({ onSearch, onChange, typed, setTyped, filter, searchText, appliedSelectedOptions, setAppliedSelectedOptions, searchOptions, selectedOptions, setSelectedOptions }) {
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
  } = useAsync({ asyncFunction: getCrimeTypes });

  const fetchResults = (value) => {
    execute({ filters: { search: value, limit: 20, language: isRtl ? "ar" : "en" } });
  };

  useEffect(() => {
    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  useEffect(() => {
    if (status === "success") {
      const _data = departmentValue?.data;
      setOptions(_.cloneDeep(_data))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentValue?.data])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(() => _.debounce(fetchResults, 300), []);

  // Call debounced function when input changes
  const handleChange = (e) => {
    debouncedSearch(e);
    setTyped(e)
  };

  const optionValues = useMemo(() => {
    return options?.sort((a, b) => {
      return a?.[isRtl ? "crime_type_ar" : "crime_type_en"]?.localeCompare(b?.[isRtl ? "crime_type_ar" : "crime_type_en"])
    }).map((v) => ({
      value: v?.crime_type_code,
      label: isRtl ? v?.crime_type_ar : v?.crime_type_en,
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
          onChange={(e, e1, e2) => {
            if (!e?.length) {
              setValue(undefined);
              setSelectedOptions(undefined)
              setTimeout(() => {
                onChange(undefined);
              }, 400)
            } else if (e) {
              const _values = e?.reduce((acc, v) => {
                const foundInValue = value?.find((_v) => _v?.value === v)
                if (foundInValue) {
                  acc.push(foundInValue)
                } else {
                  const foundInE1 = e1?.find((_v) => _v?.value === v)
                  if (foundInE1) {
                    acc.push(foundInE1)
                  }
                }
                return acc
              }, [])
              setValue(_values)
              onChange(_values)
              setSelectedOptions(_values);
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
  setTyped: PropTypes.any,
  filter: PropTypes.any,
  searchText: PropTypes.any,
  appliedSelectedOptions: PropTypes.any,
  setAppliedSelectedOptions: PropTypes.any,
  searchOptions: PropTypes.any,
  selectedOptions: PropTypes.any,
  setSelectedOptions: PropTypes.any
}

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function useCrimeType({ filters }) {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)
  const [searchText, setSearchText] = useState(undefined)
  const [typed, setTyped] = useState(undefined);
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const [appliedSelectedOptions, setAppliedSelectedOptions] = useState(undefined);
  const [sorter, setSorter] = useState({});

  const {
    execute,
    status,
    value,
    setState
  } = useAsync({
    asyncFunction: getCrimeTypeStatistics,
  });

  useEffect(() => {
    const sortBy = {};
    if (sorter?.order === "descend") {
      sortBy.order_by = "DSC"
    }
    if (sorter?.order === "ascend") {
      sortBy.order_by = "ASC"
    }
    if (sorter.columnKey) {
      sortBy.sort_by = sorter.columnKey;
    }
    execute({
      filters: {
        ...filters,
        crime_types: appliedSelectedOptions?.map((v) => v?.value),
        ...sortBy,
        language: isRtl ? "ar" : "en",
        limit: 10,
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, appliedSelectedOptions, sorter])

  const {
    execute: loadMoreCrimeTypes,
  } = useAsync({ asyncFunction: getCrimeTypeStatistics });

  const isLoading = status === "idle" || status === "pending";
  // const isEmpty = !isLoading && !value?.data?.crimes?.length

  const getResponsive = useResponsive();
  const intl = useIntl();

  const formattedData = useMemo(() => {
    return (value?.data?.crimes || []);
  }, [value?.data?.crimes]);

  const filteredData = useMemo(() => {
    return _.cloneDeep(formattedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedData])

  async function loadMoreValues() {
    if (filteredData?.length < value?.pagination?.total) {
      const sortBy = {};
      if (sorter?.order === "descend") {
        sortBy.order_by = "DSC"
      }
      if (sorter?.order === "ascend") {
        sortBy.order_by = "ASC"
      }
      if (sorter.columnKey) {
        sortBy.sort_by = sorter.columnKey;
      }
      const res = await loadMoreCrimeTypes({
        filters: {
          ...filters,
          ...sortBy,
          skip: filteredData?.length,
          limit: 10,
          crime_types: appliedSelectedOptions?.map((v) => v?.value),
          language: isRtl ? "ar" : "en"
        }
      });

      if (res?.data?.crimes?.length) {
        setState((v) => ({
          ...v,
          value: {
            ...v?.value,
            data: {
              crimes: [...(v?.value?.data?.crimes || []), ...(res?.data?.crimes || [])]
            }
          }
        }))
      }
    }
  }

  const handleTableChange = (newPagination, filters, newSorter) => {
    setSorter(newSorter);
  };

  function handleScroll(e) {
    const ele = document.querySelector("#CrimeTypeTable .ant-table-body");
    if (!ele) return;
    const { scrollTop, clientHeight, scrollHeight } = ele;

    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Example action based on distance from the bottom
    if (distanceFromBottom < 30) {
      loadMoreValues()
    }
  }
  const debouncedScrollHandler = _.debounce(handleScroll, 400);

  useEffect(() => {
    if (filteredData?.length) {
      const ele = document.querySelector("#CrimeTypeTable .ant-table-body");
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
  }, [filteredData, appliedSelectedOptions])

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (selectedOptions) {
      setSelectedOptions(undefined)
    }
    if (appliedSelectedOptions) {
      setAppliedSelectedOptions(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={() => { }}
        appliedSearchText={""}
        setSearchText={setSearchText}
        searchText={searchText}
        data={formattedData || []}
        onSearch={() => {
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
              filter={filters}
              selectedOptions={selectedOptions}
              typed={typed}
              setTyped={setTyped}
              setSelectedOptions={setSelectedOptions}
              setAppliedSelectedOptions={setAppliedSelectedOptions}
              appliedSelectedOptions={appliedSelectedOptions}
              onSearch={() => {
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

  const columns = [{
    title: intl?.formatMessage({ id: "Crime Type" }),
    width: getResponsive({ default: "50%", mobile: "155px" }),
    ellipsis: true,
    key: "name",
    sorter: true,
    sortOrder: sorter.columnKey === 'name' ? sorter.order : null,
    render: (v) => {
      return (
        <Row>
          <Col
            paddingInline={resolveTernary(isRtl, "0px 16px", "0 16px")}
          >
            <Row align="middle" wrap={false} gutter={8}>
              <Col flex="none">
                <Text
                  ellipsis={{
                    tooltip: v?.[!isRtl ? "name_en" : "name_ar"]
                  }}
                >
                  {v?.[!isRtl ? "name_en" : "name_ar"]}
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
    title: intl?.formatMessage({ id: "Crime Rate" }),
    width: getResponsive({ default: "50%" }),
    key: "value",
    sorter: true,
    sortOrder: sorter.columnKey === 'value' ? sorter.order : null,
    render: (v) => {
      const percent = v?.percentage?.toFixed(2);
      return (
        <Row align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
          <Col flex={getResponsive({ default: "0 0 95px", mobile: "0 0 95px" })}>
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
              strokeColor={getColorFromPercentage({
                percent: percent > 100 ? 100 : percent,
              })}
              percent={percent}
              showInfo={true}
              format={FormatText}
            />
          </Col>
        </Row>
      )
    }
  }]

  return {
    isLoading,
    data: filteredData,
    isEmpty: false,
    status,
    columns,
    tableId: "CrimeTypeTable",
    onChange: handleTableChange
  };
}

export default useCrimeType; 