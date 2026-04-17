export async function getAIResponse(messages: { role: string, content: string }[]) {
  try {
    const sysInstruction = {
      role: 'system',
      content: "You are Gini, a professional and concise AI assistant. Your goal is to be direct and helpful. You understand and reply in both English and Hindi. If the user speaks in Hindi, reply in Hindi. Keep responses brief and professional."
    };

    const formattedMessages = [sysInstruction, ...messages.map(msg => ({
      role: msg.role === 'ai' || msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }))];

    const passkey = sessionStorage.getItem('gini_passkey') || "";
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Site-Passkey': passkey
      },
      body: JSON.stringify({ messages: formattedMessages })
    });
    
    if (!response.ok) {
      throw new Error(`Chat API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
}
