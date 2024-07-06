import axios, { AxiosHeaders } from "axios";
import https from "https";
import http from "node:http";

const API_KEY = "LOW KEY NO KEY";

export enum EP {
  TEST,
  DEPLOY,
}

const rootURL = "http://localhost:3009";

const EPS = {
  [EP.TEST]: "/test",
  [EP.DEPLOY]: "/deploy",
};

type Options = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: AxiosHeaders;
  data: {};
};

// TODO: wrap in a try catch, return {data, error}
const makeRequest = async (action: EP, { method, headers, data }: Options) => {
     return await  axios.request({
           url: rootURL + EPS[action],
           method: method || "GET",
           headers: {
               authorization: `Bearer ${API_KEY}`,
               "content-type": data ? "application/json" : undefined,
               ...headers,
            },
            data
        });
};

export default makeRequest;
