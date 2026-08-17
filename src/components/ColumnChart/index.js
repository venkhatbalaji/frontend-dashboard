import PropTypes from "prop-types"
import React, { useContext } from "react";
import dynamic from "next/dynamic";
import { plotOptionsConfig, legendsConfig } from "@/utils/highchartsConfig";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";
  

const DynamicColumnChart = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.ColumnChart),
  { ssr: false }
);


const valueProps = (isRtl) => ({
  type: 'column',
  isXAxisGridLine: false,
  isYAxisGridLine: true,
  plotOptions: {
    ...plotOptionsConfig
  },
  legend: {
    ...legendsConfig,
    floating: false,
    rtl: isRtl,
  }
});

const ColumnChart = ({ xAxis: _xAxis, yAxis: _yAxis, ...props }) => {
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)

  const xAxis = {
    reversed: isRtl,
    ..._xAxis
  }

  const yAxis = {
    opposite: isRtl,
    ..._yAxis
  }
  return (
    <DynamicColumnChart {...{...valueProps(isRtl), xAxis, yAxis, ...props}} />
  );
};

ColumnChart.propTypes = {
  xAxis: PropTypes.any,
  yAxis: PropTypes.any
}

export default ColumnChart;
