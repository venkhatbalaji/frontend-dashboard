import React, { useContext } from "react";
import PropTypes from "prop-types"
import dynamic from "next/dynamic";
import { legendsConfig } from "@/utils/highchartsConfig";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";

const DynamicLineChart = dynamic(
  () => import("re-usable-highchart-components").then((mod) => mod.LineChart),
  { ssr: false }
);


const valueProps = (isRtl) => ({
  chart: {
    type: 'line',
    // scrollablePlotArea: {
    //   minWidth: 700,
    //   scrollPositionX: 1
    // }
  },
  plotOptions: {
    series: {
      pointPlacement: "on",
      marker: {
        symbol: 'circle',
        fillColor: 'var(--brand-gold-6)',
        lineWidth: 0,
        radius: 4
      }
    },
  },
  isXAxisGridLine: true,
  isYAxisGridLine: true,
  isYAxisLine: true,
  legend: {
    ...legendsConfig,
    floating: false,
    rtl: isRtl
  },
});

const LineChart = ({ xAxis: _xAxis, yAxis: _yAxis, ...props }) => {
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
    <DynamicLineChart {...{...valueProps(isRtl), ...props, xAxis, yAxis}} />
  );
};

LineChart.propTypes = {
  xAxis: PropTypes.any,
  yAxis: PropTypes.any
}

export default LineChart;
