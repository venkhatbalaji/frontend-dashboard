import React, { useEffect, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Button, Select, PhosphorIcons, Empty, Text, Spin } from "re-usable-design-components";
import moment from "moment";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, formatNumber, checkIsPdfSectionEmpty } from "@/utils/helper";
import translation from "../translation.json";
import { Page, Template, colors } from "@/customPdf";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import ViolatorsSummary from "@/customPdf/widget/ViolatorsSummary";
import Summary from "@/customPdf/widget/Summary";
import ViolatorsByGender from "@/customPdf/widget/ViolatorsByGender";
import PdfColumnChart from "@/customPdf/widget/PdfColumnChart";
import CenterPanel from "@/customPdf/widget/CenterPanel";
import DistributionByEmirate from "@/customPdf/widget/ViolatorsDistributionByEmirate";
import DistributionByAgeRange from "@/customPdf/widget/DistributionByAgeRange";
import PdfBarChart from "@/customPdf/widget/PdfBarChart";
import IssuedVisa from "@/customPdf/widget/SummaryOfViolators";
import ExpatsStatisticsEmptyState from "./ExpatsStatisticsEmptyState";
import useAsync from "@/hooks/useAsync";
import Flags from 'country-flag-icons/react/1x1';
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import {
  getTotalExpats,
  getIssuedResidenceVisa,
  getIssuedVisas,
  getExpatsByGender,
  getExpatsByEmirate,
  getExpatsByAgeRange,
  getViolatorsSummary,
  getViolatorsByGender,
  getRiskTypesByRegister,
  getNationalities
} from "@/services/customPdf/expatsStatistics";

const { ArrowSquareOut } = PhosphorIcons;

export default function ExpatsStatistics({ filters = {}, emiratesConfigValue }) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const { geoJsonObj } = useWorldGeoJSON();
  const [selectedCountry, setSelectedCountry] = useState();
  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "Expats-Statistics.pdf"
  });

  // Get ISO-2 code from geoJsonObj (maps ISO-3 to ISO-2)
  const getISO2Code = (code3) => {
    if (!code3) return null;
    const geoJsonItem = geoJsonObj?.[code3];
    return geoJsonItem?.properties?.["iso-a2"] || code3; // Return ISO-2 code or original if not found
  };

  // Fetch nationalities
  const {
    execute: executeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getNationalities });

  // Total Expats API
  const {
    execute: executeTotalExpats,
    status: totalExpatsStatus,
    value: totalExpatsValue,
  } = useAsync({ asyncFunction: getTotalExpats });

  // Issued Residence Visa API
  const {
    execute: executeIssuedResidenceVisa,
    status: issuedResidenceVisaStatus,
    value: issuedResidenceVisaValue,
  } = useAsync({ asyncFunction: getIssuedResidenceVisa });

  // Issued Visas API
  const {
    execute: executeIssuedVisas,
    status: issuedVisasStatus,
    value: issuedVisasValue,
  } = useAsync({ asyncFunction: getIssuedVisas });

  // Expats by Gender API
  const {
    execute: executeExpatsByGender,
    status: expatsByGenderStatus,
    value: expatsByGenderValue,
  } = useAsync({ asyncFunction: getExpatsByGender });

  // Expats by Emirate API
  const {
    execute: executeExpatsByEmirate,
    status: expatsByEmirateStatus,
    value: expatsByEmirateValue,
  } = useAsync({ asyncFunction: getExpatsByEmirate });

  // Expats by Age Range API
  const {
    execute: executeExpatsByAgeRange,
    status: expatsByAgeRangeStatus,
    value: expatsByAgeRangeValue,
  } = useAsync({ asyncFunction: getExpatsByAgeRange });

  // Violators Summary API
  const {
    execute: executeViolatorsSummary,
    status: violatorsSummaryStatus,
    value: violatorsSummaryValue,
  } = useAsync({ asyncFunction: getViolatorsSummary });

  // Violators by Gender API
  const {
    execute: executeViolatorsByGender,
    status: violatorsByGenderStatus,
    value: violatorsByGenderValue,
  } = useAsync({ asyncFunction: getViolatorsByGender });

  // Risk Types by Register API
  const {
    execute: executeRiskTypesByRegister,
    status: riskTypesByRegisterStatus,
    value: riskTypesByRegisterValue,
  } = useAsync({ asyncFunction: getRiskTypesByRegister });

  useEffect(() => {
    executeNationalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger API calls when selectedCountry changes (only if country is selected)
  useEffect(() => {
    if (!selectedCountry) {
      return; // Don't make API calls if no country is selected
    }

    // Calculate date range: today and 365 days ago
    const end_date = moment().format("YYYY-MM-DD");
    const start_date = moment().subtract(365, 'days').format("YYYY-MM-DD");

    executeTotalExpats({ filter: { nationality_code: selectedCountry } });
    executeIssuedResidenceVisa({ filter: { nationality: selectedCountry, type: 'residence' } });
    executeIssuedVisas({ filter: { nationality: selectedCountry, type: 'visa' } });
    executeExpatsByGender({ filter: { nationality_code: selectedCountry } });
    executeExpatsByEmirate({ filter: { nationality: selectedCountry } });
    executeExpatsByAgeRange({ filter: { nationality_code: selectedCountry } });
    executeViolatorsSummary({ filter: { nationality: selectedCountry, language: language } });
    executeViolatorsByGender({ filter: { nationality: selectedCountry } });
    executeRiskTypesByRegister({ filter: { nationality: selectedCountry, language, start_date, end_date } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, language]);

  const componentProps = {
    totalExpats: {
      status: totalExpatsStatus,
      data: totalExpatsValue?.data,
    },
    issuedResidenceVisa: {
      status: issuedResidenceVisaStatus,
      data: issuedResidenceVisaValue?.data,
    },
    issuedVisas: {
      status: issuedVisasStatus,
      data: issuedVisasValue?.data,
    },
    expatsByGender: {
      status: expatsByGenderStatus,
      data: expatsByGenderValue?.data,
    },
    expatsByEmirate: {
      status: expatsByEmirateStatus,
      data: expatsByEmirateValue?.data,
    },
    expatsByAgeRange: {
      status: expatsByAgeRangeStatus,
      data: expatsByAgeRangeValue?.data,
    },
    violatorsSummary: {
      status: violatorsSummaryStatus,
      data: violatorsSummaryValue?.data,
    },
    violatorsByGender: {
      status: violatorsByGenderStatus,
      data: violatorsByGenderValue?.data,
    },
    riskTypesByRegister: {
      status: riskTypesByRegisterStatus,
      data: riskTypesByRegisterValue?.data,
    },
  };

  // Custom function to check if section has meaningful data
  const checkSectionHasData = (sectionKey, data) => {
    if (!data) return false;

    switch (sectionKey) {
    case 'totalExpats':
      // Check if any of the key fields have non-zero values
      return (
        (data.total_residents && Number(data.total_residents) > 0) ||
          (data.total_visa_holders && Number(data.total_visa_holders) > 0) ||
          (data.total_expats && Number(data.total_expats) > 0) ||
          (data.last_year_movement && Number(data.last_year_movement) > 0) ||
          (data.golden_visa_holder && Number(data.golden_visa_holder) > 0) ||
          (data.resident_inside_country && Number(data.resident_inside_country) > 0) ||
          (data.resident_outside_country && Number(data.resident_outside_country) > 0)
      );

    case 'issuedResidenceVisa':
    case 'issuedVisas':
      // Check if array has items with non-zero total_visas
      return Array.isArray(data) && data.length > 0 && data.some(item => 
        item.total_visas && Number(item.total_visas) > 0
      );

    case 'expatsByGender':
      // Check if males or females have non-zero values
      return (
        data.summary &&
          (
            (data.summary.males && Number(data.summary.males) > 0) ||
            (data.summary.females && Number(data.summary.females) > 0) ||
            (data.summary.total && Number(data.summary.total) > 0)
          )
      );

    case 'expatsByEmirate':
      // Check if array has items with non-zero values in any field
      return Array.isArray(data) && data.length > 0 && data.some(item => 
        (item.number_of_expats && Number(item.number_of_expats) > 0) ||
          (item.expat_percentage && Number(item.expat_percentage) > 0) ||
          (item.total_visa_violators && Number(item.total_visa_violators) > 0) ||
          (item.total_residency_violators && Number(item.total_residency_violators) > 0)
      );

    case 'expatsByAgeRange':
      // Check if array has items with non-zero count
      return Array.isArray(data) && data.length > 0 && data.some(item => 
        item.count && Number(item.count) > 0
      );

    case 'violatorsSummary':
      // Check if any violator counts are non-zero
      return (
        (data.total_violators && Number(data.total_violators) > 0) ||
          (data.visa_violators && Number(data.visa_violators) > 0) ||
          (data.residency_violators && Number(data.residency_violators) > 0)
      );

    case 'violatorsByGender':
      // Check if male or female violators have non-zero values
      return (
        (data.male_violators && Number(data.male_violators) > 0) ||
          (data.female_violators && Number(data.female_violators) > 0)
      );

    case 'riskTypesByRegister':
      // Check if array has items with non-zero percentage or count
      return Array.isArray(data) && data.length > 0 && data.some(item => 
        (item.risk_vs_population_percentage && Number(item.risk_vs_population_percentage) > 0) ||
          (item.risk_vs_total_risks_percentage && Number(item.risk_vs_total_risks_percentage) > 0)
      );

    default:
      // Fallback to generic empty check
      return !checkIsPdfSectionEmpty("success", data);
    }
  };

  // Check loading state and empty state
  const { isLoading: isAnySectionLoading, allSectionsEmpty, hasAnyData } = useMemo(() => {
    // Only check if country is selected
    if (!selectedCountry) {
      return {
        isLoading: false,
        allSectionsEmpty: false,
        hasAnyData: false
      };
    }

    const sectionsConfig = [
      { key: 'totalExpats', ...componentProps.totalExpats },
      { key: 'issuedResidenceVisa', ...componentProps.issuedResidenceVisa },
      { key: 'issuedVisas', ...componentProps.issuedVisas },
      { key: 'expatsByGender', ...componentProps.expatsByGender },
      { key: 'expatsByEmirate', ...componentProps.expatsByEmirate },
      { key: 'expatsByAgeRange', ...componentProps.expatsByAgeRange },
      { key: 'violatorsSummary', ...componentProps.violatorsSummary },
      { key: 'violatorsByGender', ...componentProps.violatorsByGender },
      { key: 'riskTypesByRegister', ...componentProps.riskTypesByRegister },
    ];

    // Check if any section is still loading
    const hasLoadingSections = sectionsConfig.some(section => 
      section.status === "pending" || section.status === "idle"
    );

    // Check if any section has data (not empty)
    const hasData = sectionsConfig.some(section => {
      if (section.status === "success" || section.status === "error") {
        return checkSectionHasData(section.key, section.data);
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
    const completedSections = sectionsConfig.filter(section => 
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
      !checkSectionHasData(section.key, section.data)
    );

    return {
      isLoading: false,
      allSectionsEmpty: allEmpty,
      hasAnyData: hasData
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCountry,
    totalExpatsStatus,
    totalExpatsValue?.data,
    issuedResidenceVisaStatus,
    issuedResidenceVisaValue?.data,
    issuedVisasStatus,
    issuedVisasValue?.data,
    expatsByGenderStatus,
    expatsByGenderValue?.data,
    expatsByEmirateStatus,
    expatsByEmirateValue?.data,
    expatsByAgeRangeStatus,
    expatsByAgeRangeValue?.data,
    violatorsSummaryStatus,
    violatorsSummaryValue?.data,
    violatorsByGenderStatus,
    violatorsByGenderValue?.data,
    riskTypesByRegisterStatus,
    riskTypesByRegisterValue?.data,
  ]);

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
    const defaultEmirates = [
      {
        id: 'abu-dhabi',
        code: 1,
        nameEn: 'Abu Dhabi',
        nameAr: 'أبوظبي',
        marker: { xPct: 27.33, yPct: 96.26 },
        box: { leftPct: 2.33, topPct: 102.63, anchor: 'right-top' },
        label: { text: translation[language]?.["Abu Dhabi"] || "Abu Dhabi", dx: -6, dy: 12 },
      },
      {
        id: 'dubai',
        code: 2,
        nameEn: 'Dubai',
        nameAr: 'دبي',
        marker: { xPct: 32.33, yPct: 78.26 },
        box: { leftPct: 2.33, topPct: 70.63, anchor: 'right-top' },
        label: { text: translation[language]?.["Dubai"] || "Dubai", dx: -4, dy: 10 },
      },
      {
        id: 'sharjah',
        code: 3,
        nameEn: 'Sharjah',
        nameAr: 'الشارقة',
        marker: { xPct: 35.33, yPct: 69.26 },
        box: { leftPct: 26.33, topPct: 103.63, anchor: 'top-mid' },
        label: { text: translation[language]?.["Sharjah"] || "Sharjah", dx: -10, dy: 12 },
      },
      {
        id: 'ajman',
        code: 4,
        nameEn: 'Ajman',
        nameAr: 'عجمان',
        marker: { xPct: 38.33, yPct: 60.26 },
        box: { leftPct: 5.67, topPct: 38.63, anchor: 'right-mid' },
        label: { text: translation[language]?.["Ajman"] || "Ajman", dx: -8, dy: 10 },
      },
      {
        id: 'umm-al-quwain',
        code: 5,
        nameEn: 'Umm Al Quwain',
        nameAr: 'أم القيوين',
        marker: { xPct: 41.33, yPct: 48.26 },
        box: { leftPct: 12.33, topPct: 6.63, anchor: 'right-mid' },
        label: { text: translation[language]?.["Umm Al Quwain"] || "Umm Al Quwain", dx: -6, dy: 10 },
      },
      {
        id: 'ras-al-khaimah',
        code: 6,
        nameEn: 'Ras Al Khaimah',
        nameAr: 'رأس الخيمة',
        marker: { xPct: 46.33, yPct: 37.26 },
        box: { leftPct: 36.33, topPct: 0.63, anchor: 'bottom-mid' },
        label: { text: translation[language]?.["Ras Al Khaima"] || "Ras Al Khaima", dx: 16, dy: 14 },
      },
      {
        id: 'fujairah',
        code: 7,
        nameEn: 'Fujairah',
        nameAr: 'الفجيرة',
        marker: { xPct: 53.33, yPct: 57.26 },
        box: { leftPct: 38, topPct: 74.63, anchor: 'top-mid' },
        label: { text: translation[language]?.["Fujairah"] || "Fujairah", dx: -8, dy: 12 },
      },
    ];

    if (!apiItems || !Array.isArray(apiItems)) {
      return [];
    }

    return defaultEmirates
      .map(emirate => {
        const emirateName = getEmirateName(emirate.code);
        const apiItem = apiItems?.find(item => {
          const emirateId = getEmirateIdFromCode(item?.emirate_code);
          return emirateId === emirate?.id;
        });

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
            total_violators: apiItem?.total_expats || 0,
            number_of_expats: apiItem?.number_of_expats || 0,
            expat_percentage: apiItem?.expat_percentage || 0,
            total_residency_violators: apiItem?.total_residency_violators || 0,
            total_visa_violators: apiItem?.total_visa_violators || 0,
          },
        };
      });
  };

  // Format number helper
  const formatNumberForDisplay = (num) => {
    if (num === null || num === undefined) return '0';
    return formatNumber(Number(num) || 0);
  };

  // Prepare right side branches for Summary component (Right column - Expats)
  const prepareRightBranches = (summaryData) => {
    if (!summaryData) return [];

    return [
      { 
        offsetY: -110,
        offsetX: 93,
        labelY: -22,
        boxText: formatNumberForDisplay(summaryData?.golden_visa_holder || 0),
        boxLabel: translation[language]?.["Golden Visa Holders"] || "Golden\nVisa\nHolders"
      },
      { 
        offsetY: -45, 
        offsetX: 93,
        labelY: -12,
        boxText: formatNumberForDisplay(summaryData?.resident_inside_country || 0),
        boxLabel: translation[language]?.["Inside UAE"] || "Inside\nthe\nUAE"
      },
      { 
        offsetY: 20, 
        offsetX: 93,
        labelY: -12,
        boxText: formatNumberForDisplay(summaryData?.resident_outside_country || 0),
        boxLabel: translation[language]?.["Outside UAE"] || "Outside\nthe\nUAE"
      },
    ];
  };

  // Prepare left side branch for Summary component (Right column - Expats)
  const prepareLeftBranches = (summaryData) => {
    if (!summaryData) return [];

    return [
      { 
        offsetY: -43, 
        offsetX: -70,
        boxText: formatNumberForDisplay(summaryData?.last_year_movement || 0),
        boxLabel: translation[language]?.["Entry and Exit Movements for last year"] || "Entry and\nExit\nMovements\nfor last\nyear"
      },
    ];
  };

  // Prepare chart data for Risk Register (similar to RiskRegisterStatistics.js)
  const chartData = useMemo(() => {
    const riskTypes = componentProps?.riskTypesByRegister?.data || [];
    
    return {
      riskTypesRegister: {
        categories: riskTypes.map(item => 
          language === "ar" 
            ? (item.risk_type_ar || item.risk_type_en) 
            : (item.risk_type_en || item.risk_type_ar)
        ),
        femaleData: riskTypes.map(item => item.risk_vs_population_percentage || 0),
        maleData: riskTypes.map(item => item.risk_vs_total_risks_percentage || 0),
      }
    };
  }, [componentProps?.riskTypesByRegister?.data, language]);

  // Prepare custom rows configuration for DistributionByEmirate (for Expats Statistics)
  const getEmirateCardRowsConfig = () => [
    { 
      key: 'number_of_expats', 
      label: translation[language]?.["Number of Expats"] || "Number of Expats", 
      dataField: 'number_of_expats',
      formatType: 'number',
      bgColor: 'transparent',
    },
    { 
      key: 'percentage', 
      label: translation[language]?.["Percentage"] || "Percentage", 
      dataField: 'expat_percentage',
      formatType: 'percentage',
      bgColor: 'transparent',
    },
    { 
      key: 'residence_violators', 
      label: translation[language]?.["Residence Violators"] || "Residence Violators", 
      dataField: 'total_residency_violators',
      formatType: 'number',
      bgColor: '#E7BB62',
    },
    { 
      key: 'visa_violators', 
      label: translation[language]?.["Visa Violators"] || "Visa Violators", 
      dataField: 'total_visa_violators',
      formatType: 'number',
      bgColor: '#FCD6B5',
    },
  ];

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
    printDocumentCustomSize(selectedCountryName ? `${translation[language]?.["Expats in the UAE"]} - ${selectedCountryName}.pdf` : (`${translation[language]?.["Expats in the UAE"]}.pdf`), setIsCreatingPdf);
  };

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
                disabled={!selectedCountry}
              >
                {translation[language]?.["Export"] || "Export"}
              </Button>
            </Col>
            <Col flex="none">
              <Select
                placeholder={translation?.[language]?.["Country"] || "Select Country"}
                size="default"
                value={selectedCountry}
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
                disabled={!selectedCountry}
              >
                {translation[language]?.["Export"] || "Export"}
              </Button>
            </Col>
          </>
        )}
      </Row>
      {!selectedCountry ? (
        <div
          style={{
            height: "calc(100% - 64px)",
            marginTop: "16px",
          }}
        >
          <ExpatsStatisticsEmptyState />
        </div>
      ) : (
        <Page title={
          selectedCountryName
            ? `${translation[language]?.["Expats in the UAE"] || "Expats in the UAE"} - ${selectedCountryName}`
            : (translation[language]?.["Expats in the UAE"] || "Expats in the UAE")
        } isCreatingPdf={isCreatingPdf}>
          <Template
            isRightColumnLeftBorder={false}
            leftColumn={
              <Row gutter={[0, 4]}>
                {/* Violators Summary */}
                <Col>
                  <ViolatorsSummary
                    title={translation[language]?.["Summary of Violators"] || "Summary of Violators"}
                    imageAlt="Violators Icon"
                    imageSrc="/customPdf/expatsStatistics/people_cross.png"
                    centerLabel1={translation[language]?.["Total Violators"] || "Total Violators"}
                    totalViolatorsLabel1={translation[language]?.["Total Visa Violators"] || "Total Visa"}
                    visaViolatorsLabel1={translation[language]?.["Total Residency Violators"]}
                    totalViolators={componentProps?.violatorsSummary?.data?.total_violators}
                    visaViolators={componentProps?.violatorsSummary?.data?.visa_violators}
                    residencyViolators={componentProps?.violatorsSummary?.data?.residency_violators}
                    status={componentProps?.violatorsSummary?.status}
                    data={checkSectionHasData('violatorsSummary', componentProps?.violatorsSummary?.data) ? componentProps?.violatorsSummary?.data : null}
                  />
                </Col>
                {/* Violators by Gender */}
                <Col>
                  <ViolatorsByGender
                    title={translation[language]?.["Violators categorized by Gender"] || "Violators categorized by Gender"}
                    forceLeftPosition={true}
                    titleWrapperStyle={{
                      maxWidth: "110px",
                      width: "110px",
                    }}
                    chartColStyle={{
                      width: "calc(100% - 160px)",
                      marginLeft: "80px",
                      marginTop: "70px",
                      height: "55px",
                      marginRight: language === "ar" ? "85px" : "0px",
                    }}
                    leftImageStyle={{ position: "absolute", bottom: "-10px", left: "-60px" }}
                    rightImageStyle={{
                      position: "absolute",
                      bottom: "-10px",
                      right: "-75px",
                    }}
                    loadingHeight="125px"
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
                    data={checkSectionHasData('violatorsByGender', componentProps?.violatorsByGender?.data) ? componentProps?.violatorsByGender?.data : null}
                  />
                </Col>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "8px", marginRight: "6px", width: "100%" }}></div>

                {/* Risk Register */}
                <Col>
                  <PdfColumnChart
                    title={translation[language]?.["Violator By Risk Register"] || "Violator By Risk Register"}
                    imageSrc="/customPdf/riskRegister/risk.png"
                    imageAlt={translation[language]?.["Risk Register"] || "Risk Register"}
                    isImageWithBorder={true}
                    forceLeftPosition={true}
                    loadingHeight="292px"
                    chartProps={{
                      chart: {
                        type: 'column',
                        marginBottom: 95,
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
                              textOutline: "1px solid #fff",
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
                            return `<div style="max-width: 45px; width: 45px; word-wrap: auto-phrase; word-break: auto-phrase; white-space: normal; color: ${colors.chartAxisLabelColor}; font-size: 9px; line-height: 1.2; text-align: center; margin: 0 auto;">${label}</div>`;
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
                        maxPadding: 0.1,
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
                          name: translation[language]?.["Total Risks"] || "Total Risks",
                          data: chartData.riskTypesRegister.femaleData,
                          showInLegend: true,
                          color: "#CBA54A",
                        },
                        {
                          type: 'column',
                          name: translation[language]?.["% of Risk vs Population"] || "% of Risk vs Population",
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
                      width: "calc(100%)",
                      marginLeft: "0px",
                      marginTop: "42px",
                      height: "250px",
                    }}
                    status={componentProps?.riskTypesByRegister?.status}
                    data={checkSectionHasData('riskTypesByRegister', componentProps?.riskTypesByRegister?.data) ? componentProps?.riskTypesByRegister?.data : null}
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
                mapPosition={language === "ar" ? "-28px 20px" : "-140px 20px"}
              >
                <DistributionByEmirate
                  title={translation[language]?.["Distribution by Emirate"] || "Distribution by Emirate"}
                  imageSrc="/customPdf/violatorsStatistics/emirate.png"
                  forceLeftPosition={true}
                  customBoxHeight={ language === "ar" ? 73 : 82}
                  imageAlt={translation[language]?.["Emirate Map"] || "Emirate Map"}
                  items={prepareDistributionByEmirateItems(componentProps?.expatsByEmirate?.data)}
                  status={componentProps?.expatsByEmirate?.status}
                  data={checkSectionHasData('expatsByEmirate', componentProps?.expatsByEmirate?.data) ? componentProps?.expatsByEmirate?.data : null}
                  rows={getEmirateCardRowsConfig()}
                />

                <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: "12px", marginBottom: "4px", width: "calc(100% - 12px)", marginLeft: "6px", marginRight: "6px" }}></div>
              
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

                    // Transform the API response structure
                    // API returns: { data: [ { age_range: "0-18", count: 5058 }, ... ] }
                    const ageGroups = componentProps?.expatsByAgeRange?.data || [];

                    const ranges = ageGroups.map((group, index) => {
                      const ageGroup = group?.age_range || "";
                      const count = group?.count || 0;

                      const iconHeight = ageGroup === "60+" ? 25 : (23 + (index * 1));

                      return {
                        label: formatAgeGroupLabel(ageGroup),
                        value: count,
                        iconSrc: getIconPath(ageGroup),
                        iconHeight: iconHeight,
                      };
                    });

                    return (
                      <DistributionByAgeRange
                        title={translation[language]?.["Distribution by Age Range"] || "Distribution by Age Range"}
                        imageSrc="/customPdf/violatorsStatistics/summary.png"
                        imageAlt={translation[language]?.["Age Range"] || "Age Range"}
                        height={200}
                        chartStyle={{ marginRight: language === "ar" ? "20px" : "0px" }}
                        forceLeftPosition={true}
                        ranges={ranges.length > 0 ? ranges : undefined}
                        status={componentProps?.expatsByAgeRange?.status}
                        data={checkSectionHasData('expatsByAgeRange', componentProps?.expatsByAgeRange?.data) ? componentProps?.expatsByAgeRange?.data : null}
                      />
                    );
                  })()}
                </div>
              </CenterPanel>
            }
            rightColumnWidth="34.3%"
            leftColumnWidth="32%"
            rightColumn={
              <Row gutter={[0, 0]} style={{ paddingLeft: 0 }}>
                {/* Summary */}
                <Col>
                  <Summary
                    title={translation[language]?.["Summary"] || "Summary"}
                    imageAlt="Summary"
                    imageSrc="/customPdf/expatsStatistics/summary.png"
                    centerLabel1={translation[language]?.["Total Expats"] || "Total Expats"}
                    centerLabel2={translation[language]?.["in the UAE"] || "in the UAE"}
                    totalViolators={formatNumberForDisplay(componentProps?.totalExpats?.data?.total_expats)}
                    leftBranchLabel={translation[language]?.["Number of Visa Holders"] || "Number of Visa Holders"}
                    rightBranchLabel={translation[language]?.["Number of Residents"] || "Number of Residents"}
                    leftBranchValue={formatNumberForDisplay(componentProps?.totalExpats?.data?.total_visa_holders)}
                    rightBranchValue={formatNumberForDisplay(componentProps?.totalExpats?.data?.total_residents)}
                    branchesData={prepareRightBranches(componentProps?.totalExpats?.data)}
                    leftBranchesData={prepareLeftBranches(componentProps?.totalExpats?.data)}
                    CountryFlag={(() => {
                      if (!selectedCountry) return null;
                      const iso2Code = getISO2Code(selectedCountry);
                      if (!iso2Code || !Flags[iso2Code]) return null;
                      return React.createElement(Flags[iso2Code], { style: { width: "100%", height: "100%" } });
                    })()}
                    countryName={selectedCountryName}
                    status={componentProps?.totalExpats?.status}
                    data={checkSectionHasData('totalExpats', componentProps?.totalExpats?.data) ? componentProps?.totalExpats?.data : null}
                  />
                </Col>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "8px", marginLeft: "6px", width: "100%" }}></div>

                {/* Issued Residence Visas */}
                <Col>
                  <PdfBarChart
                    title={translation[language]?.["Issued Residence Visas"] || "Issued Residence Visas"}
                    imageSrc="/customPdf/expatsStatistics/people_home.png"
                    imageAlt={translation[language]?.["Visa Icon"] || "Visa Icon"}
                    forceLeftPosition={true}
                    isImageWithBorder={true}
                    meshRight={70}
                    loadingHeight="134px"
                    titleWrapperStyle={{ maxWidth: "100px", width: "100px" }}
                    chartProps={{
                      chart: {
                        spacingTop: 4,
                        spacingBottom: 4,
                        marginTop: 0,
                        marginBottom: 4,
                        type: "bar",
                      },
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
                      categories: componentProps?.issuedResidenceVisa?.data?.map(item => item.year) || [],
                      values: [
                        {
                          data: componentProps?.issuedResidenceVisa?.data?.map(item => item.total_visas) || [],
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
                      width: "calc(100% - 100px)",
                      marginTop: "0px",
                      marginLeft: "100px",
                      height: "134px",
                    }}
                    status={componentProps?.issuedResidenceVisa?.status}
                    data={checkSectionHasData('issuedResidenceVisa', componentProps?.issuedResidenceVisa?.data) ? componentProps?.issuedResidenceVisa?.data : null}
                  />
                </Col>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "8px", width: "100%", marginLeft: "6px" }}></div>

                {/* Issued Visas */}
                <Col>
                  <IssuedVisa
                    title={translation[language]?.["Issued Visas"] || "Issued Visas"}
                    imageSrc="/customPdf/violatorsStatistics/plane_ok.png"
                    imageAlt={translation[language]?.["Visa Icon"] || "Visa Icon"}
                    forceLeftPosition={true}
                    loadingHeight="134px"
                    meshRight={70}
                    chartProps={{
                      chart: {
                        spacingTop: 4,
                        spacingBottom: 4,
                        marginTop: 0,
                        marginBottom: 4,
                        type: "bar",
                      },
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
                      categories: componentProps?.issuedVisas?.data?.map(item => item.year) || [],
                      values: [
                        {
                          data: componentProps?.issuedVisas?.data?.map(item => item.total_visas) || [],
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
                      width: "calc(100% - 100px)",
                      marginTop: "0px",
                      marginLeft: "100px",
                      marginRight: language === "ar" ? "0px" : "0px",
                      height: "134px",
                    }}
                    status={componentProps?.issuedVisas?.status}
                    data={checkSectionHasData('issuedVisas', componentProps?.issuedVisas?.data) ? componentProps?.issuedVisas?.data : null}
                  />
                </Col>

                {/* Divider */}
                <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: "8px", width: "100%" }}></div>

                {/* Expats categorized by Gender */}
                <Col>
                  <ViolatorsByGender
                    title={translation[language]?.["Expats categorized by Gender"] || "Expats categorized by Gender"}
                    imageSrc="/customPdf/expatsStatistics/male_female.png"
                    forceLeftPosition={true}
                    chartColStyle={{
                      width: "calc(100% - 150px)",
                      marginLeft: "125px",
                      marginTop: "45px",
                      height: "50px",
                      marginRight: language === "ar" ? "20px" : "0px",
                    }}
                    maleImageStyle={{ width: "auto", height: "30px" }}
                    femaleImageStyle={{ width: "auto", height: "30px" }}
                    leftImageStyle={{ position: "absolute", bottom: "31px", }}
                    rightImageStyle={{
                      position: "absolute",
                      bottom: "31px",
                      right: "0",
                    }}
                    titleStyle={{
                      width: "90%"
                    }}
                    maleCount={componentProps?.expatsByGender?.data?.summary?.males}
                    femaleCount={componentProps?.expatsByGender?.data?.summary?.females}
                    malePercent={(() => {
                      const maleCount = Number(componentProps?.expatsByGender?.data?.summary?.males) || 0;
                      const femaleCount = Number(componentProps?.expatsByGender?.data?.summary?.females) || 0;
                      const total = maleCount + femaleCount;
                      if (total > 0) {
                        return parseFloat(((maleCount / total) * 100).toFixed(1));
                      }
                      return 0;
                    })()}
                    loadingHeight="95px"
                    showMarker={true}
                    maleLabel={translation[language]?.["Male"] || "Male"}
                    femaleLabel={translation[language]?.["Female"] || "Female"}
                    status={componentProps?.expatsByGender?.status}
                    data={checkSectionHasData('expatsByGender', componentProps?.expatsByGender?.data) ? componentProps?.expatsByGender?.data : null}
                  />
                </Col>
              </Row>
            }
            showThreeColumns={!allSectionsEmpty && !isAnySectionLoading}
          >
            {/* Show loading spinner if sections are loading */}
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
      )}
    </>
  );
}

ExpatsStatistics.propTypes = {
  filters: PropTypes.object,
  emiratesConfigValue: PropTypes.object,
};
