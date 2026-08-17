import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getCrimeFrequencyStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useCrimeFrequency({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getCrimeFrequencyStatistics,
    filters,
    dataPath: 'crimeFrequencyRate',
    chartNameId: 'Criminal Frequency Rate %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.crimeFrequencyRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.crimeFrequencyRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisText: intl?.formatMessage({ id: "Current" }),
    axisValue: `${value?.data?.currentRateChange || 0}%`,
  };
}

export default useCrimeFrequency; 