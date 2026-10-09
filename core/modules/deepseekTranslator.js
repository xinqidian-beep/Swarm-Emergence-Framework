// core/modules/deepseekTranslator.js - 明确以“撰写状态提示词”为契约的转译模块

async function translateStateWithDeepSeek(agentPacket) {
    const { 
        name = "未知实体", 
        profession = "流民", 
        region = "荒野", 
        physique = 0.0, 
        stance = 0.0, 
        resonance = 0.0, 
        ambientEnergy = 0.5, 
        ...rest 
    } = agentPacket;

    const totalTension = Math.abs(physique) * 0.3 + Math.abs(stance) * 0.4 + Math.abs(resonance) * 0.3;
    if (totalTension < 1.0) {
        return ""; 
    }

    // 【核心契约调整】：明确告知 DeepSeek 它的工作是“撰写下游状态提示词”
    const promptWriterTemplate = `【你的任务】
为下游的叙事引擎撰写一段关于该实体的**“身体感觉与心理压力的状态提示词”**。

【输入数据】
- 角色目标：${region}的${profession} ${name}
- 活力 P = ${physique.toFixed(1)}
- 立场 S = ${stance.toFixed(1)}
- 感知 R = ${resonance.toFixed(1)}
- 环境压强 = ${ambientEnergy.toFixed(2)}

【核心映射规则】
1. 0 是正常平衡点。
2. 绝对值越大（离 0 越远，向 -5 或 +5 靠近）：角色受到的身体负荷、心理撕裂感和压迫阻力就越极端、越沉重。
   - P：正代表肌肉贲张、气血翻涌；负代表四肢沉重、快要虚脱。
   - S：正代表死死咬定、固执如铁；负代表信念坍塌、直犯嘀咕。
   - R：正代表耳朵刺痛、神经紧绷；负代表感官封闭、像掉进真空。

【输出要求】
仅输出一句话作为该角色的状态感官提示词（例如：“手臂肌肉酸胀得发抖”、“心里像塞了一团乱麻”）。`;

    let resultText = "呼吸平稳，身体保持着基本的平衡。";

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "deepseek-r1:1.5b",
                messages: [
                    {
                        role: "system",
                        content: "你是一个专门为下游叙事引擎撰写角色状态提示词的生成器。"
                    },
                    {
                        role: "user",
                        content: promptWriterTemplate
                    }
                ],
                stream: false,
                options: {
                    temperature: 0.2,
                    num_predict: 96
                }
            }),
            signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
            const data = await response.json();
            const rawContent = data?.message?.content || "";
            
            if (rawContent.length > 0) {
                let cleanText = rawContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
                if (cleanText.length === 0 && rawContent.includes("<think>")) {
                    const innerThink = rawContent.replace(/<\/?think>/g, '').trim();
                    cleanText = innerThink.split(/[。！？\n]/).filter(s => s.trim().length > 2)[0] || "";
                }
                if (cleanText.length > 0) {
                    resultText = cleanText.split('\n')[0].replace(/^["「]|["」]$/g, '');
                }
            }
        }
    } catch (e) {
        resultText = `${name}的身体在局域压强中微微一沉。`;
    }

    if (typeof resultText !== 'string') {
        resultText = String(resultText || "内稳态维持中。");
    }

    return resultText;
}

module.exports = { translateStateWithDeepSeek };