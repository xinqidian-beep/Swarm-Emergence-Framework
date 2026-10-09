// core/fractalPipeline.js - 五段式神经分形闭环流水线（自持同构与语义反哺闭环版）
const { dynamicsModule } = require('./modules/dynamicsModule');
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { buildOrganicPrompt } = require('./modules/organicNarrative');
const { dialogueModule } = require('./modules/transmitModule');
const { applySemanticFeedback } = require('./modules/feedbackModule');

/**
* 驱动局域同构信息包流经五段式神经分形闭环
* @param {Object} agentPacket - 包含实体全量状态与局域环境场的同构包
* @returns {Promise<Object>} 演化完成并经过语义反哺的最终同构包
*/
async function runFractalPipeline(agentPacket) {
    try {
        // 1. 【Dynamics 阶段】调用非线性物理动力学引擎，演化 P, S, R 与内生记忆
        const evolvedPacket = dynamicsModule(agentPacket);

        // 2. 【IO / 神经转译层】潜意识中枢转译物理直觉
        const phenomenon = await translateStateWithDeepSeek(evolvedPacket);

        // --- 【DIAGNOSTIC PROBE】 ---
        if (typeof phenomenon !== 'string') {
            console.warn(`[探针警告] 实体 ${agentPacket.name} 的 phenomenon 返回了非字符串类型:`, typeof phenomenon, phenomenon);
        }
        // ---------------------------

        const safePhenomenon = typeof phenomenon === 'string' ? phenomenon : String(phenomenon || "");

        if (!safePhenomenon || safePhenomenon.trim() === "") {
            return {
                ...evolvedPacket,
                currentDialogue: "",
                cognitivePrompt: "（静默区：物理张力未达临界阈值）"
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
        
    } catch (error) {
        console.error(`[分形流水线异常] 实体 ${agentPacket.name || '未知'} 演化流断裂:`, error.message);
        // 异常兜底：保持原样同构返回，确保系统“不死不崩”
        return {
            ...agentPacket,
            currentDialogue: "...",
            cognitivePrompt: "（流水线感官自锁）"
        };
    }
}

module.exports = { runFractalPipeline };