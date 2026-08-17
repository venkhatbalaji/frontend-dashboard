import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getCrimeRateStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useCrimeRate({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getCrimeRateStatistics,
    filters,
    dataPath: 'crimeRatePerMillion',
    chartNameId: 'Crime Rate'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.crimeRatePerMillion || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.crimeRatePerMillion]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisText: intl?.formatMessage({ id: "per 100,000" }),
    axisValue: `${value?.data?.currentCrimeRateChange || 0}`,
  };
}

export default useCrimeRate; 