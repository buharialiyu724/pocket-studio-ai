# Pocket Studio AI

A responsive, browser-based photo editor inspired by familiar iPhone Photos and Samsung Gallery workflows.

## Features
- Upload a photo from your phone or computer; images stay in the browser unless you explicitly configure the optional AI worker.
- Twelve live filter presets, including Natural, Vivid, Warm, Cool, Dramatic, Portrait, Mono, Golden and Night.
- Fine-tune brightness, contrast, saturation, warmth, highlights, shadows, clarity and fade.
- Press and hold **Compare** to preview the original image.
- Export a high-quality JPEG.
- AI assistant with local prompt interpretation and optional OpenAI-backed Cloudflare Worker integration.
- Responsive layout for mobile and desktop.

## Run locally
Open `index.html` in a modern browser. Some browsers restrict local file behavior; if needed, use a static server such as VS Code Live Server or Python's `python -m http.server`.

## Deploy on GitHub Pages
1. Upload the contents of this folder to the root of `buharialiyu724/pocket-studio-ai` (including `index.html`, `style.css`, `app.js`, `.nojekyll`, and `test-photo.jpg`).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/(root)`, then Save.
4. Wait for the Pages deployment to finish. The site URL will normally be `https://buharialiyu724.github.io/pocket-studio-ai/`.

## Optional AI endpoint
The browser-only assistant uses a local prompt-to-filter interpreter without an API key. For model-assisted prompt interpretation, deploy `worker.js` to Cloudflare Workers:
1. Create a Worker and paste the contents of `worker.js`.
2. In the Worker settings, add the secret `OPENAI_API_KEY` and optionally the variable `OPENAI_MODEL` (default `gpt-4.1-mini`).
3. Deploy the Worker and copy its HTTPS URL.
4. Open Pocket Studio, select **AI assistant**, paste the Worker URL into **Optional AI Worker URL**, then apply a prompt.

The Worker calls the OpenAI Responses API to convert text into safe filter/slider instructions. The actual image adjustments are performed locally in the browser; this is not a generative image transformation endpoint. Keep the API key in the Worker secret store, never in `app.js` or the public repository. Add rate limits or authentication before sharing the worker publicly, because requests may incur API costs.

## Test portrait
`test-photo.jpg` is a local sample copy of the portrait supplied with the project brief. It is included only as a test asset; choose it with **Open photo** after opening the app. Remove it from the repository if you do not want it published.
