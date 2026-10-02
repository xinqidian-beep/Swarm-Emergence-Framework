// core/slotMatcher.js (未来升级版：调用本地轻量 LLM)
async function generateLocalLLMDialogue(agent) {
    let mood = "中立";
    if (agent.stance < -0.3) mood = "敌对/抱怨";
    if (agent.stance > 0.3) mood = "友好/乐观";

    const prompt = `角色:\({agent.name}，当前心情:\){mood}。请用一句老滚5风格的简短台词表达当前心境，不要超过20个字，不要输出多余解释。`;

    // 通过 Node.js 内置 fetch 请求本地 Ollama 接口 (以 phi3 为例)
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "phi3:mini",
                prompt: prompt,
                stream: false,
                options: { temperature: 0.7, num_predict: 30 }
            })
        });
        const data = await response.json();
        return data.response.trim();
    } catch (e) {
        return "今天天气真不错。"; // 降级兜底方案，防止本地大模型未启动时报错
    }
}