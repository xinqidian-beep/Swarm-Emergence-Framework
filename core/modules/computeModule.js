// core/modules/computeModule.js - 带全链路诊断探针的神经转译算子

function resolveNarrativeAnchor(physique, stance, resonance) {
    let stanceDesc = "心态平稳，顺应自然";
    if (stance > 2.0) stanceDesc = "内生抗拒，警惕防备";
    else if (stance < -2.0) stanceDesc = "顺从柔和，易于接受";

    let resonanceDesc = "心如止水，与世隔绝";
    if (resonance > 3.0) resonanceDesc = "强烈渴望连接与共鸣";
    else if (resonance < 1.0) resonanceDesc = "冷漠孤立，封闭自我";

    let energyDesc = "精力充沛";
    if (physique < 2.0) energyDesc = "疲惫困顿，步履维艰";

    return `[心境投影] ${energyDesc}，${stanceDesc}，${resonanceDesc}`;
}

async function computeModule(agentPacket, llmClient) {
    const { 
        name, 
        role, 
        location, 
        physique = 0.0, 
        stance = 0.0, 
        resonance = 0.0, 
        ambientEnergy = 0.5,
        memoryBuffer = [] 
    } = agentPacket;

    console.log(`[探针-1: 进入 Compute] 正在计算实体: ${name}`);

    // 1. 势能门控探针
    const innerTension = Math.abs(stance) * 0.5 + Math.abs(resonance) * 0.5;
    const activationThreshold = 1.8;
    console.log(`[探针-2: 势能计算] ${name} 张力=${innerTension.toFixed(2)} (阈值: ${activationThreshold})`);

    if (innerTension < activationThreshold) {
        console.log(`[探针-3: 门控拦截] ${name} 张力不足，保持物理静默。`);
        return {
            ...agentPacket,
            currentDialogue: "" 
        };
    }

    console.log(`[探针-4: 唤醒转译] ${name} 张力达标，准备调用 LLM 转译...`);

    const narrativeState = resolveNarrativeAnchor(physique, stance, resonance);
    const memoryContext = memoryBuffer.length > 0 
        ? memoryBuffer.map(m => `- ${m.text}`).join('\n') 
        : "无显著记忆残留";

    const systemPrompt = `[神经转译契约]
实体档案: ${name} (${role} @ ${location})
${narrativeState}
环境压强: ${ambientEnergy}
近期记忆:
${memoryContext}

输出规范:
根据上述实体档案与心境投影，输出该实体在当前瞬间脱口而出的单行原生台词文本。`;

    let dialogue = "";

    try {
        console.log(`[探针-5: 发起 API 请求] 正在向 LLM 发送请求 (${name})...`);
        const response = await llmClient.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "涌现一句台词：" }
            ],
            temperature: 0.3,
            max_tokens: 40
        });

        const rawOutput = response.choices[0].message.content.trim();
        console.log(`[探针-6: API 响应成功] ${name} 原始输出: "${rawOutput}"`);
        
        if (rawOutput.length > 0) {
            dialogue = rawOutput;
        }
    } catch (error) {
        console.error(`[探针-X: 捕获异常] ${name} 转译过程报错:`, error.message);
        if (stance > 2.0) {
            dialogue = `${name}警惕地环视四周。`;
        } else {
            dialogue = `${name}陷入了沉思。`;
        }
    }

    console.log(`[探针-7: 组装返回] ${name} 最终台词: "${dialogue}"`);
    return {
        ...agentPacket,
        currentDialogue: dialogue
    };
}

module.exports = { computeModule };