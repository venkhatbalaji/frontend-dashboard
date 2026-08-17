import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getCareerTransferStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useEconomicSector({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getCareerTransferStatistics,
    filters,
    dataPath: 'careerTransferRate',
    chartNameId: 'Career Transfer Rate %'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.careerTransferRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.careerTransferRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisText: intl?.formatMessage({ id: "Current" }),
    axisValue: `${value?.data?.currentTransferRate || 0}%`,
  };
}

export default useEconomicSector; 