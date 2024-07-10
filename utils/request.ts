import axios, { AxiosHeaders } from "axios";
import https from "https";
import http from "node:http";
import authService from "../controls/auth/svc";

export enum EP {
  TEST,
  DEPLOY,
  GET_DOCS_URL,
}

const rootURL = "http://localhost:3009";

const EPS = {
  [EP.TEST]: "/test",
  [EP.DEPLOY]: "/endpoint",
  [EP.GET_DOCS_URL]: "/docs/url",
};

type Options = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: AxiosHeaders;
  data?: {};
};

// TODO: wrap in a try catch, return {data, error}
const makeRequest = async (action: EP, { method, headers, data }: Options) => {
  const apiKey = authService.getAPIKey();

  try {
    return await axios.request({
      url: rootURL + EPS[action],
      method: method || "GET",
      headers: {
        ...(apiKey
          ? {
              authorization: `Bearer ${apiKey}`,
            }
          : {}),
        authorization: `Bearer ${apiKey}`,
        "content-type": data ? "application/json" : undefined,
        ...headers,
      },
      data,
    });
  } catch (error) {
    console.log(JSON.stringify((error as any).response.data, null, 2));
    return { error, message: (error as any).response.data.message };
  }
};

export default makeRequest;
