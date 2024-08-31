
  const serverUrl = "http://localhost:3009"
  

/** THIS IS A GENERATED FILE, EDITS WILL BE OVERWRITTEN */

type ClientOptions = {
  forgeKey: string;
  //   defaultModel: string;
};

type RequestOptions = {
  token?: string;
  cache?: "Bust" | "Evade"; // (@TODO: only if cache setting)
  model?: string;
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
              ...(opts.model && {
                Model: opts.model,
              }),
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

enum Provider {
  OpenAI = "openai",
  Anthropic = "anthropic",
  Groq = "groq",
}

type ModelConfig = {
  model: string;
  provider: Provider;
};

type RAGRequestOptions = {
  collectionId: string;
  token?: string;
  modelConfig?: ModelConfig;
  chunkCount?: number;
};

type Chunk = {
  text: string;
  score: number;
};

type RAGResponse = Promise<{
  response: string;
  context: Chunk[];
}>;

const ragRequest = async (
  query: string,
  opts: RAGRequestOptions
): RAGResponse => {
  const response = await fetch(`${serverUrl}/q/rag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.token}`,
    },
    body: JSON.stringify({
      q: query,
      collectionId: opts.collectionId,
      model: opts.modelConfig?.model,
      provider: opts.modelConfig?.provider,
      chunkCount: opts.chunkCount,
    }),
  });

  return response.json();
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
import message_schema from "./message.generated.ts"
import person_schema from "./person.generated.ts"

  const generatedClient = (forgeKey: string) => {
    return {
      
$withContext: (prompt: string, opts: RAGRequestOptions) => {
    return ragRequest(prompt, {
      token: opts.token || forgeKey,
      collectionId: opts.collectionId,
      modelConfig: opts.modelConfig,
      chunkCount: opts.chunkCount,
    });
  },

      
recipe: {
    queryImage: (prompt: { imageUrl: string, prompt: string }, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof recipe_schema>>({
          username: "jakezegil",
          path: "recipe",
          contentType: "image"
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
          model: opts?.model,
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
          model: opts?.model,
        });
      },
},

message: {
    query: (prompt: string, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof message_schema>>({
          username: "jakezegil",
          path: "message",
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
          model: opts?.model,
        });
      },
},

person: {
    query: (prompt: string, opts?: RequestOptions) => {
        return createRequest<Zod.infer<typeof person_schema>>({
          username: "jakezegil",
          path: "person",
        })(prompt, {
          token: opts?.token || forgeKey,
          cache: opts?.cache,
          model: opts?.model,
        });
      },
},
    };
  };
  