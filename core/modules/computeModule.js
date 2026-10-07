// core/modules/computeModule.js - 纯正向白名单契约的神经转译算子
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

    // 1. 【Positive Context Ingestion】正向状态输入结构
    const memoryContext = memoryBuffer.length > 0 
        ? memoryBuffer.map(m => `- ${m.text} (权重: ${m.weight.toFixed(2)})`).join('\n') 
        : "无显著记忆残留";

    // 纯正向契约定义：只声明输入包含什么、输出需要什么结构，没有任何否定句式
    const systemPrompt = `[神经转译算子契约]
实体档案: ${name} (${role} @ ${location})
物理场状态: P=${physique}, S=${stance}, R=${resonance}, 场压=${ambientEnergy}
内生记忆流:
${memoryContext}

输出规范:
输出内容必须为该实体在当前物理状态下的单行原生台词文本。`;

    let dialogue = "";

    try {
        const response = await llmClient.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: "生成当前物理状态对应的单行台词：" }
            ],
            temperature: 0.2,
            max_tokens: 50
        });

        const rawOutput = response.choices[0].message.content.trim();
        
        // 正向白名单采纳：只要有有效字符即直接接受
        if (rawOutput.length > 0) {
            dialogue = rawOutput;
        } else {
            throw new Error("Invalid Output Length");
        }

    } catch (error) {
        // 【Deterministic Mathematical Fallback】当网络或算子异常时，由正向物理态势直接映射台词
        if (stance > 2.0) {
            dialogue = `${name}握紧了手中的武器。`;
        } else if (resonance > 3.0) {
            dialogue = `${name}向四周投去探寻的目光。`;
        } else {
            dialogue = `${name}注视着前方。`;
        }
    }

    // 2. 【Homomorphic Passthrough】同构打包透传
    return {
        ...agentPacket,
        currentDialogue: dialogue
    };
}

module.exports = { computeModule };