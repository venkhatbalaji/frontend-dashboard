import { useEffect } from "react";
import useAsync from "@/hooks/useAsync";
import { useIntl } from "react-intl";
import _ from "lodash";
import PropTypes from "prop-types";

export const useBaseHook = ({ asyncFunction, filters, dataPath, chartNameId }) => {
  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction });

  useEffect(() => {
    if (filters) {
      execute({ filters: { ...filters } })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const isLoading = ["idle", "pending"]?.includes(status);
  const intl = useIntl();

  return {
    isLoading,
    value,
    isEmpty: !isLoading && !_.get(value?.data, dataPath)?.length,
    status,
    chartName: chartNameId ? intl?.formatMessage({ id: chartNameId }) : ""
  };
};

useBaseHook.propTypes = {
  asyncFunction: PropTypes.any,
  filters: PropTypes.any,
  dataPath: PropTypes.any,
  chartNameId: PropTypes.any
};

useBaseHook.defaultProps = {
  asyncFunction: null,
  filters: {},
  dataPath: '',
  chartNameId: ''
};

export default useBaseHook; 