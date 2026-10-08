// core/fractalPipeline.js - 五段式神经分形闭环流水线（含中间态认知提示词透传版）
const { dynamicsModule } = require('./modules/dynamicsModule');
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { buildOrganicPrompt } = require('./modules/organicNarrative');
const { dialogueModule } = require('./modules/transmitModule');
const { applySemanticFeedback } = require('./modules/feedbackModule');

async function runFractalPipeline(agentPacket) {
    // 1. 【Dynamics 阶段】调用非线性物理动力学引擎，演化 P, S, R 与内生记忆
    const evolvedPacket = dynamicsModule(agentPacket);

    // 2. 【IO / 神经转译层】潜意识中枢转译物理直觉（内含势能门控）
    const phenomenon = await translateStateWithDeepSeek(evolvedPacket);

    // 如果潜意识由于张力不足而选择静默（phenomenon 为空），则记录静默认知态并跳过下游
    if (!phenomenon || phenomenon.trim() === "") {
        return {
            ...evolvedPacket,
            currentDialogue: "", // 保持物理静默
            cognitivePrompt: "（静默区：物理张力未达临界阈值）" // 暴露 DeepSeek 中间态
        };
    }

    // 3. 【叙事织网层】织入文学前置背景与心境投影
    const organicContext = buildOrganicPrompt({
        ...evolvedPacket,
        phenomenon: phenomenon
    });

    // 4. 【Transmit 主力激发层】语言中枢涌现灵魂台词
    const communicatedAgent = await dialogueModule({
        ...evolvedPacket,
        organicContext: organicContext,
        phenomenon: phenomenon
    });

    // 统一字段映射契约
    const rawDialogue = communicatedAgent.dialogue || communicatedAgent.currentDialogue || "";

    // 5. 【Feedback 反哺阶段】将当前涌现台词注入语义反哺网关，畸变底层物理场
    const finalizedAgent = applySemanticFeedback({
        ...communicatedAgent,
        currentDialogue: rawDialogue,
        cognitivePrompt: phenomenon // 核心：将 DeepSeek 转译出的中间态提示词透传给主控台
    });

    return finalizedAgent;
}

module.exports = { runFractalPipeline };