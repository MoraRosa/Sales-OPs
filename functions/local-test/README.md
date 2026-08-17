# Manual test requests

`requests.http` works directly in VS Code with the "REST Client" extension
(click "Send Request" above each block) or you can copy any block into curl:

```bash
curl -X POST http://127.0.0.1:5001/demo-peak-empire/us-central1/discoverProspects \
  -H "Content-Type: application/json" \
  -d '{"industry": "dog walker", "city": "Calgary", "sources": ["google_places"]}'
```

Run these in order once `pnpm functions:serve` is up. Step 3 is expected
to fail with a 400 -- that's confirming validation works, not a bug.
For step 5, grab a real `id` from step 4's response first.
