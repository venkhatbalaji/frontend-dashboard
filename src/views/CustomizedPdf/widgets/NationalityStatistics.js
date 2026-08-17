import React, { useEffect, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  Row,
  Col,
  Button,
  Select,
  PhosphorIcons,
  Text,
  Spin,
  Empty,
} from "re-usable-design-components";
import dayjs from "dayjs";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, formatNumber, checkIsPdfSectionEmpty } from "@/utils/helper";
import translation from "../translation.json";
import {
  Page, Template, colors, PdfDivider,
  UpdateMetrics,
  CountryFlagDisplay,
  ResidentBreakdownTree,
  SecurityCancellationMovements,
} from "@/customPdf";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import CenterPanel from "@/customPdf/widget/CenterPanel";
import DistributionByEmirate from "@/customPdf/widget/ViolatorsDistributionByEmirate";
import UAEPopulationSummaryViolator from "@/customPdf/widget/UAEPopulationSummaryViolator";
import useAsync from "@/hooks/useAsync";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import ExpatsStatisticsEmptyState from "./ExpatsStatisticsEmptyState";
import {
  getNationalities,
  getNationalityCancellations,
  getNationalitySnapshot,
  getNationalityDistributionByEmirate,
} from "@/services/customPdf/nationalityStatistics";

const { ArrowSquareOut } = PhosphorIcons;

export default function NationalityStatistics({ emiratesConfigValue }) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const { geoJsonObj } = useWorldGeoJSON();
  const [selectedCountry, setSelectedCountry] = useState();

  const referenceDate = useMemo(() => {
    if (!selectedCountry) return null;
    return selectedCountry === "PAK" ? "2026-03-28" : "2026-02-28";
  }, [selectedCountry]);

  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "Nationality-Statistics.pdf",
  });

  const getISO2Code = (code3) => {
    if (!code3) return null;
    const geoJsonItem = geoJsonObj?.[code3];
    return geoJsonItem?.properties?.["iso-a2"] || code3;
  };

  // --- API hooks ---
  const {
    execute: executeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getNationalities });

  const {
    execute: executeCancellations,
    status: cancellationsStatus,
    value: cancellationsValue,
  } = useAsync({ asyncFunction: getNationalityCancellations });

  const {
    execute: executeSnapshot,
    status: snapshotStatus,
    value: snapshotValue,
  } = useAsync({ asyncFunction: getNationalitySnapshot });

  const {
    execute: executeDistribution,
    status: distributionStatus,
    value: distributionValue,
  } = useAsync({ asyncFunction: getNationalityDistributionByEmirate });

  // Fetch nationalities on mount
  useEffect(() => {
    executeNationalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger all APIs when country is selected
  useEffect(() => {
    if (!selectedCountry) return;
    const today = dayjs().format("YYYY-MM-DD");
    executeCancellations({
      filter: { nationality_code: selectedCountry, snapshot_date: today },
    });
    executeSnapshot({
      filter: {
        nationality_code: selectedCountry,
        snapshot_date: today,
        reference_date: referenceDate,
      },
    });
    executeDistribution({
      filter: { nationality_code: selectedCountry, snapshot_date: today },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry]);

  // --- Derived data ---
  const countryOptions = useMemo(() => {
    if (!nationalitiesValue?.data || !Array.isArray(nationalitiesValue.data))
      return [];
    return nationalitiesValue.data
      .map((item) => ({
        value: item?.country_alpha3 || "",
        label: isRtl ? item?.country_ar || "" : item?.country_en || "",
      }))
      .filter((item) => item.value && item.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [nationalitiesValue?.data, isRtl]);

  const selectedCountryName = useMemo(() => {
    if (!selectedCountry) return null;
    const country = countryOptions.find((o) => o.value === selectedCountry);
    return country ? country.label : null;
  }, [selectedCountry, countryOptions]);

  const iso2Code = useMemo(
    () => getISO2Code(selectedCountry),
    [selectedCountry, geoJsonObj],
  );

  const checkSectionHasData = (sectionKey, data) => {
    if (!data) return false;

    switch (sectionKey) {
    case 'cancellations':
      return (
        (data.total_resident_cancellation_movements && Number(data.total_resident_cancellation_movements) > 0) ||
          (data.cancelled_other_resident_visa_holders && Number(data.cancelled_other_resident_visa_holders) > 0) ||
          (data.cancelled_golden_visa_holders && Number(data.cancelled_golden_visa_holders) > 0) ||
          (data.security_record_movements_post_cancellation && Number(data.security_record_movements_post_cancellation) > 0)
      );

    case 'snapshot':
      return (
        (data.current_snapshot &&
          ((data.current_snapshot.total_residents && Number(data.current_snapshot.total_residents) > 0) ||
            (data.current_snapshot.other_resident_visa_holders && Number(data.current_snapshot.other_resident_visa_holders) > 0) ||
            (data.current_snapshot.golden_visa_holders && Number(data.current_snapshot.golden_visa_holders) > 0))) ||
        (data.variance &&
          ((data.variance.total_updates && Number(data.variance.total_updates) > 0) ||
            (data.variance.increase_percentage && Number(data.variance.increase_percentage) !== 0))) ||
        (data.reference_snapshot &&
          ((data.reference_snapshot.total_residents && Number(data.reference_snapshot.total_residents) > 0) ||
            (data.reference_snapshot.other_resident_visa_holders && Number(data.reference_snapshot.other_resident_visa_holders) > 0) ||
            (data.reference_snapshot.golden_visa_holders && Number(data.reference_snapshot.golden_visa_holders) > 0)))
      );

    case 'distribution':
      return Array.isArray(data) && data.length > 0 && data.some(item =>
        (item.number_of_residents && Number(item.number_of_residents) > 0) ||
          (item.resident_percentage && Number(item.resident_percentage) > 0)
      );

    default:
      return !checkIsPdfSectionEmpty("success", data);
    }
  };

  const { isLoading: isAnySectionLoading, allSectionsEmpty, hasAnyData } = useMemo(() => {
    if (!selectedCountry) return { isLoading: false, allSectionsEmpty: false, hasAnyData: false };

    const sectionsConfig = [
      { key: 'cancellations', status: cancellationsStatus, data: cancellationsValue?.data },
      { key: 'snapshot', status: snapshotStatus, data: snapshotValue?.data },
      { key: 'distribution', status: distributionStatus, data: distributionValue?.data },
    ];

    const hasLoadingSections = sectionsConfig.some(
      (s) => s.status === "pending" || s.status === "idle"
    );

    const hasData = sectionsConfig.some((section) => {
      if (section.status === "success" || section.status === "error") {
        return checkSectionHasData(section.key, section.data);
      }
      return false;
    });

    if (hasData) {
      return { isLoading: false, allSectionsEmpty: false, hasAnyData: true };
    }

    if (hasLoadingSections) {
      return { isLoading: true, allSectionsEmpty: false, hasAnyData: false };
    }

    const completedSections = sectionsConfig.filter(
      (s) => s.status === "success" || s.status === "error"
    );

    if (completedSections.length === 0) {
      return { isLoading: true, allSectionsEmpty: false, hasAnyData: false };
    }

    const allEmpty = completedSections.every((section) =>
      !checkSectionHasData(section.key, section.data)
    );

    return { isLoading: false, allSectionsEmpty: allEmpty, hasAnyData: hasData };
  }, [
    selectedCountry,
    cancellationsStatus,
    cancellationsValue?.data,
    snapshotStatus,
    snapshotValue?.data,
    distributionStatus,
    distributionValue?.data,
  ]);

  const formatNum = (num) => {
    if (num === null || num === undefined || num === "") return "-";
    return formatNumber(Number(num) || 0);
  };

  const cancellationsData = cancellationsValue?.data;

  const residentBreakdownData = useMemo(() => {
    if (!cancellationsData) return null;
    return {
      resident_cancellation_movements: cancellationsData?.total_resident_cancellation_movements,
      other_resident_visas: cancellationsData?.cancelled_other_resident_visa_holders,
      golden_visa_holders: cancellationsData?.cancelled_golden_visa_holders,
      resident_outside_country: cancellationsData?.residing_outside_country,
      resident_inside_country: cancellationsData?.residing_inside_country,
      sub_breakdown_1: cancellationsData?.in_grace_period,
      sub_breakdown_2: cancellationsData?.overstayed_illegal,
    };
  }, [cancellationsData]);

  const securityCancellationData = useMemo(() => {
    if (!cancellationsData) return null;
    return {
      security_cancellation_movements: cancellationsData.security_record_movements_post_cancellation,
    };
  }, [cancellationsData]);

  const snapshotData = snapshotValue?.data;

  const metricsData = useMemo(() => {
    const snapshotVariance = snapshotData?.variance;
    return {
      total_updates: snapshotVariance?.total_updates ?? 0,
      increase_percentage: snapshotVariance?.increase_percentage ?? 0,
    };
  }, [snapshotData]);

  const statsTodayData = useMemo(() => {
    if (!snapshotData?.current_snapshot) return null;
    const cs = snapshotData.current_snapshot;
    return {
      date: cs?.snapshot_date,
      total_residents: cs?.total_residents,
      days_count: Math.abs(snapshotData?.days_elapsed),
      other_resident_visas: cs?.other_resident_visa_holders,
      golden_visa_holders: cs?.golden_visa_holders,
    };
  }, [snapshotData]);

  const statsDateData = useMemo(() => {
    const referenceSnapshot = snapshotData?.reference_snapshot;
    return {
      date: referenceSnapshot?.snapshot_date || referenceDate,
      total_residents: referenceSnapshot?.total_residents ?? 0,
      other_resident_visas: referenceSnapshot?.other_resident_visa_holders ?? 0,
      golden_visa_holders: referenceSnapshot?.golden_visa_holders ?? 0,
    };
  }, [snapshotData, referenceDate]);

  // --- Emirate distribution ---
  const getEmirateIdFromCode = (code) => {
    const codeMap = {
      1: "abu-dhabi",
      2: "dubai",
      3: "sharjah",
      4: "ajman",
      5: "umm-al-quwain",
      6: "ras-al-khaimah",
      7: "fujairah",
    };
    return codeMap[code] || null;
  };

  const emiratesNameMap = useMemo(() => {
    const map = {};
    if (emiratesConfigValue?.data && Array.isArray(emiratesConfigValue.data)) {
      emiratesConfigValue.data.forEach((emirate) => {
        map[emirate?.emirate_code] = {
          en: emirate?.emirate_name_en || "",
          ar: emirate?.emirate_name_ar || "",
        };
      });
    }
    return map;
  }, [emiratesConfigValue]);

  const isArabic = language === "ar";

  const getEmirateName = (code) => {
    const emirate = emiratesNameMap[code];
    if (!emirate) return "";
    return isArabic ? emirate.ar : emirate.en;
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined || num === 0) return "0%";
    return `${Number(num).toFixed(2)}%`;
  };

  const distributionItems = useMemo(() => {
    const apiItems = distributionValue?.data;
    if (!apiItems || !Array.isArray(apiItems)) return [];

    const defaultEmirates = [
      {
        id: "abu-dhabi",
        code: 1,
        nameEn: "Abu Dhabi",
        nameAr: "أبوظبي",
        marker: { xPct: 24.67, yPct: 96.26 },
        box: { leftPct: 0, topPct: 100.63, anchor: "right-top" },
        label: {
          text: translation[language]?.["Abu Dhabi"] || "Abu Dhabi",
          dx: -6,
          dy: 12,
        },
      },
      {
        id: "dubai",
        code: 2,
        nameEn: "Dubai",
        nameAr: "دبي",
        marker: { xPct: 29.67, yPct: 78.26 },
        box: { leftPct: 0, topPct: 82.63, anchor: "right-top" },
        label: {
          text: translation[language]?.["Dubai"] || "Dubai",
          dx: -4,
          dy: 10,
        },
      },
      {
        id: "sharjah",
        code: 3,
        nameEn: "Sharjah",
        nameAr: "الشارقة",
        marker: { xPct: 32.67, yPct: 69.26 },
        box: { leftPct: 2.37, topPct: 65.63, anchor: "top-mid" },
        label: {
          text: translation[language]?.["Sharjah"] || "Sharjah",
          dx: -10,
          dy: 12,
        },
      },
      {
        id: "ajman",
        code: 4,
        nameEn: "Ajman",
        nameAr: "عجمان",
        marker: { xPct: 35.67, yPct: 60.26 },
        box: { leftPct: 5.01, topPct: 48.63, anchor: "right-mid" },
        label: {
          text: translation[language]?.["Ajman"] || "Ajman",
          dx: -8,
          dy: 10,
        },
      },
      {
        id: "umm-al-quwain",
        code: 5,
        nameEn: "Umm Al Quwain",
        nameAr: "أم القيوين",
        marker: { xPct: 38.67, yPct: 48.26 },
        box: { leftPct: 12.67, topPct: 33.63, anchor: "right-mid" },
        label: {
          text: translation[language]?.["Umm Al Quwain"] || "Umm Al Quwain",
          dx: -6,
          dy: 10,
        },
      },
      {
        id: "ras-al-khaimah",
        code: 6,
        nameEn: "Ras Al Khaimah",
        nameAr: "رأس الخيمة",
        marker: { xPct: 43.67, yPct: 37.26 },
        box: { leftPct: 25.34, topPct: 15.63, anchor: "bottom-mid" },
        label: {
          text: translation[language]?.["Ras Al Khaima"] || "Ras Al Khaima",
          dx: 16,
          dy: 14,
        },
      },
      {
        id: "fujairah",
        code: 7,
        nameEn: "Fujairah",
        nameAr: "الفجيرة",
        marker: { xPct: 50.67, yPct: 57.26 },
        box: { leftPct: 32.8, topPct: 85.96, anchor: "top-mid" },
        label: {
          text: translation[language]?.["Fujairah"] || "Fujairah",
          dx: -8,
          dy: 12,
        },
      },
    ];

    return defaultEmirates.map((emirate) => {
      const apiItem = apiItems.find(
        (item) =>
          getEmirateIdFromCode(Number(item?.emirate_code)) === emirate.id,
      );
      const name = apiItem
        ? isArabic
          ? apiItem?.name_ar
          : apiItem?.name_en
        : getEmirateName(emirate?.code);
      return {
        ...emirate,
        name,
        label: { ...emirate?.label, text: name },
        data: {
          percentage: formatPercentage(apiItem?.percentage || 0),
          residents: (apiItem?.total_residents || 0).toLocaleString(),
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [distributionValue, emiratesNameMap, language]);

  const emirateCardRowsConfig = useMemo(
    () => [
      {
        key: "residents_row",
        dataField: "residents",
        formatType: "raw",
        buildCells: (data) => [
          {
            content: data?.percentage || "0%",
            bold: true,
            align: "center",
            borderRight: true,
          },
          {
            content: data?.residents || "0",
            bold: true,
            align: "center",
            borderRight: true,
          },
          {
            content:
              translation[language]?.["Number of Residents"] ||
              "Number of Residents",
            align: "center",
            bgColor: colors.nationalityBranchBgLight,
          },
        ],
      },
    ],
    [language],
  );

  // --- Handlers ---
  const handleCountryChange = (value) => setSelectedCountry(value);

  const handleExport = () => {
    const title = selectedCountryName
      ? `${translation[language]?.["Nationality Statistics"] || "Nationality Statistics"} - ${selectedCountryName}.pdf`
      : `${translation[language]?.["Nationality Statistics"] || "Nationality Statistics"}.pdf`;
    printDocumentCustomSize(title, setIsCreatingPdf);
  };

  // --- Render ---
  return (
    <>
      <Row
        gutter={16}
        justify={isRtl ? "start" : "end"}
        align="middle"
        wrap={false}
        style={{ marginBottom: "16px", direction: "ltr" }}
      >
        {isRtl ? (
          <>
            <Col flex="none">
              <Button
                type="primary"
                icon={<ArrowSquareOut size={16} />}
                onClick={handleExport}
                loading={isCreatingPdf}
                disabled={!selectedCountry || isAnySectionLoading}
              >
                {translation[language]?.["Export"] || "Export"}
              </Button>
            </Col>
            <Col flex="none">
              <Select
                placeholder={
                  translation[language]?.["Country"] || "Select Country"
                }
                size="default"
                value={selectedCountry}
                showSearch
                allowClear
                style={{ width: "260px" }}
                loading={
                  nationalitiesStatus === "pending" ||
                  nationalitiesStatus === "idle"
                }
                filterOption={(input, option) =>
                  option?.label?.toLowerCase()?.includes(input?.toLowerCase())
                }
                onChange={handleCountryChange}
                options={countryOptions}
              />
            </Col>
          </>
        ) : (
          <>
            <Col flex="none">
              <Select
                placeholder={
                  translation[language]?.["Country"] || "Select Country"
                }
                size="default"
                value={selectedCountry}
                allowClear
                showSearch
                style={{ width: "260px" }}
                loading={
                  nationalitiesStatus === "pending" ||
                  nationalitiesStatus === "idle"
                }
                filterOption={(input, option) =>
                  option?.label?.toLowerCase()?.includes(input?.toLowerCase())
                }
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
                disabled={!selectedCountry || isAnySectionLoading}
              >
                {translation[language]?.["Export"] || "Export"}
              </Button>
            </Col>
          </>
        )}
      </Row>

      {!selectedCountry ? (
        <div style={{ height: "calc(100% - 64px)", marginTop: "16px" }}>
          <ExpatsStatisticsEmptyState />
        </div>
      ) : (
        <Page
          title={
            selectedCountryName
              ? `${translation[language]?.["Updates on the Nationality in the UAE"] || "Updates on the Nationality in the UAE"} - ${selectedCountryName}`
              : translation[language]?.[
                "Updates on the Nationality in the UAE"
              ] || "Updates on the Nationality in the UAE"
          }
          isCreatingPdf={isCreatingPdf}
        >
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <Template
              showThreeColumns={!allSectionsEmpty && !isAnySectionLoading}
              leftColumnWidth="34%"
              rightColumnWidth="33%"
              templateGutter={[16, 12]}
              isRightColumnLeftBorder={false}
              leftColumn={
                <Row gutter={[0, 20]}>
                  <Col paddingBlock={"36px 0px"}>
                    <Row>
                      <Col>
                        <ResidentBreakdownTree
                          // data={checkSectionHasData('cancellations', cancellationsValue?.data) ? residentBreakdownData : null}
                          data={residentBreakdownData}
                          status={cancellationsStatus}
                          language={language}
                        />
                      </Col>
                      <Col>
                        <PdfDivider />
                      </Col>
                    </Row>
                  </Col>
                  <Col>
                    <SecurityCancellationMovements
                      data={checkSectionHasData('cancellations', cancellationsValue?.data) ? securityCancellationData : null}
                      status={cancellationsStatus}
                      language={language}
                    />
                  </Col>
                  <Col>
                    <PdfDivider />
                  </Col>
                  <Col>
                    <UpdateMetrics
                      totalUpdates={checkSectionHasData('snapshot', snapshotValue?.data) ? metricsData?.total_updates : null}
                      increasePercentage={checkSectionHasData('snapshot', snapshotValue?.data) ? metricsData?.increase_percentage : null}
                      language={language}
                      status={snapshotStatus}
                    />
                  </Col>
                </Row>
              }
              middleColumn={
                <>
                  <Row style={{ height: "245px" }}>
                    <Col>
                      <Row justify={"center"}>
                        <Col isFlex flex={"250px"}>
                          <Row>
                            <Col textAlign={"center"}>
                              <Text size={"lg"} strong color={colors.text}>
                                {translation[language]?.[
                                  "Statistics as of"
                                ] || "Statistics as of"}{" "}
                                {statsTodayData?.date
                                  ? dayjs(statsTodayData.date).format("DD/MM/YYYY")
                                  : ""}
                              </Text>
                            </Col>
                            <Col paddingBlock={"8px 0px"}>
                              <PdfDivider />
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                      <UAEPopulationSummaryViolator
                        title={translation[language]?.["Total Residents"]}
                        imageSrc="/customPdf/expatsStatistics/people_home.png"
                        imageAlt="residents"
                        total={statsTodayData?.total_residents}
                        chartStyle={{ top: -40 }}
                        totalTextStyle={{ y: '155px' }}
                        showTitleBesideIcon
                        titleStyle={{ textAlign: isArabic ? 'right' : 'left' }}
                        branches={[
                          {
                            x: -100,
                            cardTopY: 355,
                            direction: "left",
                            color: colors.nationalityOtherVisasBranch,
                            number: statsTodayData?.other_resident_visas,
                            width: "300",
                            textXPositon:'-100',
                            label:
                              translation[language]?.[
                                "Number of Other Resident Visas"
                              ] || "Number of Other Resident Visas",
                          },
                          {
                            x: 300,
                            cardTopY: 355,
                            direction: "right",
                            color: colors.nationalityGoldenVisaBranch,
                            number: statsTodayData?.golden_visa_holders,
                            width: "200",
                            label:
                              translation[language]?.[
                                "Number of Golden Visa Holders"
                              ] || "Number of Golden Visa Holders",
                          },
                        ]}
                        status={snapshotStatus}
                        data={checkSectionHasData('snapshot', snapshotValue?.data) ? statsTodayData : null}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col paddingBlock={"8px"}>
                      <PdfDivider />
                    </Col>
                  </Row>
                  <CenterPanel
                    showMapBackground
                    mapSrc="/customPdf/uae_map.jpg"
                    mapOpacity={1}
                    mapScale={`scale(1.2, 1.5)`}
                    mapPosition={
                      isArabic ? "-28px 20px" : "-160px 20px"
                    }
                  >
                    <DistributionByEmirate
                      showTitleBesideIcon={true}
                      title={
                        translation[language]?.["Distribution of Residents as of today by Emirate"] ||
                        "Distribution of Residents as of today by Emirate"
                      }
                      imageSrc="/customPdf/violatorsStatistics/emirate.png"
                      customBoxHeight={isArabic ? 31 : 40}
                      customBoxWidth={155}
                      imageAlt={
                        translation[language]?.["Emirate Map"] || "Emirate Map"
                      }
                      items={distributionItems}
                      status={distributionStatus}
                      data={distributionValue?.data}
                      // data={checkSectionHasData('distribution', distributionValue?.data) ? distributionValue?.data : null}
                      rows={emirateCardRowsConfig}
                      gridColumns="40px 55px 1fr"
                      titleStyle={{ textAlign: isArabic ? 'right' : 'left' }}
                      titleWrapperStyle={{ maxWidth: '250px' }}
                    />
                  </CenterPanel>
                </>
              }
              rightColumn={
                <Row>
                  <Col>
                    {/* Statistics as of date - Ring Chart */}
                    <Row style={{ height: "245px" }}>
                      <Col>
                        <Row justify={"center"}>
                          <Col isFlex flex={"250px"}>
                            <Row>
                              <Col textAlign={"center"}>
                                <Text size={"lg"} strong color={colors.text}>
                                  {translation[language]?.[
                                    "Statistics as of"
                                  ] || "Statistics as of"}{" "}
                                  {statsDateData?.date
                                    ? dayjs(statsDateData.date).format("DD/MM/YYYY")
                                    : ""}
                                </Text>
                              </Col>
                              <Col paddingBlock={"8px 0px"}>
                                <PdfDivider />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                        <UAEPopulationSummaryViolator
                          title={translation[language]?.["Total Residents"]}
                          imageSrc="/customPdf/expatsStatistics/people_home.png"
                          imageAlt="residents"
                          total={statsDateData?.total_residents}
                          chartStyle={{ top: -40 }}
                          totalTextStyle={{ y: '155px' }}
                          showTitleBesideIcon
                          titleStyle={{ textAlign: isArabic ? 'right' : 'left' }}
                          branches={[
                            {
                              x: -100,
                              cardTopY: 355,
                              direction: "left",
                              color: colors.nationalityOtherVisasBranch,
                              number: statsDateData?.other_resident_visas,
                              width: "300",
                              textXPositon:'-100',
                              label:
                                translation[language]?.[
                                  "Number of Other Resident Visas"
                                ] || "Number of Other Resident Visas",
                            },
                            {
                              x: 300,
                              cardTopY: 355,
                              direction: "right",
                              color: colors.nationalityGoldenVisaBranch,
                              number: statsDateData?.golden_visa_holders,
                              width: "200",
                              label:
                                translation[language]?.[
                                  "Number of Golden Visa Holders"
                                ] || "Number of Golden Visa Holders",
                            },
                          ]}
                          status={snapshotStatus}
                          data={checkSectionHasData('snapshot', snapshotValue?.data) ? statsDateData : null}
                        />
                      </Col>
                    </Row>
                    <Row align={"middle"} justify={"center"} isFullHeight>
                      <Col flex={"none"}>
                        <CountryFlagDisplay
                          countryCode={iso2Code}
                          countryName={
                            selectedCountryName
                              ? `${translation[language]?.["Republic of"] || "Republic of"} ${selectedCountryName}`
                              : ""
                          }
                          language={language}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              }
            >
              {isAnySectionLoading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '500px',
                  width: '100%',
                }}>
                  <Spin size="large" />
                </div>
              )}
              {!isAnySectionLoading && allSectionsEmpty && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '500px',
                  width: '100%',
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
            {/* Days badge - left-pointing arrow overlaying the column border */}
            {!isAnySectionLoading && !allSectionsEmpty && statsTodayData?.days_count != null && (
              <div
                style={{
                  position: "absolute",
                  top: "118px",
                  left: "calc(70% - 100px)",
                  zIndex: 10,
                }}
              >
                <svg
                  width="120"
                  height="30"
                  viewBox="0 0 100 50"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <polygon
                    points="20,0 100,0 100,50 20,50 0,25"
                    fill={colors.nationalityBadgeFill}
                    stroke={colors.nationalityBadgeStroke}
                    strokeWidth="1"
                    strokeDasharray="4,2"
                  />
                  <text
                    x="58"
                    y="27"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={colors.fontSizeMedium}
                    fontWeight="bold"
                    fill={colors.nationalityBadgeText}
                  >
                    {statsTodayData.days_count}{" "}
                    {translation[language]?.["Days"] || "Days"}
                  </text>
                </svg>
              </div>
            )}
          </div>
        </Page>
      )}
    </>
  );
}

NationalityStatistics.propTypes = {
  emiratesConfigValue: PropTypes.object,
};
