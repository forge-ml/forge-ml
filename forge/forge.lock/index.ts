
  const serverUrl = "http://localhost:3009"
  

/** THIS IS A GENERATED FILE, EDITS WILL BE OVERWRITTEN */

import { z } from "zod";

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

const createRequest = <T>(params: GeneratedOptions) => {
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

type ReqConfig<B, R> = {
  path: string;
  method: string;
  body?: z.ZodType<B>;
  response: z.ZodType<R>;
};

const DOCUMENT_REQS = {
  get: (id: string) => ({
    path: `/documents/${id}`,
    method: "GET",
    response: z.object({
      id: z.string(),
      name: z.string(),
      text: z.string(),
      collectionIds: z.array(z.string()),
    }),
  }),
  create: () => ({
    path: "/documents/create",
    method: "POST",
    body: z.object({
      name: z.string(),
      text: z.string(),
      collectionIds: z.array(z.string()),
    }),
    response: z.object({
      id: z.string(),
      name: z.string(),
      text: z.string(),
      collectionIds: z.array(z.string()),
    }),
  }),
  delete: (id: string) => ({
    path: `/documents/${id}`,
    method: "DELETE",
    response: z.object({
      ok: z.boolean(),
    }),
  }),
  addToCollections: (id: string) => ({
    path: `/documents/${id}/collections`,
    method: "POST",
    body: z.object({
      collectionIds: z.array(z.string()),
    }),
    response: z.object({
      id: z.string(),
      name: z.string(),
      collectionIds: z.array(z.string()),
    }),
  }),
  removeFromCollections: (id: string) => ({
    path: `/documents/${id}/collections`,
    method: "DELETE",
    body: z.object({
      collectionIds: z.array(z.string()),
    }),
    response: z.object({
      id: z.string(),
      name: z.string(),
      collectionIds: z.array(z.string()),
    }),
  }),
} satisfies Record<string, (...args: any[]) => ReqConfig<any, any>>;

const COLLECTION_REQS = {
  get: (id: string) => ({
    path: `/collections/${id}`,
    method: "GET",
    response: z.object({
      id: z.string(),
      name: z.string(),
      documentIds: z.array(z.string()),
    }),
  }),
  create: () => ({
    path: "/collections",
    method: "POST",
    body: z.object({
      name: z.string(),
      documentIds: z.array(z.string()),
    }),
    response: z.object({
      id: z.string(),
      name: z.string(),
      documentIds: z.array(z.string()),
    }),
  }),
  delete: (id: string) => ({
    path: `/collections/${id}`,
    method: "DELETE",
    body: z.object({
      deleteDocuments: z.boolean(),
    }),
    response: z.object({
      ok: z.boolean(),
    }),
  }),
} satisfies Record<string, (...args: any[]) => ReqConfig<any, any>>;

const generReq = <B, R>(
  forgeKey: string,
  reqConfig: ReqConfig<B, R>
) => {
  return async (body?: B): Promise<R> => {
    const headers: HeadersInit = {
      Authorization: `Bearer ${forgeKey}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method: reqConfig.method,
      headers,
    };

    if (reqConfig.body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${serverUrl}${reqConfig.path}`, options);
    return response.json();
  };
};

type DocumentRequestOptions = {
  forgeKey: string;
};

const getDocument = (id: string, { forgeKey }: DocumentRequestOptions) =>
  generReq(forgeKey, DOCUMENT_REQS.get(id))();
const createDocument = (
  body: { name: string; text: string; collectionIds: string[] },
  { forgeKey }: DocumentRequestOptions
) => generReq(forgeKey, DOCUMENT_REQS.create())(body);
const deleteDocument = (id: string, { forgeKey }: DocumentRequestOptions) =>
  generReq(forgeKey, DOCUMENT_REQS.delete(id))();
const addDocumentToCollections = (
  id: string,
  collectionIds: string[],
  { forgeKey }: DocumentRequestOptions
) => generReq(forgeKey, DOCUMENT_REQS.addToCollections(id))({ collectionIds });
const removeDocumentFromCollections = (
  id: string,
  collectionIds: string[],
  { forgeKey }: DocumentRequestOptions
) =>
  generReq(
    forgeKey,
    DOCUMENT_REQS.removeFromCollections(id)
  )({ collectionIds });

type CollectionRequestOptions = {
  forgeKey: string;
};

const getCollection = (id: string, { forgeKey }: CollectionRequestOptions) =>
  generReq(forgeKey, COLLECTION_REQS.get(id))();
const createCollection = (
  body: { name: string; documentIds: string[] },
  { forgeKey }: CollectionRequestOptions
) => generReq(forgeKey, COLLECTION_REQS.create())(body);
const deleteCollection = (id: string, { deleteDocuments }: { deleteDocuments: boolean }, { forgeKey }: CollectionRequestOptions) =>
  generReq(forgeKey, COLLECTION_REQS.delete(id))({ deleteDocuments });

const Forge = (options: ClientOptions) => {
  const forgeKey = options.forgeKey;
  //   const defaultModel = options.defaultModel;

  const client = generatedClient(forgeKey);

  return client;
};

export default Forge;


  import recipe_schema from "./recipe.generated.ts";
import book_schema from "./book.generated.ts";
import message_schema from "./message.generated.ts";
import person_schema from "./person.generated.ts";

  const generatedClient = (forgeKey: string) => {
    return {
      
$documents: {
   get: (id: string) => {
    return getDocument(id, {forgeKey});
   },
   create: ({ name, text, collectionIds }: { name: string, text: string, collectionIds?: string[] }) => {
    return createDocument({ name, text, collectionIds: collectionIds || [] }, {forgeKey});
   },
   delete: (id: string) => {
    return deleteDocument(id, {forgeKey});
   },
   addToCollections: (id: string, collectionIds: string[]) => {
    return addDocumentToCollections(id, collectionIds, {forgeKey});
   },
   removeFromCollections: (id: string, collectionIds: string[]) => {
    return removeDocumentFromCollections(id, collectionIds, {forgeKey});
   },
},

      
$collections: {
   get: (id: string) => {
    return getCollection(id, {forgeKey});
   },
   create: ({ name, documentIds }: { name: string, documentIds?: string[] }) => {
    return createCollection({ name, documentIds: documentIds || [] }, {forgeKey});
   },
   delete: (id: string, options?: { deleteDocuments: boolean }) => {
    return deleteCollection(id, { deleteDocuments: options?.deleteDocuments || false }, {forgeKey});
   },
},

      
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
  