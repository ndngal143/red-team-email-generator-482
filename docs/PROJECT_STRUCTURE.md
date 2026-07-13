# Project Structure and Safety Notes

## Project Structure

```text
src/server.js           Backend server and API routes
src/generator.js        OpenAI integration and safe fallback generation
src/linkGenerator.js    Safe internal-looking training link generator
src/spamChecker.js      Simple spam indicator scoring
src/logStore.js         JSONL log storage and export
public/index.html       Prototype UI
public/styles.css       UI styles
public/app.js           Browser-side form logic
docs/MILESTONE_TODOS.md Team TODOs organized by milestone
data/.gitkeep           Log directory placeholder
```

## Safety Notes

- Generated links use safe demo domains or local routes.
- The prompt instructs the model to create training drafts only.
- The prototype does not create credential collection pages.
- Logs are local JSONL files intended for defensive analysis and export.
