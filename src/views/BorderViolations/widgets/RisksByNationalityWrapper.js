import PropTypes from "prop-types"
import { useContext, useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { checkRtl } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import RisksByNationality from "./RisksByNationality";
import useResponsive from "@/hooks/useResponsive";
import { getAllEmirates, getRiskByNationality } from "@/services/riskDashboardService";
import getCountryISO2 from 'country-iso-3-to-2';


function RisksByNationalityWrapper({
  filters,
  icon,
  title,
  dateRange,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden,
  pageRef
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [showBy, setShowBy] = useState(isPreview ? pageRef?.current?.risksByNationality?.showBy : 0);
  const getResponsive = useResponsive();

  useEffect(() => {
    pageRef.current.risksByNationality = {
      ...pageRef.current.risksByNationality,
      showBy
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBy]);

  const {
    execute: invokeGetAllEmirates,
    status: getAllEmiratesStatus,
    value: emiratesList,
  } = useAsync({ asyncFunction: getAllEmirates});

  const {
    execute: invokeGetRiskByNationality,
    status: getRiskByNationalityStatus,
    value: riskByNationality,
  } = useAsync({ asyncFunction: getRiskByNationality });

  useEffect(() => {
    const _filters = _.cloneDeep(filters);
    delete _filters?.emirates;
    invokeGetAllEmirates({
      filter: {
        ..._filters,
        emirate: [0],
        ...dateRange
      },
    });
  }, [filters, invokeGetAllEmirates, dateRange]);

  useEffect(() => {
    invokeGetRiskByNationality({
      filter: {
        emirate: showBy,
        nationality: filters.nationality,
        risks: filters.risks,
        ...dateRange,
      },
    });
  }, [showBy, filters, invokeGetRiskByNationality, dateRange]);

  const isLoadingTabs = getAllEmiratesStatus === "pending" || getAllEmiratesStatus === "idle";

  useEffect(() => {
    if (!isLoadingTabs) {
      const isAllDisabled = filters?.emirates?.length && filters?.emirates?.length !== 7;
      if (isAllDisabled) {
        const emirate = (emiratesList?.data?.emirates || [])?.find((v) => {
          return filters?.emirates?.find((e) => e == v?.code)
        });

        if (emirate && !isPreview) {
          setShowBy((emirate?.code))
        }
        // (emirate?.code != 0 && filter?.emirate_code?.length ? !(filter?.emirate_code || [])?.find((v) => v == emirate?.code) : false) ? "-" : formatNumber(emirate?.total)
      } else if (!isPreview) {
        setShowBy(0)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isLoadingTabs]);

  const isLoading =
    getRiskByNationalityStatus === "idle" ||
    getRiskByNationalityStatus === "pending" ||
    isLoadingTabs;

  const { data, totalData } = useMemo(() => {
    if (getRiskByNationalityStatus !== "success") {
      return {}
    }
    return {
      data: riskByNationality?.data?.nationalities?.map((item) => ({
        "iso-a2": getCountryISO2(item?.code),
        "iso-a3": item?.code,
        label: isRtl
          ? item?.name_ar
          : item?.name_en,
        value: item?.total || 0,
        ...item
      })),
      totalData: emiratesList?.data?.emirates?.[showBy]?.total || 0,
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskByNationality?.data?.nationalities, showBy, emiratesList?.data?.emirates])

  return (
    <RisksByNationality
      icon={icon}
      filters={filters}
      geoJsonObj={geoJsonObj}
      title={title}
      pageRef={pageRef}
      showBy={showBy}
      mapTooltipTitle={intl?.formatMessage({ id: "Total Risks" })}
      setShowBy={setShowBy}
      isLoading={isLoading}
      scrollY={getResponsive({ default: 455, tablet: 345 })}
      isLoadingTabs={isLoadingTabs}
      data={isPreview ? (data || [])?.slice(0, 20) : data}
      emiratesList={emiratesList?.data?.emirates || []}
      totalCount={totalData}
      isPreview={isPreview}
      space={space}
      isPrint={isPrint}
      rows={rows}
      offset={offset}
      callback={callback}
      isTableHidden={isTableHidden}
      isMapHidden={isMapHidden}
    />
  );
}

RisksByNationalityWrapper.propTypes = {
  filters: PropTypes.any,
  pageRef: PropTypes.any,
  icon: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any
}

export default RisksByNationalityWrapper;
