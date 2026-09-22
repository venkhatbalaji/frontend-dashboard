import { PhosphorIcons } from "re-usable-design-components";

const { ChartLineUp, ChartBar } = PhosphorIcons;

// "all" is always shown when there is at least one visible dashboard; every
// other tab only appears once at least one of its dashboards is enabled and
// accessible (see src/views/Hub/index.js).
export const HUB_PLATFORM_TABS = [
  { key: "all", labelId: "All Platforms" },
  { key: "icp-suite", labelId: "ICP Suite" },
  { key: "cognos", labelId: "Cognos" },
];

// This app IS one dashboard suite (it has its own internal Sidemenu/pages),
// not nine separate hub tiles — so it's exactly one entry here, gated on
// whether the user has access to at least one of its internal pages. Cognos
// is a second, upcoming suite: a fully separate application, so its own
// entry, disabled until it's actually wired up.
//
// pageNames reuses the existing nameGroupMapping keys in src/utils/helper.js
// — checkAccess is called once per name and the dashboard is visible if ANY
// of them pass, matching how Main already decides "does this user belong
// anywhere in this app" (src/layouts/Main/index.js's fallback redirect logic
// walks the same set of page names).
//
// enabled:false hides a card outright regardless of permission. For a
// not-yet-stable integration (e.g. Cognos), wire `enabled` to a
// publicRuntimeConfig env var instead of a literal boolean — same pattern as
// SHOW_EMIRATES_RISKS_DASHBOARD in next.config.js — so it can be killed per
// environment without a code deploy.
export const HUB_DASHBOARDS = [
  {
    key: "icp-dashboards",
    platform: "icp-suite",
    pageNames: [
      "Passenger_Forecasting",
      "Name_Prediction",
      "Active_Residence",
      "Active_General",
      "Border_Movements",
      "Border_Violations",
      "General_Indicators",
      "Customized_PDF",
      "Family_Tree",
    ],
    nameIntlId: "ICP Dashboards",
    descriptionIntlId: "ICP Dashboards Description",
    icon: ChartLineUp,
    openType: "internal",
    // Lands on the app's current default page. If the user doesn't have
    // access to that specific page, Main's own fallback (src/layouts/Main/
    // index.js) already redirects them to the first page they do have
    // access to — the hub doesn't need to duplicate that logic.
    href: "/passenger-forecasting",
    enabled: true,
  },
  {
    key: "cognos",
    platform: "cognos",
    // Placeholder — not a real nameGroupMapping key yet. Add the real group
    // name(s) here once confirmed, and flip `enabled` once Cognos is
    // federated against Keycloak and has a real URL. enabled:false is
    // checked before checkAccess, so this unresolved name is never
    // evaluated in the meantime.
    pageNames: ["Cognos_Reporting"],
    nameIntlId: "Cognos Reporting",
    descriptionIntlId: "Cognos Reporting Description",
    icon: ChartBar,
    openType: "external",
    href: null,
    enabled: true,
  },
];
