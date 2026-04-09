# Behaviour

A small **Next.js** web app for working through **urges and stress** with **AI-guided chat**: CBT-style dialogue for cravings, plus **Calm Down** and **Fall Asleep** flows when you want something quieter.

---

## What it does

- **Urges** — You define urges (name, icon, color, optional notes). Tapping one starts a **CBT session**: the model helps you notice thoughts, challenge distortions, and try coping strategies.
- **Calm Down / Fall Asleep** — One-tap sessions for breathing, grounding, relaxation, and sleep-oriented guidance (different tones and prompts).
- **Sessions & outcomes** — When you finish, you can mark whether you **curbed** the urge or **gave in**. That feeds simple **stats** and **history** over time.
- **Profile** — Optional name and free-text context so chats can feel more personal.
- **Memories** — After a session ends, the app can extract a few short, reusable bullet points (stored locally) to improve later sessions.
- **Custom templates** — In **Settings**, edit prompts for your own session types alongside the built-in ones.
- **Data** — Chats, urges, and settings live in your browser (**IndexedDB** via Dexie). You can **export / import** JSON (API keys are **not** included in exports). You can also **clear all data**.

---

## How to use it (first time)

1. **Run the app** (see [Development](#development)).
2. Open **Settings** and add an **OpenAI-compatible API key** (default base URL is OpenAI; you can point to another compatible endpoint and choose a model).
3. Optionally enable **WebAuthn** to encrypt the API key with your device.
4. Under **Urges**, create at least one urge so the home grid has something to tap.
5. Optional: **Profile** — add your name or context you’re comfortable sharing with the model.
6. From **Home**, start a session from an urge, **Calm Down**, or **Fall Asleep**. Use **History** and **Stats** to review past sessions.

---

## Development

**Requirements:** Node.js 20+ (recommended), npm or compatible package manager.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm run start   # run production server
npm run lint    # eslint
```

There is **no required `.env`** for local chat: API configuration is stored in the client database after you save it in the UI.

---

## Tech stack

- **Next.js** (App Router), **React**, **TypeScript**, **Tailwind CSS**
- **Dexie** — IndexedDB for offline-first storage
- **OpenAI** SDK — chat completions (browser; streaming)
- **Serwist** — PWA / service worker (`src/app/sw.ts`), installable on supported devices

---

## Privacy & security notes

- Data stays **on your device** unless you export it or send messages to your chosen **LLM provider** (which receives chat content per their policies).
- The API key is used **from the browser** to talk to the provider. That’s convenient for a personal PWA but is **not** ideal for a shared or untrusted machine—use WebAuthn encryption and device passkeys where possible, and treat the key like a secret.

---

## License

Private project unless you add a license file.
