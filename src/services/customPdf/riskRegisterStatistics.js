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
 * Get risk by age group
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'AGO')
 * @returns {Promise} API response
 */
export const getRiskByAgeGroup = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/age-group?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get risk by nationality
 * @param {Object} data - Filter object containing emirate and limit
 * @param {number} data.emirate - Emirate code (e.g., 0 for all)
 * @param {number} data.limit - Number of results to return (e.g., 10)
 * @returns {Promise} API response
 */
export const getRiskByNationality = async () => {
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/nationalities?emirate=0&limit=10`,
    isCacheEnabled: "true",
  });
};

/**
 * Get risk types by register
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'AGO')
 * @returns {Promise} API response
 */
export const getRiskTypesByRegister = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/type-registered?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Get risk register by year
 * @param {Object} data - Filter object containing nationality
 * @param {string} data.nationality - Nationality code (e.g., 'AGO')
 * @returns {Promise} API response
 */
export const getRiskRegisterByYear = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/violations-risks/risk/yearly-registered?${params}`,
    isCacheEnabled: "true",
  });
};

