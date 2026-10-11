// core/modules/deepseekTranslator.js - 纯净的局域状态测算器

async function translateStateWithDeepSeek(agentPacket) {
    const { 
        name = "未知实体", 
        profession = "流民", 
        region = "荒野", 
        physique = 0.0, 
        stance = 0.0, 
        resonance = 0.0, 
        ambientEnergy = 0.5 
    } = agentPacket;

    // 0-中心对称张力计算：0 为绝对平衡点
    const tension = Math.abs(physique) * 0.3 + Math.abs(stance) * 0.4 + Math.abs(resonance) * 0.3;

    if (tension < 1.0) {
        return {
            sensoryPrompt: "",
            translationStatus: "skipped"
        };
    }

    const prompt = `当前局部状态：
身份：${region}的${profession} ${name}
活力P=${physique.toFixed(1)}（0正常，正充沛，负疲惫）
信心S=${stance.toFixed(1)}（0平常，正自信，负低落）
感官R=${resonance.toFixed(1)}（0正常，正敏锐，负迟钝）
绝对值越大，感受越强。
环境压强=${ambientEnergy.toFixed(2)}。

只输出一句客观的身体与心理感受，最多25字。绝对不要AI废话，绝对不要台词。`;

    const startedAt = Date.now();
    console.log(`[转译开始] ${name} (势能张力: ${tension.toFixed(2)})`);

    try {
        const response = await fetch("http://localhost:11434/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "qwen2.5:0.5b",
                messages: [{ role: "user", content: prompt }],
                stream: false,
                keep_alive: "1h",
                options: { temperature: 0.3, num_predict: 48, num_ctx: 512 }
            }),
            signal: AbortSignal.timeout(15000)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const content = String(data?.message?.content || "").trim();
        const duration = Date.now() - startedAt;

        console.log(`[转译响应] ${name} | 耗时=${duration}ms`);

        if (!content) throw new Error("正文为空");

        const cleanText = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
        const line = cleanText.split(/\r?\n/).find(t => t.trim());

        if (!line) throw new Error("无有效文本");

        return {
            sensoryPrompt: line.replace(/^["「]|["」]$/g, '').trim(),
            translationStatus: "success"
        };

    } catch (error) {
        console.warn(`[转译失败] ${name} | 原因: ${error.message}`);
        return {
            sensoryPrompt: "",
            translationStatus: "failed"
        };
    }
}

// 唯一标准的具名导出
module.exports = { translateStateWithDeepSeek };