import PropTypes from "prop-types"
import { useContext, useRef, useState } from "react";
import { theme, Tooltip as AntdTooltip } from "re-usable-design-components";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, resolveTernary } from "@/utils/helper";
const { useToken } = theme;
import dynamic from "next/dynamic";
import { renderTooltipTemplate } from "./renderTemplate";

const DynamicPlotChart = dynamic(
  () => import("react-plotly.js"),
  { ssr: false }
);

function getTheme(yAxisTitle, token, rest, isRtl) {
  const plotlyTheme = {
    font: {
      family: token?.fontFamily,
      size: 14,
      color: token?.colorText,
    },
    hoverlabel: {
      borderRadius: 6,
      bgcolor: token.tooltipBg,
      align: 'left',
      font: {
        family: "sf-pro-text",
        size: 12,
        color: token.colorTextLightSolid,
        nameLength: 0
      },
    },
    bargroupgap: 0.20,
    dragmode: false,
    xaxis: {
      ...isRtl ? { autorange: 'reversed' } : {},
      showline: true,
      fixedrange: true,
      automargin: true,
      zeroline: false,
      ticklen: 0,
      linewidth: 1,
      linecolor: token?.colorBorderSecondary,
      mirror: false,
      tickfont: { size: 12, color: token?.colorText },
      gridcolor: token?.colorBorderSecondary,
    },
    barcornerradius: 4,
    hoverinfo: 'skip',
    yaxis: {
      showline: true,
      zeroline: false,
      side: isRtl ? 'right': 'left',
      automargin: true,
      fixedrange: true,
      ticklen: 0,
      tickwidth: 0,
      linecolor: token?.colorBorderSecondary,
      linewidth: 1,
      mirror: false,
      tickfont: { size: 12, color: token?.colorText },
      title: { text: yAxisTitle, standoff: !yAxisTitle ? resolveTernary(isRtl, 32, 0) : resolveTernary(isRtl, 76, 24), font: { size: 14, color: token?.colorText } },
      gridcolor: token?.colorBorderSecondary,
      showgrid: !!rest?.showYAxisGridlines,
    },
    autosize: true,
    bargap: 0.4,
    legend: {
      itemclick: false,
      itemdoubleclick: false,
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
    },
    showlegend: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    margin: { l: 0, r: 0, t: 0, b: 0 },
  };
  return plotlyTheme;
}

const PlotlyChart = ({
  data,
  layout = {},
  config = {},
  yAxisTitle = "",
  customLegend = false,
  ...rest
}) => {
  const themeVariables = useToken();
  const chartContainerRef = useRef();
  const [anchorPos, setAnchorPos] = useState(null); // {x, y} or null
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const _layout = getTheme(yAxisTitle, themeVariables?.token, rest, isRtl);

  // Show tooltip at the given event position with the given content
  const showTooltip = (event, point) => {
    // Always close the tooltip before opening a new one
    setTooltipOpen(false);
    setTimeout(() => {
      const plotlyEvent = event.event;
      const container = chartContainerRef.current;
      const containerRect = container.getBoundingClientRect();
      let clientX = 0, clientY = 0;
      if (plotlyEvent.touches && plotlyEvent.touches.length > 0) {
        clientX = plotlyEvent.touches[0].clientX;
        clientY = plotlyEvent.touches[0].clientY;
      } else {
        clientX = plotlyEvent.clientX;
        clientY = plotlyEvent.clientY;
      }
      setAnchorPos({
        x: clientX - containerRect.left,
        y: clientY - containerRect.top
      });
      setTooltipContent(renderTooltipTemplate(point));
      setTooltipOpen(true);
    }, 0);
  };

  // Plotly hover handler
  const handleHover = (event) => {
    const point = event.points[0];
    showTooltip(event, point);
  };

  // Plotly click handler
  const handleClick = (event) => {
    const point = event.points[0];
    showTooltip(event, point);
  };

  // Plotly unhover handler (close tooltip)
  const handleUnhover = () => {
    setTooltipOpen(false);
  };

  // Hide tooltip when clicking anywhere else in the chart
  const handleChartClick = (e) => {
    if (chartContainerRef.current && !e.target.closest('#plotly-tooltip-anchor')) {
      setTooltipOpen(false);
    }
  };

  // Attach click listener to chart container
  useState(() => {
    const container = chartContainerRef.current;
    if (!container) return;
    container.addEventListener('mousedown', handleChartClick);
    return () => {
      container.removeEventListener('mousedown', handleChartClick);
    };
  }, []);

  return (
    <div ref={chartContainerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <DynamicPlotChart
        data={data}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        layout={{
          ..._layout,
          ...layout,
          yaxis: {
            ..._layout?.yaxis,
            ...(layout?.yaxis || {})
          },
        }}
        config={{
          displayModeBar: false,
          scrollZoom: false,
          ...config
        }}
        onHover={handleHover}
        onUnhover={handleUnhover}
        onClick={handleClick}
        {...rest}
      />
      {/* Single anchor for AntD Tooltip, positioned at last interaction */}
      <AntdTooltip
        open={tooltipOpen}
        title={<span dangerouslySetInnerHTML={{ __html: tooltipContent }} />}
        placement="top"
        getPopupContainer={() => chartContainerRef.current}
        arrow={true}
        overlayInnerStyle={{ maxWidth: 320, width: "max-content" }}
      >
        {anchorPos && (
          <div
            id="plotly-tooltip-anchor"
            style={{
              position: 'absolute',
              left: anchorPos.x,
              top: anchorPos.y,
              width: 0,
              height: 0,
              pointerEvents: 'none',
            }}
          />
        )}
      </AntdTooltip>
      {customLegend && data &&
        <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%'}}>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: '18px'}}>
            {data?.[0]?.labels?.map((label, index) => {
              const color = data[0].marker?.colors?.[index];
              return <div key={label + index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color || '#000',
                  }}
                ></div>
                <span style={{ fontSize: '14px'}}>{label}</span>
              </div>
            })}
          </div>
        </div>}
    </div>
  );
};

PlotlyChart.propTypes = {
  data: PropTypes.any,
  layout: PropTypes.any,
  config: PropTypes.any,
  yAxisTitle: PropTypes.any,
  customLegend: PropTypes.bool,
}

export default PlotlyChart;
