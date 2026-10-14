# CodeMentor AI — Learn, Don't Just Copy

> **TECH X INNOVATION 2026 Round 3 Project**  
> *Target Users: B.Tech Computer Science Engineering Students (learning C, C++, and Python)*  
> *Tagline:* "Write Code. Understand Errors. Become a Better Programmer."  
> *Unique Selling Point:* "Learn, Don't Just Copy."

---

## 1. Product Overview

Standard AI coding assistants output complete code solutions, encouraging students to copy-paste without grasping the underlying compiler errors, memory models, or algorithmic invariants. **CodeMentor AI** is built specifically for college engineering curricula to teach students *why* code fails.

### Core Capabilities:
1. **AI Debugger (Hint-First Architecture):**
   - Statically analyzes C, C++, and Python for syntax bugs, null/dangling pointer dereferences, off-by-one errors, and indentation errors.
   - Shows pedagogical hints first before allowing the student to reveal the full explanation and fix.
2. **Hinglish & English Code Explainer:**
   - Line-by-line program breakdown in friendly, intuitive **Hinglish** (Hindi + English blend) or formal **English**.
   - Includes variable/function inventories and expected control-flow transitions.
3. **Boundary & Edge Test Case Generator:**
   - Automatically generates Normal, Boundary, Edge, and Invalid test scenarios with reasonings.
   - 1-click dispatch to the Code Runner with populated `stdin`.
4. **Sandboxed Code Runner:**
   - Safe execution of C, C++, and Python via configurable sandboxes (Judge0).
   - Strict execution time limits (5s) and output size limits (12KB).
   - **Never** executes user-submitted code directly on the application server via `child_process` or `eval`.
   - Honest standby/unconfigured state when sandbox credentials are not present.
5. **Practice Arena:**
   - 10+ core curriculum questions covering Variables, Loops, Arrays, Strings, Functions, Pointers, Recursion, and Basic Data Structures.
   - Dynamic AI problem generator for custom syllabus topics.
   - Progressive multi-stage hints and multiple-choice concept quizzes with deterministic scoring.
6. **Adaptive Learning Engine:**
   - Transparent recommendation engine tracking topic-wise accuracy and repeated mistake categories.
   - Explains the exact rationale for recommended revisions.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express, TypeScript (`tsx`)
- **AI Integration:** Official `@google/genai` TypeScript SDK (server-side only with `gemini-3.8-flash`)
- **Code Execution:** Sandboxed Judge0 CE API adapter with request & output clipping
- **Local Persistence:** Validated browser `localStorage`

---

## 3. Environment Variables

Configure `.env` using `.env.example`:

```bash
# GEMINI_API_KEY: Required for AI static code analysis & debugging
GEMINI_API_KEY="your-gemini-api-key"

# JUDGE0_API_URL: Optional sandboxed execution service URL
# (e.g. https://judge0-ce.p.rapidapi.com or self-hosted Judge0 instance)
JUDGE0_API_URL=""

# JUDGE0_API_KEY: Optional RapidAPI key or Judge0 authentication token
JUDGE0_API_KEY=""

# JUDGE0_API_HOST: Optional RapidAPI host header
JUDGE0_API_HOST="judge0-ce.p.rapidapi.com"
```

---

## 4. Local Development & Commands

### Installation
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Starts full-stack server on `http://localhost:3000` with Express API and Vite middleware.

### Run Automated Tests
```bash
npm run test
```
Executes the automated test suite verifying input validation, quiz determinism, adaptive engine logic, and truncation bounds.

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm run start
```

---

## 5. Security Architecture

- **Zero Client API Key Leakage:** `process.env.GEMINI_API_KEY` is accessed only within Node.js backend routes (`server/gemini.ts`). It is never bundled into browser assets.
- **Untrusted Input Boundaries:** User source code, error logs, and comments are wrapped in strict delimiters and passed as untrusted data with anti-prompt-injection system instructions.
- **No Insecure Execution:** The application server never executes user source code using Node `child_process.exec`, `eval`, or local bash shells. Execution is delegated exclusively to sandboxed container services with timeout and memory limits.
- **Payload & Rate Guards:** Max code size is capped at 60KB, max JSON request size at 1MB, and rate limits are enforced on `/api/*`.
