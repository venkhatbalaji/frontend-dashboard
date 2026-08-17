import React from "react";
import PropTypes from "prop-types";
import { colors } from "../colors";

const PdfDivider = ({ style }) => (
  <div
    style={{
      borderTop: `1px solid ${colors.border}`,
      width: "100%",
      ...style,
    }}
  />
);

PdfDivider.propTypes = {
  style: PropTypes.object,
};

export default PdfDivider;
