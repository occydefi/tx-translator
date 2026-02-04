require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { translateTransaction } = require('./translator');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', agent: 'TX-Translator' });
});

// Main endpoint - translate transaction
app.post('/api/translate', async (req, res) => {
  try {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Transaction signature required' });
    }

    // Clean the signature (remove Solscan URL if pasted)
    const cleanSig = signature
      .replace('https://solscan.io/tx/', '')
      .replace('https://explorer.solana.com/tx/', '')
      .trim();

    const result = await translateTransaction(cleanSig);
    res.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message || 'Failed to translate transaction' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`TX-Translator running on http://localhost:${PORT}`);
});
