import PropTypes from "prop-types"
import { memo, useEffect, useRef } from "react";


function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function MainContentWrap({ children }) {

  return (
    children
  )
}

MainContentWrap.propTypes = {
  children: PropTypes.any
}

const memoWrap = memo(withPreviousProps(MainContentWrap), (prev, next) => {
  return next.isPreviewOpen !== false || next?.previousProps?.isPreviewOpen !== false;
});

function withPreviousProps(WrappedComponent) {
  return function ComponentWithPreviousProps(props) {
    const previousProps = usePrevious(props);

    return <WrappedComponent {...props} previousProps={previousProps} />;
  };
}

export default withPreviousProps(memoWrap);
 

