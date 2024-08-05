# Forge Client (SDK)

The commands `$ forge init` and `$ forge deploy` will generate a client for you, allowing you to interact with your endpoints programatically.

<br>

## How to Use the Forge Client

After running `$ forge init` you'll have a client.ts file in your forge folder.

```Text
## client.ts
import Forge from "@forge-ml/client";

const keyGuard = () => {
  throw new Error("set FORGE_KEY in your .env");
};

const forgeKey = process.env.FORGE_KEY || keyGuard();

const forge = Forge({
  forgeKey: forgeKey,
});

export default forge;
```

##### Feel free to edit this file. Your edits will not be overwritten unless you run `$ forge init` again.

<br>

## 1. Environment

In the root of your project create a .env file and add your forge key.

```Text
## .env
FORGE_KEY=your-forge-key
```

##### Your forge key is accessible via `$ forge key copy forge`

## 2. Usage

Import your forge client into any file in your project and make a request.

```Text
## <any_file>.ts
import forge from "./forge/client";

const response = await forge.person.query("Who is Mark Twain?");

// a type-safe response!
const firstName = response.name.firstName;
console.log(firstName); // "Mark"
```

Volia! You now have a type-safe response from your endpoint

```JSON
{
  "name": {
    "full": "Mark Twain",
    "firstName": "Mark",
    "lastName": "Twain"
  },
  ...
  "\_meta": {
    "usage": {
      "prompt_tokens": 211,
      "completion_tokens": 220,
      "total_tokens": 431
    },
    "cacheHit": false
  }
}
```

<br>

---

#### WHAT'S NEXT

### [Schema Creation]({{ site.baseurl }}/schema-creation)

### [Security]({{ site.baseurl }}/security)

<br>
