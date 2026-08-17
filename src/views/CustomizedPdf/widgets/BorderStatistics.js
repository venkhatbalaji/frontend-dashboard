import PropTypes from "prop-types";
import { useState, useEffect, useMemo, useContext } from "react";
import { Row, Col, Button, DateRangePicker, PhosphorIcons, Empty, Text, Spin } from "re-usable-design-components";
import dayjs from "dayjs";
import translation from "../translation.json";
import { Page, Template, PdfBarChart, TotalMovements, PdfColumnChart, colors } from "@/customPdf";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import useAsync from "@/hooks/useAsync";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkIsPdfSectionEmpty } from "@/utils/helper";
import {
  getBorderPortSummary,
  getBorderMovementsByBorderType,
  getTopPorts,
  getAirportGateSummary,
  getSmartCrossingSummary,
} from "@/services/customPdf/borderStatistics";
import { head } from "lodash";

const { ArrowSquareOut } = PhosphorIcons;

const disableFutureDates = (current) => {
  return current && current > dayjs().endOf('day');
};

export default function BorderStatistics({
  dateRange: initialDateRange = {},
}) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const [localDateRange, setLocalDateRange] = useState(
    initialDateRange?.date_range?.map((v) => dayjs(v)) || [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')]
  );

  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "Borders-Statistics.pdf"
  });

  // API hooks
  const {
    execute: executeBorderPortSummary,
    status: borderPortSummaryStatus,
    value: borderPortSummaryValue,
  } = useAsync({ asyncFunction: getBorderPortSummary });
  const {
    execute: executeBorderMovementsByBorderType,
    status: borderMovementsByBorderTypeStatus,
    value: borderMovementsByBorderTypeValue,
  } = useAsync({ asyncFunction: getBorderMovementsByBorderType });

  const {
    execute: executeTopPortsLand,
    status: topPortsLandStatus,
    value: topPortsLandValue,
  } = useAsync({ asyncFunction: getTopPorts });

  const {
    execute: executeTopPortsAir,
    status: topPortsAirStatus,
    value: topPortsAirValue,
  } = useAsync({ asyncFunction: getTopPorts });

  const {
    execute: executeTopPortsSea,
    status: topPortsSeaStatus,
    value: topPortsSeaValue,
  } = useAsync({ asyncFunction: getTopPorts });

  const {
    execute: executeAirportGateSummary,
    status: airportGateSummaryStatus,
    value: airportGateSummaryValue,
  } = useAsync({ asyncFunction: getAirportGateSummary });

  const {
    execute: executeSmartCrossingSummary,
    status: smartCrossingSummaryStatus,
    value: smartCrossingSummaryValue,
  } = useAsync({ asyncFunction: getSmartCrossingSummary });


  // Prepare filter object for API calls
  const apiFilters = useMemo(() => {
    const startDate = localDateRange[0]?.format('YYYY-MM-DD');
    const endDate = localDateRange[1]?.format('YYYY-MM-DD');
    return {
      start_date: startDate,
      end_date: endDate,
    };
  }, [localDateRange]);

  // Format date range for display in title and filename
  const dateRangeString = useMemo(() => {
    const startDate = localDateRange[0]?.format('YYYY-MM-DD');
    const endDate = localDateRange[1]?.format('YYYY-MM-DD');
    return startDate && endDate ? `${startDate} - ${endDate}` : null;
  }, [localDateRange]);

  // Execute API calls when date range changes
  useEffect(() => {
    if (apiFilters.start_date && apiFilters.end_date) {
      executeBorderPortSummary({ filter: apiFilters });
      executeBorderMovementsByBorderType({ filter: apiFilters });
      // Call Top 5 Ports API for each port type
      executeTopPortsLand({ filter: { ...apiFilters, port_type: "LAND", limit: 5 } });
      executeTopPortsAir({ filter: { ...apiFilters, port_type: "AIR", limit: 5 } });
      executeTopPortsSea({ filter: { ...apiFilters, port_type: "SEA", limit: 5 } });
      // Call E-Gate and Smart Crossing APIs
      executeAirportGateSummary({ filter: { ...apiFilters, limit: 3 } });
      executeSmartCrossingSummary({ filter: { ...apiFilters, limit: 3 } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFilters]);

  const handleDateRangeChange = (val, val1) => {
    setLocalDateRange(val);
  };

  const handleExport = () => {
    const baseTitle = translation[language]?.["Borders Statistics"] || "Borders Statistics";
    const pdfName = dateRangeString
      ? `${baseTitle} ${dateRangeString}.pdf`
      : `${baseTitle}.pdf`;
    printDocumentCustomSize(pdfName, setIsCreatingPdf);
  };

  // Transform border movements by border type data for movement type chart
  const movementTypeChart = useMemo(() => {
    const borderMovementsData = borderMovementsByBorderTypeValue?.data;

    if (borderMovementsData?.borderTypes && Array.isArray(borderMovementsData?.borderTypes) && borderMovementsData?.borderTypes?.length > 0) {
      const transformedData = [];
      const transformedCategories = [];
      const borderTypesOrder = ['AIR', 'LAND', 'SEA'];

      borderTypesOrder.forEach((borderType) => {
        const borderData = borderMovementsData?.borderTypes?.find(item => item?.type === borderType);

        if (borderData && (borderData?.entries !== undefined || borderData?.exits !== undefined)) {
          transformedData.push(borderData?.entries || 0);
          transformedData.push(borderData?.exits || 0);
          transformedCategories.push(translation[language]?.["Entry"] || "Entry");
          transformedCategories.push(translation[language]?.["Exit"] || "Exit");
        }
      });

      // Check if all values are 0, if so assign empty array
      const allValuesZero = transformedData.length > 0 && transformedData.every(val => val === 0 || val === null || val === undefined);

      if (transformedData.length > 0 && !allValuesZero) {
        return {
          categories: transformedCategories,
          data: transformedData
        };
      }
    }

    return { categories: [], data: [] };
  }, [borderMovementsByBorderTypeValue, language]);

  // Transform border port summary for TotalMovements
  const totalMovements1 = useMemo(() => {
    const borderPortSummaryData = borderPortSummaryValue?.data;

    if (!borderPortSummaryData) {
      return {
        total: "",
        centerLabel1: translation[language]?.["Total Movements"] || "Total Movements",
        centerLabel2: "",
        branches: []
      };
    }

    const totalEntries = borderPortSummaryData?.entries || 0;
    const totalExits = borderPortSummaryData?.exits || 0;
    const total = (totalEntries + totalExits) || 0;

    return {
      total: total,
      centerLabel1: translation[language]["Total Movements"],
      centerLabel2: "",
      branches: [
        {
          x: -90,
          direction: "left",
          cardTopY: 400,
          color: colors.totalMovementsEntryColor,
          number: totalEntries,
          label: translation[language]?.["Total (Entries)"] || "Total (Entries)"
        },
        {
          x: 90,
          direction: "right",
          cardTopY: 400,
          color: colors.totalMovementsExitColor,
          number: totalExits,
          label: translation[language]?.["Total (Exits)"] || "Total (Exits)"
        }
      ]
    };
  }, [borderPortSummaryValue, language]);

  // E-Gate and Staffed Gate Movement (Chart 1)
  const chart1 = useMemo(() => {
    const airportGateData = airportGateSummaryValue?.data;

    if (airportGateData && Array.isArray(airportGateData)) {
      return {
        categories: airportGateData.map(item => {
          const portName = language === "ar"
            ? (item?.port_name_ar || item?.port_name_en || "Unknown")
            : (item?.port_name_en || item?.port_name_ar || "Unknown");
          return portName;
        }),
        eGateData: airportGateData.map(item => item?.number_of_e_gate_passengers || 0),
        staffedGateData: airportGateData.map(item => item?.number_of_staffed_gate_passengers || 0)
      };
    }
    return { categories: [], eGateData: [], staffedGateData: [] };
  }, [airportGateSummaryValue, language]);

  // Smart Crossing Movement (Chart 2)
  const chart2 = useMemo(() => {
    const smartCrossingData = smartCrossingSummaryValue?.data;

    if (smartCrossingData && Array.isArray(smartCrossingData)) {
      return {
        categories: smartCrossingData.map(item => {
          const portName = language === "ar"
            ? (item?.port_name_ar || item?.port_name_en || "Unknown")
            : (item?.port_name_en || item?.port_name_ar || "Unknown");
          return portName;
        }),
        data: smartCrossingData.map(item => item?.total_movements || 0)
      };
    }
    return { categories: [], data: [] };
  }, [smartCrossingSummaryValue, language]);

  // Top 5 Air Ports (Chart 3)
  const chart3 = useMemo(() => {
    const topPortsAirData = topPortsAirValue?.data;

    if (topPortsAirData?.ports && Array.isArray(topPortsAirData?.ports)) {
      return {
        categories: topPortsAirData?.ports?.map(port => {
          const portName = language === "ar"
            ? (port?.name_ar || port?.name_en || "Unknown")
            : (port?.name_en || port?.name_ar || "Unknown");
          return portName;
        }),
        data: topPortsAirData?.ports?.map(port => port?.total || 0)
      };
    }
    return { categories: [], data: [] };
  }, [topPortsAirValue, language]);

  // Top 5 Land Ports (Chart 4)
  const chart4 = useMemo(() => {
    const topPortsLandData = topPortsLandValue?.data;

    if (topPortsLandData?.ports && Array.isArray(topPortsLandData?.ports)) {
      return {
        categories: topPortsLandData?.ports?.map(port => {
          const portName = language === "ar"
            ? (port?.name_ar || port?.name_en || "Unknown")
            : (port?.name_en || port?.name_ar || "Unknown");
          return portName;
        }),
        data: topPortsLandData?.ports?.map(port => port?.total_movements || 0)
      };
    }
    return { categories: [], data: [] };
  }, [topPortsLandValue, language]);

  // Top 5 Sea Ports (Chart 5)
  const chart5 = useMemo(() => {
    const topPortsSeaData = topPortsSeaValue?.data;

    if (topPortsSeaData?.ports && Array.isArray(topPortsSeaData?.ports)) {
      return {
        categories: topPortsSeaData?.ports?.map(port => {
          const portName = language === "ar"
            ? (port?.name_ar || port?.name_en || "Unknown")
            : (port?.name_en || port?.name_ar || "Unknown");
          return portName;
        }),
        data: topPortsSeaData?.ports?.map(port => port?.total || 0)
      };
    }
    return { categories: [], data: [] };
  }, [topPortsSeaValue, language]);



  // Check loading state and empty state
  const { isLoading: isAnySectionLoading, allSectionsEmpty, hasAnyData } = useMemo(() => {
    const sections = [
      // TotalMovements section
      {
        status: borderPortSummaryStatus,
        data: borderPortSummaryValue?.data?.totalBorderMovements ? totalMovements1 : null
      },
      // Movement Type Chart
      {
        status: borderMovementsByBorderTypeStatus,
        data: movementTypeChart
      },
      // E-Gate and Staffed Gate Movement (Chart 1)
      {
        status: airportGateSummaryStatus,
        data: chart1
      },
      // Smart Crossing Movement (Chart 2)
      {
        status: smartCrossingSummaryStatus,
        data: chart2
      },
      // Top 5 Air Ports (Chart 3)
      {
        status: topPortsAirStatus,
        data: chart3
      },
      // Top 5 Land Ports (Chart 4)
      {
        status: topPortsLandStatus,
        data: chart4
      },
      // Top 5 Sea Ports (Chart 5)
      {
        status: topPortsSeaStatus,
        data: chart5
      },
    ];

    // Check if any section is still loading
    const hasLoadingSections = sections.some(section =>
      section.status === "pending" || section.status === "idle"
    );

    // Check if any section has data (not empty)
    const hasData = sections.some(section => {
      if (section.status === "success" || section.status === "error") {
        return !checkIsPdfSectionEmpty(section.status, section.data);
      }
      return false;
    });

    // If any section has data, show sections (even if others are loading)
    if (hasData) {
      return {
        isLoading: false,
        allSectionsEmpty: false,
        hasAnyData: true
      };
    }

    // If any section is still loading and no data yet, show loader
    if (hasLoadingSections) {
      return {
        isLoading: true,
        allSectionsEmpty: false,
        hasAnyData: false
      };
    }

    // All sections must be empty (success status with empty data)
    // Only check sections that have completed (success or error status)
    const completedSections = sections.filter(section =>
      section.status === "success" || section.status === "error"
    );

    // If no sections have completed yet, show loader
    if (completedSections.length === 0) {
      return {
        isLoading: true,
        allSectionsEmpty: false,
        hasAnyData: false
      };
    }

    // Check if all completed sections are empty
    const allEmpty = completedSections.every(section =>
      checkIsPdfSectionEmpty(section.status, section.data)
    );

    return {
      isLoading: false,
      allSectionsEmpty: allEmpty,
      hasAnyData: hasData
    };
  }, [
    borderPortSummaryStatus,
    borderPortSummaryValue?.data,
    totalMovements1,
    borderMovementsByBorderTypeStatus,
    movementTypeChart,
    airportGateSummaryStatus,
    chart1,
    smartCrossingSummaryStatus,
    chart2,
    topPortsAirStatus,
    chart3,
    topPortsLandStatus,
    chart4,
    topPortsSeaStatus,
    chart5
  ]);

  return (
    <>
      <Row gutter={16} justify="end" align="middle" wrap={false} style={{ marginBottom: "16px" }}>
        <Col flex="none">
          <DateRangePicker
            value={localDateRange}
            allowClear={false}
            disabledDate={disableFutureDates}
            size="default"
            onChange={handleDateRangeChange}
            style={{ width: "260px" }}
          />
        </Col>
        <Col flex="none">
          <Button
            type="primary"
            icon={<ArrowSquareOut size={16} />}
            onClick={handleExport}
            loading={isCreatingPdf}
          >
            {translation[language]?.["Export"] || "Export"}
          </Button>
        </Col>
      </Row>
      <Page title={translation[language]?.["Borders Statistics"]} isCreatingPdf={isCreatingPdf}>
        <Template
          showThreeColumns={!allSectionsEmpty && !isAnySectionLoading}
          rightColumnWidth={"35%"}
          leftColumnWidth={"30%"}
          leftColumn={
            <Row gutter={[0, 8]}>
              <Col>
                <PdfBarChart
                  title={translation[language]?.["E-Gate and Staffed Gate Movement"] || "E-Gate and Staffed Gate Movement"}
                  imageSrc="/customPdf/borderStatistics/ship.png"
                  isImageWithBorder={true}
                  imageAlt={translation[language]?.["E-Gate and Staffed Gate Movement"] || "E-Gate and Staffed Gate Movement"}
                  showTitleBesideIcon={true}
                  chartProps={{
                    plotOptions: {
                      bar: {
                        maxPointWidth: 20
                      }
                    },
                    xAxis: {
                      opposite: true,
                      labels: {
                        enabled: true,
                        useHTML: true,
                        reserveSpace: true,
                        formatter: function () {
                          const label = this.value || "";
                          return `<div style="max-width: 90px; width: 90px; word-wrap: break-word; word-break: break-word; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: ${colors.chartAxisLabelFontSize}; line-height: 1.2;">${label}</div>`;
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        }
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 4, zIndex: 5 },
                      ],
                    },
                    categories: chart1?.categories || [],
                    values: [
                      {
                        name: translation[language]?.["E-Gate"] || "E-Gate",
                        data: chart1?.eGateData || [],
                        showInLegend: false,
                        color: "#D9AA54",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: [
                          {
                            enabled: true,
                            verticalAlign: "middle",
                            inside: false,
                            x: -40,
                            allowOverlap: true,
                            crop: false,
                            formatter: function () {
                              return translation[language]?.["E-Gate"] || "E-Gate";
                            },
                            style: {
                              textOutline: "none",
                              color: colors.text,
                              fontSize: colors.chartAxisLabelFontSize
                            },
                          },
                          {
                            enabled: true,
                            align: "center",
                            x: -10,
                            allowOverlap: true,
                            crop: false,
                            inside: true,
                            formatter: function () {
                              return this.y.toLocaleString();
                            },
                            style: {
                              textOutline: "1px #D9AA54",
                              color: "#ffffff",
                            },
                          }
                        ],
                      },
                      {
                        name: translation[language]?.["Staffed Gate"] || "Staffed Gate",
                        data: chart1?.staffedGateData || [],
                        showInLegend: false,
                        color: "#D9AA54",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: [
                          {
                            enabled: true,
                            // align: "left",
                            inside: false,
                            x: -40,
                            allowOverlap: true,
                            crop: false,
                            formatter: function () {
                              return translation[language]?.["Staffed Gate"] || "Staffed Gate";
                            },
                            style: {
                              textOutline: "none",
                              color: colors.text,
                              fontSize: colors.chartAxisLabelFontSize
                            },
                          },
                          {
                            enabled: true,
                            align: "center",
                            inside: true,
                            x: -10,
                            allowOverlap: true,
                            crop: false,
                            formatter: function () {
                              return this.y.toLocaleString();
                            },
                            style: {
                              textOutline: "1px #D9AA54",
                              color: "#ffffff",
                            },
                          }
                        ],
                      },
                    ],
                    legend: {
                      enabled: false,
                    },
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "100%",
                    marginTop: "45px",
                    height: "240px",
                    marginLeft: "0px",
                  }}
                  loadingHeight="285px"
                  status={(airportGateSummaryStatus === "pending" || airportGateSummaryStatus === "idle") ? "pending" : "success"}
                  data={chart1}
                />
              </Col>
              <Col>
                <div style={{ borderTop: `1px solid ${colors.border}` }} />
              </Col>
              <Col>
                <PdfBarChart
                  showTitleBesideIcon={true}
                  title={translation[language]?.["Smart Crossing Movements"] || "Smart Crossing Movement"}
                  titleWrapperStyle={{
                    width: "100%",
                    maxWidth: "100%",
                  }}
                  loadingHeight="285px"
                  imageSrc="/customPdf/borderStatistics/car_move.png"
                  isImageWithBorder={true}
                  imageAlt={translation[language]?.["Smart Crossing Movements"]}
                  chartProps={{
                    plotOptions: {
                      bar: {
                        maxPointWidth: 20
                      }
                    },
                    xAxis: {
                      opposite: true,
                      labels: {
                        enabled: true,
                        useHTML: true,
                        reserveSpace: true,
                        formatter: function () {
                          const label = this.value || "";
                          return `<div style="max-width: 90px; width: 90px; word-wrap: break-word; word-break: break-word; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: ${colors.chartAxisLabelFontSize}; line-height: 1.2;">${label}</div>`;
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        }
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 4, zIndex: 5 },
                      ],
                    },
                    categories: chart2?.categories || [],
                    values: [
                      {
                        data: chart2?.data || [],
                        showInLegend: false,
                        color: "#D9AA54",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          align: "center",
                          inside: true,
                          style: {
                            textOutline: "1px #D9AA54",
                            color: "#ffffff",
                          },
                        },
                      },
                    ],
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "100%",
                    marginTop: "45px",
                    height: "240px",
                    marginLeft: "0px",
                  }}
                  status={(smartCrossingSummaryStatus === "pending" || smartCrossingSummaryStatus === "idle") ? "pending" : "success"}
                  data={chart2}
                />
              </Col>
            </Row>
          }
          middleColumn={
            <Row gutter={[0, 8]}>
              <Col>
                <PdfBarChart
                  isImageWithBorder={true}
                  title={translation[language]?.["Top 5 Ports Title"]}
                  showTitleBesideIcon={true}
                  imageSrc="/customPdf/borderStatistics/emirate.png"
                  imageAlt={translation[language]?.["Top 5 Ports"] || "Top 5 Ports"}
                  chartImageSrc="/customPdf/borderStatistics/airplane.png"
                  chartImageAlt="Airports"
                  chartImageSubtitle={translation[language]?.["Top 5 Ports"] || "Top 5 Ports"}
                  chartImageLabel={translation[language]?.["Airports"] || "Airports"}
                  meshRight={130}
                  chartProps={{
                    xAxis: {
                      opposite: true,
                      labels: {
                        enabled: true,
                        useHTML: true,
                        reserveSpace: true,
                        formatter: function () {
                          const label = this.value || "";
                          return `<div style="max-width: 105px; width: 105px; word-wrap: break-word; word-break: break-word; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: 9px; line-height: 1.2;">${label}</div>`;
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        }
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 4, zIndex: 5 },
                      ],
                    },
                    categories: chart3?.categories || [],
                    values: [
                      {
                        data: chart3?.data || [],
                        showInLegend: false,
                        color: "#9A6E23",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          x: -20,
                          align: "center",
                          verticalAlign: "middle",
                          inside: true,
                          style: {
                            textOutline: "1px #9A6E23",
                            color: "#ffffff",
                          },
                        },
                      },
                    ],
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "100%",
                    marginTop: "45px",
                    marginLeft: "0px",
                    height: "185px",
                  }}
                  chartWrapperStyle={{
                    paddingLeft: "80px",
                    width: "calc(100% - 80px)",
                  }}
                  loadingHeight="220px"
                  status={(topPortsAirStatus === "pending" || topPortsAirStatus === "idle") ? "pending" : "success"}
                  data={chart3}
                />
              </Col>
              <Col>
                <div style={{ borderTop: `1px solid ${colors.border}` }} />
              </Col>
              <Col>
                <PdfBarChart
                  chartImageSrc="/customPdf/borderStatistics/car.png"
                  chartImageAlt="Land Ports"
                  meshRight={130}
                  chartImageSubtitle={translation[language]?.["Top 5 Ports"] || "Top 5 Ports"}
                  chartImageLabel={translation[language]?.["Land Ports"] || "Land Ports"}
                  chartProps={{
                    xAxis: {
                      opposite: true,
                      labels: {
                        enabled: true,
                        useHTML: true,
                        reserveSpace: true,
                        formatter: function () {
                          const label = this.value || "";
                          return `<div style="max-width: 105px; width: 105px; word-wrap: break-word; word-break: break-word; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: 9px; line-height: 1.2;">${label}</div>`;
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        }
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 4, zIndex: 5 },
                      ],
                    },
                    categories: chart4?.categories || [],
                    values: [
                      {
                        data: chart4?.data || [],
                        showInLegend: false,
                        color: "#D9AA54",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          align: "center",
                          verticalAlign: "middle",
                          inside: true,
                          x: -20,
                          style: {
                            textOutline: "1px #D9AA54",
                            color: "#ffffff",
                          },
                        },
                      },
                    ],
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "100%",
                    marginTop: "0px",
                    marginLeft: "0px",
                    height: "170px",
                  }}
                  chartWrapperStyle={{
                    paddingLeft: "80px",
                    width: "calc(100% - 80px)",
                  }}
                  loadingHeight="175px"
                  status={(topPortsLandStatus === "pending" || topPortsLandStatus === "idle") ? "pending" : "success"}
                  data={chart4}
                />
              </Col>
              <Col>
                <div style={{ borderTop: `1px solid ${colors.border}` }} />
              </Col>
              <Col>
                <PdfBarChart
                  chartImageSrc="/customPdf/borderStatistics/cruise.png"
                  chartImageAlt="Sea Ports"
                  chartImageSubtitle={translation[language]?.["Top 5 Ports"] || "Top 5 Ports"}
                  chartImageLabel={translation[language]?.["Sea Ports"] || "Sea Ports"}
                  meshRight={130}
                  chartProps={{
                    xAxis: {
                      opposite: true,
                      labels: {
                        enabled: true,
                        useHTML: true,
                        reserveSpace: true,
                        formatter: function () {
                          const label = this.value || "";
                          return `<div style="max-width: 105px; width: 105px; word-wrap: break-word; word-break: break-word; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: 9px; line-height: 1.2;">${label}</div>`;
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        }
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 4, zIndex: 5 },
                      ],
                    },
                    categories: chart5?.categories || [],
                    values: [
                      {
                        data: chart5?.data || [],
                        showInLegend: false,
                        color: "#AC7E27",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          align: "center",
                          verticalAlign: "middle",
                          inside: true,
                          x: -20,
                          style: {
                            textOutline: "1px #AC7E27",
                            color: "#ffffff",
                          },
                        },
                      },
                    ],
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "100%",
                    marginTop: "0px",
                    marginLeft: "0px",
                    height: "170px",
                  }}
                  chartWrapperStyle={{
                    paddingLeft: "80px",
                    width: "calc(100% - 80px)",
                  }}
                  loadingHeight="175px"
                  status={(topPortsSeaStatus === "pending" || topPortsSeaStatus === "idle") ? "pending" : "success"}
                  data={chart5}
                />
              </Col>
            </Row>
          }
          rightColumn={
            <Row gutter={[0, 8]}>
              <Col>
                <Row style={{ height: "200px", marginBottom: "16px" }}>
                  <Col>
                    <TotalMovements
                      loadingHeight="200px"
                      isImageWithBorder={true}
                      title={translation[language]?.["Border Ports Summary"] || "Border Ports Summary"}
                      imageSrc="/customPdf/borderStatistics/summary.png" imageAlt={translation[language]?.["Total Movements"] || "Total Movements"}
                      centerLabel1={translation[language]?.["Total"]}
                      centerLabel2={translation[language]?.["Movements"]}
                      total={borderPortSummaryValue?.data?.totalBorderMovements}
                      branches={totalMovements1?.branches || []}
                      status={(borderPortSummaryStatus === "pending" || borderPortSummaryStatus === "idle") ? "pending" : "success"}
                      data={borderPortSummaryValue?.data?.totalBorderMovements ? totalMovements1 : 0}
                    />
                  </Col>
                </Row>
                <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "16px" }} />
                <Row>
                  <Col>
                    <PdfColumnChart
                      loadingHeight="280px"
                      isImageWithBorder={true}
                      title={translation[language]?.["Border Movements by Border and Movement Type"] || "Border Movements by Border and Movement Type"}
                      imageSrc="/customPdf/borderStatistics/male_female.png" imageAlt={translation[language]?.["Total Movements"] || "Total Movements"}
                      chartProps={{
                        type: 'column', // Explicitly set chart type to column
                        isYAxisLine: true,
                        plotOptions: {
                          column: {
                            pointWidth: null, // Auto width based on available space
                            groupPadding: 0, // Reduced spacing between groups (5% of available space) - makes columns wider
                            pointPadding: 0, // Reduced spacing between columns in same group (5% of column width) - makes columns wider
                            dataLabels: {
                              enabled: true,
                              align: "center",
                              verticalAlign: "bottom",
                              inside: true,
                              rotation: -90,
                              y: -5,
                              allowOverlap: true,
                              crop: false,
                              overflow: 'allow',
                              style: {
                                textOutline: "1px solid #fff",
                                fontSize: colors.chartDataLabelFontSize,
                                fontWeight: colors.fontWeightBold
                              },
                            },
                          }
                        },
                        xAxis: {
                          categories: movementTypeChart?.categories || [],
                          offset: 1,
                          labels: {
                            useHTML: true,
                            formatter: function () {
                              // Determine color based on index:
                              // Indices 0, 2: Airports/Land Ports Entry (default Entry color)
                              // Indices 1, 3: Airports/Land Ports Exit (default Exit color)
                              // Index 4: Sea Ports Entry (#5C4776)
                              // Index 5: Sea Ports Exit (#6C5489)
                              let squareColor;

                              // Default colors for Airports and Land Ports
                              const isEntry = this.pos % 2 === 0;
                              squareColor = isEntry ? colors.chartEntryGradientLight : colors.chartExitGradientLight;

                              const labelText = this.value;
                              return `
																<div style="display: flex; align-items: center; gap: 6px; justify-content: center;">
																	<div style="width: 10px; height: 10px; background-color: ${squareColor}; border-radius: 2px;"></div>
																	<span style="color: ${colors.chartAxisLabelColor}; font-size: ${colors.chartAxisLabelFontSize}">${labelText}</span>
																</div>
															`;
                            }
                          },
                          gridLineWidth: 0,
                          gridLineColor: colors.chartGridLineColor,
                        },
                        yAxis: {
                          min: 0,
                          offset: colors.chartAxisOffset, // Add space between y-axis line and columns
                          labels: {
                            enabled: true,
                            useHTML: true,
                            formatter: function () {
                              return `<div style="text-align: right; min-width: 57px; max-width: 57px; word-wrap: break-word; word-break: break-word; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: ${colors.chartAxisLabelFontSize}; line-height: 1.2;">${this.value.toLocaleString()}</div>`;
                            },
                            style: {
                              color: colors.chartAxisLabelColor,
                              fontSize: colors.chartAxisLabelFontSize,
                            }
                          },
                          gridLineWidth: 0,
                          gridLineColor: colors.chartGridLineColor,
                          lineWidth: colors.chartAxisLineWidth,
                          lineColor: colors.chartAxisLineColor,
                        },
                        values: [
                          {
                            type: 'column',
                            name: translation[language]?.["Border Movements by Border and Movement Type"] || "Border Movements by Border and Movement Type",
                            data: (movementTypeChart?.data || []).map((value, index) => {
                              // Color logic:
                              // Indices 0, 2: Airports/Land Ports Entry (default Entry colors)
                              // Indices 1, 3: Airports/Land Ports Exit (default Exit colors)
                              // Index 4: Sea Ports Entry (#5C4776)
                              // Index 5: Sea Ports Exit (#6C5489)
                              let colorStops;

                              // Default colors for Airports and Land Ports
                              colorStops = index % 2 === 0
                                ? [[0, colors.chartEntryGradientLight], [1, colors.chartEntryGradientDark]] // Entry - dark brown
                                : [[0, colors.chartExitGradientLight], [1, colors.chartExitGradientDark]]; // Exit - light brown

                              return {
                                y: value,
                                color: {
                                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                                  stops: colorStops
                                }
                              };
                            }),
                            showInLegend: false,
                            borderRadius: { radius: colors.chartBorderRadius, where: "all" },
                          },
                        ],
                        legend: {
                          enabled: true,
                          align: "center",
                          verticalAlign: "bottom",
                          layout: "horizontal"
                        },
                        tooltip: {
                          enabled: false,
                        },
                      }}
                      chartColStyle={{
                        width: "100%",
                        marginTop: "60px",
                        marginLeft: "0px",
                      }}
                      status={(borderMovementsByBorderTypeStatus === "pending" || borderMovementsByBorderTypeStatus === "idle") ? "pending" : "success"}
                      data={movementTypeChart}
                    />
                  </Col>
                  {movementTypeChart?.data && movementTypeChart?.data?.length > 0 && (
                    <Col>
                      <div style={{ marginLeft: "130px", marginRight: "43px", display: "flex", justifyContent: "space-between", alignItems: "center", direction: "ltr" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <img src="/customPdf/borderStatistics/airplane.png" alt="plane" width={"auto"} height={"40px"} />
                          <span style={{ fontSize: colors.chartAxisLabelFontSize, color: colors.chartAxisLabelColor }}>
                            {translation[language]?.["Airports"] || "Airports"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <img src="/customPdf/borderStatistics/car.png" alt="car" width={"auto"} height={"40px"} />
                          <span style={{ fontSize: colors.chartAxisLabelFontSize, color: colors.chartAxisLabelColor }}>
                            {translation[language]?.["Land Ports"] || "Land Ports"}
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                          <img src="/customPdf/borderStatistics/cruise.png" alt="cruise" width={"auto"} height={"40px"} />
                          <span style={{ fontSize: colors.chartAxisLabelFontSize, color: colors.chartAxisLabelColor }}>
                            {translation[language]?.["Sea Ports"] || "Sea Ports"}
                          </span>
                        </div>
                      </div>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
          }
        >
          {/* Show common loader if any section is loading */}
          {isAnySectionLoading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '500px',
              width: '100%'
            }}>
              <Spin size="large" />
            </div>
          )}
          {/* Show Empty component if all sections are empty and none are loading */}
          {!isAnySectionLoading && allSectionsEmpty && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '500px',
              width: '100%'
            }}>
              <Empty
                description={
                  <Text color={colors.textDescription}>
                    {translation[language]?.["No data"] || "No data"}
                  </Text>
                }
              />
            </div>
          )}
        </Template>
      </Page>
    </>
  );
}

BorderStatistics.propTypes = {
  filters: PropTypes.object,
  dateRange: PropTypes.object,
  title: PropTypes.string,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
};
