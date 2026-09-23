import { PhosphorIcons } from "re-usable-design-components";

const { ChartLineUp, ChartBar } = PhosphorIcons;


export const HUB_PLATFORM_TABS = [
  { key: "all", labelId: "All Platforms" },
  { key: "icp-suite", labelId: "ICP Suite" },
  { key: "cognos", labelId: "Cognos" },
];

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
    href: "/passenger-forecasting",
    enabled: true,
  },
  {
    key: "cognos",
    platform: "cognos",
    pageNames: ["Cognos_Reporting"],
    nameIntlId: "Cognos Reporting",
    descriptionIntlId: "Cognos Reporting Description",
    icon: ChartBar,
    openType: "external",
    href: null,
    enabled: true,
  },
];
