import axios, { AxiosHeaders } from "axios";
import localConfigService from "../controls/auth/svc";
import { Keys } from "../commands/key";

export enum EP {
  TEST,
  DEPLOY,
  GET_DOCS_URL,
  SET_OPENAI_KEY,
  UPDATE_USERNAME,
}

const rootURL = "http://localhost:3009";

const EPS = {
  [EP.TEST]: "/test",
  [EP.DEPLOY]: "/endpoint",
  [EP.GET_DOCS_URL]: "/docs/url",
  [EP.SET_OPENAI_KEY]: "/cli/key",
  [EP.UPDATE_USERNAME]: "/cli/updateUsername",
};

type Options = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: AxiosHeaders;
  data?: {};
};

const makeRequest = async (action: EP, { method, headers, data }: Options) => {
  const apiKey = localConfigService.getValue(Keys.FORGE);

  try {
    const response = await axios.request({
      url: rootURL + EPS[action],
      method: method || "GET",
      headers: {
        ...(apiKey
          ? {
              authorization: `Bearer ${apiKey}`,
            }
          : {}),
        "content-type": data ? "application/json" : undefined,
        ...headers,
      },
      data,
    });
    return { data: response.data, error: null, message: null };
  } catch (error) {
    console.log(JSON.stringify((error as any).response.data, null, 2));
    return {
      error,
      message: (error as any).response.data.message,
      data: null,
    };
  }
};

export default makeRequest;
