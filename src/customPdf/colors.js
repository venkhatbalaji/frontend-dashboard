// Common colors for customPdf components
export const colors = {
  // Primary colors
  primary: '#B68A35',
  primaryHover: '#40a9ff',
  primaryActive: '#096dd9',
  
  // Background colors
  bgContainer: '#ffffff',
  bgLayout: '#f5f5f5',
  bgElevated: '#ffffff',

  // Chip colors
  chipPrimary: "#fde9d8",
  chipSecondary: "#e7bb63",
  chipBorder: "#bfbfbf",

  // Text colors
  text: '#262626',
  textSecondary: '#595959',
  textDescription: '#8c8c8c',
  textDisabled: '#bfbfbf',
  textBlack: '#000000',
  // Border colors
  border: '#d9d9d9',
  borderSecondary: '#f0f0f0',
  borderSplit: '#f0f0f0',
  
  // Chart colors
  track: '#f5f5f5',
  muted: '#8c8c8c',

  male: "#b38105",
  female: "#7f7f7f",
  progressIndicator: "#b31212ff",
  // Semantic colors
  positive: '#52c41a',
  negative: '#ff4d4f',
  neutral: '#8c8c8c',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.45)',
  mask: 'rgba(0, 0, 0, 0.65)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowSecondary: 'rgba(0, 0, 0, 0.12)',
  shadowTertiary: 'rgba(0, 0, 0, 0.16)',
  
  // TotalMovements gradient colors
  totalMovementsGradientLight: '#D9AA54', // Lighter, warmer golden-brown
  totalMovementsGradientDark: '#D9AA54', // Darker, richer golden-brown
  totalMovementsBorder: '#666',
  totalMovementsCircleStroke: '#d3d3d3', // Color for circle stroke
  lineSegmentColor: '#808080', // Color for line segments/arrows
  
  // Tooltip colors
  tooltipBg: 'rgba(0, 0, 0, 0.88)', // Tooltip background color
  tooltipText: '#ffffff', // Tooltip text color (light text on dark background)
  
  // Chart colors
  chartLabelColor: '#ffaa00f5', // Color for x-axis labels and Entry/Exit labels
  chartEntryGradientLight: '#AC7E27', // Entry column gradient light color (dark brown)
  chartEntryGradientDark: '#AC7E27', // Entry column gradient dark color (darker brown)
  chartExitGradientLight: '#D9AA54', // Exit column gradient light color (light brown)
  chartExitGradientDark: '#D9AA54', // Exit column gradient dark color (golden brown)
  chartAxisLineColor: 'rgba(0,0,0,0.3)', // Y-axis line color
  chartGridLineColor: 'rgba(0,0,0,0.06)', // Grid line color
  chartAxisLineWidth: 1, // Axis line width
  
  // Bar chart gradient colors
  barChartGradientLight: 'rgba(240, 161, 13, 0.57)', // Bar chart gradient light color
  barChartGradientDark: 'rgba(194, 137, 23, 0.98)', // Bar chart gradient dark color
  
  // TotalMovements branch colors
  totalMovementsEntryColor: '#f0a10d', // Entry branch color
  totalMovementsExitColor: '#c28917', // Exit branch color
  
  // UAE Population Summary branch colors
  visaHoldersColor: '#ded9c3', // Light beige/tan for Visa Holders
  residentsColor: '#FFD4A3', // Light orange/peach for Residents
  gccColor: '#E6D5F7', // Light purple/lavender for GCC
  uaeNationalsColor: '#CCE5FF', // Light blue for UAE Nationals
  
  // Plot line color
  plotLineColor: '#000000', // Plot line color (black)
  
  // Chart typography
  chartDataLabelFontSize: '10px', // Data label font size
  chartAxisLabelFontSize: '10px', // Axis label font size
  chartAxisLabelColor: '#262626', // Axis label text color
  chartTooltipFontSize: '12px', // Tooltip font size
  chartTooltipLineHeight: '20px', // Tooltip line height
  
  // Chart spacing and sizing
  chartDataLabelOffsetY: -5, // Data label vertical offset
  chartBorderRadius: 4, // Chart border radius
  chartTooltipBorderRadius: 6, // Tooltip border radius
  chartAxisOffset: 10, // Space between axis line and columns
  
  // Nationality Statistics colors
  nationalityBranchColor: '#806026',
  nationalityBranchBgLight: '#8060261A',
  nationalityBranchBgMedium: '#8060264D',
  nationalityBadgeFill: '#e0e0e0',
  nationalityBadgeStroke: '#999999',
  nationalityBadgeText: '#333333',
  nationalityProhibitionRed: '#c0392b',
  nationalityOtherResidentsBg: '#e8e8e8',
  nationalityGoldenVisaBg: '#c9b06b',
  nationalityOutsideCountryBg: '#d6d0c4',
  nationalityInsideCountryBg: '#c8c8c8',
  nationalitySubBorderBlue: '#99C2E6',
  nationalitySubBgPink: '#FFE0E0',
  nationalitySubBorderPink: '#E6A0A0',
  nationalityIconFill: '#e8d5c0',
  nationalityIconText: '#6b5a4a',
  nationalityOtherVisasBranch: '#FDEADA',
  nationalityGoldenVisaBranch: '#E7BB62',
  // Golden Visa "shine" callout (Summary widget)
  goldShineLight: '#FFE9A8',
  goldShineMid: '#F0C05A',
  goldShineDeep: '#B8860B',
  goldShineGlow: 'rgba(240, 192, 90, 0.55)',

  // Typography - common font settings
  fontFamily: 'sf-pro-text',
  fontSizeXxs: '8px',
  fontSizeXs: '9px',
  fontSizeSvgIcon: '10',
  fontSizeSmall: '12',
  fontSizeMedium: '14',
  fontSizeLarge: '26',
  fontWeightNormal: 'normal',
  fontWeightBold: 'bold'
};

// Color aliases for backward compatibility
export const {
  primary,
  bgContainer,
  bgLayout,
  text,
  textDescription,
  border,
  gold,
  track,
  muted
} = colors;

export default colors;
