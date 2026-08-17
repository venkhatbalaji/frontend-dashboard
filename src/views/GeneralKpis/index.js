import PropTypes from "prop-types"
import {
  Row,
  Col,
  PhosphorIcons,
  AntIcons
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs"
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";
import { useRouter } from "next/router";
import DemographicKpis from "./DemographicKpis";
import CrimeRelatedIndicators from "./CrimeRateIndicators";
import SectoralPerformance from "./SectoralPerformance";
import OccupationalPerformance from "./OccupationalPerformance";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useState, useContext } from "react";
import { checkRtl, resolveTernary } from "@/utils/helper";
import { getResidencyTypes } from "@/services/generalIndicatorsService";
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const DemographicKpisWithPageDelay = withPageLoadDelay(DemographicKpis);
const CrimeRelatedIndicatorsWithPageDelay = withPageLoadDelay(CrimeRelatedIndicators);
const SectoralPerformanceWithPageDelay = withPageLoadDelay(SectoralPerformance);
const OccupationalPerformanceWithPageDelay = withPageLoadDelay(OccupationalPerformance);


const { Gavel, Suitcase, ChartPie } = PhosphorIcons;
const { ProjectOutlined } = AntIcons;

function DemographicKpisWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
  const intl = useIntl()
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(router?.query?.type || "demographic-kpis");
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const {
    value: residencyTypeValues,
  } = useAsync({ asyncFunction: getResidencyTypes, immediate: true });

  const getResponsive = useResponsive();
  
  return (
    <Row
      isFullHeight
      style={{
        position: "relative"
      }}
    >
      <Col
        style={{
          position: "absolute",
          left: getResponsive({ default: "-24px", midTablet: "-16px" }),
          right: getResponsive({ default: "-24px", midTablet: "-16px" }),
          top: getResponsive({ default: "-24px", midTablet: "-16px" }),
          paddingInline: "24px",
          backgroundColor: "var(--colorPrimaryBg)",
          minWidth: getResponsive({ default: "calc(100% + 48px)", midTablet: "calc(100% + 32px)" }),
          borderBottom: "1px solid var(--colorPrimaryBase)"
        }}
      >
        <Tabs
          type="line"
          tabBarGutter={isRtl ? 0: 32}
          bodyPaddingTop="none"
          activeKey={selectedTab}
          onChange={(v) => {
            setSelectedTab(v);
            router?.replace({
              pathname: '/general-indicators',
              query: {
                type: v
              }
            })
          }}
          items={[
            {
              key: "demographic-kpis",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <ProjectOutlined style={{ fontSize: "16px" }} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Demographic KPIs" })}
                  </Col>
                </Row>
              )
            },
            {
              key: "occupational-performance",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <Suitcase size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Occupational Performance" })}
                  </Col>
                </Row>
              )
            },
            {
              key: "sectoral-performance",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <ChartPie size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Sectoral Performance" })}
                  </Col>
                </Row>
              )
            },
            {
              key: "crime-related-indicators",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <Gavel size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Crime Related Indicators" })}
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Col>
      <Col
        style={{
          marginTop: "48px"
        }}
      >
        {
          resolveTernary(
            selectedTab === "demographic-kpis",
            (
              <DemographicKpisWithPageDelay
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                emiratesConfigValue={emiratesConfigValue}
                residencyTypeValues={residencyTypeValues || {}}
              />
            ),
            resolveTernary(
              selectedTab === "occupational-performance",
              (
                <OccupationalPerformanceWithPageDelay
                  nationalitiesConfigValue={nationalitiesConfigValue}
                  nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                  emiratesConfigValue={emiratesConfigValue}
                  residencyTypeValues={residencyTypeValues}
                />
              ),
              resolveTernary(
                selectedTab === "sectoral-performance",
                (
                  <SectoralPerformanceWithPageDelay
                    nationalitiesConfigValue={nationalitiesConfigValue}
                    nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                    emiratesConfigValue={emiratesConfigValue}
                    residencyTypeValues={residencyTypeValues}
                  />
                ),
                (
                  <CrimeRelatedIndicatorsWithPageDelay
                    nationalitiesConfigValue={nationalitiesConfigValue}
                    nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                    emiratesConfigValue={emiratesConfigValue}
                    residencyTypeValues={residencyTypeValues}
                  />
                )
              )
            )
          )
        }
      </Col>
    </Row>
  );
}
export default DemographicKpisWrap;

DemographicKpisWrap.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  emiratesConfigValue: PropTypes.any,
}