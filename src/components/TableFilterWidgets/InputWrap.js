import { Select, AntIcons } from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useState, useContext, useEffect, useMemo } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";

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

const { SearchOutlined } = AntIcons;

function InputWrap({
  data,
  onChange,
  searchText,
  arKey = "nationalityAr",
  enKey = "nationalityEn",
  setAppliedSearchText = () => {},
  onSearch = () => {}
}) {
  // Generate unique ID for this component instance
  const uniqueId = useMemo(() => `table-filter-dropdown-${Math.random().toString(36).substr(2, 9)}`, []);
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [value, setValue] = useState(searchText);
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

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
          placeholder={intl?.formatMessage({ id: "Search" })}
          // allowClear
          mode={"multiple"}
          open={true}
          getPopupContainer={() => document.getElementById(uniqueId)}
          options={_.cloneDeep(_.uniqBy(data, isRtl ? arKey : enKey))?.sort((a, b) => {
            return a?.[isRtl ? arKey : enKey]?.localeCompare(b?.[isRtl ? arKey : enKey])
          }).map((v) => ({
            value: isRtl ? v?.[arKey] : v?.[enKey],
            label: isRtl ? v?.[arKey] : v?.[enKey],
          }))}
          value={value}
          suffixIcon={(
            <SearchOutlined
              style={{ padding: "12px 0px 12px 0px" }}
              onClick={() => {
                setAppliedSearchText(searchText)
                onSearch();
              }}
            />
          )}
          onChange={(e) => {
            if (!e?.length) {
              setValue(undefined);
              setTimeout(() => {
                onChange(undefined);
              }, 400)
            } else if (e) {
              setValue(e)
              setTimeout(() => {
                onChange(e)
              }, 400)
            }
          }}
          style={{
            width: "100%"
          }}
          block
          onClear={() => {
            setValue(undefined)
            onChange(undefined)
          }}
          size="default"
          maxTagCount={4}
          listHeight={200}
          // getPopupContainer={(triggerNode) => triggerNode.parentNode}
          showSearch
          filterOption={(input, option) => {
            return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
          }}
        />
      </div>
    </>
  )
}

InputWrap.propTypes = {
  data: PropTypes.any,
  onChange: PropTypes.any,
  searchText: PropTypes?.any,
  arKey: PropTypes.any,
  enKey: PropTypes.any,
  setAppliedSearchText: PropTypes.any,
  onSearch: PropTypes.any
}

export default InputWrap;

