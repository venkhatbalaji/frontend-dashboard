import httpService from "../httpService";

function removeKeys(_obj = {}) {
  const obj = { ..._obj };
  
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && key !== "date_range") {
      // Handle date_range if it exists
      if (key === "date_range" && Array.isArray(obj[key])) {
        acc["start_date"] = obj[key][0];
        acc["end_date"] = obj[key][1];
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
}

function objectToParamString(_obj = {}) {
  const obj = removeKeys(_obj || {}) || {};
  const params = Object.keys(obj).map(key => {
    const value = obj[key];
    // If the value is an array, we need to handle it differently
    if (Array.isArray(value)) {
      return value.map(val => encodeURIComponent(key) + '=' + encodeURIComponent(val)).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });

  // Join all parameters with '&'
  return params.join('&');
}

/**
 * Get border port summary statistics
 * @param {Object} data - Filter object containing start_date and end_date
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const getBorderPortSummary = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/summary?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get border movements by border and movement type
 * @param {Object} data - Filter object containing start_date and end_date
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const getBorderMovementsByBorderType = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/border-type?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get top ports by border movements
 * @param {Object} data - Filter object containing start_date, end_date, port_type, and limit
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @param {string} data.port_type - Port type (e.g., 'LAND', 'AIR', 'SEA')
 * @param {number} data.limit - Number of top ports to return (e.g., 5)
 * @returns {Promise} API response
 */
export const getTopPorts = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/ports?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get e-gate and staffed gate movement summary
 * @param {Object} data - Filter object containing start_date, end_date, and limit
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @param {number} data.limit - Number of results to return (e.g., 3)
 * @returns {Promise} API response
 */
export const getAirportGateSummary = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/airport_gate_summary?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get smart crossing movement summary
 * @param {Object} data - Filter object containing start_date, end_date, and limit
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @param {number} data.limit - Number of results to return (e.g., 3)
 * @returns {Promise} API response
 */
export const getSmartCrossingSummary = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/border-movements/smart_crossing_summary?${params}`,
    isCacheEnabled: "true",
  });
};

