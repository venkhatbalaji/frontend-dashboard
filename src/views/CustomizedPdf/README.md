# Customized PDF Dashboard (`/customized-pdf`)

## Overview

The Customized PDF route is a multi-tab dashboard that generates fixed-dimension (1292×741px) PDF-ready report pages. Each tab represents an independent statistical dashboard that can be exported as a landscape PDF via client-side capture (`html2canvas` + `jsPDF`).

**Current Tabs:** Expats | Violators | Risk Register | Population | Borders | Nationality Statistics

---

## Architecture

```
src/pages/customized-pdf.js          ← Next.js page (Pages Router)
src/views/CustomizedPdf/
├── index.js                         ← Main view: tab shell + RBAC + routing
├── translation.json                 ← EN/AR i18n strings for all tabs
├── README.md                        ← This file
└── widgets/
    ├── ExpatsStatistics.js          ← Tab: Expats in the UAE
    ├── ViolatorsStatistics.js       ← Tab: Statistics of Violators
    ├── RiskRegisterStatistics.js    ← Tab: Risk Register
    ├── UaePopulationStatistics.js   ← Tab: UAE Population
    ├── BorderStatistics.js          ← Tab: Borders Statistics
    ├── NationalityStatistics.js     ← Tab: Nationality Statistics
    ├── ExpatsStatisticsEmptyState.js← Empty state (country not selected)
    └── nationalityStatisticsWidgets/
        ├── index.js                 ← Barrel re-exports all sub-widgets
        ├── CountryFlagDisplay.js    ← Center-panel country flag + name
        ├── ResidentBreakdownTree.js ← SVG tree for resident cancellation
        ├── ResidenceIssuanceTable.js← TreeFlow-based residence issuance by emirate
        ├── UpdateMetrics.js         ← Total updates + increase % with arrows
        └── VisaIssuanceTable.js     ← TreeFlow-based visa issuance transactions

src/customPdf/
├── index.js                         ← Barrel exports for all shared components
├── Page.js                          ← Fixed-size PDF canvas (1292×741)
├── Template.js                      ← Multi-column layout with RTL swap
├── colors.js                        ← Shared color/typography tokens
└── widget/
    ├── index.js                     ← Widget barrel exports
    ├── SectionCard.js               ← Base card (icon + title + loading/empty/error)
    ├── CenterPanel.js               ← UAE map container
    ├── DistributionByEmirate.js     ← Emirate map markers (population-style)
    ├── ViolatorsDistributionByEmirate.js  ← Emirate map markers (configurable rows/width)
    ├── DistributionByAgeRange.js    ← Single-series gold bar chart by age
    ├── ViolatorsDistributionByAgeRange.js ← Dual-value grouped bars by age
    ├── PdfBarChart.js               ← Horizontal bar chart widget
    ├── PdfColumnChart.js            ← Column chart widget
    ├── TotalMovements.js            ← Entry/exit movement diagram
    ├── IssuedVisa.js                ← Bar chart with country flag labels
    ├── SummaryOfViolators.js        ← Violator count bars (internally named IssuedVisa)
    ├── Summary.js                   ← Expats summary branches + country flag
    ├── ViolatorsSummary.js          ← Donut/ring chart for violator totals
    ├── ViolatorSummary.js           ← SVG tree summary with slanted branches
    ├── UAEPopulationSummaryViolator.js  ← Population summary tree with branches
    ├── ViolatorsByGender.js         ← Male/female percentage bars
    ├── VerticalGauge.js             ← Percentage gauge overlay
    ├── TreeFlow.js                  ← Pure SVG left-to-right tree diagram
    └── HtmlTreeFlow.js              ← HTML/CSS flexbox tree diagram alternative

src/services/customPdf/
├── borderStatistics.js              ← Border movement APIs
├── expatsStatistics.js              ← Expats APIs
├── nationalityStatistics.js         ← Nationality Statistics APIs (mock-backed)
├── riskRegisterStatistics.js        ← Risk register APIs
├── uaePopulationStatistics.js       ← Population APIs
├── violatorsStatistics.js           ← Violators APIs
└── mocks/
    └── nationalityStatisticsMock.js ← Mock data for nationality statistics
```

---

## Render Pipeline

```
_app.js
 └─ SessionProvider → GlobalProvider → IntlWrapper → ThemeWrapper
     └─ PrivateRoute (auth guard)
         └─ Main Layout (injects emiratesConfigValue, nationalitiesConfigValue, etc.)
             └─ CustomizedPdf (tabs + RBAC per tab)
                 └─ [Active Tab Widget]
                     ├─ Filter Controls (Select/DateRangePicker + Export Button)
                     └─ Page (1292×741 fixed canvas)
                         └─ Template (2 or 3 column layout)
                             └─ [Chart/Summary Widgets]
```

---

## Page Registration Pattern

Every page in this project uses static property attachment:

```javascript
import CustomizedPdf from '@/views/CustomizedPdf';
import Private from '@/routeGuards/PrivateRoute';
import Main from '@/layouts/Main';

const customizedPdf = () => null;

customizedPdf.View = CustomizedPdf;
customizedPdf.RouteGuard = Private;
customizedPdf.Layout = Main;
customizedPdf.Name = "Customized_PDF";  // RBAC page name

export default customizedPdf;
```

`_app.js` reads `.View`, `.RouteGuard`, `.Layout`, and `.Name` to compose the render tree.

---

## RBAC (Role-Based Access Control)

### Two layers:

1. **Page-level:** `Customized_PDF` → Roles: `ADMIN`, `CUSTOMIZED-PDF-DASHBOARD`
2. **Tab-level:** Each tab has its own role check via `getTabVisibility(groups)`

### Tab-level RBAC mapping:

| Tab Key | RBAC `pageName` |
|---------|-----------------|
| `expats` | `Customized_PDF_EXPATS_STATS` |
| `violators` | `Customized_PDF_VIOLATORS_STATS` |
| `risk-register` | `Customized_PDF_RISK_REGISTER_STATS` |
| `population` | `Customized_PDF_POPULATION_STATS` |
| `borders` | `Customized_PDF_BORDER_STATS` |
| `nationality-statistics` | `Customized_PDF_NATIONALITY_STATS` |

### Behavior:

- Tabs the user cannot access are omitted from the tab bar.
- If no tabs are accessible → `<DashboardTabsNoAccess />`.
- Default tab: `resolveDefaultTabKey({ queryType: router.query.type, visibility })` — uses URL `?type=` if permitted, else first available tab.
- If selected tab loses access → `useEffect` falls back and `router.replace({ pathname: '/customized-pdf', query: { type: fallback } })`.

### Adding a new tab's RBAC:

1. Add entry to `nameGroupMapping` in `src/utils/helper.js`:
   ```javascript
   Customized_PDF_YOUR_TAB_STATS: ["ADMIN", "CUSTOMIZED-PDF-YOUR-TAB-STATS"],
   ```

2. Add visibility check in `src/views/CustomizedPdf/index.js`:
   ```javascript
   "your-tab": checkAccess({ groups, pageName: "Customized_PDF_YOUR_TAB_STATS" }),
   ```

---

## Tab Widget Pattern

Every tab widget follows this consistent structure:

```javascript
import { Page, Template, PdfBarChart, colors } from "@/customPdf";
import { usePrint } from "@/components/Print";
import { printDocumentCustomSize } from "@/components/Print/customPdfExport";
import useAsync from "@/hooks/useAsync";
import translation from "../translation.json";

export default function YourTabStatistics({ emiratesConfigValue }) {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";

  // 1. PDF export hook
  const { isCreatingPdf, setIsCreatingPdf } = usePrint({ name: "Your-Tab.pdf" });

  // 2. Async data hooks (one per API)
  const { execute, status, value } = useAsync({ asyncFunction: getYourData });

  // 3. Filter state (country/date)
  const [selectedCountry, setSelectedCountry] = useState(null);

  // 4. API call trigger on filter change
  useEffect(() => { execute({ filter: { ... } }); }, [selectedCountry]);

  // 5. Data transformation via useMemo
  const chartData = useMemo(() => transformResponse(value), [value]);

  // 6. Export handler
  const handleExport = () => {
    printDocumentCustomSize("filename.pdf", setIsCreatingPdf);
  };

  return (
    <>
      {/* Filter bar + Export button */}
      <Row justify="end" align="middle">
        <Col><Select ... /></Col>
        <Col><Button onClick={handleExport}>Export</Button></Col>
      </Row>

      {/* PDF canvas */}
      <Page title={translation[language]["Your Tab Title"]} isCreatingPdf={isCreatingPdf}>
        <Template
          showThreeColumns={true}
          leftColumnWidth="30%"
          rightColumnWidth="35%"
          leftColumn={...}
          middleColumn={...}
          rightColumn={...}
        />
      </Page>
    </>
  );
}
```

---

## Config Prop Flow

```
Main layout (useAsync → getEmiratesConfig)
  └─ React.cloneElement(children, { emiratesConfigValue, ... })
       └─ CustomizedPdf({ emiratesConfigValue })
            ├─ ExpatsStatistics        ← receives emiratesConfigValue
            ├─ ViolatorsStatistics     ← receives emiratesConfigValue
            ├─ UaePopulationStatistics ← receives emiratesConfigValue
            ├─ NationalityStatistics   ← receives emiratesConfigValue
            ├─ RiskRegisterStatistics  ← does NOT receive emiratesConfigValue
            └─ BorderStatistics        ← does NOT receive emiratesConfigValue
```

Tabs that receive `emiratesConfigValue` build an emirate code → name map from `emiratesConfigValue.data` for emirate labels in distribution widgets.

`nationalitiesConfigValue` is **not** passed into `CustomizedPdf`; nationality dropdowns fetch via `getNationalities()` from services.

---

## Data Fetching Pattern

### Service file (`src/services/customPdf/yourTabStatistics.js`):

```javascript
import httpService from "../httpService";

function objectToParamString(_obj = {}) {
  // Converts filter object to URL query params
  // Handles arrays, removes undefined, strips "date_range" key
}

export const getYourData = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/your-endpoint?${params}`,
    isCacheEnabled: "true",
  });
};
```

### useAsync hook interface:

```javascript
const { execute, status, value, error } = useAsync({ asyncFunction: getYourData });

// Status values: "idle" | "pending" | "success" | "error"
// execute() returns a Promise
// value = full response object (access .data for payload)
```

---

## API Endpoints by Tab

### Border Statistics (`borderStatistics.js`)

| Export | Endpoint |
|--------|----------|
| `getBorderPortSummary` | `GET /bi-dashboards/api/v1/border-movements/summary` |
| `getBorderMovementsByBorderType` | `GET /bi-dashboards/api/v1/border-movements/border-type` |
| `getTopPorts` | `GET /bi-dashboards/api/v1/border-movements/ports` |
| `getAirportGateSummary` | `GET /bi-dashboards/api/v1/border-movements/airport_gate_summary` |
| `getSmartCrossingSummary` | `GET /bi-dashboards/api/v1/border-movements/smart_crossing_summary` |

### Expats Statistics (`expatsStatistics.js`)

| Export | Endpoint |
|--------|----------|
| `getNationalities` | `GET /bi-dashboards/api/v1/configs/nationalities` |
| `getTotalExpats` | `GET /bi-dashboards/api/v1/dashboard-1/residents-insights/total-expats` |
| `getIssuedResidenceVisa` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/visa-issues-by-nationality` |
| `getIssuedVisas` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/visa-issues-by-nationality` |
| `getExpatsByGender` | `GET /bi-dashboards/api/v1/dashboard-1/residents-insights/gender/statistics` |
| `getExpatsByEmirate` | `GET /bi-dashboards/api/v1/dashboard-1/residents-insights/expats-statistics` |
| `getExpatsByAgeRange` | `GET /bi-dashboards/api/v1/dashboard-1/residents-insights/age-range/statistics` |
| `getViolatorsSummary` | `GET /bi-dashboards/api/v1/violations-risks/violations/summary` |
| `getViolatorsByGender` | `GET /bi-dashboards/api/v1/violations-risks/violations/gender` |
| `getRiskTypesByRegister` | `GET /bi-dashboards/api/v1/violations-risks/risk/type-registered` |

### Violators Statistics (`violatorsStatistics.js`)

| Export | Endpoint |
|--------|----------|
| `getViolatorsSummary` | `GET /bi-dashboards/api/v1/violations-risks/violations/summary` |
| `getViolatorsByAgeRange` | `GET /bi-dashboards/api/v1/violations-risks/violations/age-group` |
| `getViolatorsByGender` | `GET /bi-dashboards/api/v1/violations-risks/violations/gender` |
| `getViolatorsByEmirates` | `GET /bi-dashboards/api/v1/violations-risks/violations/emirates` |
| `getResidencyViolatorsByYear` | `GET /bi-dashboards/api/v1/violations-risks/violations/year?type=residency` |
| `getVisaViolatorsByYear` | `GET /bi-dashboards/api/v1/violations-risks/violations/year?type=visa` |

### Risk Register Statistics (`riskRegisterStatistics.js`)

| Export | Endpoint |
|--------|----------|
| `getNationalities` | `GET /bi-dashboards/api/v1/configs/nationalities` |
| `getRiskByAgeGroup` | `GET /bi-dashboards/api/v1/violations-risks/risk/age-group` |
| `getRiskByNationality` | `GET /bi-dashboards/api/v1/violations-risks/risk/nationalities?emirate=0&limit=10` |
| `getRiskTypesByRegister` | `GET /bi-dashboards/api/v1/violations-risks/risk/type-registered` |
| `getRiskRegisterByYear` | `GET /bi-dashboards/api/v1/violations-risks/risk/yearly-registered` |

### UAE Population Statistics (`uaePopulationStatistics.js`)

| Export | Endpoint |
|--------|----------|
| `getUAEPopulationStatisticsSummary` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/summary` |
| `getPopulationByGender` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/by_gender` |
| `getPopulationByAgeRange` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/by_age_range` |
| `getTopNationalities` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/nationality` |
| `getDistributionByEmirate` | `GET /bi-dashboards/api/v1/dashboard-3/active-general-residents/statistics-by-emirate` |

### Nationality Statistics (`nationalityStatistics.js`) — Mock-backed

| Export | Status | Planned Endpoint |
|--------|--------|------------------|
| `getNationalities` | Re-export from `expatsStatistics` | — |
| `getNationalityResidentsSummary` | Mock | `/bi-dashboards/api/v1/nationality-stats/residents-summary` |
| `getResidenceIssuanceApplications` | Mock | `/bi-dashboards/api/v1/nationality-stats/residence-issuance` |
| `getVisaIssuanceTransactions` | Mock | `/bi-dashboards/api/v1/nationality-stats/visa-issuance` |
| `getUpdateMetrics` | Mock | `/bi-dashboards/api/v1/nationality-stats/update-metrics` |
| `getStatisticsAsOfToday` | Mock | `/bi-dashboards/api/v1/nationality-stats/statistics-today` |
| `getStatisticsAsOfDate` | Mock | `/bi-dashboards/api/v1/nationality-stats/statistics-date` |
| `getNationalityDistributionByEmirate` | Mock | `/bi-dashboards/api/v1/nationality-stats/distribution-by-emirate` |

Mock data lives in `mocks/nationalityStatisticsMock.js`.

---

## Shared Infrastructure Components

### `Page` — PDF Canvas

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `title` | string | `""` | Centered page title below header |
| `isCreatingPdf` | bool | `false` | Shows white overlay spinner during export |
| `style` | object | `{}` | Additional inline styles |
| `className` | string | `""` | Additional CSS class |
| `children` | node | — | Template/content |

Fixed at 1292×741px. Includes ICP/UAE logos header, timestamp, red "Top Secret" label. Responsive scaling between 1440px–1920px viewport. Logos swap in RTL mode.

### `Template` — Column Layout

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `showThreeColumns` | bool | `false` | Enable 3-column mode |
| `leftColumn` | node | — | Left panel content |
| `middleColumn` | node | — | Center panel content |
| `rightColumn` | node | — | Right panel content |
| `leftColumnWidth` | string | `"25%"` | Left column width |
| `rightColumnWidth` | string | `"33%"` | Right column width |
| `templateGutter` | any | `[12,12]` | Gutter between columns |
| `isRightColumnLeftBorder` | bool | `false` | Disable middle borders |
| `showFooter` | bool | `false` | Renders bordered footer |
| `footerContent` | node | — | Footer slot content |
| `children` | node | — | Used when `showThreeColumns=false` |

Automatically swaps left/right columns and their widths in RTL mode. Middle column width = `100% - left% - right%`.

### `SectionCard` — Base Widget Card

All chart widgets (PdfBarChart, PdfColumnChart, TotalMovements, etc.) wrap SectionCard internally. It handles:
- Loading state (spinner)
- Empty state ("No data")
- Error state
- Icon + title positioning (with `forceLeftPosition` for RTL override)

### `ViolatorsDistributionByEmirate` — Configurable Emirate Map

Used by Expats, Violators, and Nationality Statistics tabs. Supports:

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `items` | array | `[]` | Emirate configs with marker/box coordinates |
| `rows` | array | default 4-row violator layout | Custom row definitions for EmirateCard |
| `customBoxHeight` | number | `82`/`82.2` (EN/AR) | Override card height |
| `customBoxWidth` | number | `140` | Override card width |
| `gridColumns` | string | `'60px 1fr'` | CSS grid template for data rows |
| `height` | number | `380` | Container height |

Row config supports `buildCells(data)` for fully custom cell layouts, `dataField` + `formatType` for auto-extraction, and static `cells` arrays.

---

## i18n / Translations

All display strings live in `src/views/CustomizedPdf/translation.json` with `en` and `ar` keys:

```json
{
  "en": {
    "Your Label": "Your Label",
    ...
  },
  "ar": {
    "Your Label": "التسمية الخاصة بك",
    ...
  }
}
```

Access via: `translation[language]["Your Label"]`

---

## PDF Export Flow

1. User clicks **Export** → `setIsCreatingPdf(true)`
2. White overlay appears on the `Page` component
3. `printDocumentCustomSize(filename, setIsCreatingPdf)` captures `.export-pdf` elements
4. `html2canvas` renders at 1292×741
5. `jsPDF` generates landscape PDF
6. Download triggers → `setIsCreatingPdf(false)`

---

## Key Design Constraints

1. **Fixed canvas size:** All content must fit within 1292×741px. This is NOT a responsive web layout — it's designed for PDF capture.
2. **No Redux/Zustand:** State is local to each widget. Cross-widget communication flows through props from the parent view.
3. **RTL support:** All components check `LocaleContext` and swap left/right positioning automatically.
4. **PropTypes only:** No TypeScript. Use PropTypes for prop validation.
5. **Cached API calls:** All `httpService.get` calls use `isCacheEnabled: "true"`.
6. **Color consistency:** Use `colors` from `@/customPdf/colors.js`. Never hardcode chart colors directly.
7. **Nationality Statistics is mock-backed:** All APIs return mock data from `mocks/nationalityStatisticsMock.js` until real endpoints are deployed.

---

## Checklist for Adding a New Tab

1. [ ] Create service file: `src/services/customPdf/yourTabStatistics.js`
2. [ ] Create widget component: `src/views/CustomizedPdf/widgets/YourTabStatistics.js`
3. [ ] Add RBAC role mapping in `src/utils/helper.js` (`nameGroupMapping`)
4. [ ] Add tab key to `CUSTOMIZED_PDF_TAB_ORDER` array in `src/views/CustomizedPdf/index.js`
5. [ ] Add visibility check to `getTabVisibility()` function
6. [ ] Add tab item to `tabItems` useMemo with icon + label
7. [ ] Add conditional render for the tab widget in the main view
8. [ ] Add all EN/AR translations to `src/views/CustomizedPdf/translation.json`
9. [ ] (Optional) Add new shared widgets to `src/customPdf/widget/` if needed
10. [ ] (Optional) Export new widgets from `src/customPdf/index.js` barrel
11. [ ] Add static assets to `public/customPdf/yourTab/` directory
12. [ ] Verify PDF export works correctly at 1292×741px dimensions

---

## Dependencies Used

| Package | Usage |
|---------|-------|
| `re-usable-design-components` | Row, Col, Button, DateRangePicker, Select, Tabs, Spin, Empty, Text, PhosphorIcons |
| `dayjs` | Date manipulation and formatting |
| `react-intl` | `useIntl` for tab labels |
| `next/router` | URL query param sync |
| `lodash` | `cloneDeep`, `head`, `template` |
| `html2canvas` | Client-side page capture for PDF |
| `jspdf` | PDF generation |
| `prop-types` | Runtime prop validation |
| `country-flag-icons` | Country flag SVGs (Nationality Statistics tab) |
