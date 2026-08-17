import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Text } from "re-usable-design-components";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { colors } from "@/customPdf";
import translation from "../translation.json";

export default function ExpatsStatisticsEmptyState() {
  const [localeStore] = useContext(LocaleContext);
  const language = localeStore?.projectTranslation || "en";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        marginBottom: "16px",
        backgroundColor: colors.colorBgContainer || "#ffffff",
        borderRadius: "8px",
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Image (blurred dashboard) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <img
          alt=""
          src="/customPdf/expatsStatistics/empty_bg.png"
          style={{
            position: "absolute",
            height: "100%",
            left: 0,
            top: "-2.02%",
            width: "100%",
            maxWidth: "none",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Modal Overlay with Backdrop Blur */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "100px",
          backgroundColor: "rgba(0, 0, 0, 0.24)",
          backdropFilter: "blur(17px)",
          WebkitBackdropFilter: "blur(17px)",
          borderRadius: "8px",
          boxSizing: "border-box",
        }}
      >
        {/* Modal Card */}
        <div
          style={{
            width: "343px",
            backgroundColor: colors.colorBgElevated || "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 6px 16px 0px rgba(0,0,0,0.08), 0px 3px 6px -4px rgba(0,0,0,0.12), 0px 9px 28px 8px rgba(0,0,0,0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {/* Content Wrapper */}
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              paddingTop: "12px",
              paddingBottom: "24px",
              paddingLeft: "24px",
              paddingRight: "24px",
              boxSizing: "border-box",
            }}
          >
            {/* Content with Icon and Text */}
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
                minWidth: 0,
                minHeight: 0,
              }}
            >
              {/* Icon Slot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "40px",
                    height: "40px",
                  }}
                >
                  {/* Globe Icon SVG */}
                  <img src="/customPdf/expatsStatistics/globe_hemi.png" alt="Empty Icon" width={"100%"} height={"100%"} />
                </div>
              </div>

              {/* Text Content */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {/* Heading */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'SF Pro Text', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: colors.text || "rgba(0,0,0,0.88)",
                      whiteSpace: "pre",
                    }}
                  >
                    {translation[language]?.["Country Selection Required"] || "Country Selection Required"}
                  </div>
                </div>

                {/* Description */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "'SF Pro Text', sans-serif",
                      fontWeight: 400,
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: colors.text || "rgba(0,0,0,0.88)",
                      whiteSpace: "pre",
                    }}
                  >
                    {translation[language]?.["Please select a country to proceed further."] || "Please select a country to proceed further."}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ExpatsStatisticsEmptyState.propTypes = {};
