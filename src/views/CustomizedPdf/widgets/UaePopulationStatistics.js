import PropTypes from "prop-types";
import React, { useEffect, useContext, useMemo } from "react";
import { Row, Col, Button, PhosphorIcons, Empty, Text, Spin } from "re-usable-design-components";
import translation from "../translation.json";
import { Page, Template, colors } from "@/customPdf";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import Flags from 'country-flag-icons/react/1x1';
import ViolatorsByGender from "@/customPdf/widget/ViolatorsByGender";
import CenterPanel from "@/customPdf/widget/CenterPanel";
import DistributionByEmirate from "@/customPdf/widget/DistributionByEmirate";
import DistributionByAgeRange from "@/customPdf/widget/DistributionByAgeRange";
import IssuedVisa from "@/customPdf/widget/IssuedVisa";
import UAEPopulationSummaryViolator from "@/customPdf/widget/UAEPopulationSummaryViolator";
import useAsync from "@/hooks/useAsync";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, checkIsPdfSectionEmpty } from "@/utils/helper";
import {
  getUAEPopulationStatisticsSummary,
  getPopulationByGender,
  getPopulationByAgeRange,
  getTopNationalities,
  getDistributionByEmirate,
} from "@/services/customPdf/uaePopulationStatistics";
import { head } from "lodash";

const { ArrowSquareOut } = PhosphorIcons;

export default function UaePopulationStatistics({
  filters = {},
  emiratesConfigValue,
}) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const { geoJsonObj } = useWorldGeoJSON();

  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "UAE-Population-Statistics.pdf"
  });

  const {
    execute: executeSummary,
    status: summaryStatus,
    value: summaryValue,
  } = useAsync({ asyncFunction: getUAEPopulationStatisticsSummary });

  const {
    execute: executeGender,
    status: genderStatus,
    value: genderValue,
  } = useAsync({ asyncFunction: getPopulationByGender });

  const {
    execute: executeAgeRange,
    status: ageRangeStatus,
    value: ageRangeValue,
  } = useAsync({ asyncFunction: getPopulationByAgeRange });

  const {
    execute: executeTopNationalities,
    status: topNationalitiesStatus,
    value: topNationalitiesValue,
  } = useAsync({ asyncFunction: getTopNationalities });

  const {
    execute: executeDistributionByEmirate,
    status: distributionByEmirateStatus,
    value: distributionByEmirateValue,
  } = useAsync({ asyncFunction: getDistributionByEmirate });

  useEffect(() => {
    // Prepare filter object for API calls
    const apiFilters = {
      ...filters,
    };

    // Execute API calls
    executeSummary({ filter: apiFilters });
    executeGender({ filter: apiFilters });
    executeAgeRange({ filter: apiFilters });
    executeTopNationalities({ filter: { ...apiFilters, emirate_code: 0, limit: 5 } });
    executeDistributionByEmirate({ filter: apiFilters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apiData = {
    summary: summaryValue?.data,
    gender: genderValue?.data,
    ageRange: ageRangeValue?.data,
    // Handle nested data structure: check if data is array first, then check for nested data.data
    topNationalities: Array.isArray(topNationalitiesValue?.data)
      ? topNationalitiesValue?.data
      : topNationalitiesValue?.data?.data || topNationalitiesValue?.data,
    distributionByEmirate: distributionByEmirateValue?.data,
  };

  const componentProps = {
    summary: { status: summaryStatus, data: apiData.summary },
    gender: { status: genderStatus, data: apiData.gender },
    ageRange: { status: ageRangeStatus, data: apiData.ageRange },
    topNationalities: { status: topNationalitiesStatus, data: apiData.topNationalities },
    distributionByEmirate: { status: distributionByEmirateStatus, data: apiData.distributionByEmirate },
  };

  // Get ISO-2 code from geoJsonObj (maps ISO-3 to ISO-2)
  const getISO2Code = (code3) => {
    if (!code3) return null;
    const geoJsonItem = geoJsonObj?.[code3];
    return geoJsonItem?.properties?.["iso-a2"] || code3; // Return ISO-2 code or original if not found
  };

  // Prepare chart data for IssuedVisa component
  const prepareChartData = (topNationalitiesData) => {
    // Handle both nested and flat data structures
    const dataArray = Array.isArray(topNationalitiesData)
      ? topNationalitiesData
      : (topNationalitiesData?.data && Array.isArray(topNationalitiesData.data))
        ? topNationalitiesData.data
        : [];

    if (!dataArray || dataArray.length === 0) {
      return { categories: [], values: [], countryCodes: [] };
    }

    // Extract categories (nationality names) based on language
    const categories = dataArray.map(item =>
      language === "ar" ? (item?.name_ar || "") : (item?.name_en || "")
    );

    // Extract and convert country codes for flag images (3-letter to ISO-2)
    const countryCodes = dataArray.map(item => {
      const code = item?.code || "";
      return getISO2Code(code);
    });

    // Extract data values (total counts)
    const data = dataArray.map(item => item?.total || 0);

    return {
      categories: categories,
      countryCodes: countryCodes,
      values: [
        {
          data: data,
          showInLegend: false,
          color: "rgba(12, 10, 6, 0.37)",
          borderRadius: { radius: 50, where: "all" },
          dataLabels: {
            enabled: true,
            inside: false,
            color: colors.text,
            x: 0,
            style: {
              textOutline: "1px solid #fff",
            },
          },
        },
      ],
    };
  };

  // Prepare chart data for Top Nationalities with country codes
  const topNationalitiesChartData = useMemo(() => {
    const rawData = componentProps?.topNationalities?.data;
    const chartData = prepareChartData(rawData);
    return chartData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentProps?.topNationalities?.data]);

  // Prepare flags array for IssuedVisa component
  const flagsData = useMemo(() => {
    if (!topNationalitiesChartData?.categories || !topNationalitiesChartData?.countryCodes) {
      return [];
    }

    return topNationalitiesChartData.categories.map((countryName, index) => {
      const countryCode = topNationalitiesChartData?.countryCodes?.[index];
      const FlagComponent = countryCode && Flags?.[countryCode] ? Flags[countryCode] : null;

      return {
        countryCode,
        countryName,
        FlagComponent,
        labelColor: colors.chartAxisLabelColor,
        labelFontSize: colors.chartAxisLabelFontSize,
      };
    });
  }, [topNationalitiesChartData]);

  // Prepare UAE Population Summary branches with layout configurations
  const prepareSummaryBranches = (summaryData) => {
    if (!summaryData) return [];

    const branches = [];

    // Map the new API response structure to branches
    // Order from left to right: Visa Holders, Residents, GCC, UAE Nationals

    // total_visa -> visa holders (leftmost)
    if (summaryData?.total_visa !== undefined) {
      branches.push({
        x: -220, // Position for leftmost card
        cardTopY: 355,
        color: colors.visaHoldersColor,
        direction: "left",
        number: summaryData?.total_visa,
        label: translation[language]?.["Visa Holders"] || "Visa Holders",
      });
    }

    // total_expats -> residents (left-center)
    if (summaryData?.total_expats !== undefined) {
      branches.push({
        x: -10, // Position for left-center card
        cardTopY: 355,
        color: colors.residentsColor,
        direction: "left",
        number: summaryData?.total_expats,
        label: translation[language]?.["Residents"] || "Residents",
      });
    }

    // total_gcc -> gcc (right-center)
    if (summaryData?.total_gcc !== undefined) {
      branches.push({
        x: 190, // Position for right-center card
        cardTopY: 355,
        color: colors.gccColor,
        direction: "right",
        number: summaryData?.total_gcc,
        label: translation[language]?.["GCC"] || "GCC",
      });
    }

    // total_locals -> uae nationals (rightmost)
    if (summaryData?.total_locals !== undefined) {
      branches.push({
        x: 390, // Position for rightmost card
        cardTopY: 355,
        color: colors.uaeNationalsColor,
        direction: "right",
        number: summaryData?.total_locals,
        label: translation[language]?.["UAE Nationals"] || "UAE Nationals",
      });
    }

    return branches;
  };

  // Map emirate codes to emirate IDs
  const getEmirateIdFromCode = (code) => {
    const codeMap = {
      1: 'abu-dhabi',
      2: 'dubai',
      3: 'sharjah',
      4: 'ajman',
      5: 'umm-al-quwain',
      6: 'ras-al-khaimah',
      7: 'fujairah',
    };
    return codeMap[code] || null;
  };

  // Format number for display
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  // Format percentage for display
  const formatPercentage = (num) => {
    if (num === null || num === undefined || num === 0) return '0%';
    return `${num.toFixed(2)}%`;
  };

  // Create mapping from emirate code to names from config
  const emiratesNameMap = useMemo(() => {
    const map = {};
    if (emiratesConfigValue?.data && Array.isArray(emiratesConfigValue.data)) {
      emiratesConfigValue.data.forEach((emirate) => {
        map[emirate?.emirate_code] = {
          en: emirate?.emirate_name_en || '',
          ar: emirate?.emirate_name_ar || '',
        };
      });
    }
    return map;
  }, [emiratesConfigValue]);

  // Helper to get emirate name from config
  const getEmirateName = (code) => {
    const emirate = emiratesNameMap[code];
    if (!emirate) return '';
    return language === "ar" ? emirate.ar : emirate.en;
  };

  // Prepare DistributionByEmirate items with layout configurations
  const prepareDistributionByEmirateItems = useMemo(() => {
    return (apiItems) => {
      if (!apiItems || !Array.isArray(apiItems)) return [];

      const defaultEmirates = [
        {
          id: 'abu-dhabi',
          code: 1,
          // Southwest (far western region)
          marker: { xPct: 59, yPct: 108 },
          box: { leftPct: 20, topPct: 111, anchor: 'right-top' },
          label: { dx: -6, dy: 12 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
        {
          id: 'dubai',
          code: 2,
          // North of Abu Dhabi (west-central)
          marker: { xPct: 63, yPct: 86 },
          box: { leftPct: 20, topPct: 64, anchor: 'right-mid' },
          label: { dx: -4, dy: 10 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
        {
          id: 'sharjah',
          code: 3,
          // North of Dubai (west-central)
          marker: { xPct: 67, yPct: 78 },
          box: { leftPct: 50.5, topPct: 116, anchor: 'top-mid' },
          label: { dx: -10, dy: 12 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
        {
          id: 'ajman',
          code: 4,
          // North of Sharjah (west-central)
          marker: { xPct: 71, yPct: 71 },
          box: { leftPct: 18, topPct: 18, anchor: 'right-mid' },
          label: { dx: -8, dy: 10 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
        {
          id: 'umm-al-quwain',
          code: 5,
          // North of Ajman (north-central)
          marker: { xPct: 73, yPct: 62 },
          box: { leftPct: 47, topPct: 4, anchor: 'bottom-mid' },
          label: { dx: -6, dy: 10 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
        {
          id: 'ras-al-khaimah',
          code: 6,
          // Northeast (further north than Umm Al Quwain)
          marker: { xPct: 76, yPct: 47 },
          box: { leftPct: 75, topPct: 5, anchor: 'bottom-mid' },
          label: { dx: 16, dy: 14 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
        {
          id: 'fujairah',
          code: 7,
          // Eastern coast (northeast)
          marker: { xPct: 90, yPct: 76 },
          box: { leftPct: 76, topPct: 84, anchor: 'top-mid' },
          label: { dx: -8, dy: 12 },
          data: { expats: '0', percentage: '0%', residence: '0', visa: '0' },
        },
      ];

      return defaultEmirates.map(emirate => {
        // Get emirate name from config
        const emirateName = getEmirateName(emirate.code);

        // Find API item by matching emirate code to ID
        const apiItem = apiItems?.find(item => {
          const emirateId = getEmirateIdFromCode(item?.emirate_code);
          return emirateId === emirate?.id;
        });

        if (apiItem) {
          // Always use name from config, not from API response
          const name = emirateName;

          // Map API data to component format
          return {
            ...emirate,
            name: name,
            label: {
              ...emirate.label,
              text: name,
            },
            data: {
              // Total Population (from API, used in header)
              totalPopulation: formatNumber(apiItem?.total_population || 0),
              // UAE Nationals (Total)
              uaeNationalsTotal: formatNumber(apiItem?.total_locals || 0),
              uaeNationalsTotalPercentage: formatPercentage(apiItem?.total_locals_percentage || 0),
              // Males (UAE Nationals)
              malesUaeNationals: formatNumber(apiItem?.male_locals || 0),
              malesUaeNationalsPercentage: formatPercentage(apiItem?.male_locals_percentage || 0),
              // Females (UAE Nationals)
              femalesUaeNationals: formatNumber(apiItem?.female_locals || 0),
              femalesUaeNationalsPercentage: formatPercentage(apiItem?.female_locals_percentage || 0),
              // Number of Residents
              residents: formatNumber(apiItem?.total_expats || 0),
              residentsPercentage: formatPercentage(apiItem?.total_expats_percentage || 0),
              // Visa Holders & GCC
              visaGcc: formatNumber(apiItem?.total_visa_and_gcc || 0),
              visaGccPercentage: formatPercentage(apiItem?.total_visa_and_gcc_percentage || 0),
            },
          };
        }

        // If no API item, still use name from config
        return {
          ...emirate,
          name: emirateName,
          label: {
            ...emirate.label,
            text: emirateName,
          },
        };
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiratesNameMap]);

  const handleExport = () => {
    printDocumentCustomSize(`${translation[language]?.["UAE Population Statistics"]}.pdf`, setIsCreatingPdf);
  };

  // Check loading state and empty state
  const { isLoading: isAnySectionLoading, allSectionsEmpty, hasAnyData } = useMemo(() => {
    const sections = [
      // Summary section
      {
        status: summaryStatus,
        data: componentProps?.summary?.data
      },
      // Gender section
      {
        status: genderStatus,
        data: componentProps?.gender?.data
      },
      // Age Range section
      {
        status: ageRangeStatus,
        data: componentProps?.ageRange?.data
      },
      // Top Nationalities section
      {
        status: topNationalitiesStatus,
        data: topNationalitiesChartData
      },
      // Distribution by Emirate section
      {
        status: distributionByEmirateStatus,
        data: componentProps?.distributionByEmirate?.data
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
    summaryStatus,
    componentProps?.summary?.data,
    genderStatus,
    componentProps?.gender?.data,
    ageRangeStatus,
    componentProps?.ageRange?.data,
    topNationalitiesStatus,
    topNationalitiesChartData,
    distributionByEmirateStatus,
    componentProps?.distributionByEmirate?.data
  ]);

  return (
    <>
      <Row
        gutter={16}
        justify="end"
        align="middle"
        wrap={false}
        style={{
          marginBottom: "16px",
          direction: isRtl ? "rtl" : "ltr"
        }}
      >
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
      <Page title={translation[language]?.["UAE Population Statistics"] || "UAE Population Statistics"} isCreatingPdf={isCreatingPdf}>
        <Template
          isRightColumnLeftBorder={false}
          showThreeColumns={!allSectionsEmpty && !isAnySectionLoading}
          leftColumn={
            <Row gutter={[0, 8]}
            >
              {/* Top Nationalities By Year */}
              <Col>
                <IssuedVisa
                  title={translation[language]?.["Top 5 Nationalities in the Country"] || "Top 5 Nationalities in the Country"}
                  imageSrc="/customPdf/uaePopulationStatistics/plane_ok.png"
                  imageAlt={translation[language]?.["Pakistani Visa Icon"] || "Pakistani Visa Icon"}
                  forceLeftPosition={true}
                  chartProps={{
                    plotOptions: {
                      bar: {
                        borderWidth: 0, // Disable borders on bars
                        borderColor: 'transparent', // Ensure no border color
                      }
                    },
                    xAxis: {
                      opposite: true,
                      labels: { 
                        style: { 
                          color: colors.primary,
                          fontSize: colors.chartAxisLabelFontSize
                        } 
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: {
                        enabled: false,
                        formatter: function () {
                          // Just return the country name without flag
                          return this.value;
                        },
                        style: { 
                          color: colors.chartAxisLabelColor,
                          fontSize: colors.chartAxisLabelFontSize
                        } 
                      },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 3, zIndex: 5 },
                      ],
                    },
                    ...topNationalitiesChartData,
                    chart: {
                      type: 'bar', // Ensure chart type is bar
                    },
                    tooltip: {
                      enabled: false,
                    },
                  }}
                  chartColStyle={{
                    width: "80%",
                    marginTop: "0px",
                    marginLeft: "100px",
                    height: "120px",
                  }}
                  status={componentProps?.topNationalities?.status}
                  data={topNationalitiesChartData}
                  flags={flagsData}
                />
              </Col>

              <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "10px" }}></div>
              {/* UAE Map with Distribution */}
              <CenterPanel
                showMapBackground
                mapSrc="/customPdf/uae_map.jpg"
                mapOpacity={1}
                mapScale={`scale(1.2, 1.5)`}
                mapPosition="0px 20px"
              >
                <DistributionByEmirate
                  title={translation[language]?.["Distribution by Emirate"] || "Distribution by Emirate"}
                  imageSrc="/customPdf/uaePopulationStatistics/emirate.png"
                  imageAlt={translation[language]?.["Emirate Map"] || "Emirate Map"}
                  forceLeftPosition={true}
                  contentStyle={{
                    width: "750px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    overflow: "visible",
                  }}
                  items={prepareDistributionByEmirateItems(componentProps?.distributionByEmirate?.data)}
                  status={componentProps?.distributionByEmirate?.status}
                  data={componentProps?.distributionByEmirate?.data}
                />
              </CenterPanel>
            </Row>
          }
          rightColumn={
            <Row gutter={[0, 8]} style={{ borderLeft: `1px solid ${colors.border}`, paddingLeft: 10 }}>
              <Col>
                <Row
                  gutter={[0, 8]}
                >
                  {/* Summary */}
                  <Col>
                    <Row style={{ height: "250px", marginBottom: "10px", overflow: "hidden" }}>
                      <Col>
                        <UAEPopulationSummaryViolator
                          title={translation[language]?.["Summary"] || "Summary"}
                          imageAlt="Violators Icon"
                          imageSrc="/customPdf/uaePopulationStatistics/summary.png"
                          centerLabel1={translation[language]?.["UAE Population"] || "UAE Population"}
                          forceLeftPosition={true}
                          total={componentProps?.summary?.data?.total_visa_holders}
                          branches={prepareSummaryBranches(componentProps?.summary?.data)}
                          status={componentProps?.summary?.status}
                          data={componentProps?.summary?.data}
                        />
                      </Col>
                    </Row>

                    <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "10px" }}></div>

                    {/* Population by Gender */}
                    <Row style={{ height: "120px", marginBottom: "10px" }}>
                      <Col>
                        {(() => {
                          // Calculate percentages from the new API response structure
                          const maleResidents = componentProps?.gender?.data?.male_residents || 0;
                          const femaleResidents = componentProps?.gender?.data?.female_residents || 0;
                          const totalResidents = componentProps?.gender?.data?.total_residents || (maleResidents + femaleResidents);

                          // Calculate percentages on frontend with 1 decimal place if needed
                          const malePercent = totalResidents > 0
                            ? parseFloat(((maleResidents / totalResidents) * 100).toFixed(1))
                            : 0;
                          const femalePercent = parseFloat((100 - malePercent).toFixed(1));

                          return (
                            <ViolatorsByGender
                              title={translation[language]?.["Population by Gender"] || "Population by Gender"}
                              imageSrc="/customPdf/uaePopulationStatistics/male_female.png"
                              imageAlt={translation[language]?.["Gender Icon"] || "Gender Icon"}
                              forceLeftPosition={true}
                              chartColStyle={{
                                width: "calc(100% - 150px)",
                                marginLeft: "125px",
                                marginTop: "70px",
                                height: "150px",
                              }}
                              leftImageStyle={{ position: "absolute", bottom: "35px" }}
                              rightImageStyle={{
                                position: "absolute",
                                bottom: "35px",
                                right: "0",
                              }}
                              maleCount={maleResidents}
                              femaleCount={femaleResidents}
                              malePercent={malePercent}
                              showMarker={true}
                              maleLabel={translation[language]?.["Male"] || "Male"}
                              femaleLabel={translation[language]?.["Female"] || "Female"}
                              status={componentProps?.gender?.status}
                              data={componentProps?.gender?.data}
                            />
                          );
                        })()}
                      </Col>
                    </Row>

                    <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "10px" }}></div>

                    <Row style={{ height: "200px", marginBottom: "10px" }}>
                      <Col>
                        {(() => {
                          // Transform the new API response structure
                          const ageRangeData = componentProps?.ageRange?.data || [];

                          // Calculate total residents for percentage calculation
                          const totalResidents = ageRangeData.reduce((sum, item) => sum + (item?.total_residents || 0), 0);

                          // Map icon paths based on age range
                          const getIconPath = (ageRange) => {
                            if (ageRange === "0-18") return "/customPdf/0_10.png";
                            if (ageRange === "19-21") return "/customPdf/10_20.png";
                            if (ageRange === "22-29") return "/customPdf/20_30.png";
                            if (ageRange === "30-39") return "/customPdf/30_40.png";
                            if (ageRange === "40-49") return "/customPdf/40_50.png";
                            if (ageRange === "50-59") return "/customPdf/50_60.png";
                            if (ageRange === "60+") return "/customPdf/60+.png";
                            return "/customPdf/0_10.png"; // default
                          };

                          // Transform data and calculate percentages
                          const ranges = ageRangeData.map((item, index) => {
                            const percentage = totalResidents > 0
                              ? Math.round(((item?.total_residents || 0) / totalResidents) * 100)
                              : 0;

                            const ageRange = item?.age_range || "";
                            // Fixed height of 22 for "60+" age range
                            const iconHeight = ageRange === "60+" ? 22 : (20 + (index * 1));

                            return {
                              label: ageRange,
                              value: item?.total_residents || 0,
                              iconSrc: getIconPath(ageRange),
                              iconHeight: iconHeight
                            };
                          });

                          return (
                            <DistributionByAgeRange
                              title={translation[language]?.["Distribution by Age Group"] || "Distribution by Age Group"}
                              imageSrc="/customPdf/uaePopulationStatistics/summary.png"
                              imageAlt={translation[language]?.["Age Range"] || "Age Range"}
                              forceLeftPosition={true}
                              ranges={ranges}
                              height={200}
                              status={componentProps?.ageRange?.status}
                              data={componentProps?.ageRange?.data}
                            />
                          );
                        })()}
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          }
          leftColumnWidth="60%"
          rightColumnWidth="40%"
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

UaePopulationStatistics.propTypes = {
  filters: PropTypes.object,
  emiratesConfigValue: PropTypes.any,
};
