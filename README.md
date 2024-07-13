# forge-ml

To install forge:

```bash
npm install zod forge-ml
```

## Getting Started

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
