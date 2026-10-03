// core/modules/dialogueModule.js - 修复停止符过严导致的静默问题

function encodeToPrompt(agentPacket) {
    const { name, archetype, physique, stance, resonance, shortTermGoal = "维持现状" } = agentPacket;
    return `[日志] 实体:\({name}(\){archetype}) 状态[P:\({physique.toFixed(1)} S:\){stance.toFixed(1)} R:\({resonance.toFixed(1)}] 目标:\){shortTermGoal} 自言自语:`;
}

async function dialogueModule(agentPacket) {
    // 1. 【Sample 采样】白名单提取
    const { name, archetype, physique, stance, resonance, intrinsicFactor, shortTermGoal, ...rest } = agentPacket;

    // 2. 【IO 转译】纯状态日志流映射
    const prompt = encodeToPrompt(agentPacket);
    let currentDialogue = "";

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                prompt: prompt,
                stream: false,
                options: { 
                    temperature: 0.7, 
                    num_predict: 20 // 允许足够的字数空间
                }
            }),
            signal: AbortSignal.timeout(2000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.response) {
                // 清洗并提取第一行或有效短句
                const rawText = data.response.trim().split('\n')[0];
                currentDialogue = rawText
                    .replace(/^[:：\s"]+|["\s]+$/g, '')
                    .replace(/^(自言自语|台词|说|角色设定)：?/i, '');
            }
        }
    } catch (e) {
        currentDialogue = "...";
    }

    if (!currentDialogue || currentDialogue.length > 25) {
        currentDialogue = "今天风真大。";
    }

    // 4. 【Transmit 传递】同构打包
    return {
        name,
        archetype,
        intrinsicFactor,
        shortTermGoal,
        physique,
        stance,
        resonance,
        ...rest,
        currentDialogue
    };
}

module.exports = { dialogueModule };