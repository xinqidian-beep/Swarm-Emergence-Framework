// core/fractalPipeline.js - 五段式神经分形闭环流水线（严格对齐版）
const { dynamicsModule } = require('./modules/dynamicsModule');
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { buildOrganicPrompt } = require('./modules/organicNarrative');
const { dialogueModule } = require('./modules/transmitModule');
const { applySemanticFeedback } = require('./modules/feedbackModule');

async function runFractalPipeline(agentPacket) {
    // 1. 【Dynamics 阶段】调用非线性物理动力学引擎，演化 P, S, R 与记忆衰减
    const evolvedPacket = dynamicsModule(agentPacket);

    // 2. 【IO / 神经转译层】DeepSeek 潜意识中枢转译物理直觉
    const phenomenon = await translateStateWithDeepSeek(evolvedPacket);

    // 3. 【叙事织网层】织入文学前置背景
    const organicContext = buildOrganicPrompt({
        ...evolvedPacket,
        phenomenon: phenomenon
    });

    // 4. 【Transmit 主力激发层】Qwen 语言中枢涌现灵魂台词
    const communicatedAgent = await dialogueModule({
        ...evolvedPacket,
        organicContext: organicContext
    });

    // 5. 【Feedback 反哺阶段】将当前台词作为 currentDialogue 注入语义反哺网关，畸变底层物理场
    const finalizedAgent = applySemanticFeedback({
        ...communicatedAgent,
        currentDialogue: communicatedAgent.dialogue
    });

    return finalizedAgent;
}

module.exports = { runFractalPipeline };