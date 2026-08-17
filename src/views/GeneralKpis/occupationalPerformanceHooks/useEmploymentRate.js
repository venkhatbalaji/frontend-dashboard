import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getEmploymentRateStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useEmploymentRate({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getEmploymentRateStatistics,
    filters,
    dataPath: 'employmentRate',
    chartNameId: 'Employment Rate %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.employmentRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.employmentRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisText: intl?.formatMessage({ id: "Current" }),
    axisValue: `${value?.data?.currentEmploymentRateChange || 0}%`,
  };
}

export default useEmploymentRate; 