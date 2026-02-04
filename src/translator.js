const Anthropic = require('@anthropic-ai/sdk').default;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchTransaction(signature) {
  const heliusKey = process.env.HELIUS_API_KEY;

  // Use Helius parse transaction API
  const url = `https://api.helius.xyz/v0/transactions?api-key=${heliusKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions: [signature] }),
  });

  if (!response.ok) {
    // Try alternative: get raw transaction and parse
    const altUrl = `https://api.helius.xyz/v0/parsed-transactions/${signature}?api-key=${heliusKey}`;
    const altResponse = await fetch(altUrl);

    if (altResponse.ok) {
      return await altResponse.json();
    }
    throw new Error('Failed to fetch transaction from Helius');
  }

  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error('Transaction not found');
  }

  return data[0];
}

async function translateTransaction(signature) {
  // Fetch transaction data
  const txData = await fetchTransaction(signature);

  // Build context for Claude
  const prompt = buildPrompt(txData);

  // Get explanation from Claude
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const explanation = message.content[0].text;

  return {
    signature,
    explanation,
    timestamp: txData.timestamp ? new Date(txData.timestamp * 1000).toISOString() : null,
    type: txData.type || 'UNKNOWN',
    fee: txData.fee ? (txData.fee / 1e9).toFixed(6) + ' SOL' : null,
  };
}

function buildPrompt(txData) {
  return `You are TX-Translator, an AI agent that explains Solana blockchain transactions in simple, clear language that anyone can understand.

Analyze this transaction and explain what happened in plain language. Be concise but complete. Use bullet points for multiple actions.

Transaction Data:
${JSON.stringify(txData, null, 2)}

Guidelines:
- Explain WHO did WHAT (e.g., "This wallet swapped 10 SOL for 50,000 BONK")
- Mention the platforms/protocols involved (Jupiter, Raydium, etc.)
- Include amounts and token names
- Note any fees paid
- If it's a failed transaction, explain why
- Keep it under 200 words
- Use simple language, avoid jargon
- Format with bullet points if multiple actions

Respond in English. Start directly with the explanation, no preamble.`;
}

module.exports = { translateTransaction };
