import React, { useEffect, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Button, Select, PhosphorIcons, Empty, Text, Spin } from "re-usable-design-components";
import translation from "../translation.json";
import { Page, Template, colors } from "@/customPdf";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import CenterPanel from "@/customPdf/widget/CenterPanel";
import PdfBarChart from "@/customPdf/widget/PdfBarChart";
import IssuedVisa from "@/customPdf/widget/SummaryOfViolators";
import DistributionByEmirate from "@/customPdf/widget/ViolatorsDistributionByEmirate";
import DistributionByAgeRange from "@/customPdf/widget/ViolatorsDistributionByAgeRange";
import ViolatorSummary from "@/customPdf/widget/ViolatorSummary";
import ViolatorsByGender from "@/customPdf/widget/ViolatorsByGender";
import useAsync from "@/hooks/useAsync";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, checkIsPdfSectionEmpty, formatNumber } from "@/utils/helper";
import { getViolatorsSummary, getViolatorsByAgeRange, getViolatorsByGender, getViolatorsByEmirates, getResidencyViolatorsByYear, getVisaViolatorsByYear } from "@/services/customPdf/violatorsStatistics";
import { getNationalities } from "@/services/customPdf/riskRegisterStatistics";
import { head } from "lodash";

const { ArrowSquareOut } = PhosphorIcons;

export default function ViolatorsStatistics({ filters = {}, emiratesConfigValue }) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const [selectedCountry, setSelectedCountry] = useState(undefined);

  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "Violators-Statistics.pdf"
  });

  // Fetch nationalities
  const {
    execute: executeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getNationalities });

  const {
    execute: executeIssuedResidenceVisa,
    status: issuedResidenceVisaStatus,
    value: issuedResidenceVisaValue,
  } = useAsync({ asyncFunction: getResidencyViolatorsByYear });

  const {
    execute: executeVisaByYear,
    status: visaByYearStatus,
    value: visaByYearValue,
  } = useAsync({ asyncFunction: getVisaViolatorsByYear });

  const {
    execute: executeDistributionByEmirate,
    status: distributionByEmirateStatus,
    value: distributionByEmirateValue,
  } = useAsync({ asyncFunction: getViolatorsByEmirates });

  const {
    execute: executeAgeRange,
    status: ageRangeStatus,
    value: ageRangeValue,
  } = useAsync({ asyncFunction: getViolatorsByAgeRange });

  const {
    execute: executeSummary,
    status: summaryStatus,
    value: summaryValue,
  } = useAsync({ asyncFunction: getViolatorsSummary });

  const {
    execute: executeGender,
    status: genderStatus,
    value: genderValue,
  } = useAsync({ asyncFunction: getViolatorsByGender });

  useEffect(() => {
    executeNationalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger API calls when selectedCountry changes
  useEffect(() => {
    const apiFilters = { nationality: selectedCountry };

    executeIssuedResidenceVisa({ filter: apiFilters });
    executeVisaByYear({ filter: apiFilters });
    executeDistributionByEmirate({ filter: apiFilters });
    executeAgeRange({ filter: apiFilters });
    executeSummary({ filter: apiFilters });
    executeGender({ filter: apiFilters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  const componentProps = {
    residenceVisaStatistics: {
      status: issuedResidenceVisaStatus,
      data: issuedResidenceVisaValue?.data,
    },
    visaByYear: {
      status: visaByYearStatus,
      data: visaByYearValue?.data,
    },
    distributionByEmirate: {
      status: distributionByEmirateStatus,
      data: distributionByEmirateValue?.data,
    },
    violatorsByAgeRange: {
      status: ageRangeStatus,
      data: ageRangeValue?.data,
    },
    summaryStatistics: {
      status: summaryStatus,
      data: summaryValue?.data,
    },
    violatorsByGender: {
      status: genderStatus,
      data: genderValue?.data,
    },
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
  const prepareDistributionByEmirateItems = (apiItems) => {
    // Static layout configurations for each emirate
    const defaultEmirates = [
      {
        id: 'abu-dhabi',
        code: 1,
        nameEn: 'Abu Dhabi',
        nameAr: 'أبوظبي',
        marker: { xPct: 32.33, yPct: 99.26 },
        box: { leftPct: 7.33, topPct: 102.63, anchor: 'right-top' },
        label: { text: translation[language]?.["Abu Dhabi"] || "Abu Dhabi", dx: -6, dy: 12 },
      },
      {
        id: 'dubai',
        code: 2,
        nameEn: 'Dubai',
        nameAr: 'دبي',
        marker: { xPct: 38.33, yPct: 78.26 },
        box: { leftPct: 2.33, topPct: 70.63, anchor: 'right-top' },
        label: { text: translation[language]?.["Dubai"] || "Dubai", dx: -4, dy: 10 },
      },
      {
        id: 'sharjah',
        code: 3,
        nameEn: 'Sharjah',
        nameAr: 'الشارقة',
        marker: { xPct: 41.33, yPct: 69.26 },
        box: { leftPct: 37.33, topPct: 102.63, anchor: 'top-mid' },
        label: { text: translation[language]?.["Sharjah"] || "Sharjah", dx: -10, dy: 12 },
      },
      {
        id: 'ajman',
        code: 4,
        nameEn: 'Ajman',
        nameAr: 'عجمان',
        marker: { xPct: 44.33, yPct: 60.26 },
        box: { leftPct: 5.67, topPct: 38.63, anchor: 'right-mid' },
        label: { text: translation[language]?.["Ajman"] || "Ajman", dx: -8, dy: 10 },
      },
      {
        id: 'umm-al-quwain',
        code: 5,
        nameEn: 'Umm Al Quwain',
        nameAr: 'أم القيوين',
        marker: { xPct: 47.33, yPct: 48.26 },
        box: { leftPct: 18.33, topPct: 6.63, anchor: 'right-mid' },
        label: { text: translation[language]?.["Umm Al Quwain"] || "Umm Al Quwain", dx: -6, dy: 10 },
      },
      {
        id: 'ras-al-khaimah',
        code: 6,
        nameEn: 'Ras Al Khaimah',
        nameAr: 'رأس الخيمة',
        marker: { xPct: 52.33, yPct: 37.26 },
        box: { leftPct: 49.33, topPct: 0.63, anchor: 'bottom-mid' },
        label: { text: translation[language]?.["Ras Al Khaima"] || "Ras Al Khaima", dx: 16, dy: 14 },
      },
      {
        id: 'fujairah',
        code: 7,
        nameEn: 'Fujairah',
        nameAr: 'الفجيرة',
        marker: { xPct: 59.33, yPct: 57.26 },
        box: { leftPct: 49.33, topPct: 67.63, anchor: 'top-mid' },
        label: { text: translation[language]?.["Fujairah"] || "Fujairah", dx: -8, dy: 12 },
      },
    ];

    if (!apiItems || !Array.isArray(apiItems)) {
      // Return empty array if no API data, so component can show empty state
      return [];
    }

    return defaultEmirates
      .map(emirate => {
        // Get emirate name from config
        const emirateName = getEmirateName(emirate.code);

        // Find API item by matching emirate code
        const apiItem = apiItems?.find(item => {
          const emirateId = getEmirateIdFromCode(item?.emirate_code);
          return emirateId === emirate?.id;
        });

        // Always use name from config, not from API response
        const name = emirateName || (language === 'ar' ? emirate.nameAr : emirate.nameEn);

        return {
          id: emirate.id,
          name: name,
          marker: emirate.marker,
          box: emirate.box,
          label: {
            ...emirate.label,
            text: name,
          },
          data: {
            total_violators: apiItem?.total_violators || 0,
            total_residents_violators: apiItem?.total_residents_violators || 0,
            total_visa_violators: apiItem?.total_visa_violators || 0,
            total_residents_violators_percentage: apiItem?.total_residents_violators_percentage || 0,
            total_visa_violators_percentage: apiItem?.total_visa_violators_percentage || 0,
          },
        };
      });
  };

  // Format number helper
  const formatNumberForDisplay = (num) => {
    if (num === null || num === undefined) return '0';
    return formatNumber(Number(num) || 0);
  };

  // Prepare ViolatorSummary branches with layout configurations
  const prepareSummaryBranches = (summaryData) => {
    if (!summaryData) return [];

    const branches = [];
    const centerX = 250;
    const equalDistance = 180; // Equal distance from center for both boxes (increased to prevent overlap)

    if (summaryData?.visa_violators !== undefined) {
      branches.push({
        x: centerX - equalDistance, // 70
        cardTopY: 425,
        color: "#FDEADA",
        direction: "left",
        number: formatNumberForDisplay(summaryData.visa_violators),
        label: translation[language]?.["Visa Violators Summary"] || "Visa Violators",
      });
    }

    if (summaryData?.residency_violators !== undefined) {
      branches.push({
        x: centerX + equalDistance, // 430
        cardTopY: 425,
        color: "#E7BB62",
        direction: "right",
        number: formatNumberForDisplay(summaryData.residency_violators),
        label: translation[language]?.["Residence Violators Summary"] || "Residence Violators",
      });
    }

    return branches;
  };

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

  // Get selected country name for display in title
  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return null;
    const country = countryOptions.find(option => option.value === selectedCountry);
    return country ? country.label : null;
  }, [selectedCountry, countryOptions]);

  const handleExport = () => {

    printDocumentCustomSize(
      selectedCountryName 
        ? `${translation[language]?.["Statistics of Violators in the UAE"]} - ${selectedCountryName}.pdf`
        : (`${translation[language]?.["Statistics of Violators in the UAE"]}.pdf`), setIsCreatingPdf);
  };

  // Helper function to check if a section is empty based on expected numeric keys
  const isSectionEmpty = (status, data, sectionType) => {
    if (!status || status !== "success") {
      return false;
    }

    if (!data) {
      return true;
    }

    // Check based on section type
    switch (sectionType) {
    case 'summaryStatistics':
      // Check if all expected keys are 0 or missing
      const summaryKeys = ['visa_violators', 'residency_violators', 'total_violators'];
      const summaryValues = summaryKeys.map(key => Number(data[key]) || 0);
      return summaryValues.every(val => val === 0);

    case 'violatorsByGender':
      // Check if all expected keys are 0 or missing
      const genderKeys = ['male_violators', 'female_violators'];
      const genderValues = genderKeys.map(key => Number(data[key]) || 0);
      return genderValues.every(val => val === 0);

    case 'violatorsByAgeRange':
      // Check if age_groups array is empty or all values are 0
      if (!data.age_groups || !Array.isArray(data.age_groups) || data.age_groups.length === 0) {
        return true;
      }
      return data.age_groups.every(group => {
        const visaViolations = Number(group?.visa_violations) || 0;
        const residencyViolations = Number(group?.residency_violations) || 0;
        return visaViolations === 0 && residencyViolations === 0;
      });

    case 'residenceVisaStatistics':
      // Check if array is empty or all total_violations are 0
      if (!Array.isArray(data) || data.length === 0) {
        return true;
      }
      return data.every(item => (Number(item?.total_violations) || 0) === 0);

    case 'visaByYear':
      // Check if array is empty or all total_violations are 0
      if (!Array.isArray(data) || data.length === 0) {
        return true;
      }
      return data.every(item => (Number(item?.total_violations) || 0) === 0);

    case 'distributionByEmirate':
      // Check if array is empty or all numeric keys are 0
      if (!Array.isArray(data) || data.length === 0) {
        return true;
      }
      return data.every(item => {
        const totalViolators = Number(item?.total_violators) || 0;
        const totalResidentsViolators = Number(item?.total_residents_violators) || 0;
        const totalVisaViolators = Number(item?.total_visa_violators) || 0;
        return totalViolators === 0 && totalResidentsViolators === 0 && totalVisaViolators === 0;
      });

    default:
      // Fallback to original check
      return checkIsPdfSectionEmpty(status, data);
    }
  };

  // Check loading state and empty state
  const { isLoading: isAnySectionLoading, allSectionsEmpty, hasAnyData } = useMemo(() => {
    const sections = [
      // Residence Visa Statistics
      {
        status: componentProps?.residenceVisaStatistics?.status,
        data: componentProps?.residenceVisaStatistics?.data,
        type: 'residenceVisaStatistics'
      },
      // Visa By Year
      {
        status: componentProps?.visaByYear?.status,
        data: componentProps?.visaByYear?.data,
        type: 'visaByYear'
      },
      // Distribution By Emirate
      {
        status: componentProps?.distributionByEmirate?.status,
        data: componentProps?.distributionByEmirate?.data,
        type: 'distributionByEmirate'
      },
      // Violators By Age Range
      {
        status: componentProps?.violatorsByAgeRange?.status,
        data: componentProps?.violatorsByAgeRange?.data,
        type: 'violatorsByAgeRange'
      },
      // Summary Statistics
      {
        status: componentProps?.summaryStatistics?.status,
        data: componentProps?.summaryStatistics?.data,
        type: 'summaryStatistics'
      },
      // Violators By Gender
      {
        status: componentProps?.violatorsByGender?.status,
        data: componentProps?.violatorsByGender?.data,
        type: 'violatorsByGender'
      },
    ];

    // Check if any section is still loading
    const hasLoadingSections = sections.some(section =>
      section.status === "pending" || section.status === "idle"
    );

    // Check if any section has data (not empty)
    const hasData = sections.some(section => {
      if (section.status === "success" || section.status === "error") {
        return !isSectionEmpty(section.status, section.data, section.type);
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
      isSectionEmpty(section.status, section.data, section.type)
    );

    return {
      isLoading: false,
      allSectionsEmpty: allEmpty,
      hasAnyData: hasData
    };
  }, [
    componentProps?.residenceVisaStatistics?.status,
    componentProps?.residenceVisaStatistics?.data,
    componentProps?.visaByYear?.status,
    componentProps?.visaByYear?.data,
    componentProps?.distributionByEmirate?.status,
    componentProps?.distributionByEmirate?.data,
    componentProps?.violatorsByAgeRange?.status,
    componentProps?.violatorsByAgeRange?.data,
    componentProps?.summaryStatistics?.status,
    componentProps?.summaryStatistics?.data,
    componentProps?.violatorsByGender?.status,
    componentProps?.violatorsByGender?.data,
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
      <Page title={
        selectedCountryName 
          ? `${translation[language]?.["Statistics of Violators in the UAE"] || "Statistics of Violators in the UAE"} - ${selectedCountryName}` 
          : (translation[language]?.["Statistics of Violators in the UAE"] || "Statistics of Violators in the UAE")
      } isCreatingPdf={isCreatingPdf}>
        <Template
          leftColumn={
            <Row gutter={[0, 8]}
              style={{ borderRight: `1px solid ${colors.border}` }}
            >
              {/* Residency Violators By year */}
              <Col>
                <PdfBarChart
                  isImageWithBorder={true}
                  title={translation[language]?.["Residency Violators by Year"]}
                  imageSrc="/customPdf/violatorsStatistics/people_home.png"
                  forceLeftPosition={true}
                  meshRight={70}
                  loadingHeight="280px"
                  titleWrapperStyle={{ maxWidth: "100px", width: "100px" }}
                  chartProps={{
                    xAxis: {
                      opposite: true,
                      labels: { style: { color: colors.primary } },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 3, zIndex: 5 },
                      ],
                    },
                    categories: componentProps?.residenceVisaStatistics?.data?.map(item => 
                      item.year === "Others" ? (translation[language]?.["Others"] || "Others") : item.year
                    ) || [],
                    values: [
                      {
                        data: componentProps?.residenceVisaStatistics?.data?.map(item => item.total_violations) || [],
                        showInLegend: false,
                        color: "#E7BB62",
                        borderWidth: 0,
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          inside: false,
                          x: 0,
                          style: {
                            textOutline: "1px solid #fff",
                            color: colors.text,
                          },
                          formatter: function() {
                            return formatNumberForDisplay(this.y);
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
                    marginTop: "94px",
                    marginLeft: "0px",
                    height: "190px",
                  }}
                  status={componentProps?.residenceVisaStatistics?.status}
                  data={componentProps?.residenceVisaStatistics?.data}
                />
              </Col>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "16px", marginRight: "6px", width: "100%" }}></div>

              {/* Visa Violators by Year */}
              <Col>
                <IssuedVisa
                  title={translation[language]?.["Visa Violators by Year"]}
                  imageSrc="/customPdf/violatorsStatistics/plane_ok.png"
                  meshRight={70}
                  chartProps={{
                    xAxis: {
                      opposite: true,
                      labels: { style: { color: colors.primary } },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                    },
                    yAxis: {
                      reversed: true,
                      labels: { enabled: false },
                      gridLineColor: colors.chartGridLineColor,
                      gridLineWidth: 0,
                      plotLines: [
                        { value: 0, color: colors.plotLineColor, width: 3, zIndex: 5 },
                      ],
                    },
                    categories: componentProps?.visaByYear?.data?.map(item => 
                      item.year === "Others" ? (translation[language]?.["Others"] || "Others") : item.year
                    ) || [],
                    values: [
                      {
                        data: componentProps?.visaByYear?.data?.map(item => item.total_violations) || [],
                        showInLegend: false,
                        color: "rgba(12, 10, 6, 0.37)",
                        borderWidth: 0,
                        borderRadius: { radius: 50, where: "all" },
                        dataLabels: {
                          enabled: true,
                          inside: false,
                          x: 0,
                          style: {
                            textOutline: "1px solid #fff",
                            color: colors.text,
                          },
                          formatter: function() {
                            return formatNumberForDisplay(this.y);
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
                    marginTop: "94px",
                    marginLeft: "0px",
                    marginRight: language === "ar" ? "0px" : "0px",
                    height: "190px",
                  }}
                  forceLeftPosition={true}
                  status={componentProps?.visaByYear?.status}
                  data={componentProps?.visaByYear?.data}
                />
              </Col>
            </Row>
          }
          templateGutter={[0, 0]}
          middleColumn={
            <CenterPanel
              showMapBackground
              mapSrc="/customPdf/uae_map.jpg"
              mapOpacity={1}
              mapScale={`scale(1.2, 1.5)`}
              mapPosition={language === "ar" ? "-80px 20px" : "-105px 20px"}
            >
              <DistributionByEmirate
                title={translation[language]?.["Distribution by Emirate"] || "Distribution by Emirate"}
                imageSrc="/customPdf/violatorsStatistics/emirate.png"
                forceLeftPosition={true}
                imageAlt={translation[language]?.["Emirate Map"] || "Emirate Map"}
                items={prepareDistributionByEmirateItems(componentProps?.distributionByEmirate?.data)}
                status={componentProps?.distributionByEmirate?.status}
                data={componentProps?.distributionByEmirate?.data}
              />

              <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: "16px", marginBottom: "16px", width: "100%" }}></div>
              <div style={{ marginTop: 0 }}>
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

                  // Transform the new API response structure
                  const ageGroups = componentProps?.violatorsByAgeRange?.data?.age_groups || [];

                  const ranges = ageGroups.map((group, index) => {
                    const ageGroup = group?.age_group || "";
                    const visaViolations = group?.visa_violations || 0;
                    const residencyViolations = group?.residency_violations || 0;

                    // Fixed height of 22 for "60+" age range, otherwise calculate based on index
                    const iconHeight = ageGroup === "60+" ? 25 : (23 + (index * 1));

                    return {
                      label: formatAgeGroupLabel(ageGroup),
                      visaValue: visaViolations,
                      residencyValue: residencyViolations,
                      iconSrc: getIconPath(ageGroup),
                      iconHeight: iconHeight,
                    };
                  });

                  return (
                    <DistributionByAgeRange
                      title={translation[language]?.["Violators by Age Range"]}
                      imageSrc="/customPdf/violatorsStatistics/summary.png"
                      imageAlt={translation[language]?.["Age Range"] || "Age Range"}
                      height={180}
                      forceLeftPosition={true}
                      ranges={ranges.length > 0 ? ranges : undefined}
                      status={componentProps?.violatorsByAgeRange?.status}
                      data={componentProps?.violatorsByAgeRange?.data}
                    />
                  );
                })()}
              </div>
            </CenterPanel>
          }
          rightColumn={
            <Row gutter={[0, 8]} style={{ paddingLeft: 0 }}>
              {/* Summary */}
              <Col style={{ borderLeft: `1px solid ${colors.border}` }}>
                <ViolatorSummary
                  title={translation[language]?.["Summary of Violators"] || "Summary of Violators"}
                  imageAlt="Violators Icon"
                  forceLeftPosition={true}
                  imageSrc="/customPdf/violatorsStatistics/summary.png"
                  centerLabel1={translation[language]?.["Total Violators"] || "Total Violators"}
                  centerLabel2={translation[language]?.["across the UAE"] || "across the UAE"}
                  total={formatNumberForDisplay(componentProps?.summaryStatistics?.data?.total_violators)}
                  branches={prepareSummaryBranches(componentProps?.summaryStatistics?.data)}
                  status={componentProps?.summaryStatistics?.status}
                  data={componentProps?.summaryStatistics?.data}
                />
              </Col>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "16px", width: "100%" }}></div>

              {/* Violators categorized by gender */}
              <Col>
                <ViolatorsByGender
                  title={translation[language]?.["Violators categorized by Gender"] || "Violators categorized by Gender"}
                  imageSrc="/customPdf/violatorsStatistics/male_female.png"
                  forceLeftPosition={true}
                  chartColStyle={{
                    width: "calc(100% - 150px)",
                    marginLeft: "125px",
                    marginTop: "115px",
                    height: "150px",
                    marginRight: language === "ar" ? "20px" : "0px",
                  }}
                  leftImageStyle={{ position: "absolute", bottom: "31px" }}
                  rightImageStyle={{
                    position: "absolute",
                    bottom: "31px",
                    right: "0",
                  }}
                  titleStyle={{
                    width: "90%"
                  }}
                  maleCount={componentProps?.violatorsByGender?.data?.male_violators}
                  femaleCount={componentProps?.violatorsByGender?.data?.female_violators}
                  malePercent={(() => {
                    const maleCount = Number(componentProps?.violatorsByGender?.data?.male_violators) || 0;
                    const femaleCount = Number(componentProps?.violatorsByGender?.data?.female_violators) || 0;
                    const total = maleCount + femaleCount;
                    if (total > 0) {
                      return parseFloat(((maleCount / total) * 100).toFixed(1));
                    }
                    return 0;
                  })()}
                  showMarker={true}
                  maleLabel={translation[language]?.["Male"] || "Male"}
                  femaleLabel={translation[language]?.["Female"] || "Female"}
                  status={componentProps?.violatorsByGender?.status}
                  data={(() => {
                    const maleCount = Number(componentProps?.violatorsByGender?.data?.male_violators) || 0;
                    const femaleCount = Number(componentProps?.violatorsByGender?.data?.female_violators) || 0;
                    // If both are 0, pass empty object to trigger empty state
                    if (maleCount === 0 && femaleCount === 0) {
                      return {};
                    }
                    return componentProps?.violatorsByGender?.data;
                  })()}
                />
              </Col>
            </Row>
          }
          isRightColumnLeftBorder={true}
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

ViolatorsStatistics.propTypes = {
  filters: PropTypes.object,
};

