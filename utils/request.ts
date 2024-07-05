import https from "https";
import http from "node:http";

const API_KEY = "LOW KEY NO KEY";

export enum EP {
  TEST,
  DEPLOY,
}

const rootURL = "http://localhost:3000";

const EPS = {
  [EP.TEST]: "/test",
  [EP.DEPLOY]: "/deploy",
};

type Options = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: http.OutgoingHttpHeaders;
  body: {};
};

const makeRequest = (action: EP, { method, headers, body }: Options) => {
  https.request({
    path: rootURL + EPS[action],
    method: method || "GET",
    headers: {
      authorization: `Bearer ${API_KEY}`,
      "content-type": body ? "application/json" : undefined,
      ...headers,
    },
  });
};

export default makeRequest;
