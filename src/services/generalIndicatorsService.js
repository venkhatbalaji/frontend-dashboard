import { services } from "@/utils/constant";
import httpService from "./httpService";

const { bi_dashboards } = services;

function removeKeys(_obj = {}) {
  const obj = _obj || {};
  if (!obj?.period) {
    obj.period = "year";
  }

  return Object.keys(obj).reduce((acc, key) => {
    if (obj[key] !== undefined && obj[key] !== null) {
      if (key === "date_range") {
        acc["start"] = obj[key]?.[0];
        acc["end"] = obj[key]?.[1];
      } else if (key !== "date_val") {
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

export const getResidencyTypes = async () => {
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/configs/general-indicators/residency-type`,
    isCacheEnabled: "true",
  });
};

export const getPopulationGrowth = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/demographics-kpi/population-growth?${params}`,
    isCacheEnabled: "true",
  });
};

export const getRatioStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/demographics-kpi/dependency-ratio?${params}`,
    isCacheEnabled: "true",
  });
};

export const getFertilityRateStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/demographics-kpi/fertility-rate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getMigrationRateStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/demographics-kpi/migration-rate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getAgeDistributionStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/demographics-kpi/population-age-distribution?${params}`,
    isCacheEnabled: "true",
  });
};

export const getEmploymentRateStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/employment-rate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCareerTransferStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/career-transfer?${params}`,
    isCacheEnabled: "true",
  });
};

export const getUnemploymentRateStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/unemployment-rate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getSkilledWorkerStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/skilled-worker?${params}`,
    isCacheEnabled: "true",
  });
};

export const getExpatriateWorkerStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/expatriate-worker?${params}`,
    isCacheEnabled: "true",
  });
};

export const getWomenParticipationStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/women-participation?${params}`,
    isCacheEnabled: "true",
  });
};

export const getEconomicSectorStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/occupational-performance/economic-sector?${params}`,
    isCacheEnabled: "true",
  });
};

export const getLaborTurnoverStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/sectorial-performance/labor-turnover?${params}`,
    isCacheEnabled: "true",
  });
};

export const getExpatriateWorkersStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/sectorial-performance/expatriate-workers?${params}`,
    isCacheEnabled: "true",
  });
};

export const getWomensWorkforceStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/sectorial-performance/womens-workforce?${params}`,
    isCacheEnabled: "true",
  });
};

export const getHighlySkilledWorkersStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/sectorial-performance/highly-skilled-workers?${params}`,
    isCacheEnabled: "true",
  });
};

export const getEmploymentDistributionStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/sectorial-performance/employment-distribution?${params}`,
    isCacheEnabled: "true",
  });
};

export const getNewEmploymentRateStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/sectorial-performance/new-employment-rate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeRateStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/crime-rate?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeExpatriateWorkerStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/expatriate-worker?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeFrequencyStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/crime-frequency?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeTypeStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/crime-type?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeNationalityStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/nationality?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeEconomicSectorStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/economic-sector?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeOccupationsStatistics = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/general-indicators/crime-indicators/occupations?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeTypes = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/configs/general-indicators/crime/crime-type?${params}`,
    isCacheEnabled: "true",
  });
};

export const getCrimeOccupations = async ({ filters }) => {
  const params = objectToParamString(filters);
  return httpService.get({
    url: `/${bi_dashboards}/api/v1/configs/general-indicators/crime/occupations?${params}`,
    isCacheEnabled: "true",
  });
};
