import { useMemo, useContext, useState, useEffect } from "react";
import { getExpatriateWorkersStatistics } from "@/services/generalIndicatorsService";
import { Row, Col, Text, Progress, AntIcons } from "re-usable-design-components"
import { useIntl } from "react-intl";
import _ from "lodash";
import { resolveTernary, checkRtl, formatNumber, getColorFromPercentage } from "@/utils/helper";
import { useBaseHook } from "../utils/hookUtils";
import useResponsive from "@/hooks/useResponsive";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { TableFilterDropdown, InputWrap } from "@/components/TableFilterWidgets";

const { SearchOutlined } = AntIcons;

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function useEmploymentDistribution({ filters }) {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getExpatriateWorkersStatistics,
    filters,
    dataPath: 'expatriateWorkersRate',
  });
  const getResponsive = useResponsive();
  const intl = useIntl();

  const formattedData = useMemo(() => {
    return (value?.data?.expatriateWorkersRate || []);
  }, [value?.data?.expatriateWorkersRate]);

  const filteredData = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(formattedData);
    }

    return (formattedData || [])?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "sector_ar" : "sector_en"])
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedData, appliedSearchText])
  
  useEffect(() => {
    if (searchText) {
      setSearchText(undefined)
    }
    if (appliedSearchText) {
      setAppliedSearchText(undefined)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={setAppliedSearchText}
        appliedSearchText={appliedSearchText}
        setSearchText={setSearchText}
        searchText={searchText}
        data={formattedData || []}
      >
        {
          (d) => (
            <InputWrap
              data={_.uniqBy(d, isRtl ? "sector_ar" : "sector_en")}
              arKey="sector_ar"
              enKey="sector_en"
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

  const columns = [{
    title: intl?.formatMessage({ id: "Sector" }),
    width: getResponsive({ default: "50%", mobile: "155px" }),
    ellipsis: true,
    sorter: {
      compare: (a, b) => a?.[!isRtl ? "sector_en" : "sector_ar"]?.localeCompare(b?.[!isRtl ? "sector_en" : "sector_ar"]),
    },
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
                    tooltip: v?.[!isRtl ? "sector_en" : "sector_ar"]
                  }}
                >
                  {v?.[!isRtl ? "sector_en" : "sector_ar"]}
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
    title: intl?.formatMessage({ id: "Total Workers" }),
    width: getResponsive({ default: "50%" }),
    sorter: {
      compare: (a, b) => a?.expats_employees - b?.expats_employees,
    },
    render: (v) => {
      const percent = v?.expatriate_workers_rate?.toFixed(2);
      
      return (
        <Row align="middle" gutter={getResponsive({ default: [12], tablet: [0, 0], midTablet: [12], mobile: [0, 0] })}>
          <Col flex={getResponsive({ default: "0 0 95px", mobile: "0 0 95px" })}>
            <Text
              ellipsis={{
                tooltip: v?.expats_employees ? formatNumber(v?.expats_employees) : '-'
              }}
            >
              {v?.expats_employees ? formatNumber(v?.expats_employees) : '-'}
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
    isEmpty,
    status,
    chartName,
    columns,
    appliedSearchText,
  };
}

export default useEmploymentDistribution; 