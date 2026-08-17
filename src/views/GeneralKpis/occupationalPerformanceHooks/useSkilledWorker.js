import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getSkilledWorkerStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useSkilledWorker({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getSkilledWorkerStatistics,
    filters,
    dataPath: 'skilledWorkerRatio',
    chartNameId: 'Skilled Worker Ratio %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.skilledWorkerRatio || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.skilledWorkerRatio]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisText: intl?.formatMessage({ id: "Current" }),
    axisValue: `${value?.data?.currentRatioChange || 0}%`,
  };
}

export default useSkilledWorker; 