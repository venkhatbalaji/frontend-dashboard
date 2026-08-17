import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getExpatriateWorkerStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useExpatriateWorker({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getExpatriateWorkerStatistics,
    filters,
    dataPath: 'ExpatriateWorkerRatio',
    chartNameId: 'Expatriate Worker Ratio %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.ExpatriateWorkerRatio || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.ExpatriateWorkerRatio]);

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

export default useExpatriateWorker; 