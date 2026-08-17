import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getUnemploymentRateStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useUnemploymentRate({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getUnemploymentRateStatistics,
    filters,
    dataPath: 'unemploymentRate',
    chartNameId: 'Unemployment Rate %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.unemploymentRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.unemploymentRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisText: intl?.formatMessage({ id: "Current" }),
    axisValue: `${value?.data?.currentUnemploymentChange || 0}%`,
  };
}

export default useUnemploymentRate; 