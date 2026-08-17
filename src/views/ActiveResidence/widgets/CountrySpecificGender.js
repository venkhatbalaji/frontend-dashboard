import PropTypes from "prop-types"
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Row,
  Col,
  theme,
  Text,
  Empty,
  Skeleton
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import { tooltipConfig } from "@/utils/highchartsConfig";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, formatNumber, resolveTernary } from "@/utils/helper";
import DualBarChart from "@/components/DualBarChart";


const LABEL_WIDTH = 70;
const { useToken } = theme;


const getFormattedData = (isRtl, data = [], nationalitiesConfigValueObj = {}) => {
  const resObj = {
    xAxis: [],
    maleYaxis: [],
    femaleYaxis: [],
  };
  data?.forEach((value) => {
    const countryLabelObj = { country_ar: value?.name_ar, country_en: value?.name_en };
  
    resObj.xAxis.push(
      isRtl ? countryLabelObj?.country_ar : countryLabelObj?.country_en
    );
    resObj.maleYaxis.push(value?.males);
    resObj.femaleYaxis.push(value?.females);
  });
  return resObj;
};

function NationalityByGender({ data: _data, filter = {} }) {
  const intl = useIntl();
  const themeVariables = useToken();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const isAllGender = filter?.gender_code === undefined;
  const isMalelGender = filter?.gender_code == "male";
  const isFemalelGender = filter?.gender_code == "female";

  function getTooltip(item) {
    return (
      <Row style={{ direction: item?.isRtl ? "rtl": "ltr" }}>
        <Col>
          <Row>
            <Col flex="none">
              <Text size="sm" color={themeVariables?.token?.Menu.colorText}>
                {intl?.formatMessage({
                  id: "Name",
                })}
                :
              </Text>
            </Col>
            <Col flex="none">
              <Text
                size="sm"
                strong
                color={themeVariables?.token?.Menu.colorText}
              >
                &nbsp;{item?.name}
              </Text>
            </Col>
          </Row>
        </Col>
        <Col>
          <Row>
            <Col flex="none">
              <Text size="sm" color={themeVariables?.token?.Menu.colorText}>
                {intl?.formatMessage({
                  id: "Value",
                })}
                :
              </Text>
            </Col>
            <Col flex="none">
              <Text
                size="sm"
                strong
                color={themeVariables?.token?.Menu.colorText}
              >
                &nbsp;{item?.value ? formatNumber(item?.value) : "-"}
              </Text>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }

  const data = useMemo(() => {
    if (!_data?.length) {
      return {}
    }
    return getFormattedData(
      isRtl,
      _data || [],
      {},
    );  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_data])
  
  const maleBarProps = {
    categories: resolveTernary(data?.xAxis, data?.xAxis, []),
    width: isAllGender ? `calc(50% + ${LABEL_WIDTH / 2}px)` : "100%",
    values: [
      {
        data: resolveTernary(data?.maleYaxis, data?.maleYaxis, []),
        showInLegend: false,
        color: "var(--custom-gold-1)",
      },
    ],
    yAxis: {
      reversed: !isMalelGender,
      lineWidth: 1,
    },
    xAxis: {
      reversed: true,
      opposite: !isMalelGender,
      labels: {
        align: "center",
        reserveSpace: true,
        useHTML: true,
        style: {
          minWidth: `${LABEL_WIDTH}px`,
          textAlign: "center",
          color: "var(--colorText)",
        },
      },
    },
    tooltip: {
      formatter: getTooltip,
      ...tooltipConfig,
    },
  };

  const femaleBarProps = {
    ...maleBarProps,
    width: resolveTernary(isAllGender, `calc(50% - ${LABEL_WIDTH / 2}px)`, "100%"),
    values: [
      {
        data: resolveTernary(data?.femaleYaxis, data?.femaleYaxis, []),
        showInLegend: false,
        color: "var(--custom-gold-2)",
      },
    ],
    xAxis: {
      visible: !isMalelGender && !isAllGender,
    },
    yAxis: {
      lineWidth: 1,
    },
  };

  const legendMapping = [
    {
      name: intl?.formatMessage({ id: "Male" }),
      color: "var(--custom-gold-1)",
    },
    {
      name: intl?.formatMessage({ id: "Female" }),
      color: "var(--custom-gold-2)",
    },
  ];

  return (
    <>
      {
        resolveTernary(
          data?.xAxis?.length,
          (
            <>
              <DualBarChart
                firstChartData={isRtl ? femaleBarProps : maleBarProps}
                secondChartData={isRtl ? maleBarProps : femaleBarProps}
                getTooltip={getTooltip}
                showfirstSeries={isRtl ? isFemalelGender: isMalelGender}
                showSecondSeries={isRtl ? isMalelGender: isFemalelGender}
                showBoth={isAllGender}
              />
              <Row
                align="middle"
                gutter={themeVariables?.token?.margin}
                style={{ marginTop: themeVariables.token?.marginXS, display: 'flex', justifyContent: "center", direction: isRtl ? "rtl" : "ltr" }}
              >
                {legendMapping?.map((item) => {
                  return (
                    <Col key={item?.name} flex="none">
                      <Row style={{ direction: isRtl ? "rtl" : "ltr" }} isFlex align="middle">
                        <Col
                          isFlex
                          flex="none"
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: item?.color
                          }}
                        />
                        <Col
                          isFlex
                          flex="none"
                          paddingInline={`${themeVariables?.token?.paddingXXS}px 0px`}
                        >
                          <Text size="sm">{item?.name}</Text>
                        </Col>
                      </Row>
                    </Col>
                  );
                })}
              </Row>
            </>
          ),
          (
            <Row isFullHeight>
              <Col alignItems="center" justifyContent="center" isFlex>
                <Empty />
              </Col>
            </Row>
          )
        )}
    </>
  );
}

NationalityByGender.propTypes = {
  filter: PropTypes.any,
  data: PropTypes.any
}

const NationalityByGenderWrap = (props) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 400)
  }, [])

  if (loading) {
    return <Skeleton />
  }
  return <NationalityByGender {...props} />
}

export default NationalityByGenderWrap;