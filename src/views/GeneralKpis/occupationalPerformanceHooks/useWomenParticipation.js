import { useMemo } from "react";
import { useIntl } from "react-intl";
import { getWomenParticipationStatistics } from "@/services/generalIndicatorsService";
import { useBaseHook } from "../utils/hookUtils";

function useWomenParticipation({ filters }) {
  const intl = useIntl();
  const { isLoading, value, isEmpty, status, chartName } = useBaseHook({
    asyncFunction: getWomenParticipationStatistics,
    filters,
    dataPath: 'womenWorkforceParticipation',
    chartNameId: `Women's Workforce Participation %`
  });

  const formattedData = useMemo(() => {
    return (value?.data?.womenWorkforceParticipation || [])?.reduce((acc, v) => {
      acc?.values?.push(v?.rate);
      acc?.categories?.push(v?.period);
      return acc;
    }, { categories: [], values: [] });
  }, [value?.data?.womenWorkforceParticipation]);

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

export default useWomenParticipation; 