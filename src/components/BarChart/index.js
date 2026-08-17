import PropTypes from "prop-types"
import React, { useContext } from "react";
import dynamic from "next/dynamic";
import { plotOptionsConfig } from "@/utils/highchartsConfig";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";

const DynamicBarChart = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.BarChart),
  { ssr: false }
);


const valueProps = {
  type: 'basicBar',
  isXAxisGridLine: false,
  isYAxisGridLine: true,
  plotOptions: {
    ...plotOptionsConfig
  }
};

function BarChart ({ xAxis: _xAxis, yAxis: _yAxis, ...props }) {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)

  const xAxis = {
    opposite: isRtl,
    ..._xAxis
  }

  const yAxis = {
    reversed: isRtl,
    tickAmount: 6,
    allowDecimals: false,
    ..._yAxis
  }
  return (
    <DynamicBarChart {...{...valueProps, xAxis, yAxis, ...props}} />
  );
};

BarChart.propTypes = {
  xAxis: PropTypes.any,
  yAxis: PropTypes.any
}

export default BarChart;
