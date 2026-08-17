import React, { useContext, useEffect } from "react";
import { Row, Col } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import PropTypes from "prop-types";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl } from "@/utils/helper";
import { getVisaViolationAgeGroup } from "@/services/borderViolationService";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import PlotlyChart from "@/components/PlotlyChart";

// Utility function to force desktop/default layout values when in preview mode
const patchedGetResponsive = (getResponsive, isPreview, isPreviewOpen) => {
  return (config) => {
    if (isPreview || isPreviewOpen) {
      // Force desktop/default values for layout-related props in preview mode
      return config.default || config.desktop || Object.values(config)[0];
    }
    return getResponsive(config);
  };
};

function ViolationsByAgeCategory({
  title = "",
  icon,
  filter,
  dateRange,
  isPreview
}) {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive()
  const patchedGetResponsiveFn = patchedGetResponsive(getResponsive, isPreview, false);
  const {
    execute: invokeApi,
    status: apiStatus,
    value,
  } = useAsync({ asyncFunction: getVisaViolationAgeGroup });

  const data = value?.data?.chart_data?.data;
  useEffect(() => {
    invokeApi({ filter: { ...filter, ...dateRange, language: isRtl ? "ar": "en" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange]);

  const isLoading = ["pending", "idle"]?.includes(apiStatus)

  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      cardBodyPadding={isLoading ? "var(--paddingPx)" : "0px"}
      cardBodyHeight={"calc(100% - 67px)"}
      title={title}
      style={{
        height: "100%"
      }}
      loading={isLoading}
      isEmpty={!data?.length}
      icon={icon}
      titleItemsWrapProps={{
        wrap: patchedGetResponsiveFn({ default: "false", mobile: "true" }) === "true",
        ...patchedGetResponsiveFn({ default: false, mobile: true }) && {
          style: {
            maxWidth: "77%",
            whiteSpace: "pre-wrap"
          }
        }
      }}
      isPreview={isPreview}
      isPreviewOpen={false}
    >
      <Row
        isFullHeight
      >
        <Col>
          <PlotlyChart
            data={data}
            layout={{
              showlegend: false, // This hides the legend
            }}
          />
        </Col>
      </Row>
    </ DashboardCard>
  )
}

ViolationsByAgeCategory.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any,
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
}

export default ViolationsByAgeCategory;
