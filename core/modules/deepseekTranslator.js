// core/modules/deepseekTranslator.js - 赋予规则、由 DeepSeek 自主转译的感官算子

function finiteNumber(v, fallback = 0) {
    return (typeof v === 'number' && Number.isFinite(v)) ? v : fallback;
}

function plainText(v, fallback = "") {
    return (typeof v === 'string' && v.trim()) ? v.trim() : fallback;
}

async function translateStateWithDeepSeek(agentPacket) {
    const whitelistedPacket = {
        name: plainText(agentPacket?.name, "未知实体"),
        profession: plainText(agentPacket?.profession, "流民"),
        region: plainText(agentPacket?.region, "荒野"),
        physique: finiteNumber(agentPacket?.physique, 0.0),
        stance: finiteNumber(agentPacket?.stance, 0.0),
        resonance: finiteNumber(agentPacket?.resonance, 0.0),
        ambientEnergy: finiteNumber(agentPacket?.ambientEnergy, 0.5)
    };

    const { name, profession, region, physique, stance, resonance, ambientEnergy } = whitelistedPacket;

    // 为 DeepSeek 设定清晰、不可逾越的转译规则契约
    const prompt = `你是一个底层认知与感官转译算子。
任务：根据输入的实体数学状态，将其转写为一句客观、直接的身体与心理感官的文本提示词。

【转译规则】
1. 状态维度说明：
   - 活力 P（数值越正越充沛，越负越疲惫；绝对值越大感受越强烈）
   - 信心 S（数值越正越坚定，越负越低落）
   - 感官 R（数值越正越敏锐，越负越迟钝）
2. 边界限制：
   - 将当前状态转写成只有文本的提示词。
   
当前输入实体：
身份：${region}的${profession} ${name}
- 活力 P = ${physique.toFixed(1)}
- 信心 S = ${stance.toFixed(1)}
- 感官 R = ${resonance.toFixed(1)}
- 环境压强 = ${ambientEnergy.toFixed(2)}

请根据以上规则直接输出转译结果：`;

    const startedAt = Date.now();
    console.log(`[DeepSeek 转译开始] ${name}`);

    try {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen2.5:1.5b",
                messages: [{ role: "user", content: prompt }],
                stream: false,
                keep_alive: "1h",
                options: { 
                    temperature: 0.1, // 极低温度，压制大模型胡思乱想的倾向，让其严格遵从转译规则
                    num_predict: 128,  // 给足推理模型思考并吐字的空间
                    num_ctx: 1024 
                }
            }),
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const rawContent = String(data?.message?.content || "").trim();
        const duration = Date.now() - startedAt;

        console.log(`[DeepSeek 转译响应] ${name} | 耗时=${duration}ms`);

        if (!rawContent) throw new Error("正文为空");

        // 强健的思维链清理与兜底提取
        let cleanText = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        if (!cleanText) {
            const stripped = rawContent.replace(/<\/?think>/gi, "").trim();
            const lines = stripped.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
            cleanText = lines[lines.length - 1] || "";
        }

        const line = cleanText.split(/\r?\n/).find(t => t.trim());
        if (!line) throw new Error("无有效文本");

        const rawText = line.replace(/^["「]|["」]$/g, '').trim();
        const finalPrompt = Array.from(rawText).slice(0, 250).join("");

        if (!finalPrompt) throw new Error("清洗后正文为空");

        return {
            ...agentPacket,
            sensoryPrompt: finalPrompt,
            translationStatus: "success"
        };

    } catch (error) {
        console.warn(`[DeepSeek 转译失败] ${name} | 原因: ${error.message}`);
        // 优雅降级：当大模型超时或失败时，保留异步脉络，回退到基础状态描述，绝不崩溃
        const fallbackPrompt = `${region}的${profession} ${name}，P=${physique.toFixed(1)}, S=${stance.toFixed(1)}, R=${resonance.toFixed(1)}`;
        return {
            ...agentPacket,
            sensoryPrompt: fallbackPrompt,
            translationStatus: "fallback"
        };
    }
}

translateStateWithDeepSeek.translateStateWithDeepSeek = translateStateWithDeepSeek;
translateStateWithDeepSeek.default = translateStateWithDeepSeek;

module.exports = translateStateWithDeepSeek;