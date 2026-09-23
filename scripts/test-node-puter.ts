import { defaultGroqProvider, GroqProvider } from '../src/lib/ai/provider';

async function testGroqProvider() {
  console.log('Provider model:', defaultGroqProvider.getModel());
  console.log('Provider available (GROQ_API_KEY configured):', defaultGroqProvider.isAvailable());
  console.log('Provider attribution:', defaultGroqProvider.getAttribution());

  if (defaultGroqProvider.isAvailable()) {
    try {
      const res = await defaultGroqProvider.chat([
        { role: 'user', content: 'Hello, please return the word "GROQ_OK".' }
      ]);
      console.log('Groq chat response:', res);
    } catch (err: any) {
      console.log('Groq chat error:', err?.message);
    }
  } else {
    console.log('GROQ_API_KEY is not configured in process.env. Skipping live call.');
  }
}

testGroqProvider();
