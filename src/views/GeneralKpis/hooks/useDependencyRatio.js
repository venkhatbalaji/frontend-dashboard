import { useEffect, useMemo } from "react";
import useAsync from "@/hooks/useAsync";
import { useIntl } from "react-intl";
import { getRatioStatistics } from "@/services/generalIndicatorsService";


function useDependencyRatio({ filters }) {
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getRatioStatistics });

  useEffect(() => {
    execute({ filters: { ...filters } })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])
  const isLoading = ["idle", "pending"]?.includes(status);
  const intl = useIntl();

  const formattedData = useMemo(() => {
    return (value?.data?.dependencyRatio || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] })
  }, [value?.data?.dependencyRatio])

  return {
    isLoading: isLoading,
    data: formattedData,
    isEmpty: !isLoading && !value?.data?.dependencyRatio?.length,
    status,
    chartName: intl?.formatMessage({ id: "Dependency Ratio %" }),
    axisText: intl?.formatMessage({ id: "Current" }),
    axisValue: `${value?.data?.currentRateChange || 0}%`,
  }
}

export default useDependencyRatio;
