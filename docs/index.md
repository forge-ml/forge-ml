Forge ML is a powerful tool designed to streamline the process of creating and deploying structured data extraction endpoints for Large Language Models (LLMs).

## Overview

<style>
    .container {
  	display: flex;
    flex-direction: row;
		justify-content: space-evenly;
  }
  
  .disabled-button {
    display: flex;
    opacity: 50%;
    cursor: default;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 80px;
    font-size: 20px;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
   .button {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 200px;
    height: 80px;
    font-size: 20px;
    color: #fff;
    background-color: #007bff;
    border: none;
    border-radius: 10px;
    text-decoration: none;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .button:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
  }
  
  @media (max-width: 500px) {
    .container {
      flex-direction: column;
      align-items: center;
    }

    .button {
      margin-bottom: 20px;
    }
  }
</style>
<br>

<div class="container"> 
    <a href="quickstart.html" style="text-decoration: none;">
        <button class="button">Quickstart</button>
    </a>
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

### [Quickstart](quickstart.html)

<br>
