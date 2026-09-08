import { puter } from '@heyputer/puter.js';

async function testNodePuter() {
  console.log('puter keys:', Object.keys(puter));
  console.log('puter.ai keys:', puter.ai ? Object.keys(puter.ai) : null);
  
  try {
    const res = await puter.ai.chat('Hello', { model: 'gpt-4o-mini' });
    console.log('Node puter result:', res);
  } catch (err: any) {
    console.log('Node puter error:', err.message, err.status, err.response?.data);
  }
}

testNodePuter();
