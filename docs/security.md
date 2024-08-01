# Security

Guidelines for essential tasks like signing up, logging in, updating credentials, and handling API keys to maintain a robust security framework for Forge ML services.

## Authentication

Auth lives at `$ forge auth`. When you log in or sign up, you'll get a fresh api key (this will not invalidate your old key). Your credentials are stored at `~/.forge/key.json`.

### Commands:

- `$ forge auth signup` // Sign up for a forge account
- `$ forge auth signin` // Sign in to your account
- `$ forge auth logout` // Log out of your account
- `$ forge auth update` // update your forge username
  - This command will also update your deployed endpoints. Your swagger docs are dynamic, and will reflect your latest username and endpoints.

## Managing API Keys

Your api keys live in ~/.forge/key.json. You can manage them using some of the utility functions forge provides out of the box.

#### - Check status of API key (are keys set?)

`$ forge key list`

#### - Copy a key to your clipboard

You'll need this once you're ready to hit a deployed endpoint.

`$ forge key copy <provider>` // Provider options: openAI or forge

#### - Set a key

The default option sets your OpenAI API key, in case it isn't valid anymore or you want to change it.

`$ forge key set \<API_KEY> --provider <provider>` // Provider options: openAI or forge

<br>

---

#### WHAT'S NEXT

### [Build and Deploy]()

### [FAQs]()
