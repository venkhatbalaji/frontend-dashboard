import PropTypes from "prop-types";
import { useContext, useEffect, useMemo, useCallback, useState } from "react";
import { Row, Col, theme, PhosphorIcons, Tooltip } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import useResponsive from "@/hooks/useResponsive";
import { checkRtl, formatNumber, resolveTernary, formatChartDateLabel, getColorByIndex } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import { getBorderMovementsTrendAnalysis } from "@/services/borderMovementService";
import LineChart from "@/components/LineChart";
import { tooltipConfig, legendsConfig } from "@/utils/highchartsConfig";
import Segmented from "@/components/Segmented";

const { useToken } = theme;
const { Info, ChartLineUp } = PhosphorIcons;

const LINE_COLOR = "var(--brand-gold-6)";
const BORDER_TYPE_TAB_ORDER = ["air", "sea", "land"];
const GRANULARITY_OPTIONS = { MONTH: "month", YEAR: "year" };

// Helper: create marker config (filled by default when single point, else show on hover)
const createMarker = (color, showByDefault = false) => ({
  enabled: showByDefault,
  symbol: "circle",
  lineColor: color,
  fillColor: color,
  lineWidth: 2,
  ...(!showByDefault && {
    states: {
      hover: { enabled: true },
    },
  }),
});

// Helper: create series pair (entries solid + exits dashed)
const createSeriesPair = (name, entriesData, exitsData, color, showInLegend = true, isSinglePoint = false) => {
  const marker = createMarker(color, isSinglePoint);
  return [
    { name, data: entriesData, color, dashStyle: "Solid", showInLegend, connectNulls: true, marker },
    { name: "", data: exitsData, color, dashStyle: "Dash", showInLegend: false, connectNulls: true, marker },
  ];
};

// Helper: sort categories chronologically
const sortCategories = (categories) => {
  return [...categories].sort((a, b) => {
    const yearA = parseInt(a, 10);
    const yearB = parseInt(b, 10);
    return !isNaN(yearA) && !isNaN(yearB) ? yearA - yearB : new Date(a) - new Date(b);
  });
};

// Helper: get localized name
const getLocalizedName = (item, enKey, arKey, isRtl) => (isRtl ? item[arKey] : item[enKey]) || item[enKey];

/**
 * Build Highcharts data from API response.
 * Driven by global filter.port_type: none = "All Ports" aggregated; one/multiple = filter by those types.
 * getBorderTypeLabel(key) maps AIR/SEA/LAND to "All Airports"/"All Seaports"/"All Land Borders".
 */
function buildHighchartsData(apiData, granularity, isRtl, portTypes, getBorderTypeLabel) {
  const { by_border_type: byBorderType, by_port: byPort, granularity: apiGran } = apiData || {};
  const isMonthly = (apiGran || granularity) === "month";
  const format = (t) => formatChartDateLabel(t, isMonthly);
  const portTypeArray = Array.isArray(portTypes) ? portTypes : (portTypes ? [portTypes] : []);
  const getLabel = getBorderTypeLabel || ((key) => key);

  // Collect all categories from items
  const collectCategories = (items) => {
    const cats = new Set();
    items?.forEach((item) => item.trend?.forEach((t) => cats.add(format(t))));
    return sortCategories([...cats]);
  };

  // Build data map from trend array
  const buildDataMap = (trend) => {
    const map = {};
    trend?.forEach((t) => { map[format(t)] = { entries: t.entries || 0, exits: t.exits || 0 }; });
    return map;
  };

  // Handle ports - each port gets separate series
  if (byPort?.length) {
    const categories = collectCategories(byPort);
    const isSinglePoint = categories.length === 1;
    const series = byPort.flatMap((port, i) => {
      const dataMap = buildDataMap(port.trend);
      return createSeriesPair(
        getLocalizedName(port, "port_name_en", "port_name_ar", isRtl),
        categories.map((c) => dataMap[c]?.entries ?? null),
        categories.map((c) => dataMap[c]?.exits ?? null),
        getColorByIndex(i),
        true,
        isSinglePoint
      );
    });
    return { categories, series };
  }

  // Handle border types - driven by global filter.port_type
  if (byBorderType?.length) {
    const ordered = [...byBorderType].sort((a, b) => {
      const ia = BORDER_TYPE_TAB_ORDER.indexOf((a.border_type || "").toLowerCase());
      const ib = BORDER_TYPE_TAB_ORDER.indexOf((b.border_type || "").toLowerCase());
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    // No port type selected: use all types (accumulated). Multiple selected: filter to those.
    const selectedKeys = portTypeArray.map((p) => (p || "").toUpperCase()).filter(Boolean);
    const filtered =
      selectedKeys.length === 0
        ? ordered
        : ordered.filter((item) => selectedKeys.includes((item.border_type || "").toUpperCase()));

    const categories = collectCategories(filtered);
    const isSinglePoint = categories.length === 1;

    // Multiple port types selected: one series per type (like ports)
    if (selectedKeys.length > 1 && filtered.length > 0) {
      const series = filtered.flatMap((item, i) => {
        const dataMap = buildDataMap(item.trend);
        const name = getLabel(item.border_type) || getLocalizedName(item, "border_type_en", "border_type_ar", isRtl);
        return createSeriesPair(
          name,
          categories.map((c) => dataMap[c]?.entries ?? null),
          categories.map((c) => dataMap[c]?.exits ?? null),
          getColorByIndex(i),
          true,
          isSinglePoint
        );
      });
      return { categories, series };
    }

    // None or one port type: single aggregated series
    const aggregated = Object.fromEntries(categories.map((c) => [c, { entries: 0, exits: 0 }]));
    filtered.forEach((item) => {
      item.trend?.forEach((t) => {
        const cat = format(t);
        if (aggregated[cat]) {
          aggregated[cat].entries += t.entries || 0;
          aggregated[cat].exits += t.exits || 0;
        }
      });
    });

    const seriesName =
      selectedKeys.length === 0
        ? "" // "All Ports" applied in component from intl
        : filtered[0]
          ? (getLabel(filtered[0].border_type) || getLocalizedName(filtered[0], "border_type_en", "border_type_ar", isRtl))
          : "";
    const series = createSeriesPair(
      seriesName,
      categories.map((c) => aggregated[c]?.entries ?? null),
      categories.map((c) => aggregated[c]?.exits ?? null),
      LINE_COLOR,
      true,
      isSinglePoint
    );
    return { categories, series };
  }

  return { categories: [], series: [] };
}

const patchedGetResponsive = (getResponsive, isPreview) => (config) =>
  isPreview ? config.default || config.desktop || Object.values(config)?.[0] : getResponsive(config);

// Tooltip per entity: when hovering over a point, show tooltip for that entity only
// (Entries + Exits + Total). Uses shared: false and finds the paired series.
const getEntityTooltip = (isRtl, intl) => function () {
  const align = resolveTernary(isRtl, "right", "left");
  const dir = isRtl ? "rtl" : "ltr";
  const point = this?.point;
  const series = point?.series;
  const chart = series?.chart;
  const seriesIndex = series?.index ?? 0;
  const pointIndex = point?.index ?? 0;

  // Entries series are at even indices (0, 2, 4...), exits at odd (1, 3, 5...)
  const isEntriesSeries = seriesIndex % 2 === 0;
  const entriesSeriesIndex = isEntriesSeries ? seriesIndex : seriesIndex - 1;
  const exitsSeriesIndex = entriesSeriesIndex + 1;

  const entriesSeries = chart?.series?.[entriesSeriesIndex];
  const exitsSeries = chart?.series?.[exitsSeriesIndex];
  const entityName = entriesSeries?.name || "";
  const entries = entriesSeries?.data?.[pointIndex]?.y ?? 0;
  const exits = exitsSeries?.data?.[pointIndex]?.y ?? 0;
  const total = entries + exits;

  const entriesLabel = intl?.formatMessage({ id: "Entries" }) || "Entries";
  const exitsLabel = intl?.formatMessage({ id: "Exits" }) || "Exits";
  const totalLabel = intl?.formatMessage({ id: "Total" }) || "Total";

  return `
    <div style="font-family: var(--fontFamily); text-align: ${align}; direction: ${dir}">
      <div><b>${this?.x ?? this?.key}</b></div>
      <div style="margin-top: 8px;">
        <div><b>${entityName}</b></div>
        <div>${entriesLabel}: <b>${formatNumber(entries)}</b></div>
        <div>${exitsLabel}: <b>${formatNumber(exits)}</b></div>
        <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 4px; margin-top: 4px;">${totalLabel}: <b>${formatNumber(total)}</b></div>
      </div>
    </div>
  `;
};

function BorderMovementsTrend({ filter, dateRange, isPreview, title }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const getResponsive = useResponsive();
  const patchedGetResponsiveFn = patchedGetResponsive(getResponsive, isPreview);
  const themeVariables = useToken();
  const [granularity, setGranularity] = useState(GRANULARITY_OPTIONS.MONTH);
  const portTypes = filter?.port_type;

  const granularityOptions = useMemo(() => [
    { value: GRANULARITY_OPTIONS.MONTH, label: intl?.formatMessage({ id: "Monthly" }) },
    { value: GRANULARITY_OPTIONS.YEAR, label: intl?.formatMessage({ id: "Yearly" }) },
  ], [intl]);

  const {
    execute: invokeTrendAnalysis,
    status: trendStatus,
    value: trendValue,
  } = useAsync({ asyncFunction: getBorderMovementsTrendAnalysis });

  // httpService.get returns response.data (API body: { filters, data })
  const apiData = trendValue?.data;

  useEffect(() => {
    const filterPayload = {
      ...filter,
      ...dateRange,
      granularity,
      language: isRtl ? "ar" : "en",
    };
    invokeTrendAnalysis({ filter: filterPayload });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dateRange, granularity, isRtl]);

  const hasPortsSelected = filter?.ports_code?.length > 0;
  const portTypeArray = Array.isArray(portTypes) ? portTypes : (portTypes ? [portTypes] : []);

  // Chart title label: none = "All Ports", one type = "All Airports" etc, multiple = no suffix
  const chartTitleLabel = useMemo(() => {
    if (hasPortsSelected) return "";
    if (portTypeArray.length === 0) return intl?.formatMessage({ id: "All Ports" }) || "All Ports";
    if (portTypeArray.length === 1) {
      const labelMap = {
        AIR: intl?.formatMessage({ id: "All Airports" }),
        SEA: intl?.formatMessage({ id: "All Seaports" }),
        LAND: intl?.formatMessage({ id: "All Land Borders" }),
      };
      return labelMap[(portTypeArray[0] || "").toUpperCase()] || "";
    }
    return "";
  }, [hasPortsSelected, portTypeArray, intl]);

  // Map AIR/SEA/LAND to "All Airports"/"All Seaports"/"All Land Borders"
  const getBorderTypeLabel = useCallback(
    (key) => {
      const map = {
        AIR: intl?.formatMessage({ id: "All Airports" }),
        SEA: intl?.formatMessage({ id: "All Seaports" }),
        LAND: intl?.formatMessage({ id: "All Land Borders" }),
      };
      return map[(key || "").toUpperCase()] || "";
    },
    [intl]
  );

  const chartData = useMemo(() => {
    const data = buildHighchartsData(apiData, granularity, isRtl, portTypes, getBorderTypeLabel);
    let series = data?.series || [];

    // When no port type selected (All Ports) or single type: apply chart title label as first series name
    if (!hasPortsSelected && chartTitleLabel && series.length > 0) {
      series = series.map((s, i) => (i === 0 ? { ...s, name: chartTitleLabel } : s));
    }

    // Center single data point by padding categories and series data
    if (data?.categories?.length === 1) {
      return {
        categories: ["", data.categories[0], ""],
        series: series.map((s) => ({
          ...s,
          data: [null, ...(s.data || []), null],
        })),
      };
    }
    return { ...data, series };
  }, [apiData, granularity, isRtl, portTypes, hasPortsSelected, chartTitleLabel, getBorderTypeLabel]);

  const isLoading = ["idle", "pending"].includes(trendStatus);
  const isEmpty = !isLoading && (!chartData?.series?.length || !chartData?.categories?.length);

  const chartTitle = title || `${intl?.formatMessage({ id: "Trend Chart" })}${chartTitleLabel ? ` - ${chartTitleLabel}` : ""}`;

  // Tooltip per entity: hovering a point shows tooltip for that entity only (Entries + Exits + Total)
  const tooltipConfigForChart = {
    ...tooltipConfig,
    shared: false,
    outside: true,
    formatter: getEntityTooltip(isRtl, intl),
    crosshairs: [{ width: 2, color: "var(--colorTextTertiary, rgba(0, 0, 0, 0.45))", dashStyle: "Dash" }],
  };

  return (
    <DashboardCard
      bodyBackgroundColor="transparent"
      cardBodyHeight={patchedGetResponsiveFn({ default: "614px", })}
      title={
        <Row wrap={false} gutter={[4]} align="middle">
          <Col flex="none">
            {chartTitle}
          </Col>
        </Row>
      }
      icon={<ChartLineUp size={32} />}
      loading={isLoading}
      isEmpty={isEmpty}
      cardBodyPadding={isLoading ? "var(--paddingLGPx)" : "0px"}
      titleItemsWrapProps={{
        wrap: patchedGetResponsiveFn({ default: "false", mobile: "true" }) === "true",
        ...(patchedGetResponsiveFn({ default: false, mobile: true }) && {
          style: { maxWidth: "77%", whiteSpace: "pre-wrap" },
        }),
      }}
      isPreview={isPreview}
      isPreviewOpen={false}
      action={
        !isPreview && (
          <Segmented
            size="small"
            value={granularity}
            onChange={setGranularity}
            options={granularityOptions}
          />
        )
      }
    >
      <Row className="border-movements-trend-chart" style={{ padding: "12px 0px 4px 0px", height: "100%", overflow: "visible", flex: "1 1 auto", minHeight: 0 }}>
        <Col span={24} style={{ height: "100%", overflow: "visible" }}>
          <LineChart
            xAxis={{
              categories: chartData?.categories,
              type: "category",
              gridLineWidth: 0,
              labels: {
                rotation: isRtl ? 45 : -45,
                style: {
                  fontFamily: "var(--fontFamily)",
                  fontSize: "12px",
                  color: "var(--colorText)",
                  whiteSpace: "nowrap",
                },
              },
            }}
            yAxis={{
              title: {
                text: "",
              },
              allowDecimals: false,
              labels: {
                style: {
                  fontFamily: "var(--fontFamily)",
                  fontSize: "12px",
                  color: "var(--colorText)",
                },
              },
            }}
            legend={{ enabled: false }}
            tooltip={tooltipConfigForChart}
            values={chartData?.series}
          />
        </Col>
      </Row>
      {/* Custom legend: filled circles for each series */}
      {chartData?.series?.length > 0 && (
        <Row justify="center" gutter={[16, 8]} style={{ paddingBottom: themeVariables?.token?.paddingSM }}>
          {chartData.series
            .filter((s) => s.name && s.showInLegend !== false)
            .map((s, i) => (
              <Col key={i} flex="none">
                <Row gutter={8} align="middle" wrap={false}>
                  <Col flex="none">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: s.color || "var(--brand-gold-6)",
                      }}
                    />
                  </Col>
                  <Col flex="none">
                    <span style={{ fontSize: 12, color: "var(--colorText)" }}>{s.name}</span>
                  </Col>
                </Row>
              </Col>
            ))}
        </Row>
      )}
      {/* Divider between chart legend and Entries/Exits legend */}
      <Row style={{ padding: `0 ${themeVariables?.token?.paddingSM ?? 8}px` }}>
        <Col span={24} style={{ borderTop: "1px solid var(--colorBorder)", marginBottom: themeVariables?.token?.paddingSM ?? 8 }} />
      </Row>
      {/* Hardcoded Entries/Exits legend */}
      <Row justify="center" style={{ paddingBottom: "0px" }} >
        <Col>
          <Row gutter={24} align="middle" justify="center" wrap={false}>
            <Col flex="none">
              <Row gutter={8} align="middle" wrap={false}>
                <Col flex="none">
                  <div
                    style={{
                      width: 24,
                      height: 2,
                      backgroundColor: "var(--brand-gold-6)",
                    }}
                  />
                </Col>
                <Col flex="none">
                  <span style={{ fontSize: 12, color: "var(--colorText)" }}>
                    {intl?.formatMessage({ id: "Entries" })}
                  </span>
                </Col>
              </Row>
            </Col>
            <Col flex="none">
              <Row gutter={8} align="middle" wrap={false}>
                <Col flex="none">
                  <div
                    style={{
                      width: 24,
                      height: 0,
                      borderTop: "2px dashed var(--brand-gold-6)",
                    }}
                  />
                </Col>
                <Col flex="none">
                  <span style={{ fontSize: 12, color: "var(--colorText)" }}>
                    {intl?.formatMessage({ id: "Exits" })}
                  </span>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  );
}

BorderMovementsTrend.propTypes = {
  filter: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.bool,
  title: PropTypes.node,
};

export default BorderMovementsTrend;
