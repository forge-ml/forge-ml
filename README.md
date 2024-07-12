# forge-ml

To install forge:

```bash
npm install zod forge-ml
```

## Getting Started

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

To view available commands:

```bash
forge --help
```

## Authentication

To sign up for a forge account:

```bash
forge auth signup
```

To log in to an existing forge account:

```bash
forge auth login
```

To log out of the current forge account:

```bash
forge auth logout
```

To update your forge username:

```bash
forge auth update
```

## Creating a schema

Example schemas can be found in the `./forge` folder.

## Deploying a schema

 `forge deploy` deploys all of these schemas by default. A specific schema can be deployed using:

```bash
forge deploy <filename>
```
