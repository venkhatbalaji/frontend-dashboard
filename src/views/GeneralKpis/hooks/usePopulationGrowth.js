import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getPopulationGrowth } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function usePopulationGrowth({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getPopulationGrowth,
    filters,
    dataPath: 'populationGrowthRate',
    chartNameId: 'Growth Rate %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.populationGrowthRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.populationGrowthRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisValue: `${value?.data?.currentGrowthRateChange || 0}%`,
    axisText: intl?.formatMessage({ id: "vs. last Year" })
  };
}

export default usePopulationGrowth;
