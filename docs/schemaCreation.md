# Schema Creation

Let's walk through the `$ forge create` command

## Run Command

```CLI
$ forge create
```

## Follow the Prompts

```Prompt
Let's build your schema:
What do you want the path of your schema to be? (required, must be one lowercase word, no special characters)

> person
```

<br>

##### Public endpoints are accessible to all Forge users, while private endpoints are restricted to the creator's access only

```Prompt
Is this a public or private path?

* public    private
```

<br>

##### Learn more about [Cache Options]().

```Prompt
Would you like to cache your schema?

* None    Common    Individual
```

<br>

```Prompt
What do you want the name of your endpoint to be? (optional)

> person
```

<br>

```Prompt
What do you want the description of your endpoint to be? (optional)

> returns a person with the attributes defined in the person schema
```

<br>

```Prompt
Enter a prompt for your schema? (ex. Generate a Person schema with attributes like a job, name, age, etc.)

> Make me a superhero schema with attributes like name, sidekick, and abilities, etc. Add a lot of attributes and be very detailed.
```

<br>

```CLI
Creating schema...
```

<br>

```CLI
Here is your schema:

import { z } from 'zod';

const Person = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().int().positive().max(120, "Age must be a realistic number"),
  job: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().regex(/^\d{10}$/, "Phone number must be a 10 digit number"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().length(2, "State must be a 2-letter abbreviation").optional(),
    zipCode: z.string().optional().regex(/^\d{5}$/, "Zip code must be a 5 digit number"),
  }).optional(),
});

 export default Person;

export const config = {"path":"person","public":false,"cache":"Common"};
```

<br>

##### It is important to verify your generated schema before writing it to a file. Only select No if the generated schema is incorrect.

```Prompt
Do you want to write this to a file?
* Yes    No
```

```CLI
Destination file path: /Users/samuelcrider/projects/forge/backend/forge/schema/person.ts

Writing to file...
File has been written
You can deploy your file by running: forge deploy all
You can test your file by running: forge test forge/schema/person.ts
```

<br>

---

#### WHAT'S NEXT

### [Security]()

### [Build and Deploy]()

<br>
