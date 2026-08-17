import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getFertilityRateStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useFertilityRate({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getFertilityRateStatistics,
    filters,
    dataPath: 'fertilityRate',
    chartNameId: 'Fertility Rate'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.fertilityRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.fertilityRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisValue: `${value?.data?.currentRateChange || 0}`,
    axisText: intl?.formatMessage({ id: "Children per Woman" })
  };
}

export default useFertilityRate;
