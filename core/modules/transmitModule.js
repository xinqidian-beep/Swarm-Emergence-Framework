// core/modules/transmitModule.js
function encodeToPrompt(agentPacket) {
    const name = agentPacket.name || "流浪者";
    const archetype = agentPacket.archetype || "独行者";
    const shortTermGoal = agentPacket.shortTermGoal || "生存";
    const memoryBuffer = agentPacket.memoryBuffer || [];
    
    const memoryContext = (memoryBuffer.length > 0 && memoryBuffer[memoryBuffer.length - 1].text) 
        ? memoryBuffer[memoryBuffer.length - 1].text 
        : "荒野死寂";

    // 采用标准的模板字符串插值，绝对没有转义污染
    return `\({archetype}\){name}正处于\({shortTermGoal}状态。记忆碎片：\){memoryContext}。他环顾四周，低声自语：“`;
}

async function dialogueModule(agentPacket) {
    let currentDialogue = "...";

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                prompt: encodeToPrompt(agentPacket),
                stream: false,
                options: { 
                    temperature: 0.75, 
                    num_predict: 20 
                }
            }),
            signal: AbortSignal.timeout(3500)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.response) {
                const raw = data.response.trim().split('\n')[0].replace(/["”’]/g, '');
                const isRefusal = raw.includes("sorry") || raw.includes("抱歉") || raw.includes("无法") || raw.includes("AI") || raw.includes("模型") || raw.includes("copyright");
                
                if (raw && !isRefusal) {
                    currentDialogue = raw;
                }
            }
        }
    } catch (e) {
        // 尊重 LLM 时序：超时或异常时静默降级，绝不阻断宏观分形流水线
        currentDialogue = "...";
    }

    return {
        ...agentPacket,
        currentDialogue
    };
}

module.exports = { dialogueModule };