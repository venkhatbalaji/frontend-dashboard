import React from "react";

export default function FamilyTree({ size = 28, color = "currentColor", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Root node */}
      <circle cx="14" cy="4" r="2.4" />
      {/* Mid-level nodes */}
      <circle cx="6" cy="13" r="2.2" />
      <circle cx="22" cy="13" r="2.2" />
      {/* Leaf nodes */}
      <circle cx="3" cy="22" r="1.8" />
      <circle cx="9" cy="22" r="1.8" />
      <circle cx="19" cy="22" r="1.8" />
      <circle cx="25" cy="22" r="1.8" />
      {/* Root to mid connections */}
      <line x1="14" y1="6.4" x2="6" y2="10.8" />
      <line x1="14" y1="6.4" x2="22" y2="10.8" />
      {/* Mid to leaf connections */}
      <line x1="6" y1="15.2" x2="3" y2="20.2" />
      <line x1="6" y1="15.2" x2="9" y2="20.2" />
      <line x1="22" y1="15.2" x2="19" y2="20.2" />
      <line x1="22" y1="15.2" x2="25" y2="20.2" />
    </svg>
  );
}
