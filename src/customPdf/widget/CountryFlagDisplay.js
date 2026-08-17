import React from "react";
import PropTypes from "prop-types";
import Flags from "country-flag-icons/react/1x1";
import { Row, Col, Text } from "re-usable-design-components";

export default function CountryFlagDisplay({
  countryCode,
  countryName,
  language = "en",
}) {
  const FlagComponent =
    countryCode && Flags?.[countryCode] ? Flags[countryCode] : null;

  return (
    <Row
      justify="center"
      align="middle"
      style={{ padding: "16px", height: "100%" }}
    >
      <Col
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {FlagComponent && (
          <Row
            justify="center"
            align="middle"
            style={{
              width: "100px",
              height: "80px",
              marginBottom: "12px"
            }}
          >
            <Col>
              <FlagComponent
                style={{ width: "90px", height: "60px", objectFit: "cover" }}
              />
            </Col>
          </Row>
        )}

        {countryName && (
          <Row justify="center">
            <Col isFlex flex={'none'}>
              <Text
                size={'sm'}
                strong
              >
                {countryName}
              </Text>
            </Col>
          </Row>
        )}
      </Col>
    </Row>
  );
}

CountryFlagDisplay.propTypes = {
  countryCode: PropTypes.string,
  countryName: PropTypes.string,
  language: PropTypes.string,
};
