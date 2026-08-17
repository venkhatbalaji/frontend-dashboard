import { services } from "@/utils/constant";
import httpService from "./httpService";


const { bi_dashboards } = services;

function removeKeys(_obj = {}) {
  const obj = _obj || {};
  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined) {
      if (key === "residents_category") {
        if (obj[key] === "visa_and_residency") {
        } else {
          acc[key] = obj[key];
        }
      } else if (key === "residenceCategory") {
        if (obj[key] === "visa_and_residency") {
        } else {
          acc["residence_category"] = obj[key];
        }
      } else {
        acc[key] = obj[key];
      }
    }
    return acc;
  }, {});
}

function objectToParamString(_obj = {}) {
  const obj = removeKeys(_obj || {}) || {}
  const params = Object.keys(obj).map(key => {
    let value = obj[key];
    // If the value is an array, we need to handle it differently
    if (Array.isArray(value)) {
      return value.map(val => encodeURIComponent(key) + '=' + encodeURIComponent(val)).join('&');
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });

  // Join all parameters with '&'
  return params.join('&');
}

export const getFilters = async () => {
  // return filters;
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/resident/filters`,
    isCacheEnabled: "true",
  });
};


export const getResidentsByGender = async ({ filters }) => {
  // return gender;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/gender/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByResidencyType = async ({ filters }) => {
  // return type;
  const params = objectToParamString(filters);

  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/type/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByAgeRange = async ({ filters }) => {
  // return ageRange;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/age-range/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByEmirates = async ({ filters }) => {
  // return emirates;
  const params = objectToParamString(filters);

  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/emirate/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getEmiratesStatistics = async ({ filters }) => {
  // return nationalities;
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/emirates?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByRegion = async ({ filter }) => {
  // return nationalities;
  const params = objectToParamString(filter);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/nationality/statistics?${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsByProfession = async ({ filters, skip = 0 }) => {
  // return profession;
  const params = objectToParamString(filters);

  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/profession/statistics?skip=${skip}&limit=10&${params}`,
    isCacheEnabled: "true",
  });
};

export const getResidentsBySponser = async ({ filters, skip = 0 }) => {
  // return sponsor;
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/sponsor/statistics?skip=${skip}&limit=10&${params}`,
    isCacheEnabled: "true",
  });
};

export const getViolatorsByGender = async ({ filters }) => {
  // return violators gender;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/violators/gender?${params}`,
    isCacheEnabled: "true",
  });
};

export const getRiskByType = async ({ filters }) => {
  // return risk type;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/risk-type?${params}`,
    isCacheEnabled: "true",
  });
};

export const getViolatorsByType = async ({ filters }) => {
  // return violators by type;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/violators-type?${params}`,
    isCacheEnabled: "true",
  });
};

export const getViolatorsByEmirate = async ({ filters }) => {
  // return violators by emirate;
  const params = objectToParamString(filters);
  
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/dashboard-1/residents-insights/violators/emirate?${params}`,
    isCacheEnabled: "true",
  });
};
