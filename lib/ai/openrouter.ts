export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateWithOpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function callOpenRouter(
  messages: OpenRouterMessage[],
  options: GenerateWithOpenRouterOptions = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error("OPENROUTER_API_KEY_MISSING");
  }

  const model = options.model || "google/gemini-2.0-flash-001";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "HTTP-Referer": "https://stak.co.in",
      "X-Title": "Stak AI Content Engine",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 3500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenRouter API error:", response.status, errorText);
    throw new Error(`OpenRouter Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response returned from OpenRouter");
  }

  return content.trim();
}

