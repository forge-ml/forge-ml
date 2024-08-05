# Quickstart

Let's get you up to speed - from [installation](#1-installation) to [deploying your first endpoint](#7-deploy), we'll walk you through the essential steps to get started with Forge.

## 1. Installation

Install Forge globally.

```CLI
$ npm install -g forge-ml
```

And you're live!

```CLI
$ forge --help
```

<br>

## 2. Sign Up

Authentication in Forge ML is essential for securing access to your endpoints and managing API keys. It ensures that only you can deploy and interact with your custom LLM extraction services, while also enabling personalized features like usage tracking and resource allocation.

```Text CLI
$ forge auth signup
```

##### [Why do I need an OpenAI API key?]()

<br>

## 3. Install Zod

Zod is the schema validation library that Forge ML uses for defining the structure and constraints of extracted data.

```Text CLI
$ npm install zod
```

<br>

## 4. Initialize Forge

Initialization prepares the project environment for creating and deploying endpoints with Forge ML by generating the Forge folder in the root of your project. This folder contains the Forge client and houses all your schemas.

```Text CLI
$ forge init
```

<br>

## 5. Create

Generate a new schema file for defining the structure of the data you want to extract.

```Text CLI
$ forge create
```

##### Learn more about [Schema Creation.]()

<br>

## 6. Test

Validate the functionality and accuracy of your schema by running it locally before deployment. Testing ensures that the endpoint will produce the expected structured data, preventing errors and ensuring reliability when the endpoint goes live.

```Text CLI
$ forge test ./forge/schema/<your_schema>.ts
```

<br>

## 7. Deploy

Establish your schema as an endpoint in the cloud, making it accessible for use in applications. This command ensures your schema is live and ready to handle requests based on the defined data structure.

```Text CLI
$ forge deploy all
```

🎉 Sweet! You've deployed your first endpoint.

## Swagger Docs

Once you're authenticated and have deployed an endpoint, you can view and test out all of your live endpoints on your swagger docs page.

```CLI
$ forge docs
```

<br>

---

#### WHAT'S NEXT

Learn how to use the Forge Client.

### [Forge Client (SDK)]({{ site.baseurl }}/forge-client)

<br>
