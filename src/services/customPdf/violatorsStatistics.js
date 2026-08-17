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
 * Get summary of violators
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'ANG')
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
 * Get violators by age range
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getViolatorsByAgeRange = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/age-group?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get violators by gender
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'ANG')
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
 * Get violators by emirates
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'IND')
 * @returns {Promise} API response
 */
export const getViolatorsByEmirates = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/emirates?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get residency violators by year
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'ANG')
 * @returns {Promise} API response
 */
export const getResidencyViolatorsByYear = async (data) => {
  const filter = { ...(data?.filter || data), type: 'residency' };
  const params = objectToParamString(filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/year?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get visa violators by year
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'ANG')
 * @returns {Promise} API response
 */
export const getVisaViolatorsByYear = async (data) => {
  const filter = { ...(data?.filter || data), type: 'visa' };
  const params = objectToParamString(filter);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/violations/year?${params}`,
    isCacheEnabled: "true",
  });
};

