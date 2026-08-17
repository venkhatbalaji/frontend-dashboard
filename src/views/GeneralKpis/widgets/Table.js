import PropTypes from "prop-types"
import { Row, Col, PhosphorIcons, Tooltip, Table } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useContext } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";

const {
  Info
} = PhosphorIcons;


function TableWrap({ columns, tableId, tooltipKey, appliedSearchText, title, data: _data, icon, isLoading, isEmpty, isPreviewOpen, ...rest }) {
  const getResponsive = useResponsive();
  const data = _data || [];
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)

  return (
    <DashboardCard
      titleEle={
        <Row style={{ minHeight: "44px" }} wrap={false} align="middle" gutter={36}>
          <Col flex="auto">
            <Row wrap={false} align="middle" gutter={8}>
              {
                getResponsive({ default: "true", mobile: "false" }) === "true" &&
                <Col flex="none">
                  {icon}
                </Col>
              }
              <Col flex="auto">
                <Row style={{ maxWidth: "fit-content", position: "relative" }} wrap={false} align="start" gutter={4}>
                  <Col
                    flex="1 1 none"
                    className="test"
                    style={{
                      whiteSpace: "normal"
                    }}
                  >
                    {title}
                  </Col>
                  <Col
                    flex="none"
                    style={{
                      position: "absolute",
                      ...isRtl
                        ? { left: "-20px" }
                        : { right: "-20px" }
                    }}>
                    <Tooltip
                      title={tooltipKey}
                    >
                      <span>
                        <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
                      </span>
                    </Tooltip>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      }
      icon={icon}
      cardBodyHeight={getResponsive({ default: "440px", desktop: "412px" })}
      loading={isLoading}
      bodyBackgroundColor="transparent"
      bodyWrapStyle={{
        padding: "1px 0px 0px 0px",
      }}
      cardBodyPadding={isLoading ? "16px": "0px"}
      isEmpty={isEmpty}
      {
        ...isPreviewOpen && ({
          cardBodyHeight: "625px"
        })
      }
    >
      <Row isFullHeight>
        <Col>
          <Row
            isFullHeight
            gutter={[12, 12]}
            wrap={getResponsive({ default: false, mobile: true })}
          >
            <Col>
              <Table
                {
                  ...tableId && {
                    id: tableId
                  }
                }
                key={`${JSON?.stringify(appliedSearchText)}`}
                borderRadiusOnSides={getResponsive({ default: data?.length > 4 ? "all" : "top", midTablet: data?.length > 4 ? "all" : "top", mobile: data?.length > 4 ? "all" : "top" })}
                columns={columns}
                {
                  ...(data?.length > getResponsive({ default: 7, tablet: 7, midTablet: 7, mobile: 7 })
                    ? {
                      scroll: {
                        y: isPreviewOpen ? getResponsive({ default: 575, desktop: 575 }) : getResponsive({ default: 380, desktop: 360 }),
                        x: getResponsive({ default: null, mobile: 400 }),
                      },
                    }
                    : {})
                }
                pagination={false}
                dataSource={data}
                {...rest}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </DashboardCard>
  )
}

TableWrap.propTypes = {
  rest: PropTypes.any,
  tableId: PropTypes.any,
  columns: PropTypes.any,
  tooltipKey: PropTypes.any,
  appliedSearchText: PropTypes.any,
  title: PropTypes.any,
  data: PropTypes.any,
  icon: PropTypes.any,
  isLoading: PropTypes.any,
  isEmpty: PropTypes.any,
  isPreviewOpen: PropTypes.any,
};

TableWrap.defaultProps = {
  columns: [],
  tooltipKey: '',
  appliedSearchText: '',
  title: '',
  data: [],
  icon: null,
  isLoading: false,
  isEmpty: false,
  isPreviewOpen: false,
};

export default TableWrap;