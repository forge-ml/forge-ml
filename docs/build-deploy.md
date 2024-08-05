# Build and Deploy

Integrate these steps into your build configuration to leverage Forge ML in production:

1. Confirm that both of your keys are set:
   ```
   $ forge key list
   ```

2. Confirm that your Forge key is listed in your `.env` file

3. Install dependencies:
   ```
   npm install
   ```

4. Run your build command

5. Generate the client for production environment:
   ```
   npx forge generate
   ```

---

## What's Next

- [FAQs]({{ site.baseurl }}/faqs)
- [Real-World Applications]({{ site.baseurl }}/applications)
