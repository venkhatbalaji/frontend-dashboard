import { useState, useEffect } from "react";
import { useIntl } from "react-intl";

// Every entry routes through a CSS custom property that the design system's
// theme provider rebinds when the user toggles dark mode. The fallback after
// the comma is the legacy light-mode value, so behavior is identical on themes
// that don't ship these vars. Gold stays brand-fixed; the cream "white" is the
// container bg so cards repaint dark when the rest of the UI does.
const C = {
  bg50:    "var(--colorBgLayout, #f9fafb)",
  bg100:   "var(--colorFillTertiary, #f3f4f6)",
  bg200:   "var(--colorFillSecondary, #e5e7eb)",
  text900: "var(--colorText, #111827)",
  text600: "var(--colorTextSecondary, #4b5563)",
  text500: "var(--colorTextTertiary, #6b7280)",
  border:  "var(--colorBorder, #e5e7eb)",
  gold:    "#DAA520",
  white:   "var(--colorBgContainer, #ffffff)",
  // Resident badge: light/dark adaptive via design-system success tokens.
  residentBg:   "var(--colorSuccessBg, #dcfce7)",
  residentText: "var(--colorSuccessText, #15803d)",
};

const styles = {
  wrapper: { height: "100%", display: "flex", flexDirection: "column", backgroundColor: C.bg50 },
  header: { position: "sticky", top: 0, zIndex: 10, backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, padding: "16px 24px" },
  headerTitle: { fontSize: "18px", fontWeight: 700, color: C.text900, margin: 0, marginBottom: "4px" },
  headerSub: { fontSize: "14px", color: C.text600, margin: 0 },
  badge: (isGold) => ({
    display: "inline-block",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: 600,
    borderRadius: "4px",
    backgroundColor: isGold ? C.gold : C.residentBg,
    // The gold (citizen) badge always uses pure white text so it reads on the
    // gold field in either theme; for residents we route through the success
    // tokens which the theme provider swaps automatically.
    color: isGold ? "#ffffff" : C.residentText,
    marginInlineStart: "8px",
  }),
  scrollBody: { flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" },
  section: { backgroundColor: C.white, borderRadius: "8px", border: `1px solid ${C.border}` },
  sectionHeader: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "start",
  },
  sectionTitle: { fontWeight: 600, color: C.text900, fontSize: "14px" },
  sectionCount: { fontSize: "12px", color: C.text500, backgroundColor: C.bg100, padding: "2px 8px", borderRadius: "999px", marginInlineStart: "8px" },
  sectionBody: { padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: "12px" },
  chevronSvg: { width: "16px", height: "16px", color: C.text500, transition: "transform 0.2s ease" },
  emptyText: { fontSize: "14px", color: C.text500, textAlign: "center", padding: "16px 0" },
  personCard: {
    backgroundColor: C.white, borderRadius: "8px", border: `1px solid ${C.border}`,
    padding: "16px", display: "flex", alignItems: "flex-start", gap: "12px",
  },
  avatarWrap: {
    width: "48px", height: "48px", borderRadius: "8px", backgroundColor: C.bg100,
    flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  infoWrap: { flex: 1, minWidth: 0 },
  nameEn: { fontWeight: 600, color: C.text900, fontSize: "14px", marginBottom: "4px" },
  nameAr: { fontWeight: 600, color: C.text900, fontSize: "14px", marginBottom: "8px" },
  fieldRow: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: C.text600, marginBottom: "4px" },
  fieldLabel: { color: C.text500, fontWeight: 500 },
  fieldMono: { fontFamily: "monospace" },
  chevron: { fontSize: "16px", color: C.text500 },
};

// Avatar URL is keyed on (person_type, sex). Resident persons get a different
// set of icons from citizens; falls back to the citizen icons when person_type
// is unknown — that matches the existing isCitizen heuristic elsewhere in the
// view (any record with a national_id but no explicit person_type is treated
// as a citizen).
function getAvatarUrl(person) {
  const isFemale = String(person.sex || person.gender || "").toUpperCase() === "F";
  const isResident = person.person_type === "resident";
  if (isResident) return isFemale ? "/resident/female.png" : "/resident/male.png";
  return isFemale ? "/citizen/female_icon.jpg" : "/citizen/male_icon.jpg";
}

function formatDate(d) {
  if (!d) return "";
  const datePart = String(d).split("T")[0];
  const parts =datePart.split(/[-/]/);
  if (parts.length !== 3) return d;
  if (parts[0].length === 4) {
    const [y, m, day] = parts;
    return `${day.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  if (parts[2].length === 4) {
    const [day, m, y] = parts;
    return `${day.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  return d;
}

function formatEmiratesId(eid) {
  if (eid == null || eid === "") return "";
  let s;
  if (typeof eid === "number") {
    s = eid.toFixed(0);
  } else {
    s = String(eid).trim();
    if (/[eE]/.test(s)) {
      const n = Number(s);
      if (Number.isFinite(n)) s = n.toFixed(0);
    }
  }
  s = s.replace(/\D/g, "");
  if (s.length === 15) {
    return `${s.slice(0,3)}-${s.slice(3,7)}-${s.slice(7,14)}-${s.slice(14)}`;
  }
  return s;
}

const KIN_KEY = {
  self: "family_tree_kin_self",
  father: "family_tree_kin_father",
  mother: "family_tree_kin_mother",
  brother: "family_tree_kin_brother",
  sister: "family_tree_kin_sister",
  son: "family_tree_kin_son",
  daughter: "family_tree_kin_daughter",
  wife: "family_tree_kin_wife",
  husband: "family_tree_kin_husband",
  grandfather: "family_tree_kin_grandfather",
  grandmother: "family_tree_kin_grandmother",
  grandson: "family_tree_kin_grandson",
  granddaughter: "family_tree_kin_granddaughter",
  uncle: "family_tree_kin_uncle",
  aunt: "family_tree_kin_aunt",
  "ex-wife":      "family_tree_kin_ex_wife",
  "ex-husband":   "family_tree_kin_ex_husband",
  "late-wife":    "family_tree_kin_late_wife",
  "late-husband": "family_tree_kin_late_husband",
  "half-brother": "family_tree_kin_half_brother",
  "half-sister":  "family_tree_kin_half_sister",
  "step-brother": "family_tree_kin_step_brother",
  "step-sister":  "family_tree_kin_step_sister",
};

function translateKin(intl, kin) {
  if (!kin) return "";
  // Accept either underscore or hyphen variants ("ex_wife" → "ex-wife")
  const key = KIN_KEY[String(kin).toLowerCase().replace(/_/g, "-")];
  return key ? intl.formatMessage({ id: key }) : kin;
}

function PersonCard({ person, intl, isRtl }) {
  const nameEng = person.name_eng || person.full_name || person.name || person.label || person.id;
  const nameArabic = person.name_arabic;
  const dob = formatDate(person.dob || person.date_of_birth);
  const unifiedId = person.unified_id || person.id;
  const emiratesId = formatEmiratesId(person.national_id);
  const passportNo = person.passport_no || person.passport;
  const contactNo = person.contact_no;
  const nationality = person.nationality;
  const gender = person.gender || person.sex;
  const kin = person.kin || "";
  const isCitizen = person.person_type === "citizen" || (person.person_type === undefined && person.national_id);

  const genderLabel =
    gender === "F" || gender === "Female"
      ? intl.formatMessage({ id: "Female" })
      : gender === "M" || gender === "Male"
        ? intl.formatMessage({ id: "Male" })
        : gender;

  // In Arabic mode, lead with the Arabic name when available.
  const primaryName = isRtl && nameArabic ? nameArabic : nameEng;
  const secondaryName = isRtl && nameArabic ? nameEng : nameArabic;

  return (
    <div style={styles.personCard}>
      <div style={styles.avatarWrap}>
        <img src={getAvatarUrl(person)} alt={primaryName} style={styles.avatarImg} onError={(e) => { e.target.style.display = "none"; }} />
      </div>
      <div style={styles.infoWrap}>
        <div style={styles.nameEn}>{primaryName}</div>
        {secondaryName && <div style={styles.nameAr}>{secondaryName}</div>}

        {person.person_type && (
          <div style={{ marginBottom: "6px" }}>
            <span style={styles.badge(isCitizen)}>
              {intl.formatMessage({ id: isCitizen ? "family_tree_citizen" : "family_tree_resident" })}
            </span>
          </div>
        )}

        {kin && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_relation" })}:</span>
            <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{translateKin(intl, kin)}</span>
          </div>
        )}
        {dob && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_dob" })}:</span>
            <span dir="ltr" style={styles.fieldMono}>{dob}</span>
          </div>
        )}
        {unifiedId && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_unified_id" })}:</span>
            <span dir="ltr" style={styles.fieldMono}>{unifiedId}</span>
          </div>
        )}
        {emiratesId && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_emirates_id" })}:</span>
            <span dir="ltr" style={styles.fieldMono}>{emiratesId}</span>
          </div>
        )}
        {passportNo && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_passport" })}:</span>
            <span dir="ltr" style={styles.fieldMono}>{passportNo}</span>
          </div>
        )}
        {contactNo && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_contact" })}:</span>
            <span dir="ltr">{contactNo}</span>
          </div>
        )}
        {nationality && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_nationality" })}:</span>
            <span>{nationality}</span>
          </div>
        )}
        {gender && (
          <div style={styles.fieldRow}>
            <span style={styles.fieldLabel}>{intl.formatMessage({ id: "family_tree_field_gender" })}:</span>
            <span>{genderLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function buildRelationships(treeData, personId) {
  const parents = [];
  const children = [];
  const spouses = [];
  const siblings = [];
  const idMap = new Map((treeData.nodes || []).map((n) => [n.id, n]));
  (treeData.edges || []).forEach((edge) => {
    if (!edge || !edge.source || !edge.target) return;
    const type = String(edge.type || "").toUpperCase();
    if (type === "CHILD_OF") {
      if (edge.source === personId) { const p = idMap.get(edge.target); if (p) parents.push(p); }
      if (edge.target === personId) { const c = idMap.get(edge.source); if (c) children.push(c); }
    } else if (type === "SPOUSE_OF") {
      if (edge.source === personId) { const s = idMap.get(edge.target); if (s) spouses.push(s); }
      if (edge.target === personId) { const s = idMap.get(edge.source); if (s) spouses.push(s); }
    } else if (type === "SIBLING_OF") {
      if (edge.source === personId) { const s = idMap.get(edge.target); if (s) siblings.push(s); }
      if (edge.target === personId) { const s = idMap.get(edge.source); if (s) siblings.push(s); }
    }
  });
  return { parents, children, spouses, siblings };
}

export default function FamilyDetails({ treeData, selectedNode, personId, isRtl }) {
  const intl = useIntl();
  const [expanded, setExpanded] = useState({ personal: true, parents: true, spouses: true, siblings: true, children: true });

  const selectedNodeId = selectedNode?.id;
  useEffect(() => {
    if (selectedNode) setExpanded({ personal: true, parents: true, spouses: true, siblings: true, children: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  if (!treeData) {
    return (
      <div style={{ ...styles.wrapper, direction: isRtl ? "rtl" : "ltr" }}>
        <div style={styles.header}>
          <h3 style={styles.headerTitle}>{intl.formatMessage({ id: "family_tree_details_title" })}</h3>
          <p style={styles.headerSub}>{intl.formatMessage({ id: "family_tree_loading" })}</p>
        </div>
      </div>
    );
  }

  const displayPerson = selectedNode || treeData.nodes?.find((n) => n.id === personId) || treeData.nodes?.[0];

  if (!displayPerson) {
    return (
      <div style={{ ...styles.wrapper, alignItems: "center", justifyContent: "center", direction: isRtl ? "rtl" : "ltr" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.text600, fontSize: "14px" }}>{intl.formatMessage({ id: "family_tree_no_person_selected" })}</p>
        </div>
      </div>
    );
  }

  const rel = buildRelationships(treeData, displayPerson.id);
  const fullName = isRtl && displayPerson.name_arabic
    ? displayPerson.name_arabic
    : displayPerson.full_name || displayPerson.name || displayPerson.label || displayPerson.id;
  const isCitizen = displayPerson.person_type === "citizen" || (displayPerson.person_type === undefined && displayPerson.national_id);

  const sections = [
    { id: "personal",  titleId: "family_tree_section_personal",  data: [displayPerson] },
    { id: "parents",   titleId: "family_tree_section_parents",   data: rel.parents },
    { id: "spouses",   titleId: "family_tree_section_spouses",   data: rel.spouses },
    { id: "siblings",  titleId: "family_tree_section_siblings",  data: rel.siblings },
    { id: "children",  titleId: "family_tree_section_children",  data: rel.children },
  ];

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ ...styles.wrapper, direction: isRtl ? "rtl" : "ltr" }}>
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>{intl.formatMessage({ id: "family_tree_details_title" })}</h3>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
          <p style={styles.headerSub}>{fullName}</p>
          {displayPerson.person_type && (
            <span style={styles.badge(isCitizen)}>
              {intl.formatMessage({ id: isCitizen ? "family_tree_citizen" : "family_tree_resident" })}
            </span>
          )}
        </div>
      </div>

      <div style={styles.scrollBody}>
        {sections.map((section) => {
          const isOpen = expanded[section.id];
          const hasData = section.data && section.data.length > 0;
          return (
            <div key={section.id} style={styles.section}>
              <button style={styles.sectionHeader} onClick={() => toggle(section.id)}>
                <span>
                  <span style={styles.sectionTitle}>{intl.formatMessage({ id: section.titleId })}</span>
                  <span style={styles.sectionCount}>{section.data?.length || 0}</span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ ...styles.chevronSvg, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {isOpen && (
                <div style={styles.sectionBody}>
                  {!hasData
                    ? <p style={styles.emptyText}>{intl.formatMessage({ id: "family_tree_no_data_available" })}</p>
                    : section.data.map((p) => <PersonCard key={p.id} person={p} intl={intl} isRtl={isRtl} />)
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
