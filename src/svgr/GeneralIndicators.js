import * as React from "react"
import PropTypes from "prop-types"

const SvgComponent = ({ size, color, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 30}
    height={size || 30}
    viewBox="0 0 32 32"
    fill="none"
    style={{
      color: color || 'currentColor',
    }}
    {...props}
  >
    <mask
      id="GeneralIndicatorsA"
      width={28}
      height={28}
      x={1}
      y={1}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <path fill="white" d="M1.249 1.25h26.876v26.877H1.249V1.25Z" />
    </mask>
    <g mask="url(#GeneralIndicatorsA)">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeOpacity={0.85}
        strokeWidth={1.4}
        d="M13.4 13.004 6.82 24.402a1.487 1.487 0 0 0 1.288 2.23h13.16a1.487 1.487 0 0 0 1.288-2.23l-6.58-11.398a1.487 1.487 0 0 0-2.575 0ZM14.687 20.683v-4.46"
      />
      <path
        fill="currentColor"
        fillOpacity={0.85}
        d="M13.944 23.66a.743.743 0 1 1 1.487 0 .743.743 0 0 1-1.487 0Z"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeOpacity={0.85}
        strokeWidth={1.4}
        d="M14.687 2.746V7.75M14.686 2.742c-6.596 0-11.943 5.346-11.943 11.942h5.005a6.938 6.938 0 0 1 13.876 0h5.005c0-6.596-5.347-11.942-11.943-11.942ZM23.132 6.237l-3.54 3.54M6.242 6.237l3.539 3.54"
      />
    </g>
  </svg>
)

SvgComponent.propTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.string,
}

export default SvgComponent
