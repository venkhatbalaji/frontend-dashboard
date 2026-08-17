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


export const getSummaryStatisticsPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  // For now, return mock data - replace with actual API call later
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total_population: 12500,
          total_violators: 4500,
          visa_violators: 28000,
          residency_violators: 17000,
          active_residents: 850000,
          visa_holders: 4000000
        }
      });
    }, 1000);
  });
  
  // Uncomment when API is ready:
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/summary/statistics?${params}`,
  //   isCacheEnabled: "true",
  // });
};


export const getViolatorsByGenderPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  // Mock data based on ActiveResidence structure
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          summary: {
            males: 28500,
            females: 16500,
            total: 45000
          },
          percentage: {
            males: 65,
            females: 35
          }
        }
      });
    }, 1000);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/violators/gender?${params}`,
  //   isCacheEnabled: "true",
  // });
};


export const getRiskRegisterDataPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          overall_risk: 38,
          categories: [
            { key: "High Risk", percent: 25, value: 11250 },
            { key: "Medium Risk", percent: 45, value: 20250 },
            { key: "Low Risk", percent: 30, value: 13500 },
            { key: "Very Low Risk", percent: 10, value: 4500 },
            { key: "Fire", percent: 10, value: 400 },

          ]
        }
      });
    }, 1000);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/risk-register?${params}`,
  //   isCacheEnabled: "true",
  // });
};


export const getDistributionByEmiratePdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: "856,420",
          items: [
            {
              id: 'abu-dhabi',
              name: 'Abu Dhabi',
              data: { expats: '190,500', percentage: '22.3%', residence: '45', visa: '125' },
            },
            {
              id: 'dubai',
              name: 'Dubai',
              data: { expats: '483,000', percentage: '56.4%', residence: '290', visa: '87' },
            },
            {
              id: 'sharjah',
              name: 'Sharjah',
              data: { expats: '100,200', percentage: '11.7%', residence: '65', visa: '234' },
            },
            {
              id: 'ajman',
              name: 'Ajman',
              data: { expats: '31,700', percentage: '3.7%', residence: '23', visa: '156' },
            },
            {
              id: 'umm-al-quwain',
              name: 'Umm Al Quwain',
              data: { expats: '7,700', percentage: '0.9%', residence: '12', visa: '45' },
            },
            {
              id: 'ras-al-khaimah',
              name: 'Ras Al Khaima',
              data: { expats: '25,700', percentage: '3%', residence: '18', visa: '67' },
            },
            {
              id: 'fujairah',
              name: 'Fujairah',
              data: { expats: '17,620', percentage: '2%', residence: '15', visa: '34' },
            },
          ],
        }
      });
    }, 1050);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/distribution/emirate?${params}`,
  //   isCacheEnabled: "true",
  // });
};

export const getDistributionByAgeRangePdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          age_ranges: [
            { range: "18-25", count: 1875000, percentage: 15.0 },
            { range: "26-35", count: 4375000, percentage: 35.0 },
            { range: "36-45", count: 3750000, percentage: 30.0 },
            { range: "46-55", count: 1875000, percentage: 15.0 },
            { range: "56-65", count: 625000, percentage: 5.0 }
          ],
          total: 12500000
        }
      });
    }, 1080);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/distribution/age-range?${params}`,
  //   isCacheEnabled: "true",
  // });
};


export const getSummaryDataPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          totalExpats: "8,500,000",
          totalResidents: "4,250,000", 
          totalViolators: "409809",
          branches: {
            goldenVisa: "12,850",
            insideUAE: "7,892,999",
            outsideUAE: "607,001",
            entryExitMovements: "2,450,000",
          }
        }
      });
    }, 1080);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/summary/data?${params}`,
  //   isCacheEnabled: "true",
  // });
};

export const getResidenceVisaStatisticsPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          categories: [
            { category: 2028, count: 65000, percentage: 62.5 },
            { category: 2027, count: 19000, percentage: 30.0 },
            { category: 2026, count: 50000, percentage: 5.0 },
            { category: 2025, count: 70000, percentage: 2.5 },
            { category: 2024, count: 10000, percentage: 2.5 },
            { category: 2023, count: 79000, percentage: 2.5 }
          ],
          total: 4000000
        }
      });
    }, 1000);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/residence-visa/statistics?${params}`,
  //   isCacheEnabled: "true",
  // });
};


export const getIssuedVisaStatisticsPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          nationalities: [
            { nationality: "Pakistan", count: 120000, year: 2024, isoA2: "PK" },
            { nationality: "India", count: 95000, year: 2023, isoA2: "IN" },
            { nationality: "Bangladesh", count: 78000, year: 2022, isoA2: "BD" },
            { nationality: "Nepal", count: 65000, year: 2021, isoA2: "NP" },
            { nationality: "Egypt", count: 52000, year: 2020, isoA2: "EG" },
            { nationality: "Philippines", count: 48000, year: 2019, isoA2: "PH" }
          ],
          total: 458000
        }
      });
    }, 4050);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/issued-visa/statistics?${params}`,
  //   isCacheEnabled: "true",
  // });
};


export const getExpatsCategorizedbyGenderPdfExpats = async ({ filters }) => {
  const params = objectToParamString(filters);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          summary: {
            males: 28500,
            females: 16500,
            total: 45000
          },
          percentage: {
            males: 63.3,
            females: 36.7
          },
          counts: {
            maleCount: "28,500",
            femaleCount: "16,500"
          },
          labels: {
            malePercentLabel: "63%",
            femalePercentLabel: "37%"
          }
        }
      });
    }, 450);
  });
  
  // return httpService.get({
  //   url: `/${bi_dashboards}/api/v1/custom-pdf/violators/gender-widget?${params}`,
  //   isCacheEnabled: "true",
  // });
};






export const getViolatorIssuedResidenceVisaData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          categories: [
            { category: "2024", count: 160898 },
            { category: "2023", count: 46991 },
            { category: "2022", count: 48784 },
            { category: "2021", count: 47202 },
            { category: "2020", count: 26832 },
            { category: "2019", count: 25647 }
          ]
        }
      });
    }, 10000);
  });
};

export const getViolatorVisaByYearData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          nationalities: [
            { year: "2024", count: 120000 },
            { year: "2023", count: 45000 },
            { year: "2022", count: 48000 },
            { year: "2021", count: 47000 },
            { year: "2020", count: 26000 },
            { year: "2019", count: 25000 }
          ]
        }
      });
    }, 10000);
  });
};

export const getViolatorDistributionByEmirate = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: "856,420",
          items: [
            {
              id: 'abu-dhabi',
              name: 'Abu Dhabi',
              data: { expats: '190,500', percentage: '22.3%', residence: '45', visa: '125' },
            },
            {
              id: 'dubai',
              name: 'Dubai',
              data: { expats: '483,000', percentage: '56.4%', residence: '290', visa: '87' },
            },
            {
              id: 'sharjah',
              name: 'Sharjah',
              data: { expats: '100,200', percentage: '11.7%', residence: '65', visa: '234' },
            },
            {
              id: 'ajman',
              name: 'Ajman',
              data: { expats: '31,700', percentage: '3.7%', residence: '23', visa: '156' },
            },
            {
              id: 'umm-al-quwain',
              name: 'Umm Al Quwain',
              data: { expats: '7,700', percentage: '0.9%', residence: '12', visa: '45' },
            },
            {
              id: 'ras-al-khaimah',
              name: 'Ras Al Khaima',
              data: { expats: '25,700', percentage: '3%', residence: '18', visa: '67' },
            },
            {
              id: 'fujairah',
              name: 'Fujairah',
              data: { expats: '17,620', percentage: '2%', residence: '15', visa: '34' },
            },
          ],
        }
      });
    }, 10000);
  });
};

export const getViolatorsByAgeRange = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          age_ranges: [
            { range: "0-18", percentage: 20 },
            { range: "19-21", percentage: 30 },
            { range: "22-29", percentage: 40 },
            { range: "30-39", percentage: 50 },
            { range: "40-49", percentage: 45 },
            { range: "50-59", percentage: 60 },
            { range: "60+", percentage: 55 },
          ],
        }
      });
    }, 10000);
  });
};

export const getViolatorSummaryData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: "856,420",
          violatorTypes: [
            {
              type: "residents",
              count: "485,230",
              label: "Residents",
            },
            {
              type: "gcc",
              count: "371,190",
              label: "GCC",
            },
          ],
        }
      });
    }, 1000);
  });
};

export const getViolatorsByGender = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          counts: {
            maleCount: "485,230",
            femaleCount: "31,190",
          },
          percentage: {
            males: 56.7,
            females: 43.3,
          },
          labels: {
            malePercentLabel: "56.7%",
            femalePercentLabel: "43.3%",
          },
        }
      });
    }, 1000);
  });
};






export const getUAEPopulationSummaryData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: "9,856,420",
          populationTypes: [
            {
              type: "visa_holders",
              count: "3,200,000",
              label: "Visa Holders",
            },
            {
              type: "residents",
              count: "4,100,000",
              label: "Residents",
            },
          ],
        }
      });
    }, 1000);
  });
};

export const getUAEPopulationByGender = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          counts: {
            maleCount: "6,405,673",
            femaleCount: "3,450,747",
          },
          percentage: {
            males: 65,
            females: 35,
          },
          labels: {
            malePercentLabel: "65%",
            femalePercentLabel: "35%",
          },
        }
      });
    }, 1000);
  });
};

export const getUAEPopulationByAgeRange = () => {

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          age_ranges: [
            { range: "18-25", count: 1875000, percentage: 15.0 },
            { range: "26-35", count: 4375000, percentage: 35.0 },
            { range: "36-45", count: 3750000, percentage: 30.0 },
            { range: "46-55", count: 1875000, percentage: 15.0 },
            { range: "56-65", count: 625000, percentage: 5.0 }
          ],
          total: 12500000
        }
      });
    }, 480);
  });
};

export const getTopNationalitiesByYear = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          years: [2024, 2023, 2022, 2021, 2020, 2019],
          values: [120000, 45000, 48000, 47000, 26000, 25000],
          topNationalities: [
            { year: 2024, nationality: "Pakistan", isoA2: "PK" },
            { year: 2023, nationality: "India", isoA2: "IN" },
            { year: 2022, nationality: "Bangladesh", isoA2: "BD" },
            { year: 2021, nationality: "Nepal", isoA2: "NP" },
            { year: 2020, nationality: "Egypt", isoA2: "EG" },
            { year: 2019, nationality: "Philippines", isoA2: "PH" },
          ],
        }
      });
    }, 1000);
  });
};

export const getUAEPopulationDistributionByEmirate = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          total: "856,420",
          items: [
            {
              id: 'abu-dhabi',
              name: 'Abu Dhabi',
              data: { expats: '190,500', percentage: '22.3%', residence: '45', visa: '125' },
            },
            {
              id: 'dubai',
              name: 'Dubai',
              data: { expats: '483,000', percentage: '56.4%', residence: '290', visa: '87' },
            },
            {
              id: 'sharjah',
              name: 'Sharjah',
              data: { expats: '100,200', percentage: '11.7%', residence: '65', visa: '234' },
            },
            {
              id: 'ajman',
              name: 'Ajman',
              data: { expats: '31,700', percentage: '3.7%', residence: '23', visa: '156' },
            },
            {
              id: 'umm-al-quwain',
              name: 'Umm Al Quwain',
              data: { expats: '7,700', percentage: '0.9%', residence: '12', visa: '45' },
            },
            {
              id: 'ras-al-khaimah',
              name: 'Ras Al Khaima',
              data: { expats: '25,700', percentage: '3%', residence: '18', visa: '67' },
            },
            {
              id: 'fujairah',
              name: 'Fujairah',
              data: { expats: '17,620', percentage: '2%', residence: '15', visa: '34' },
            },
          ],
        }
      });
    }, 1000);
  });
};


