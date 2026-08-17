import PropTypes from "prop-types"
import { Row, Col, Table, Text, Progress, AntIcons, Select, Tooltip, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import ResidenceProfession from "@/svgr/ResidenceProfession"
import { formatNumber, checkRtl } from "@/utils/helper";
import { TableFilterDropdown  } from "@/components/TableFilterWidgets";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import _ from "lodash";
import { useEffect, useState, useContext, useMemo, useRef } from "react";
import useAsync from "@/hooks/useAsync";
import { getResidentsByProfession } from "@/services/activeResidenceService";
import useResponsive from "@/hooks/useResponsive";


const { SearchOutlined } = AntIcons;
const { Info } = PhosphorIcons;
const FormatNumber = (v) => <Text>{`${v}%`}</Text>;

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

function InputWrap({ onSearch, onChange, typed, setTyped, filters, searchText, appliedSelectedOptions, setAppliedSelectedOptions, searchOptions, selectedOptions, setSelectedOptions }) {
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
    value: sponsorValue,
  } = useAsync({ asyncFunction: getResidentsByProfession });

  const fetchResults = (value) => {
    execute({ filters: { ...filters, profession_name: value } });
  };

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  useEffect(() => {
    setOptions(searchOptions)
  }, [searchOptions])

  useEffect(() => {
    if (typed?.trim() && status === "success") {
      setOptions(_.cloneDeep(sponsorValue?.data))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsorValue?.data])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(() => _.debounce(fetchResults, 300), []);

  // Call debounced function when input changes
  const handleChange = (e) => {
    if (!e) {
      setOptions(searchOptions)
    } else if (e) {
      debouncedSearch(e);
    }
    setTyped(e)
  };
  const optionValues = useMemo(() => {
    return options?.sort((a, b) => {
      return a?.[isRtl ? "profession_ar" : "profession_en"]?.localeCompare(b?.[isRtl ? "profession_ar" : "profession_en"])
    }).map((v) => ({
      value: v?.profession_code,
      label: isRtl ? v?.profession_ar : v?.profession_en,
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
          value={value?.map((v) => ({ value: v?.profession_code, label: isRtl ? v?.profession_ar : v?.profession_en }))}
          suffixIcon={(
            <SearchOutlined
              style={{ padding: "12px 0px 12px 0px" }}
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
            } else if (e) {
              const _selectedOptions = e?.map((v) => {
                if (selectedOptions) {
                  const val = selectedOptions?.find((_v) => _v?.profession_code === v);
                  if (val) {
                    return val;
                  }
                }
                const val = options?.find((_v) => _v?.profession_code === v);
                if (val) {
                  return val;
                }
              })
              setValue(_selectedOptions)
              onChange(_selectedOptions)
              setSelectedOptions(_selectedOptions);
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
  onChange: PropTypes.any,
  onSearch: PropTypes.any,
  searchText: PropTypes.string,
  searchOptions: PropTypes.array,
  filters: PropTypes.any,
  typed: PropTypes.any,
  setTyped: PropTypes.any,
  selectedOptions: PropTypes.any,
  setAppliedSelectedOptions: PropTypes.any,
  setSelectedOptions: PropTypes.any,
  appliedSelectedOptions: PropTypes?.any
}

function ResidentsByProfession({ filters, isRtl, isPreviewOpen }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [searchText, setSearchText] = useState(undefined)
  const [searchOptions, setSearchOptions] = useState([]);
  const [typed, setTyped] = useState(undefined);
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const [appliedSelectedOptions, setAppliedSelectedOptions] = useState(undefined);
  const [sorter, setSorter] = useState({});

  const {
    execute,
    status,
    value,
    setState
  } = useAsync({ asyncFunction: getResidentsByProfession });

  const {
    execute: loadMoreResidents,
    // status: loadMoreResidentsStatus,
    // value: loadMoreResidentsValues,
  } = useAsync({ asyncFunction: getResidentsByProfession });

  useEffect(() => {
    setSearchOptions(value?.data);
  }, [value?.data])

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined);
    }
    if (selectedOptions) {
      setSelectedOptions(undefined)
    }
    if (typed) {
      setTyped(undefined)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={() => {}}
        appliedSearchText={""}
        setSearchText={setSearchText}
        isSearchDisabled={_.isEqual(selectedOptions, appliedSelectedOptions)}
        searchText={searchText}
        data={searchOptions}
        onSearch={() => {
          setAppliedSelectedOptions(selectedOptions)
        }}
        onReset={() => {
          setAppliedSelectedOptions(undefined)
          setSorter({})
        }}
      >
        {
          (d) => (
            <InputWrap
              searchOptions={d}
              searchText={searchText}
              key={appliedSelectedOptions}
              size="default"
              filters={filters}
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
    filterIcon: <SearchOutlined style={{ color: appliedSelectedOptions ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  async function loadMoreValues() {
    if (appliedSelectedOptions?.length) {
      return
    }
    if (value?.data?.length < value?.total) {
      const sortBy = {};
      if (sorter?.columnKey === "title") {
        sortBy.sort_by = "name"
      } else if (sorter?.columnKey === "number_of_residents") {
        sortBy.sort_by = "value"
      }
      if (sorter?.order === "descend") {
        sortBy.order_by = "DSC"
      }
      if (sorter?.order === "ascend") {
        sortBy.order_by = "ASC"
      }

      const res = await loadMoreResidents({ filters: { ...filters, ...sortBy }, skip: value?.data?.length });
      if (res?.data?.length) {
        setState((v) => ({
          ...v,
          value: {
            ...v?.value,
            data: [...(v?.value?.data || []), ...(res?.data || [])]
          }
        }))
      }
    }
  }

  function handleScroll(e) {
    const ele = document.querySelector("#residentsProfessionTable .ant-table-body");
    const { scrollTop, clientHeight, scrollHeight } = ele;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Example action based on distance from the bottom
    if (distanceFromBottom < 30) {
      loadMoreValues()
    }
  }
  const debouncedScrollHandler = _.debounce(handleScroll, 400);

  useEffect(() => {
    if (appliedSelectedOptions?.length) {
      return
    }
    const sortBy = {}
    if (sorter?.columnKey === "title") {
      sortBy.sort_by = "name"
    } else if (sorter?.columnKey === "number_of_residents") {
      sortBy.sort_by = "value"
    }
    if (sorter?.order === "descend") {
      sortBy.order_by = "DSC"
    }
    if (sorter?.order === "ascend") {
      sortBy.order_by = "ASC"
    }
    execute({ filters: { ...filters, profession_name: "", ...sortBy } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sorter]);


  const isLoading = ["idle", "pending"]?.includes(status);

  const data = value?.data || [];
  const isEmpty = !isLoading && !data?.length;

  useEffect(() => {
    if (data?.length) {
      const ele = document.querySelector("#residentsProfessionTable .ant-table-body");
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

  const handleTableChange = (newPagination, filters, newSorter) => {
    setSorter(newSorter);
  };

  return (
    <DashboardCard
      title={
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Residents by Sector" : filters?.residents_category === 'visa' ? "Visa Holders by Sector" : "Residents by Sector" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "active_residence_residency_sector_tooltip" : filters?.residents_category === 'visa' ? "active_visa_holders_sector_tooltip" : "active_residence_residency_sector_tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      }
      icon={<ResidenceProfession size={32} />}
      cardBodyHeight={getResponsive({ default: "423px", mobile: "530px" })}
      cardBodyPadding={isLoading ? "16px" : "0px"}
      bodyWrapStyle={{
        padding: "0px"
      }}
      titleProps={{
        wrap: getResponsive({ default: "false", tablet: "true", midTablet: "false", mobile: "true" }) === "true",
        gutter: getResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
      }}
      actionProps={{
        flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
      }}
      bodyBackgroundColor="transparent"
      loading={isLoading}
      isEmpty={isEmpty}
    >
      <Row>
        <Col>
          <Table
            id="residentsProfessionTable"
            key={appliedSelectedOptions}
            onChange={handleTableChange}
            columns={[
              {
                title: intl?.formatMessage({ id: "Sector" }),
                sorter: appliedSelectedOptions
                  ? { compare: (a, b) => a?.[isRtl ? "profession_ar" : "profession_en"]?.localeCompare(b?.[isRtl ? "profession_ar" : "profession_en"]) }
                  : true,
                key: "title",
                sortOrder: sorter.columnKey === 'title' ? sorter.order : null,
                width: isPreviewOpen ? "45%" : getResponsive({ default: "437px", desktop: "320px", bigTablet: "300px", tablet: "216px", midTablet: "300px", mobile: "168px" }),
                render: (v) => {
                  return (
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: v?.label
                          }}
                        >
                          {isRtl ? v?.profession_ar : v?.profession_en}
                        </Text>
                      </Col>
                    </Row>
                  )
                },
                ...getColumnSearchProps()
              },
              {
                title: intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Number of Residents" : filters?.residents_category === 'visa' ? "Number of Visa Holders" : "Number of Residents" }),
                sorter: appliedSelectedOptions
                  ? { compare: (a, b) => a?.count - b?.count }
                  : true,
                key: "number_of_residents",
                sortOrder: sorter.columnKey === 'number_of_residents' ? sorter.order : null,
                width: "auto",
                render: (v) => {
                  return (
                    <Row align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
                      <Col flex={getResponsive({ default: "0 0 105px", tablet: "0 0 105px", midTablet: "0 0 105px", mobile: "0 0 105px" })}>
                        <Text>
                          {formatNumber(v?.count)}
                        </Text>
                      </Col>

                      <Col flex="auto">
                        <Progress
                          strokeColor={"var(--colorPrimaryBase)"}
                          percent={Number(v?.percentage)}
                          showInfo={true}
                          format={FormatNumber}
                        />
                      </Col>
                    </Row>
                  )
                }
              }
            ]}
            scroll={{
              y: isPreviewOpen ? 360 : getResponsive({ default: data?.length > 8, tablet: data?.length > 5, midTablet: data?.length > 8, mobile: data?.length > 9 }) ? getResponsive({ default: 370, mobile: 69 * 7 }) : "auto",
              x: getResponsive({ default: "auto", mobile: 500 }),
            }}
            isTableFullHeight
            borderRadiusOnSides={getResponsive({ default: data?.length > 7 ? "all" : "top", tablet: data?.length > 5 ? "all" : "top", midTablet: data?.length > 7 ? "all": "top", mobile: data?.length > 6 ? "all": "top" })}
            pagination={false}
            dataSource={appliedSelectedOptions || data}
          />
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByProfession.propTypes = {
  filters: PropTypes.any,
  isRtl: PropTypes.any,
  isPreviewOpen: PropTypes.any
}

export default ResidentsByProfession;