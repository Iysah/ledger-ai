
I will fix the issue of repetitive AI messages and potentially broken multi-turn conversations (RAG flow) by addressing a race condition in the `useExpenseAI` hook.

## Analysis
The user is seeing 5 duplicate messages for a single entry. This indicates that the transaction processing logic (`addExpense`) is running multiple times for the same completion event. This happens because the `useEffect` that triggers processing when `llm.isGenerating` becomes `false` is firing multiple times (likely due to strict mode or rapid state updates), and the existing `stateRef` check is insufficient because it is only updated at the *end* of the async processing function.

Additionally, I identified a potential deadlock in the "Query" (RAG) flow: if `llm.generate` is awaited inside the processing step, the `processingRef` lock would prevent the `useEffect` from handling the completion of that generation step, causing the response to be lost.

## Plan
1.  **Modify `src/services/ai/inference.ts`**:
    *   Introduce a `processingRef` to act as a mutex/lock, preventing multiple concurrent executions of `processStep`.
    *   Guard the entry of `processStep` with this lock.
    *   **Critical**: Remove the `await` keyword when calling `llm.generate()` for the RAG flow. This ensures `processStep` completes immediately after triggering the next stage, releasing the lock so the `useEffect` can fire again when the second generation completes.
    *   Add error handling to the un-awaited `generate` call.

2.  **Verify**:
    *   This change should prevent the 5x duplicate messages.
    *   It should also ensure "Query" requests (which trigger the 2nd stage) still work correctly.

I will perform these changes now.
