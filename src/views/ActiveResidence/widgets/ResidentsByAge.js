import PropTypes from "prop-types"
import { Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import AgeRange from "@/svgr/AgeRange"
import BarChart from "@/components/BarChart";
import { useEffect } from "react";
import useAsync from "@/hooks/useAsync";
import { getResidentsByAgeRange } from "@/services/activeResidenceService";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { formatNumber } from "@/utils/helper";


const { Info } = PhosphorIcons;

function getTooltip(isRtl, intl) {
  return function () {
    return `
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}; direction: ${isRtl ? "rtl" : "ltr"}">
      ${intl?.formatMessage({ id: "Age Range" })}: <span style="font-weight: bold;">${this?.key}</span>
    </div>
    <div style="font-family: var(--fontFamily); text-align: ${isRtl ? "right" : "left"}">
      ${intl?.formatMessage({ id: "Value" })}: <span style="font-weight: bold;">${_.isNumber(this?.point?.y) ? formatNumber(this?.point?.y) : '-'}</span>
    </div>
  `;
  }
}

const sortAgeRange = (data) => {
  if (!data) return [];
  return _.cloneDeep(data).sort((a, b) => {
    const aPlus = a.age_range.includes('+');
    const bPlus = b.age_range.includes('+');
    if (aPlus && bPlus) return 0;
    if (aPlus) return 1; // a goes after b
    if (bPlus) return -1; // b goes after a

    // Both are ranges like "0-18"
    const aStart = Number(a.age_range.split('-')[0]);
    const bStart = Number(b.age_range.split('-')[0]);
    return aStart - bStart;
  }).reverse(); // Reverse the sorted array
};

function ResidentsByAge({ filters, isRtl }) {
  const intl = useIntl();
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsByAgeRange });

  useEffect(() => {
    execute({ filters: { ...filters } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const data = value?.data || [];

  const sortedData = sortAgeRange(data);

  const isLoading = ["idle", "pending"]?.includes(status);
  const isEmpty = !isLoading && !data?.length;

  const { values, categories } = (sortedData || []).reduce((acc, val) => {
    acc.values?.[0]?.data?.push(val?.count);
    acc.categories?.push(val?.age_range);
    return acc;
  }, {
    values: [{
      data: [],
      showInLegend: false,
      color: "var(--custom-gold-1)"
    }],
    categories: []
  });

  const props = {
    categories: categories,
    chart: {
      type: 'bar',
      marginLeft: isRtl ? 0 : undefined,  // for RTL
    },
    values,
    xAxis: {
      title: {
        text: intl?.formatMessage({ id: "Age Range" }),
        offset: 75,
        style: {
          color: 'var(--colorText)', // Set the title color to red
          fontSize: 'var(--fontSizePx)', // Set the font size
        }
      }
    },
    tooltip: {
      formatter: getTooltip(isRtl, intl),
      ...tooltipConfig,
    },
  };
  
  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      title={
        <Row align="middle" gutter={4}>
          <Col flex="auto" style={{ maxWidth: window?.innerWidth < 400 ? "calc(100% - 30px)" : "100%", whiteSpace: "break-spaces" }}>
            <span style={{ position: "relative" }}>
              {intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "Residents & Visa Holders By Age" : filters?.residents_category === 'visa' ? "Visa Holder by Age" : "Residents By Age" })}
              <span
                style={{ position: "absolute", ...isRtl ? { left: "-20px" } : { right: "-20px" }, bottom: isRtl ? "4px" : "-2px" }}
              >
                <Tooltip
                  title={intl?.formatMessage({ id: (!filters?.residents_category || filters?.residents_category === 'visa_and_residency') ? "residents_visa_holders_age_tooltip" : filters?.residents_category === 'visa' ? "active_visa_holders_age_tooltip" : "active_residence_residency_age_tooltip" })}
                >
                  <span>
                    <Info style={{ marginBottom: "0px" }} color="var(--colorIcon)" size={14} weight="bold" />
                  </span>
                </Tooltip>
              </span>
            </span>
          </Col>
        </Row>
      }
      
      icon={<AgeRange />}
      loading={isLoading}
      bodyWrapStyle={{
        padding: '0px'
      }}
      isEmpty={isEmpty}
    >
      <Row isFullHeight>
        <Col>
          <BarChart {...props} />
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsByAge.propTypes = {
  filters: PropTypes.any,
  isRtl: PropTypes.any,
}

export default ResidentsByAge;