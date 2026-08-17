import axios from 'axios';
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig();
const { CACHE_ENABLED } = publicRuntimeConfig;

const BASE_URL = '';
let cache = {};

// Map to track the last promise for each endpoint (for in-order resolution)
const endpointChains = new Map();

export function clearApiResponseCache() {
  cache = {};
}

// Helper to extract the endpoint (ignoring query params)
function getEndpoint(url) {
  return url?.split('?')?.[0];
}

export default class Http {
  /**
   * GET requests are sent in parallel, but their responses are resolved in the order the requests were made.
   * Only the last request's error for each endpoint is thrown; previous errors are ignored.
   */
  static async get({ url, isBlob = false, isCacheEnabled = CACHE_ENABLED, handleDiscard = () => {} }) {
    const endpoint = getEndpoint(url);

    // Generate a unique request id for this call
    // Start the request immediately
    const cancelGetRequest = axios.CancelToken.source();
    handleDiscard(cancelGetRequest);

    let reqPromise = null;
    if (cache[endpoint] && cache[endpoint]?.[url]?.key === url && isCacheEnabled === 'true') {
      reqPromise = cache[endpoint]?.[url]?.promise;
    } else {
      reqPromise = axios.get(`${BASE_URL}${url}`, {
        cancelToken: cancelGetRequest.token,
        responseType: isBlob ? 'blob' : 'json',
      });
    }

    // Get the previous chain for this endpoint (or a resolved promise if none)
    const prev = endpointChains.get(endpoint) || Promise.resolve();

    // Chain the new promise to the previous one for in-order resolution
    const orderedPromise = prev
      .catch(() => {}) // Ignore previous errors so the chain continues
      .then(async () => {
        if (isCacheEnabled === 'true') {
          cache[endpoint] = {
            ...cache[endpoint],
            [url]: {
              key: url,
              promise: reqPromise
            }
          };
          const response = await cache[endpoint]?.[url]?.promise;
          return response?.data;
        }
        const response = await reqPromise;
        return response?.data;
      })
      .catch(error => {
        throw error;
        // Only throw if this is the latest request for this endpoint
        // if (endpointLastRequestId.get(endpoint) === requestId) {
        //  throw error;
        // }
        // // Otherwise, swallow the error
        // return;
      });

    // Update the chain for this endpoint
    endpointChains.set(endpoint, orderedPromise);

    return orderedPromise;
  }

  static async delete({ url }) {
    const response = await axios.delete(`${BASE_URL}${url}`);
    return response.data;
  }

  static async post({ url, data, isCacheEnabled = CACHE_ENABLED, handleDiscard = () => {} }) {
    const key = `${url}_${JSON.stringify(data)}`;
    if (cache[key] && isCacheEnabled === 'true') {
      await new Promise((res, rej) => {
        handleDiscard({ cancel: rej });
        res();
      });
      return cache[key];
    }
    const cancelPostRequest = axios.CancelToken.source();
    handleDiscard(cancelPostRequest);
    const response = await axios.post(`${BASE_URL}${url}`, data, {
      cancelToken: cancelPostRequest.token,
    });
    if (isCacheEnabled === 'true') {
      cache[key] = response.data;
    }
    return response.data;
  }

  static async put({ url, data, handleDiscard = () => {} }) {
    const cancelPutRequest = axios.CancelToken.source();
    handleDiscard(cancelPutRequest);
    const response = await axios.put(`${BASE_URL}${url}`, data, {
      cancelToken: cancelPutRequest.token,
    });
    return response.data;
  }

  static async patch({ url, data, handleDiscard = () => {} }) {
    const cancelPutRequest = axios.CancelToken.source();
    handleDiscard(cancelPutRequest);
    const response = await axios.patch(`${BASE_URL}${url}`, data, {
      cancelToken: cancelPutRequest.token,
    });
    return response.data;
  }
}
