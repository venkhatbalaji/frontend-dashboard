import httpService from "./httpService";

export const searchPerson = async (data) => {
  return httpService.post({
    url: "/api/v1/family-tree/search",
    data,
    isCacheEnabled: "false",
  });
};

export const getPersonTree = async (personId, depth = 3) => {
  return httpService.get({
    url: `/api/v1/persons/${personId}/tree?depth=${depth}`,
    isCacheEnabled: "false",
  });
};
