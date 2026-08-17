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
 * Get nationalities list
 * @returns {Promise} API response
 */
export const getNationalities = async () => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/configs/nationalities`,
    isCacheEnabled: "true",
  });
};

/**
 * Get total expats summary
 * @param {Object} data - Filter object containing nationality_code
 * @param {string} data.nationality_code - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getTotalExpats = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/residents-insights/total-expats?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get issued residence visa by nationality
 * @param {Object} data - Filter object containing nationality and type
 * @param {string} data.nationality - Nationality code (e.g., 'IND')
 * @param {string} data.type - Type (e.g., 'visa')
 * @returns {Promise} API response
 */
export const getIssuedResidenceVisa = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/visa-issues-by-nationality?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get issued visas by nationality
 * @param {Object} data - Filter object containing nationality and type
 * @param {string} data.nationality - Nationality code (e.g., 'IND')
 * @param {string} data.type - Type (e.g., 'visa')
 * @returns {Promise} API response
 */
export const getIssuedVisas = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-3/active-general-residents/visa-issues-by-nationality?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get expats categorized by gender
 * @param {Object} data - Filter object containing nationality_code
 * @param {string} data.nationality_code - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getExpatsByGender = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/residents-insights/gender/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get expats distribution by emirate
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getExpatsByEmirate = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/residents-insights/expats-statistics?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get expats distribution by age range
 * @param {Object} data - Filter object containing nationality_code
 * @param {string} data.nationality_code - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getExpatsByAgeRange = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/dashboard-1/residents-insights/age-range/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get summary of violators
 * @param {Object} data - Filter object containing nationality and language
 * @param {string} data.nationality - Nationality code (e.g., 'ANG')
 * @param {string} data.language - Language (e.g., 'en')
 * @returns {Promise} API response
 */
export const getViolatorsSummary = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/summary?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get violators by gender
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getViolatorsByGender = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/gender?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get risk types by register
 * @param {Object} data - Filter object containing start_date, end_date, and nationality
 * @param {string} data.start_date - Start date (e.g., '2024-11-11')
 * @param {string} data.end_date - End date (e.g., '2025-11-11')
 * @param {string} data.nationality - Nationality code (e.g., 'BGD')
 * @returns {Promise} API response
 */
export const getRiskTypesByRegister = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/type-registered?${params}`,
    isCacheEnabled: "true",
  });
};

