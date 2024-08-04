
  const serverUrl = "http://localhost:3009"
  

/** THIS IS A GENERATED FILE, EDITS WILL BE OVERWRITTEN */

type ClientOptions = {
  forgeKey: string;
  //   defaultModel: string;
};

type RequestOptions = {
  token?: string;
  model?: string;
  cache?: "Bust" | "Evade"; // (@TODO: only if cache setting)
 };

// Options that will be set at generation time
type GeneratedOptions =
  | {
      username: string;
      path: string;
      contentType?: "text";
    }
  | {
      username: string;
      path: string;
      contentType: "image";
    };

type ImageQuery = { imageUrl: string; prompt: string };

type QueryType = string | ImageQuery;

export const createRequest = <T>(params: GeneratedOptions) => {
  return async (query: QueryType, opts: RequestOptions) => {
    const baseController = (() => {
      switch (params.contentType) {
        case "image":
          return "image";
        default:
          return "q";
      }
    })();
    try {
      const response = await fetch(
        `${serverUrl}/${baseController}/${params.username}/${params.path}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${opts.token}`,
            ...(opts.cache && {
              "Cache-Behavior": opts.cache,
            }),
            ...(opts.model && {
              "X-Custom-Model": opts.model,
            }),
          },
          body: JSON.stringify({
            q: query,
          }),
        }
      );

      return response.json() as Promise<T>;
    } catch (error) {
      return { error: error } as T;
    }
  };
};

const Forge = (options: ClientOptions) => {
  const forgeKey = options.forgeKey;
  //   const defaultModel = options.defaultModel;

  const client = generatedClient(forgeKey);

  return client;
};

export default Forge;


  import recipe_schema from "./recipe.generated.ts"
import book_schema from "./book.generated.ts"
import person_schema from "./person.generated.ts"

  const generatedClient = (forgeKey: string) => {
    return {
      
recipe: {
    queryImage: (prompt: { imageUrl: string, prompt: string }, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof recipe_schema>>({
          username: "jakezegil",
          path: "recipe",
          contentType: "image"
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
        });
      },
},

book: {
    query: (prompt: string, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof book_schema>>({
          username: "jakezegil",
          path: "book",
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
        });
      },
},

person: {
    queryImage: (prompt: { imageUrl: string, prompt: string }, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof person_schema>>({
          username: "jakezegil",
          path: "person",
          contentType: "image"
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
        });
      },
},
    };
  };
  