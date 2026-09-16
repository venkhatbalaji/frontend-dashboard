import PropTypes from "prop-types"
import { useEffect, useRef, useState } from "react";
import { Card } from "re-usable-design-components";

// Defers mounting heavy below-the-fold widgets (Highcharts maps/charts, tables)
// until they're about to scroll into view, instead of every row on this page
// initializing at once. Scoped to ActiveResidence only.
function LazySection({ children, minHeight }) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isVisible || typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return undefined;
    }

    const node = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries?.[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );

    if (node) {
      observer.observe(node);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={containerRef}>
      {isVisible ? children : <Card loading style={{ height: minHeight }} />}
    </div>
  );
}

LazySection.propTypes = {
  children: PropTypes.node,
  minHeight: PropTypes.string
}

LazySection.defaultProps = {
  minHeight: "480px"
}

export default LazySection;
