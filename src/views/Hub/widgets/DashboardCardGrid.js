import PropTypes from "prop-types"
import { Row, Col } from "re-usable-design-components";
import DashboardTile from "./DashboardTile";

export default function DashboardCardGrid({ dashboards = [] }) {
  return (
    <Row gutter={[24, 24]}>
      {dashboards?.map((dashboard) => (
        <Col key={dashboard.key} xs={24} sm={12} lg={8}>
          <DashboardTile dashboard={dashboard} />
        </Col>
      ))}
    </Row>
  );
}

DashboardCardGrid.propTypes = {
  dashboards: PropTypes.array,
}
