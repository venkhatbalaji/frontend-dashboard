import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getMigrationRateStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useMigrationRate({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getMigrationRateStatistics,
    filters,
    dataPath: 'migrationRate',
    chartNameId: 'Migration Rate (Per 1,000)'
  });

  const formattedData = useMemo(() => {
    return (value?.data?.migrationRate || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.migrationRate]);

  return {
    isLoading,
    data: formattedData,
    isEmpty,
    status,
    chartName,
    axisValue: value?.data?.currentRateChange,
    axisText: intl?.formatMessage({ id: "per 1,000" })
  };
}

export default useMigrationRate;
