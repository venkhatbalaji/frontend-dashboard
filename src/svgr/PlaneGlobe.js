import * as React from "react"
import PropTypes from "prop-types"

const SvgComponent = ({ size, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 32}
    height={size || 32}
    viewBox="0 0 32 32"
    fill="none"
    {...props}
  >
    <g
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
      strokeOpacity={0.88}
      strokeWidth={1.4}
      clipPath="url(#plane_globe_a)"
    >
      <path d="M3 17h28c0 7.7-6.3 14-14 14S3 24.7 3 17ZM6.311 3H7.86c.785 0 1.529.353 2.025.961l1.54 1.885h12.845c.408 0 .803.143 1.116.404l1.848 1.54a1.266 1.266 0 0 1-.81 2.239H9.1L6.31 7.705V3Z" />
      <path d="m14.676 10.03-6.041 3.717h4.873c.464 0 .924-.093 1.352-.273l8.181-3.445h-8.365ZM17 17.262v3.05l1.566 2.349c.191.286.293.622.293.966v1.796l1.146 1.91c.162.27.248.58.248.897v2.347M6.969 26.625l2.13-2.131v-1.856c0-.583.292-1.127.777-1.45l2.012-1.342v-2.584M29.245 23.58h-1.303a1.743 1.743 0 0 1-1.62-1.099l-.492-1.24-1.597-.533a1.743 1.743 0 0 1-1.192-1.653V17.12" />
    </g>
    <defs>
      <clipPath id="plane_globe_a">
        <path fill="#fff" d="M0 0h32v32H0z" />
      </clipPath>
    </defs>
  </svg>
)

SvgComponent.propTypes = {
  size: PropTypes.string
}

export default SvgComponent
