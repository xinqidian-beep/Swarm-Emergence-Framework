// core/modules/dialogue.js - 纯粹的本地 LLM 驱动（已彻底移除所有静态预设台词）

// 【转译层】：白名单提取局域参数并转译为提示词
function translateStateToPrompt(name, stance, resonance) {
    const localValence = stance + (resonance - 5) * 0.05;
    const mood = localValence < 0 ? "警惕排外" : "平静温和";
    
    // 给 qwen2.5:0.5b 的极简原子化指令
    return `角色:\({name}，心境:\){mood}。说一句老滚5居民的日常短句，12字以内，不要解释：`;
}

async function processDialogue(agent) {
    // 【白名单原则】：只取用当前模块需要的局部参数
    const { name, stance, resonance, ...rest } = agent;

    const prompt = translateStateToPrompt(name, stance, resonance);
    let currentDialogue = "[等待模型响应...]";

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                prompt: prompt,
                stream: false,
                options: { 
                    temperature: 0.6, // 稍微放开一点温度，看它能不能自由发挥
                    num_predict: 20 
                }
            }),
            signal: AbortSignal.timeout(1500) // 1.5 秒超时保护
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.response) {
                // 剥离多余引号和空白
                currentDialogue = data.response.trim().replace(/^["「『]|["」』]$/g, '');
            }
        }
    } catch (e) {
        currentDialogue = "[LLM请求超时或Ollama未启动]";
    }

    // 【同构打包】：原封不动透传其余未使用的参数
    return {
        name,
        stance,
        resonance,
        ...rest,
        currentDialogue
    };
}

module.exports = { processDialogue };