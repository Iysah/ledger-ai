import { useState, useEffect, useRef } from 'react';
// @ts-ignore
import { useLLM, LLAMA3_2_1B_SPINQUANT } from 'react-native-executorch';
import { vectorStore } from './vectorStore';
import { addExpense, getCategoryBudget, getMonthlyCategorySpend } from '../../database/db';
import { PREDEFINED_CATEGORIES } from '../../constants/categories';

export interface AIResponse {
  type: 'transaction' | 'message' | 'error';
  data?: any;
  content?: string;
}

export const useExpenseAI = () => {
  const llm = useLLM({
    model: LLAMA3_2_1B_SPINQUANT,
  });

  const [result, setResult] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const stateRef = useRef<'idle' | 'extracting' | 'rag_gen'>('idle');
  const processingRef = useRef(false);
  const queryRef = useRef('');

  useEffect(() => {
    // We only act when generation finishes
    if (llm.isGenerating) return;
    if (stateRef.current === 'idle') return;
    if (processingRef.current) return;

    const processStep = async () => {
      processingRef.current = true;
      try {
        const responseText = llm.response;
        
        if (stateRef.current === 'extracting') {
        let parsedResult;
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          console.warn("Failed to parse JSON");
        }

        if (parsedResult && parsedResult.amount) {
          // It's a transaction
          try {
            const expenseId = await addExpense({
              amount: parsedResult.amount,
              category: parsedResult.category || 'Uncategorized',
              merchant: parsedResult.merchant || null,
              description: queryRef.current,
              date: new Date().toISOString(),
              receipt_image_uri: null,
            });

            const mockEmbedding = Array(128).fill(0).map(() => Math.random());
            await vectorStore.addEmbedding(expenseId, mockEmbedding);

            // Fetch budget info
            const category = parsedResult.category || 'Uncategorized';
            const budgetLimit = await getCategoryBudget(category);
            let budgetInfo = null;
            
            if (budgetLimit !== null) {
               const currentSpend = await getMonthlyCategorySpend(category);
               // currentSpend includes the just added expense
               budgetInfo = {
                 limit: budgetLimit,
                 remaining: budgetLimit - currentSpend,
                 spend: currentSpend
               };
            }

            setResult({ 
              type: 'transaction', 
              data: { 
                ...parsedResult, 
                id: expenseId,
                budget: budgetInfo 
              } 
            });
          } catch (e) {
            setResult({ type: 'error', content: "Failed to save expense." });
          }
          stateRef.current = 'idle';
          setIsProcessing(false);
        } else {
          // It's a query or failed extraction -> Treat as query (RAG)
          stateRef.current = 'rag_gen';
          
          // RAG Logic
          const queryVector = Array(128).fill(0).map(() => Math.random());
          const contextDocs = await vectorStore.search(queryVector, 5);
          const contextText = contextDocs.map(d => 
            `- ${d.date}: ${d.merchant || 'Expense'} ($${d.amount}) - ${d.category}`
          ).join('\n');

          const ragPrompt = `Context:\n${contextText}\n\nUser Question: "${queryRef.current}"\nAnswer the question based on the context provided.`;
          
          // Trigger next generation step
          llm.generate([{ role: 'user', content: ragPrompt }]).catch(e => {
            console.error("RAG generation failed", e);
            setResult({ type: 'error', content: "Failed to generate answer." });
            stateRef.current = 'idle';
            setIsProcessing(false);
          });
        }
      } else if (stateRef.current === 'rag_gen') {
        // RAG generation finished
        setResult({ type: 'message', content: responseText });
        stateRef.current = 'idle';
        setIsProcessing(false);
      }
      } finally {
        processingRef.current = false;
      }
    };

    processStep();
  }, [llm.isGenerating]);

  const sendMessage = async (text: string) => {
    if (!llm.isReady) {
        setResult({ type: 'error', content: "Model is loading..." });
        return;
    }
    
    setIsProcessing(true);
    setResult(null);
    queryRef.current = text;
    stateRef.current = 'extracting';

    const categoriesList = PREDEFINED_CATEGORIES.map(c => c.name).join(', ');
    const currentDate = new Date().toISOString().split('T')[0];

    const systemPrompt = `
    You are a specialized Financial Data Extraction engine for a private ledger.
    Your ONLY goal is to parse user text into a structured JSON schema.

    CONTEXT:
    - Today's Date: ${currentDate}
    - Valid Categories: [${categoriesList}]

    RULES:
    1. Classification: Determine if the input is an 'entry' (logging an expense) or a 'query' (asking for information).
    2. Normalization:
       - Always convert relative dates (e.g., "yesterday", "last Friday") to YYYY-MM-DD based on Today's Date.
       - If a category doesn't perfectly match, map it to the closest 'Valid Category'. If no match is even remote, use 'Uncategorized'.
    3. Data Integrity:
       - Amounts must be pure numbers.
       - If the user mentions a merchant like "Starbucks", extract it. If not, set to null.
    4. Response Format: Return ONLY valid JSON. No conversational text, no markdown blocks.
    `;

    const userPrompt = `Input: "${text}"`;

    await llm.generate([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);
  };

  return {
    sendMessage,
    result,
    isProcessing,
    modelReady: llm.isReady,
    downloadProgress: llm.downloadProgress
  };
};
