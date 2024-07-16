import z from "zod";
import endpointSchema from "./constructor.schema";
type Source = z.infer<typeof endpointSchema>;

const source: Source = {
  config: {
    name: "test",
    path: "test",
    public: true,
    description: "some description",
  },
  properties: [
    {
      description: "some description",
      name: "objectArray",
      optional: false,
      type: "array",
      arrayType: "object",
      objectProperties: [
        {
          description: "some description",
          name: "objectArrNumber",
          optional: false,
          type: "number",
        },
        {
          description: "some description",
          name: "objectArrString",
          optional: true,
          type: "string",
        },
      ],
    },
    {
      description: "some description",
      name: "objectProp",
      optional: false,
      type: "object",
      objectProperties: [
        {
          description: "some description",
          name: "objectNumber",
          optional: false,
          type: "number",
        },
        {
          description: "some description",
          name: "objectString",
          optional: true,
          type: "string",
        },
      ],
    },
    {
      description: "some description",
      name: "primitiveArray",
      optional: false,
      type: "array",
      arrayType: "string",
    },
    {
      description: "some description",
      name: "primitiveProp",
      optional: false,
      type: "string",
    },
  ],
};

export default source;
