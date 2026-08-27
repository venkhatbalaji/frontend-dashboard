import { useState, useCallback, useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import { Row, Col, theme, Spin } from "re-usable-design-components";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import FamilyGraph from "./FamilyGraph";
import FamilyDetails from "./FamilyDetails";
import { searchPerson, getPersonTree } from "@/services/familyTreeService";

const { useToken } = theme;

// Locale switching causes the design-system ThemeProvider to re-mount its
// children when `direction` flips. Persisting the open tree to sessionStorage
// lets the FamilyTreeView re-hydrate exactly where the user left off.
const SS_KEY = "familyTree.viewState";
const ssLoad = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.sessionStorage.getItem(SS_KEY) || "null"); }
  catch { return null; }
};
const ssSave = (data) => {
  if (typeof window === "undefined") return;
  try {
    if (data) window.sessionStorage.setItem(SS_KEY, JSON.stringify(data));
    else window.sessionStorage.removeItem(SS_KEY);
  } catch { /* quota or disabled storage — non-fatal */ }
};

// maxLen mirrors the placeholder so the input box can't accept more characters
// than the example shows the user.
const SEARCH_TYPES = [
  { value: "UNIFIED_ID", labelId: "family_tree_unified_id", placeholder: "0020375801", maxLen: 18, validate: (v) => /^\d{1,15}$/.test(v.trim()) },
  { value: "EID", labelId: "family_tree_emirates_id", placeholder: "784-XXXX-XXXXXXX-X", maxLen: 18, validate: (v) => /^\d{3}-\d{4}-\d{7}-\d$/.test(v.trim()) || /^\d{15}$/.test(v.trim()) },
  { value: "PASSPORT", labelId: "family_tree_passport_number", placeholder: "A1234567", maxLen: 15, validate: (v) => /^[A-Za-z0-9]{6,12}$/.test(v.trim()) },
];

// Take whatever the user typed (digits, dashes, spaces, paste with formatting)
// and produce the canonical 784-XXXX-XXXXXXX-X view. Capped at 15 digits so the
// field can't overflow even when the user pastes a long string.
function formatEID(raw) {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 15);
  const parts = [];
  if (digits.length > 0) parts.push(digits.slice(0, 3));
  if (digits.length > 3) parts.push(digits.slice(3, 7));
  if (digits.length > 7) parts.push(digits.slice(7, 14));
  if (digits.length > 14) parts.push(digits.slice(14, 15));
  return parts.join("-");
}

// Production-no-op: kept so existing call sites remain valid without printing.
function tsLog() { }

// ─── Search Screen ────────────────────────────────────────────────────────────

function SearchScreen({ onSearch, loading, error }) {
  const intl = useIntl();
  const themeVariables = useToken();
  const [searchType, setSearchType] = useState("UNIFIED_ID");
  const [value, setValue] = useState("");
  const [validationError, setValidationError] = useState("");

  const selectedType = SEARCH_TYPES.find((t) => t.value === searchType);
  const selectedLabel = selectedType ? intl.formatMessage({ id: selectedType.labelId }) : "";

  const handleSearch = () => {
    const trimmed = value.trim();
    if (!trimmed) { setValidationError(intl.formatMessage({ id: "familytree_search_empty" })); return; }
    if (!selectedType.validate(trimmed)) { setValidationError(intl.formatMessage({ id: "family_tree_invalid_input" })); return; }
    const payLoad = searchType === "EID" ? trimmed.replace(/-/g, "")
      : searchType === "UNIFIED_ID" ? `P${trimmed}`
      : trimmed;
    setValidationError("");
    onSearch({ searchType, value: payLoad });
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSearch(); };

  // Both controls share the same font size, padding, border, and explicit
  // height so the dropdown and the input render at pixel-identical sizes in
  // every locale. Native <select> defaults to a slightly different height
  // than <input> across browsers — locking height + box-sizing eliminates it.
  const FIELD_HEIGHT = 42;
  const fieldBase = {
    height: `${FIELD_HEIGHT}px`,
    padding: "0 5px",
    fontSize: "15px",
    lineHeight: 1.2,
    borderRadius: "8px",
    outline: "none",
    backgroundColor: themeVariables?.token?.colorBgContainer || "#fff",
    color: themeVariables?.token?.colorText || "#111",
    boxSizing: "border-box",
  };

  const inputStyle = {
    ...fieldBase,
    width: "100%",
    border: `1px solid ${validationError ? "#ef4444" : themeVariables?.token?.colorBorder || "#d1d5db"}`,
    transition: "border-color 0.2s",
  };

  const selectStyle = {
    ...fieldBase,
    width: "100%",
    border: `1px solid ${themeVariables?.token?.colorBorder || "#d1d5db"}`,
    cursor: "pointer",
  };

  // Match the search button's width to the row above it (dropdown + gap +
  // input = 160px + 10px + 260px = 430px). On narrow screens the row wraps
  // and the button stays capped at 100% of its container.
  const btnStyle = (disabled) => ({
    padding: "10px 28px",
    fontSize: "15px",
    fontWeight: 600,
    backgroundColor: disabled ? "#d1d5db" : "#DAA520",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
    maxWidth: "430px",
    transition: "background-color 0.2s",
    whiteSpace: "nowrap",
  });

  return (
    <Row isFullHeight style={{ alignItems: "center", justifyContent: "center" }}>
      <Col style={{ maxWidth: "600px", width: "100%", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "16px",
            background: "linear-gradient(135deg, rgba(218,165,32,0.18), rgba(218,165,32,0.06))",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            color: "#DAA520", marginBottom: "16px",
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="4.5" r="2.2" />
              <circle cx="6" cy="13" r="2.2" />
              <circle cx="18" cy="13" r="2.2" />
              <circle cx="4" cy="20" r="1.8" />
              <circle cx="10" cy="20" r="1.8" />
              <circle cx="14" cy="20" r="1.8" />
              <circle cx="20" cy="20" r="1.8" />
              <path d="M12 6.7v3.5M6 15.2v2.8M18 15.2v2.8M5 11.5l6-4.5M19 11.5l-6-4.5M5 18.5l-1 .8M7 18.5l1 .8M17 18.5l-1 .8M19 18.5l1 .8" />
            </svg>
          </div>
          <h2 style={{ fontSize: "26px", fontWeight: 700, margin: 0, marginBottom: "8px", color: themeVariables?.token?.colorText || "#111", letterSpacing: "-0.01em" }}>
            {intl.formatMessage({ id: "Family Tree" })}
          </h2>
          <p style={{ fontSize: "14px", color: themeVariables?.token?.colorTextSecondary || "#6b7280", margin: 0, maxWidth: "440px", marginInline: "auto", lineHeight: 1.5 }}>
            {intl.formatMessage({ id: "family_tree_search_description" })}
          </p>
        </div>

        {/* Search card */}
        <div style={{
          background: themeVariables?.token?.colorBgContainer || "#fff",
          border: `1px solid ${themeVariables?.token?.colorBorderSecondary || "#eef0f3"}`,
          borderRadius: "14px",
          boxShadow: "0 8px 24px rgba(15,23,42,0.04)",
          padding: "20px",
        }}>

          {/* Search controls + button share the same 430px-wide column so
              their left and right edges line up exactly. margin: 0 auto
              centers the column inside the card; the dropdown column is a
              fixed 160px so the row keeps its proportions in Arabic too
              (where the dropdown text would otherwise be wider). */}
          <div style={{ width: "100%", maxWidth: "430px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
              <div style={{ flexShrink: 0, width: "160px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: themeVariables?.token?.colorTextSecondary || "#6b7280", marginBottom: "6px" }}>
                  {intl.formatMessage({ id: "family_tree_search_by" })}
                </label>
                <select style={selectStyle} value={searchType} onChange={(e) => { setSearchType(e.target.value); setValue(""); setValidationError(""); }}>
                  {SEARCH_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{intl.formatMessage({ id: t.labelId })}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: "1 1 0%", minWidth: "180px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: themeVariables?.token?.colorTextSecondary || "#6b7280", marginBottom: "6px" }}>
                  {selectedLabel}
                </label>
                <input
                  type="text"
                  style={inputStyle}
                  placeholder={selectedType?.placeholder}
                  value={value}
                  // EID is auto-formatted to 784-XXXX-XXXXXXX-X on every keystroke.
                  // Unified ID has the leading "P" stripped on input so the user
                  // sees just digits matching the placeholder; the prefix is
                  // restored by handleSearch before going to the backend.
                  inputMode={searchType === "PASSPORT" ? "text" : "numeric"}
                  maxLength={selectedType?.maxLen}
                  onChange={(e) => {
                    let raw = e.target.value;
                    if (searchType === "EID") raw = formatEID(raw);
                    else if (searchType === "UNIFIED_ID") raw = raw.replace(/\D/g, "");
                    setValue(raw);
                    setValidationError("");
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* Validation error */}
            {validationError && (
              <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "10px", marginTop: "-6px" }}>{validationError}</p>
            )}

            {/* API error */}
            {error && (
              <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", marginBottom: "14px" }}>
                <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>{error}</p>
              </div>
            )}

            <button style={btnStyle(loading)} disabled={loading} onClick={handleSearch}>
              {loading ? <Spin size="small" /> : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  {intl.formatMessage({ id: "family_tree_search" })}
                </span>
              )}
            </button>
          </div>
        </div>
      </Col>
    </Row>
  );
}

// ─── Graph View ───────────────────────────────────────────────────────────────

function GraphView({ treeData, selectedNode, currentPersonId, onPersonSelect, onNodeClick, onBack, isRtl }) {
  const intl = useIntl();
  const themeVariables = useToken();
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const isArabicLocale = String(intl.locale || "").toLowerCase().startsWith("ar");
  const personRecord = currentPersonId && treeData?.nodes
    ? treeData.nodes.find((n) => n.id === currentPersonId) || {}
    : {};
  const personName = currentPersonId
    ? (isArabicLocale
      ? (personRecord.name_arabic || personRecord.full_name || currentPersonId)
      : (personRecord.full_name || personRecord.name_eng || currentPersonId))
    : currentPersonId;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", direction: isRtl ? "rtl" : "ltr" }}>
      {/* Subheader */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 20px", borderBottom: `1px solid ${themeVariables?.token?.colorBorder || "#e5e7eb"}`,
        backgroundColor: themeVariables?.token?.colorBgContainer || "#fff", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={onBack}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              // Use the theme container background so the button stays
              // legible in dark mode — was hardcoded "#fff" which made the
              // text disappear when colorText became light.
              background: themeVariables?.token?.colorBgContainer || "#fff",
              border: `1px solid ${themeVariables?.token?.colorBorder || "#d1d5db"}`,
              borderRadius: "8px", padding: "6px 12px", cursor: "pointer",
              fontSize: "13px", fontWeight: 500, color: themeVariables?.token?.colorText || "#111",
              transition: "background-color 0.15s ease, border-color 0.15s ease",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRtl ? "scaleX(-1)" : "none" }} aria-hidden="true">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            {intl.formatMessage({ id: "family_tree_new_search" })}
          </button>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#DAA520" }}>
            {intl.formatMessage({ id: "family_tree_title_of" }, { name: personName || currentPersonId })}
          </span>
        </div>
      </div>

      {/* Content split */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Details panel – collapsible, 30% when open. The collapse/expand
            toggle lives inside its header (FamilyDetails), not as a separate
            strip here — when closed, a small floating button on the graph
            side re-opens it. Stays mounted (rather than conditionally
            rendered) so the width/opacity change can transition smoothly
            instead of popping in/out instantly. */}
        <div style={{
          flex: isDetailsOpen ? "0 0 30%" : "0 0 0%",
          minWidth: 0, overflowY: isDetailsOpen ? "auto" : "hidden", overflowX: "hidden",
          opacity: isDetailsOpen ? 1 : 0,
          [isRtl ? "borderLeft" : "borderRight"]: `1px solid ${isDetailsOpen ? (themeVariables?.token?.colorBorder || "#e5e7eb") : "transparent"}`,
          backgroundColor: "#f9fafb",
          transition: "flex-basis 0.28s ease, opacity 0.2s ease, border-color 0.28s ease",
        }}>
          <FamilyDetails
            treeData={treeData}
            selectedNode={selectedNode}
            personId={currentPersonId}
            isRtl={isRtl}
            onToggleCollapse={() => setIsDetailsOpen(false)}
          />
        </div>

        {/* Graph – fills whatever space remains */}
        <div style={{ flex: "1 1 auto", position: "relative", backgroundColor: "#fff", direction: "ltr", overflow: "hidden" }}>
          {!isDetailsOpen && (
            <button
              onClick={() => setIsDetailsOpen(true)}
              title={intl.formatMessage({ id: "family_tree_expand_panel" })}
              aria-label={intl.formatMessage({ id: "family_tree_expand_panel" })}
              style={{
                position: "absolute", top: "10px", [isRtl ? "right" : "left"]: "14px", zIndex: 30,
                width: "34px", height: "34px", borderRadius: "8px",
                background: themeVariables?.token?.colorBgContainer || "#fff",
                border: `1px solid ${themeVariables?.token?.colorBorder || "#d1d5db"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: themeVariables?.token?.colorText || "#111",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <line x1={isRtl ? "15" : "9"} y1="4" x2={isRtl ? "15" : "9"} y2="20" />
              </svg>
            </button>
          )}
          <FamilyGraph
            treeData={treeData}
            personId={currentPersonId}
            onPersonSelect={onPersonSelect}
            onNodeClick={onNodeClick}
            isRtl={isRtl}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────

export default function FamilyTreeView() {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = localeStore?.projectTranslation === "ar";

  // Initialize from sessionStorage so a locale-driven re-mount restores the
  // open tree instead of bouncing back to the search screen.
  const persisted = ssLoad();
  const [state, setState] = useState(persisted?.state || "idle"); // idle | loading | error | success
  const [treeData, setTreeData] = useState(persisted?.treeData || null);
  const [selectedNode, setSelectedNode] = useState(persisted?.selectedNode || null);
  const [currentPersonId, setCurrentPersonId] = useState(persisted?.currentPersonId || null);
  const [searchError, setSearchError] = useState("");
  const [loadingNav, setLoadingNav] = useState(false);

  // Keep sessionStorage in sync with whatever's on screen.
  useEffect(() => {
    if (state === "success" && treeData && currentPersonId) {
      ssSave({ state, treeData, selectedNode, currentPersonId });
    } else if (state === "idle") {
      ssSave(null);
    }
  }, [state, treeData, selectedNode, currentPersonId]);

  const handleSearch = useCallback(async ({ searchType, value }) => {
    tsLog("log", "Search triggered:", searchType, value);
    setState("loading");
    setSearchError("");
    setTreeData(null);
    setSelectedNode(null);
    setCurrentPersonId(null);

    try {
      const searchResult = await searchPerson({ searchType, value });
      tsLog("log", "Search result:", searchResult);

      if (!searchResult?.exists && !searchResult?.personId) {
        setSearchError(intl.formatMessage({ id: "family_tree_person_not_found" }));
        setState("idle");
        return;
      }

      const personId = searchResult.personId || value;
      setCurrentPersonId(personId);

      const tree = await getPersonTree(personId, 3);
      tsLog("log", "Tree loaded, nodes:", tree?.nodes?.length, "edges:", tree?.edges?.length);

      if (!tree?.nodes?.length) {
        setSearchError(intl.formatMessage({ id: "family_tree_no_data" }));
        setState("idle");
        return;
      }

      setTreeData(tree);
      const rootNode = tree.nodes.find((n) => n.id === personId) || tree.nodes[0];
      setSelectedNode(rootNode);
      setState("success");
    } catch (err) {
      tsLog("error", "Search failed:", err);
      const msg = err?.response?.data?.detail || err?.message || intl.formatMessage({ id: "family_tree_search_failed" });
      setSearchError(msg);
      setState("idle");
    }
  }, [intl]);

  const handlePersonSelect = useCallback(async (newPersonId) => {
    if (loadingNav) return;
    tsLog("log", "Navigating to person:", newPersonId);
    setLoadingNav(true);
    try {
      const tree = await getPersonTree(newPersonId, 3);
      if (!tree?.nodes?.length) { tsLog("warn", "No tree data for person:", newPersonId); return; }
      setTreeData(tree);
      setCurrentPersonId(newPersonId);
      const rootNode = tree.nodes.find((n) => n.id === newPersonId) || tree.nodes[0];
      setSelectedNode(rootNode);
    } catch (err) {
      tsLog("error", "Navigation failed:", err);
    } finally {
      setLoadingNav(false);
    }
  }, [loadingNav]);

  const handleNodeClick = useCallback((nodeId) => {
    if (!treeData) return;
    const node = treeData.nodes.find((n) => n.id === nodeId);
    if (node) setSelectedNode(node);
  }, [treeData]);

  const handleBack = useCallback(() => {
    setState("idle");
    setTreeData(null);
    setSelectedNode(null);
    setCurrentPersonId(null);
    setSearchError("");
    ssSave(null);
  }, []);

  if (state === "loading") {
    return (
      <Row isFullHeight style={{ alignItems: "center", justifyContent: "center" }}>
        <Col style={{ textAlign: "center" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#6b7280", fontSize: "15px" }}>
            {intl.formatMessage({ id: "family_tree_searching" })}
          </p>
        </Col>
      </Row>
    );
  }

  if (state === "success" && treeData) {
    return (
      <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
        {loadingNav && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "8px",
          }}>
            <Spin size="large" />
          </div>
        )}
        <GraphView
          treeData={treeData}
          selectedNode={selectedNode}
          currentPersonId={currentPersonId}
          onPersonSelect={handlePersonSelect}
          onNodeClick={handleNodeClick}
          onBack={handleBack}
          isRtl={isRtl}
        />
      </div>
    );
  }

  return <SearchScreen onSearch={handleSearch} loading={state === "loading"} error={searchError} />;
}
