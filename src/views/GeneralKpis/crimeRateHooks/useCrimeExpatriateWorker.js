import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getCrimeExpatriateWorkerStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useCrimeExpatriateWorker({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getCrimeExpatriateWorkerStatistics,
    filters,
    dataPath: 'expatriateWorkerCrimeRate',
    chartNameId: 'Expatriate Workers Crime Rate %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.expatriateWorkerCrimeRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.expatriateWorkerCrimeRate]);

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

export default useCrimeExpatriateWorker; 