import PropTypes from "prop-types";
import { useContext, useState, useEffect, useMemo } from "react";
import { Row, Col, Select, Button, PhosphorIcons, Spin, Empty, Text } from "re-usable-design-components";
import translation from "../translation.json";
import { Page, Template, PdfBarChart, PdfColumnChart, colors } from "@/customPdf";
import DistributionByAgeRange from "@/customPdf/widget/ViolatorsDistributionByAgeRange";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useAsync from "@/hooks/useAsync";
import { 
  getNationalities,
  getRiskByAgeGroup,
  getRiskByNationality,
  getRiskTypesByRegister,
  getRiskRegisterByYear
} from "@/services/customPdf/riskRegisterStatistics";
import { checkRtl, checkIsPdfSectionEmpty, formatNumber } from "@/utils/helper";

const { ArrowSquareOut } = PhosphorIcons;

export default function RiskRegisterStatistics({
  filters = {},
}) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const [selectedCountry, setSelectedCountry] = useState(undefined);

  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "Risk-Register-Statistics.pdf"
  });

  // Fetch nationalities
  const {
    execute: executeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getNationalities });

  // Fetch risk data APIs
  const {
    execute: executeRiskByAgeGroup,
    status: riskByAgeGroupStatus,
    value: riskByAgeGroupValue,
  } = useAsync({ asyncFunction: getRiskByAgeGroup });

  const {
    status: riskByNationalityStatus,
    value: riskByNationalityValue,
  } = useAsync({ asyncFunction: getRiskByNationality, immediate: true });

  const {
    execute: executeRiskTypesByRegister,
    status: riskTypesByRegisterStatus,
    value: riskTypesByRegisterValue,
  } = useAsync({ asyncFunction: getRiskTypesByRegister });

  const {
    execute: executeRiskRegisterByYear,
    status: riskRegisterByYearStatus,
    value: riskRegisterByYearValue,
  } = useAsync({ asyncFunction: getRiskRegisterByYear });

  useEffect(() => {
    executeNationalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger API calls when selectedCountry changes
  useEffect(() => {
    const apiFilters = { nationality: selectedCountry };
    
    executeRiskByAgeGroup({ filter: { ...apiFilters, language }});
    executeRiskTypesByRegister({ filter: { ...apiFilters, language }});
    executeRiskRegisterByYear({ filter: { ...apiFilters, language }});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, language]);

  // Transform nationalities data for Select component
  const countryOptions = useMemo(() => {
    if (!nationalitiesValue?.data || !Array.isArray(nationalitiesValue.data)) {
      return [];
    }

    return nationalitiesValue.data
      .map((item) => ({
        value: item?.country_alpha3 || "",
        label: isRtl 
          ? (item?.country_ar || "") 
          : (item?.country_en || ""),
      }))
      .filter((item) => item.value && item.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [nationalitiesValue?.data, isRtl]);

  const handleCountryChange = (value) => {
    setSelectedCountry(value);
  };

  // Get selected country name
  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return null;
    const country = countryOptions.find(opt => opt.value === selectedCountry);
    return country ? country.label : null;
  }, [selectedCountry, countryOptions]);

  const handleExport = () => {
    const baseTitle = translation[language]?.["Risk Register Statistics"] || "Risk Register Statistics";
    const pdfName = selectedCountryName 
      ? `${baseTitle} - ${selectedCountryName}.pdf` 
      : `${baseTitle}.pdf`;
    printDocumentCustomSize(pdfName, setIsCreatingPdf);
  };

  // Transform API responses to chart data format
  const chartData = useMemo(() => {
    // Risk Register by Year
    const riskRegisterByYearData = riskRegisterByYearValue?.data || [];
    const riskRegisterByYearDataArray = riskRegisterByYearData.map(item => item?.total_violations || 0);
    // Check if all values are 0 - if so, set data to empty array to trigger empty state
    const allValuesZero = riskRegisterByYearDataArray.length > 0 && riskRegisterByYearDataArray.every(val => val === 0);
    const riskRegisterByYear = {
      categories: riskRegisterByYearData.map(item => item?.year || ""),
      data: allValuesZero ? [] : riskRegisterByYearDataArray
    };

    // Risk by Age Group
    const riskByAgeData = riskByAgeGroupValue?.data || [];
    const riskByAge = {
      categories: riskByAgeData.map(item => item?.age_range || ""),
      maleData: riskByAgeData.map(item => item?.male_risk || 0),
      femaleData: riskByAgeData.map(item => item?.female_risk || 0)
    };

    // Risk Types Register
    const riskTypesData = riskTypesByRegisterValue?.data || [];
    const riskTypesRegister = {
      categories: riskTypesData.map(item => 
        language === "ar" ? (item?.risk_type_ar || "") : (item?.risk_type_en || "")
      ),
      // API provides risk_vs_total_risks_percentage (0-100 range)
      // Using percentage value for visualization since no male/female breakdown available
      maleData: riskTypesData.map(item => item?.risk_vs_total_risks_percentage || 0),
      femaleData: riskTypesData.map((item) => item?.risk_vs_population_percentage || 0)
    };

    // Top Risk By Nationality
    const topRiskByNationalityData = riskByNationalityValue?.data?.nationalities || riskByNationalityValue?.data || [];
    const topRiskByNationality = {
      categories: topRiskByNationalityData.map(item => 
        language === "ar" ? (item?.name_ar || "") : (item?.name_en || "")
      ),
      maleData: topRiskByNationalityData.map(item => item?.male_risk_count || 0),
      femaleData: topRiskByNationalityData.map(item => item?.female_risk_count || 0)
    };

    return {
      riskRegisterByYear,
      riskByAge,
      riskTypesRegister,
      topRiskByNationality
    };
  }, [
    riskRegisterByYearValue?.data,
    riskByAgeGroupValue?.data,
    riskTypesByRegisterValue?.data,
    riskByNationalityValue?.data,
    language
  ]);

  // Check loading state and empty state
  const { isLoading: isAnySectionLoading, allSectionsEmpty, hasAnyData } = useMemo(() => {
    const sections = [
      { status: riskRegisterByYearStatus, data: chartData.riskRegisterByYear },
      { status: riskTypesByRegisterStatus, data: chartData.riskTypesRegister },
      { status: riskByAgeGroupStatus, data: chartData.riskByAge },
    ];

    // Only check Top Risk By Nationality if no country is selected
    if (!selectedCountry) {
      sections.push({ status: riskByNationalityStatus, data: chartData.topRiskByNationality });
    }

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

    // All completed sections are empty
    const allEmpty = completedSections.every(section => 
      checkIsPdfSectionEmpty(section.status, section.data)
    );

    return {
      isLoading: false,
      allSectionsEmpty: allEmpty,
      hasAnyData: false
    };
  }, [
    riskRegisterByYearStatus,
    riskTypesByRegisterStatus,
    riskByAgeGroupStatus,
    riskByNationalityStatus,
    chartData.riskRegisterByYear,
    chartData.riskTypesRegister,
    chartData.riskByAge,
    chartData.topRiskByNationality,
    selectedCountry
  ]);

  return (
    <>
      <Row 
        gutter={16} 
        justify={isRtl ? "start" : "end"} 
        align="middle" 
        wrap={false} 
        style={{ 
          marginBottom: "16px",
          direction: "ltr",
        }}
      >
        {isRtl ? (
          <>
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
            <Col flex="none">
              <Select
                placeholder={translation?.[language]?.["Country"] || "Select Country"}
                size="default"
                value={selectedCountry}
                allowClear
                showSearch
                style={{
                  width: "260px",
                }}
                loading={nationalitiesStatus === "pending" || nationalitiesStatus === "idle"}
                filterOption={(input, option) => {
                  return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
                }}
                onChange={handleCountryChange}
                options={countryOptions}
              />
            </Col>
          </>
        ) : (
          <>
            <Col flex="none">
              <Select
                placeholder={translation?.[language]?.["Country"] || "Select Country"}
                size="default"
                value={selectedCountry}
                allowClear
                showSearch
                style={{
                  width: "260px",
                }}
                loading={nationalitiesStatus === "pending" || nationalitiesStatus === "idle"}
                filterOption={(input, option) => {
                  return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
                }}
                onChange={handleCountryChange}
                options={countryOptions}
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
          </>
        )}
      </Row>
      <Page 
        title={
          selectedCountryName 
            ? `${translation?.[language]?.["Risk Register Statistics"] || "Risk Register Statistics"} - ${selectedCountryName}` 
            : (translation?.[language]?.["Risk Register Statistics"] || "Risk Register Statistics")
        } 
        isCreatingPdf={isCreatingPdf}
      >
        <Template
          isRightColumnLeftBorder={false}
          leftColumn={
            <Row gutter={[0, 8]} style={{ paddingLeft: "4px" }}>
              {/* Risk Register by Year */}
              <Col>
                <PdfBarChart
                  title={translation?.[language]?.["Risk Register by Year"] || "Risk Register by Year"}
                  imageSrc="/customPdf/riskRegister/risk.png"
                  isImageWithBorder={true}
                  imageAlt={translation?.[language]?.["Risk Register by Year"] || "Risk Register by Year"}
                  showTitleBesideIcon={true}
                  meshRight={58}
                  chartProps={{
                    plotOptions: {
                      bar: {
                        maxPointWidth: 20
                      }
                    },
                    xAxis: {
                      opposite: true,
                      min: 0,
                      labels: { 
                        style: { 
                          color: colors.primary,
                          fontSize: colors.chartAxisLabelFontSize
                        } 
                      },
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { 
                        enabled: false,
                        style: { 
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        } 
                      },
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 4, zIndex: 5 },
                      ],
                    },
                    categories: chartData.riskRegisterByYear.categories,
                    values: [
                      {
                        data: chartData.riskRegisterByYear.data,
                        showInLegend: false,
                        color: "#CBA54A",
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          inside: false,
                          x: 0,
                          style: {
                            textOutline: "1px solid #fff",
                          },
                        },
                      },
                    ],
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "calc(100%)",
                    marginTop: "45px",
                    height: "221px",
                    marginLeft: "0px",
                    marginBottom: "20px",
                  }}
                  loadingHeight="286px"
                  status={riskRegisterByYearStatus}
                  data={chartData.riskRegisterByYear}
                />
              </Col>

              <div style={{ borderTop: `1px solid ${colors.border}`, width: "100%", marginBottom: "10px" }}></div>
              {/* Risk Types Register */}
              <Col>
                <PdfColumnChart
                  title={translation?.[language]?.["Risk Types Register"] || "Risk Types Register"}
                  imageSrc="/customPdf/riskRegister/risk.png"
                  imageAlt={translation?.[language]?.["Risk Types Register"] || "Risk Types Register"}
                  isImageWithBorder={true}
                  chartProps={{
                    chart: {
                      type: 'column',
                      marginBottom: 110,
                    },
                    plotOptions: {
                      column: {
                        grouping: true,
                        groupPadding: 0.2,
                        pointPadding: 0,
                        borderWidth: 0,
                        dataLabels: {
                          enabled: true,
                          inside: true,
                          rotation: -90,
                          verticalAlign: 'bottom',
                          y: -5,
                          align: 'center',
                          allowOverlap: true,
                          crop: false,
                          overflow: 'allow',
                          style: {
                            color: colors?.text,
                            fontSize: '10px',
                            fontWeight: 'bold',
                            textOutline: '1px solid #fff',
                            whiteSpace: 'nowrap'
                          },
                          formatter: function() {
                            const value = this.y !== null && this.y !== undefined ? `${this.y.toLocaleString()}%` : '';
                            return value;
                          }
                        },
                      }
                    },
                    xAxis: {
                      categories: chartData.riskTypesRegister.categories,
                      labels: {
                        enabled: true,
                        useHTML: true,
                        rotation: 0,
                        reserveSpace: true,
                        formatter: function() {
                          const label = this.value || "";
                          return `<div style="max-width: 50px; width: 50px; word-wrap: break-word; word-break: auto-phrase; overflow-wrap: normal; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: ${colors.chartAxisLabelFontSize}; line-height: 1.2; text-align: center; margin: 0 auto;">${label}</div>`;
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize,
                          textOverflow: 'none',
                          whiteSpace: 'normal'
                        }
                      },
                      gridLineWidth: 0,
                      gridLineColor: colors.chartGridLineColor,
                    },
                    yAxis: {
                      min: 0,
                      tickInterval: 10,
                      labels: {
                        enabled: true,
                        formatter: function() {
                          return this.value.toLocaleString();
                        },
                        style: {
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        }
                      },
                      gridLineWidth: 1,
                      gridLineColor: colors.chartGridLineColor,
                      lineWidth: colors.chartAxisLineWidth,
                      lineColor: colors.chartAxisLineColor,
                    },
                    values: [
                      {
                        type: 'column',
                        name: translation?.[language]?.["% of Risk vs Population"] || "% of Risk vs Population",
                        data: chartData.riskTypesRegister.femaleData,
                        showInLegend: true,
                        color: "#CBA54A",
                      },
                      {
                        type: 'column',
                        name: translation?.[language]?.["Total Risks"] || "Total Risks",
                        data: chartData.riskTypesRegister.maleData,
                        showInLegend: true,
                        color: "#9A7C38",
                      },
                    ],
                    legend: {
                      enabled: true,
                      align: "center",
                      verticalAlign: "bottom",
                      layout: "horizontal",
                      symbolHeight: 8,
                      symbolWidth: 8,
                      symbolPadding: 6,
                      itemStyle: {
                        fontSize: "10px"
                      }
                    },
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "calc(100% - 0px)",
                    marginTop: "45px",
                    marginLeft: "0px",
                    height: "260px",
                  }}
                  loadingHeight="260px"
                  status={riskTypesByRegisterStatus}
                  data={chartData.riskTypesRegister}
                />
              </Col>
            </Row>
          }
          rightColumn={
            <Row
              gutter={[0, 8]}
              style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: "10px", paddingRight: "4px" }}
            >
              {/* Risk by Age */}
              <Col>
                {(() => {
                  // Helper function to map age group to icon path
                  const getIconPath = (ageGroup) => {
                    const iconMap = {
                      "0-18": "0_10",
                      "19-21": "10_20",
                      "22-29": "20_30",
                      "30-39": "30_40",
                      "40-49": "40_50",
                      "50-59": "50_60",
                      "60+": "60+",
                    };
                    return `/customPdf/${iconMap[ageGroup] || "0_10"}.png`;
                  };

                  // Format age group label for display
                  const formatAgeGroupLabel = (ageGroup) => {
                    const labelMap = {
                      "0-18": "0-18",
                      "19-21": "18-21",
                      "22-29": "22-29",
                      "30-39": "30-40",
                      "40-49": "40-49",
                      "50-59": "50-59",
                      "60+": "+60",
                    };
                    return labelMap[ageGroup] || ageGroup;
                  };

                  // Transform the API response structure
                  const riskByAgeData = riskByAgeGroupValue?.data || [];

                  const ranges = riskByAgeData.map((group, index) => {
                    const ageGroup = group?.age_range || "";
                    const maleRisk = group?.male_risk || 0;
                    const femaleRisk = group?.female_risk || 0;

                    // Fixed height of 25 for "60+" age range, otherwise calculate based on index
                    const iconHeight = ageGroup === "60+" ? 25 : (23 + (index * 1));

                    return {
                      label: formatAgeGroupLabel(ageGroup),
                      visaValue: femaleRisk, // Map male_risk to visaValue
                      residencyValue: maleRisk, // Map female_risk to residencyValue
                      iconSrc: getIconPath(ageGroup),
                      iconHeight: iconHeight,
                    };
                  });

                  return (
                    <DistributionByAgeRange
                      isRtlEnabled={true}
                      title={translation?.[language]?.["Risk by Age"] || "Risk by Age"}
                      imageSrc="/customPdf/riskRegister/risk.png"
                      imageAlt={translation?.[language]?.["Risk by Age"] || "Risk by Age"}
                      height={selectedCountry ? 610 : 285}
                      ranges={ranges.length > 0 ? ranges : undefined}
                      status={riskByAgeGroupStatus}
                      data={riskByAgeGroupValue?.data}
                      leftLegendLabel={translation?.[language]?.["Female"] || "Female"}
                      rightLegendLabel={translation?.[language]?.["Male"] || "Male"}
                    />
                  );
                })()}
              </Col>

              {!selectedCountry && (
                <div style={{ borderTop: `1px solid ${colors.border}`, width: "100%", marginBottom: "10px" }}></div>
              )}
              {/* Top Risk By Nationality - Only show when no country is selected */}
              {!selectedCountry && (
                <Col>
                  <PdfColumnChart
                    title={translation?.[language]?.["Top Risk By Nationality"] || "Top Risk By Nationality"}
                    imageSrc="/customPdf/riskRegister/risk.png"
                    isImageWithBorder={true}
                    imageAlt={translation?.[language]?.["Top Risk By Nationality"] || "Top Risk By Nationality"}
                    chartProps={{
                      chart: {
                        type: 'column',
                        marginBottom: 85,
                      },
                      plotOptions: {
                        column: {
                          grouping: true,
                          groupPadding: 0.2,
                          pointPadding: 0,
                          borderWidth: 0,
                          dataLabels: {
                            enabled: true,
                            inside: true,
                            rotation: -90,
                            verticalAlign: 'bottom',
                            y: -5,
                            align: 'center',
                            allowOverlap: true,
                            crop: false,
                            overflow: 'allow',
                            style: {
                              color: colors?.text,
                              fontSize: '10px',
                              fontWeight: 'bold',
                              textOutline: '1px solid #fff',
                              whiteSpace: 'nowrap'
                            },
                            formatter: function() {
                              const value = this.y !== null && this.y !== undefined ? this.y.toLocaleString() : '';
                              return value;
                            }
                          },
                        }
                      },
                      xAxis: {
                        categories: chartData.topRiskByNationality.categories,
                        labels: {
                          enabled: true,
                          useHTML: true,
                          reserveSpace: true,
                          rotation: 0,
                          formatter: function() {
                            const label = this.value || "";
                            return `<div style="max-width: 53px; width: 53px; word-wrap: normal; word-break: normal; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: ${colors.chartAxisLabelFontSize}; line-height: 1.2; text-align: center; margin: 0 auto;">${label}</div>`;
                          },
                          style: {
                            color: colors.chartAxisLabelColor,
                            fontSize: colors.chartAxisLabelFontSize,
                            textOverflow: 'none',
                            whiteSpace: 'normal'
                          }
                        },
                        gridLineWidth: 0,
                        gridLineColor: colors.chartGridLineColor,
                      },
                      yAxis: {
                        min: 0,
                        tickInterval: 20,
                        labels: {
                          enabled: true,
                          formatter: function() {
                            return this.value.toLocaleString();
                          },
                          style: {
                            color: colors.chartAxisLabelColor,
                            fontSize: colors.chartAxisLabelFontSize
                          }
                        },
                        gridLineWidth: 1,
                        gridLineColor: colors.chartGridLineColor,
                        lineWidth: colors.chartAxisLineWidth,
                        lineColor: colors.chartAxisLineColor,
                      },
                      values: [
                        {
                          type: 'column',
                          name: translation?.[language]?.["Female"] || "Female",
                          data: chartData.topRiskByNationality.femaleData,
                          showInLegend: true,
                          color: "#CBA54A",
                        },
                        {
                          type: 'column',
                          name: translation?.[language]?.["Male"] || "Male",
                          data: chartData.topRiskByNationality.maleData,
                          showInLegend: true,
                          color: "#9A7C38",
                        },
                      ],
                      legend: {
                        enabled: true,
                        align: "center",
                        verticalAlign: "bottom",
                        layout: "horizontal",
                        symbolHeight: 8,
                        symbolWidth: 8,
                        symbolPadding: 6,
                        itemStyle: {
                          fontSize: "10px"
                        }
                      },
                      tooltip: {
                        enabled: false,
                      },
                    }}
                    chartColStyle={{
                      width: "calc(100% - 0px)",
                      marginTop: "45px",
                      marginLeft: "0px",
                      height: "260px",
                    }}
                    loadingHeight="260px"
                    status={riskByNationalityStatus}
                    data={chartData.topRiskByNationality}
                  />
                </Col>
              )}
            </Row>
          }
          leftColumnWidth="50%"
          rightColumnWidth="50%"
          showThreeColumns={!allSectionsEmpty && !isAnySectionLoading}
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

RiskRegisterStatistics.propTypes = {
  filters: PropTypes.object,
};

