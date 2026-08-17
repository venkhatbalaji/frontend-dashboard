/**
 * Service layer for Nationality Statistics tab.
 */

import httpService from "../httpService";

// Re-export getNationalities from expatsStatistics (shared endpoint)
export { getNationalities } from "./expatsStatistics";

function objectToParamString(_obj = {}) {
  const obj = Object.keys(_obj).reduce((acc, key) => {
    if (_obj[key] !== undefined) {
      acc[key] = _obj[key];
    }
    return acc;
  }, {});
  return Object.keys(obj)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key] || ""))
    .join("&");
}

/**
 * Cancellation movements for a nationality.
 * Powers both ResidentBreakdownTree and SecurityCancellationMovements.
 * GET /bi-dashboards/api/v1/nationality-residents/cancellations?nationality_code=XXX
 */
export const getNationalityCancellations = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/nationality-residents/cancellations?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Snapshot comparison: powers variance metrics, current snapshot, and reference snapshot.
 * GET /bi-dashboards/api/v1/nationality-residents/snapshot?nationality_code=XXX&snapshot_date=YYYY-MM-DD&reference_date=YYYY-MM-DD
 */
export const getNationalitySnapshot = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/nationality-residents/snapshot?${params}`,
    isCacheEnabled: "true",
  });
};

/**
 * Distribution of residents by emirate.
 * GET /bi-dashboards/api/v1/nationality-residents/distribution-by-emirate?nationality_code=XXX&snapshot_date=YYYY-MM-DD
 */
export const getNationalityDistributionByEmirate = async (data) => {
  const params = objectToParamString(data?.filter || data);
  return httpService.get({
    url: `/bi-dashboards/api/v1/nationality-residents/distribution-by-emirate?${params}`,
    isCacheEnabled: "true",
  });
};
