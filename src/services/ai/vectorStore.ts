import { db } from '../../database/drizzle';
import { expenses } from '../../database/schema';
import { sql, isNotNull, eq } from 'drizzle-orm';
import { Expense } from '../../types';

// Simple cosine similarity in JS
// For production with large datasets, use sqlite-vec or a native module
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / ((Math.sqrt(normA) * Math.sqrt(normB)) || 1);
}

export const vectorStore = {
  /**
   * Add or update embedding for an expense
   */
  async addEmbedding(expenseId: number, embedding: number[]) {
    await db.update(expenses)
      .set({ embedding: JSON.stringify(embedding) })
      .where(eq(expenses.id, expenseId));
  },

  /**
   * Find similar expenses based on query vector
   */
  async search(queryEmbedding: number[], limit: number = 5): Promise<Expense[]> {
    // Fetch all expenses with embeddings
    // In a real app with large data, this fetch-all is inefficient.
    // Optimization: Use react-native-sqlite-vec or filter by recent date first.
    const allExpenses = await db.select().from(expenses).where(isNotNull(expenses.embedding));
    
    const results = allExpenses.map(e => {
      let embedding: number[] = [];
      try {
        embedding = JSON.parse(e.embedding!);
      } catch (err) {
        return { item: e, similarity: -1 };
      }
      
      return {
        item: e,
        similarity: cosineSimilarity(queryEmbedding, embedding)
      };
    });

    // Sort by similarity descending
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, limit).map(r => r.item as Expense);
  }
};
