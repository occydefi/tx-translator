const Anthropic = require('@anthropic-ai/sdk').default;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchTransaction(signature) {
  // Use Solana public RPC
  const rpcUrl = 'https://api.mainnet-beta.solana.com';

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTransaction',
      params: [
        signature,
        { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transaction from Solana RPC');
  }

  const data = await response.json();

  if (!data.result) {
    throw new Error('Transaction not found');
  }

  return data.result;
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
    timestamp: txData.blockTime ? new Date(txData.blockTime * 1000).toISOString() : null,
    type: 'TRANSACTION',
    fee: txData.meta?.fee ? (txData.meta.fee / 1e9).toFixed(6) + ' SOL' : null,
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
