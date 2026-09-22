import React, { useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Button, Select, PhosphorIcons } from "re-usable-design-components";
import Tabs from "@/components/Tabs";
import translation from "../translation.json";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import useAsync from "@/hooks/useAsync";
import usePersistedCountryTabs from "@/hooks/usePersistedCountryTabs";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";
import { getNationalities } from "@/services/customPdf/riskRegisterStatistics";
import Flags from 'country-flag-icons/react/1x1';
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import ViolatorsStatisticsCountryPanel from "./ViolatorsStatisticsCountryPanel";

const { ArrowSquareOut } = PhosphorIcons;

// The default "All Nationalities" report is a pinned, non-closable tab —
// unlike a specific country it's never empty, so it's always available.
const ALL_TAB_KEY = "__ALL__";

// Chrome-style tab strip: closing the active tab activates its right-hand
// neighbor (falling back to the left-hand one, which is always at least the
// pinned "All" tab), matching browser tab UX.
function getNextActiveTab(tabs, closedKey, currentActiveKey) {
  if (currentActiveKey !== closedKey) {
    return currentActiveKey;
  }
  const closedIndex = tabs.indexOf(closedKey);
  const remaining = tabs.filter((key) => key !== closedKey);
  return remaining[closedIndex] ?? remaining[closedIndex - 1] ?? ALL_TAB_KEY;
}

export default function ViolatorsStatistics({ emiratesConfigValue }) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";
  const isRtl = checkRtl(localeStore);
  const { geoJsonObj } = useWorldGeoJSON();
  const [openCountries, setOpenCountries, activeTab, setActiveTab] =
    usePersistedCountryTabs("violators", ALL_TAB_KEY);
  const [addKey, setAddKey] = useState(0);

  const { isCreatingPdf, setIsCreatingPdf } = usePrint({
    name: "Violators-Statistics.pdf"
  });

  const {
    execute: executeNationalities,
    status: nationalitiesStatus,
    value: nationalitiesValue,
  } = useAsync({ asyncFunction: getNationalities });

  useEffect(() => {
    executeNationalities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getCountryName = (code) =>
    countryOptions.find((option) => option.value === code)?.label || null;

  const getISO2Code = (code3) => {
    if (!code3) return null;
    const geoJsonItem = geoJsonObj?.[code3];
    return geoJsonItem?.properties?.["iso-a2"] || code3;
  };

  const handleAddOrSwitchCountry = (value) => {
    if (!value) return;
    setOpenCountries((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setActiveTab(value);
    setAddKey((key) => key + 1);
  };

  const handleTabClose = (targetKey) => {
    setActiveTab(getNextActiveTab([ALL_TAB_KEY, ...openCountries], targetKey, activeTab));
    setOpenCountries((prev) => prev.filter((key) => key !== targetKey));
  };

  const tabItems = useMemo(() => {
    const allTab = {
      key: ALL_TAB_KEY,
      closable: false,
      label: translation[language]?.["All Nationalities"] || "All Nationalities",
    };
    const countryTabs = openCountries.map((code) => {
      const iso2Code = getISO2Code(code);
      const FlagComponent = iso2Code && Flags[iso2Code] ? Flags[iso2Code] : null;
      return {
        key: code,
        closable: true,
        label: (
          <Row gutter={8} align="middle" wrap={false} style={{ direction: "ltr" }}>
            {FlagComponent && (
              <Col flex="none">
                <span style={{ display: "inline-block", width: "16px", height: "16px", borderRadius: "50%", overflow: "hidden" }}>
                  <FlagComponent style={{ width: "100%", height: "100%" }} />
                </span>
              </Col>
            )}
            <Col flex="none">{getCountryName(code) || code}</Col>
          </Row>
        ),
      };
    });
    return [allTab, ...countryTabs];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCountries, countryOptions, geoJsonObj, language]);

  const activeCountry = activeTab === ALL_TAB_KEY ? undefined : activeTab;
  const activeCountryName = activeCountry ? getCountryName(activeCountry) : null;

  const handleExport = () => {
    printDocumentCustomSize(
      activeCountryName
        ? `${translation[language]?.["Statistics of Violators in the UAE"]} - ${activeCountryName}.pdf`
        : (`${translation[language]?.["Statistics of Violators in the UAE"]}.pdf`), setIsCreatingPdf);
  };

  return (
    <>
      <Row
        gutter={16}
        justify={isRtl ? "start" : "end"}
        align="middle"
        wrap={false}
        style={{
          marginBottom: "8px",
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
                key={addKey}
                placeholder={translation?.[language]?.["Country"] || "Select Country"}
                size="default"
                showSearch
                style={{
                  width: "260px",
                }}
                loading={nationalitiesStatus === "pending" || nationalitiesStatus === "idle"}
                filterOption={(input, option) => {
                  return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
                }}
                onChange={handleAddOrSwitchCountry}
                options={countryOptions}
              />
            </Col>
          </>
        ) : (
          <>
            <Col flex="none">
              <Select
                key={addKey}
                placeholder={translation?.[language]?.["Country"] || "Select Country"}
                size="default"
                showSearch
                style={{
                  width: "260px",
                }}
                loading={nationalitiesStatus === "pending" || nationalitiesStatus === "idle"}
                filterOption={(input, option) => {
                  return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
                }}
                onChange={handleAddOrSwitchCountry}
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

      <div style={{ marginBottom: "4px" }}>
        <Tabs
          type="editable-card"
          hideAdd
          tabBarStyle={{ marginBottom: 0 }}
          activeKey={activeTab}
          onChange={setActiveTab}
          onEdit={(targetKey, action) => {
            if (action === "remove") {
              handleTabClose(targetKey);
            }
          }}
          items={tabItems}
        />
      </div>

      <ViolatorsStatisticsCountryPanel
        key={activeTab}
        country={activeCountry}
        countryName={activeCountryName}
        emiratesConfigValue={emiratesConfigValue}
        isCreatingPdf={isCreatingPdf}
      />
    </>
  );
}

ViolatorsStatistics.propTypes = {
  emiratesConfigValue: PropTypes.object,
};
