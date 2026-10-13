// core/modules/deepseekTranslator.js - 纯粹的状态到感官语义转译算子

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

    // 辅助符号化，强行暴露正负号
    const fmt = (v) => (v >= 0 ? `+${v.toFixed(1)}` : `${v.toFixed(1)}`);

    // 极简、严密的硬转换契约：不给它谈“提示词”、“角色扮演”等元标签的机会
    const prompt = `将以下实体的状态信息转换为一段简短的当前状态的纯文本提示词。

【数值映射法则】
- 体力（正值=充沛/强健，负值=虚弱/疲惫）
- 信心（正值=坚定/自信，负值=迷茫/低落/沮丧）
- 感官（正值=敏锐/警觉，负值=迟钝/恍惚）

【铁律】
1. 若数值为负，必须表达负面状态，严禁将其逆转为乐观或坚定。
2. 严禁虚构未提供的动作、道具或具体经历。



<实体数据>
角色：${region}的${profession} ${name}
体力：${fmt(physique)}
信心：${fmt(stance)}
感官：${fmt(resonance)}
环境压强：${ambientEnergy.toFixed(2)}
</实体数据>

状态快照输出：`;

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
                    temperature: 0.1, 
                    num_predict: 96, 
                    num_ctx: 512 
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

        // 1. 清理思绪标签
        let cleanText = rawContent.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        
        // 2. 如果模型不小心带了 Markdown 代码块（```text ... ```），顺手剥离掉
        cleanText = cleanText.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "").trim();

        // 3. 【核心修复】：不能只取第一行，必须保留完整的多行模板
        const finalPrompt = cleanText.replace(/^["「]|["」]$/g, '').trim();

        if (!finalPrompt) throw new Error("清洗后正文为空");

        return {
            ...agentPacket,
            sensoryPrompt: finalPrompt, // 这里将完整的多行模板交接给 Mailbox
            translationStatus: "success"
        };

    } catch (error) {
        console.warn(`[DeepSeek 转译失败] ${name} | 原因: ${error.message}`);
        const fallbackPrompt = `${region}的${profession} ${name}，感觉体力${physique >= 0 ? '充沛' : '虚弱'}，内心${stance >= 0 ? '坚定' : '低落'}，感官${resonance >= 0 ? '敏锐' : '迟钝'}。`;
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