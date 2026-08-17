import { useMemo, useContext, useState, useEffect } from "react";
import { getCrimeNationalityStatistics } from "@/services/generalIndicatorsService";
import { Row, Col, Text, Progress, AntIcons, Avatar } from "re-usable-design-components"
import { useIntl } from "react-intl";
import Image from "next/image";
import _ from "lodash";
import { resolveTernary, checkRtl, formatNumber, getColorFromPercentage } from "@/utils/helper";
import { useBaseHook } from "../utils/hookUtils";
import useResponsive from "@/hooks/useResponsive";
import Flags from 'country-flag-icons/react/1x1';
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { TableFilterDropdown, InputWrap } from "@/components/TableFilterWidgets";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";

const { SearchOutlined } = AntIcons;

function FormatText(v) {
  return <Text>{`${v}%`}</Text>
}

function AllUAEImage() {
  return <Image width={24} height={24} alt="flag" src={"/All_Nationality.png"} />
}


function useCrimeNationality({ filters }) {
  const [localeStore] = useContext(LocaleContext);
  const { geoJsonObj } = useWorldGeoJSON();
  const isRtl = checkRtl(localeStore)
  const [searchText, setSearchText] = useState(undefined);
  const [appliedSearchText, setAppliedSearchText] = useState(undefined)
  
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getCrimeNationalityStatistics,
    filters,
    dataPath: 'nationalities',
  });
  const getResponsive = useResponsive();
  const intl = useIntl();
  const formattedData = useMemo(() => {
    return (value?.data?.nationalities || []);
  }, [value?.data?.nationalities]);

  const filteredData = useMemo(() => {
    if (!appliedSearchText?.length) {
      return _.cloneDeep(formattedData);
    }

    return (formattedData || [])?.filter((v) => {
      return appliedSearchText?.includes(v?.[isRtl ? "name_ar" : "name_en"])
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
              data={_.uniqBy(d, isRtl ? "name_ar" : "name_en")}
              arKey="name_ar"
              enKey="name_en"
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
    title: intl?.formatMessage({ id: "Country" }),
    width: getResponsive({ default: "50%", mobile: "155px" }),
    ellipsis: true,
    sorter: {
      compare: (a, b) => a?.[!isRtl ? "name_en" : "name_ar"]?.localeCompare(b?.[!isRtl ? "name_en" : "name_ar"]),
    },
    render: (v) => {
      const country = geoJsonObj[v?.code]?.properties?.["iso-a2"];
      const Comp = Flags[country] || AllUAEImage;

      return (
        <Row>
          <Col
            paddingInline={resolveTernary(isRtl, "0px 16px", "0 16px")}
          >
            <Row align="middle" wrap={false} gutter={8}>
              <Col flex="none">
                <Avatar
                  size={16}
                  style={{
                    borderRadius: "4px"
                  }}
                  shape="square"
                  src={<Comp />}
                />
              </Col>
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
    sorter: {
      compare: (a, b) => a?.count - b?.count,
    },
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
    isEmpty,
    status,
    chartName,
    columns,
    appliedSearchText,
  };
}

export default useCrimeNationality; 