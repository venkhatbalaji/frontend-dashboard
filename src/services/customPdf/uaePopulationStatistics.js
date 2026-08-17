import httpService from "../httpService";

function removeKeys(_obj = {}) {
  const obj = { ..._obj };
  
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && key !== "date_range") {
      // Handle date_range if it exists
      if (key === "date_range" && Array.isArray(obj[key])) {
        acc["start_date"] = obj[key]?.[0];
        acc["end_date"] = obj[key]?.[1];
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
    const value = obj?.[key];
    // If the value is an array, we need to handle it differently
    if (Array.isArray(value)) {
      return value?.map(val => encodeURIComponent(key) + '=' + encodeURIComponent(val))?.join('&') || '';
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(value || '');
  });

  // Join all parameters with '&'
  return params?.join('&') || '';
}

/**
 * Get UAE population statistics summary
 * @param {Object} data - Filter object containing start_date and end_date
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const getUAEPopulationStatisticsSummary = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/summary?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get population by gender statistics
 * @param {Object} data - Filter object containing start_date and end_date
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const getPopulationByGender = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/by_gender?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get population by age range statistics
 * @param {Object} data - Filter object containing start_date and end_date
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const getPopulationByAgeRange = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/by_age_range?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get top nationalities in the country
 * @param {Object} data - Filter object containing start_date, end_date, emirate_code, and limit
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @param {number} data.emirate_code - Emirate code (e.g., 0 for all)
 * @param {number} data.limit - Number of top nationalities to return (e.g., 5)
 * @returns {Promise} API response
 */
export const getTopNationalities = async () => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/nationality?emirate_code=0&limit=5`,
    isCacheEnabled: "true",
  });
};

/**
 * Get distribution by emirate statistics
 * @param {Object} data - Filter object containing start_date and end_date
 * @param {string} data.start_date - Start date in YYYY-MM-DD format
 * @param {string} data.end_date - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const getDistributionByEmirate = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/statistics-by-emirate?${params}`,
    isCacheEnabled: "true",
  });
};

