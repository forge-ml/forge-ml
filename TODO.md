# TODO

## readme

- Sign up
- Create `forge` folder
- Create a typescript with zod schema as the default export
- Add a config export to the typescript file (not necessary to test but is for deploy)
- Path for endpoint in config should be one word, no special characters
- config
  - name
  - path
  - public(bool) can other people access endpoint (default: true) users have their own key
  - description
- test `schema.file.ts`
- deploy `forge deploy forge/schemaFile.ts` (path flag to overwrite config)
- forge docs to see endpoint for swagger docs

- Api keys
  - list
  - copy
  - set
