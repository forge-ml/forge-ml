Forge ML is a powerful tool designed to streamline the process of creating and deploying structured data extraction endpoints for Large Language Models (LLMs).

## Overview

<style>
  body {
    background-color: #0f0f0f;
    color: #00ff00;
    font-family: 'Courier New', Courier, monospace;
  }

  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    margin: 20px 0;
  }

  .button, .disabled-button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 220px;
    height: 60px;
    font-size: 18px;
    color: #0f0f0f;
    background-color: #00ff00;
    border: 2px solid #00ff00;
    border-radius: 12px;
    text-decoration: none;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 6px 8px rgba(0, 255, 0, 0.15);
    margin: 10px;
  }

  .button:hover {
    transform: scale(1.1);
    box-shadow: 0 10px 12px rgba(0, 255, 0, 0.25);
    cursor: pointer;
  }

  .disabled-button {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 500px) {
    .container {
      flex-direction: column;
      align-items: center;
    }

    .button, .disabled-button {
      width: 100%;
      margin-bottom: 20px;
    }
  }
</style>
<br>

<div class="container"> 
    <a href="#" class="button">Quickstart</a>
    <a href="#" class="disabled-button">Applications</a>
</div>
<br>
<br>

Forge ML uses a combination of tools like Zod and Instructor to create and deploy endpoints that can be used to extract structured data from LLMs. It's a dead simple way to create custom LLM endpoints for your applications.

You define a Zod schema, test it locally, and then deploy it to the cloud. From there you can access it from any application that can make HTTP requests, and it's guaranteed to have the expected response structure.

## Define your schema

```TypeScript
const whois = z.object({
  name: z.string(),
  occupation: z.string(),
  hobbies: z.array(z.string()),
});
```

### Deploy it

```CLI
$ forge deploy all
```

```TypeScript
// endpoint: <https://api.forge-ml.com/q/jakezegil/whois>
// prompt: Jake Zegil is a Software Engineer who likes ripping code and driving boats
// Your endpoint response -
{
  name: "Jake Zegil",
  occupation: "Software Engineer",
  hobbies: ["ripping code", "driving boats"],
}
```

<br>

---

#### WHAT'S NEXT

Start with the quickstart guide.

### [Quickstart]()

<br>
