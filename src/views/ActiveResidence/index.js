import PropTypes from "prop-types"
import { Row, Col } from "re-usable-design-components";
import useAsync from "@/hooks/useAsync";
import { getBorderTypeConfig } from "@/services/commonService";
import ActiveResidence from "./ActiveResidence";
import withPageLoadDelay from '@/hocs/withPageLoadDelay';

const PageWithDelayHOCResidence = withPageLoadDelay(ActiveResidence);

function ActiveResidenceWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj, residencyTypeValues }) {
  const {
    value: borderTypeConfigValue,
  } = useAsync({ asyncFunction: getBorderTypeConfig, immediate: true });

  return (
    <Row isFullHeight style={{ position: "relative" }}>
      <Col>
        <PageWithDelayHOCResidence
          nationalitiesConfigValue={nationalitiesConfigValue}
          nationalitiesConfigValueObj={nationalitiesConfigValueObj}
          borderTypeConfigValue={borderTypeConfigValue}
          emiratesConfigValue={emiratesConfigValue}
          residencyTypeValues={residencyTypeValues}
        />
      </Col>
    </Row>
  );
}
export default ActiveResidenceWrap;

ActiveResidenceWrap.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  emiratesConfigValue: PropTypes.any,
  residencyTypeValues: PropTypes.any
}