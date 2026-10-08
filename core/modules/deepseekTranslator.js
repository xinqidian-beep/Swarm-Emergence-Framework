// core/modules/deepseekTranslator.js - 状态到提示词的认知转译器（接口契约对齐版）

async function translateStateWithDeepSeek(agentPacket) {
    const { name, profession, region, physique, stance, resonance, ambientEnergy } = agentPacket;

    // 1. 势能门控：低张力下无需生成复杂认知提示词
    const innerTension = Math.abs(stance) * 0.5 + Math.abs(resonance) * 0.5;
    if (innerTension < 1.3) {
        return ""; // 返回空字符串，交由流水线判定静默
    }

    // 2. 核心职责：将全量状态拓扑，转译为富有张力的“认知与躯体感知提示词”
    const environmentalFieldPrompt = `【时空域：${region} · ${profession} ${name}】
当前肉体与心境状态：
- 体质势能 P: ${Number(physique).toFixed(2)}
- 心理立场 S: ${Number(stance).toFixed(2)}
- 感知谐振 R: ${Number(resonance).toFixed(2)}
- 环境场压: ${Number(ambientEnergy).toFixed(2)}

任务：请根据上述客观状态，为该实体生成一段**内隐的心理独白与躯体触感基调提示词**（约30-50字），供后续语言模型用来生成即时台词。
要求：直接输出提示词内容。`;

    let cognitivePromptContext = "周围一片寂静，呼吸平稳。";

    try {
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "deepseek-r1:1.5b", // 负责深层推理与状态转译
                messages: [
                    {
                        role: "system",
                        content: "你是一个深谙物理感官与心理变化的文学解构者，负责将多维物理状态精准转译为具身心理提示词。"
                    },
                    {
                        role: "user",
                        content: translationPrompt
                    }
                ],
                stream: false,
                options: {
                    temperature: 0.5,
                    num_predict: 60 
                }
            }),
            signal: AbortSignal.timeout(15000)
        });

        if (response.ok) {
            const data = await response.json();
            if (data && data.message && data.message.content) {
                let raw = data.message.content.trim();
                // 清洗推理思考标签
                raw = raw.replace(/[\s\S]*?<\/think>/g, '').trim();
                if (raw.length > 0) {
                    cognitivePromptContext = raw.replace(/^["「]|["」]$/g, '');
                }
            }
        }
    } catch (e) {
        cognitivePromptContext = `实体${name}感官受阻，陷入局部时空滞重。`;
    }

    // 3. 返回由 DeepSeek 转译生成的“认知提示词”，供下游模块消费
    return cognitivePromptContext;
}

// 导出与 fractalPipeline.js 严格契约对齐的函数名
module.exports = { translateStateWithDeepSeek };