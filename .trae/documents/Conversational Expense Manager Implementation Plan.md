Based on your detailed requirements and the current state of the repository, here is the implementation plan to transform `ledger-ai` into a conversational expense manager.

## 1. Core Tech Stack Integration (Phase 1)

We will install the required dependencies to match the "2026 Standard" stack.

* **Actions**:

  * Install `drizzle-orm` and `drizzle-kit` for type-safe database management.

  * Verify `react-native-executorch` configuration (already installed, but needs setup).

  * Setup `react-native-mmkv` for fast key-value storage (already installed).

  * **Note**: Since `react-native-rag` is not a standard registry package, we will implement a custom `MobileRAG` module that handles vector embedding and similarity search using SQLite and local logic.

## 2. System Architecture & "Memory" (Phase 2)

We will refactor the existing raw SQLite implementation to use Drizzle ORM and add vector storage capabilities.

* **Schema Definition (`src/database/schema.ts`)**:

  * Define `expenses` table with Drizzle (id, amount, category, merchant, timestamp, *embedding\_blob*).

  * Define `categories` table.

* **Database Migration**:

  * Refactor `src/database/db.ts` to initialize Drizzle with `expo-sqlite`.

  * Create a utility to migrate existing data from the old tables to the new Drizzle schema.

* **Vector Store Implementation**:

  * Implement a mechanism to store embedding vectors (as BLOBs or JSON) alongside transaction descriptions.

  * Create a `VectorSearchService` to perform cosine similarity searches against these embeddings.

## 3. The "Brain" - AI Runtime & Logic (Phase 3)

We will set up the local LLM runtime and the "Retrieval Loop".

* **Model Management**:

  * Create a `ModelService` to handle downloading/loading the Llama 3.2 1B `.pte` model on first boot.

* **Inference Engine (`src/services/ai/inference.ts`)**:

  * Implement `useLLM` hook using `react-native-executorch`.

  * Create the "System Prompt" logic to enforce JSON-only output for transaction extraction.

* **RAG Pipeline (`src/services/ai/rag.ts`)**:

  * **Ingestion**: When an expense is added, generate its embedding (using a small embedding model or the LLM itself if supported) and save it.

  * **Retrieval**: When the user queries, convert the query to a vector -> find top-k relevant expenses -> feed to LLM.

## 4. Conversational Interface (Phase 4)

We will build the UI for the user to interact with their ledger.

* **Chat Screen (`src/screens/ChatScreen.tsx`)**:

  * A chat-like interface (like WhatsApp/ChatGPT).

  * Input field for natural language (e.g., "Spent $15 on lunch").

* **Integration**:

  * Connect the chat input to the **Inference Engine**.

  * Display structured responses (e.g., "Added Expense: $15 (Food)").

  * Handle "Query" intents (e.g., "How much did I spend on gas?") by triggering the **RAG Pipeline**.

## 5. Verification & Testing

* **Unit Tests**: Test the JSON extraction logic with various text inputs.

* **Integration Tests**: Verify the full flow: User Input -> LLM -> JSON -> Drizzle Save.

