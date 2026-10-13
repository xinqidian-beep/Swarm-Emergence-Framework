// core/fractalPipeline.js - 异步后台神经分形闭环流水线（无状态隔离与信箱反哺版）
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { buildOrganicPrompt } = require('./modules/organicNarrative');
const { dialogueModule } = require('./modules/transmitModule');
const { applySemanticFeedback } = require('./modules/feedbackModule');

/**
 * 驱动局域同构信息包在后台异步流经语言与感官转译流水线
 * 
 * @param {Object} agentPacket 实体当前状态快照包
 * @returns {Promise<Object>} 包含感官提示词、灵魂台词与私有反馈摄动包的异步结果
 */
async function runFractalPipeline(agentPacket) {
    // 1. 【防串台隔离】严格深拷贝输入包，彻底杜绝并发闭包污染与状态泄漏
    const localPacket = JSON.parse(JSON.stringify(agentPacket));

    try {
        // 2. 【IO / 神经转译层】潜意识中枢转译物理直觉
        const transRes = await translateStateWithDeepSeek(localPacket);

        let sensoryText = "";
        if (typeof transRes === 'string') {
            sensoryText = transRes;
        } else if (transRes && typeof transRes === 'object') {
            sensoryText = transRes.sensoryPrompt || transRes.cognitivePrompt || "";
        }

        sensoryText = String(sensoryText || "").trim();

        // 静默区安全退回
        if (!sensoryText) {
            return {
                sensoryPrompt: "（静默区：转译文本为空）",
                currentDialogue: "...",
                feedbackDelta: { dP: 0, dS: 0, dR: 0 }
            };
        }

        // 3. 【叙事织网层】织入前置背景与心境投影
        const organicContext = buildOrganicPrompt({
            ...localPacket,
            sensoryPrompt: sensoryText,
            phenomenon: sensoryText
        });

        const safeContext = typeof organicContext === 'string' 
            ? organicContext 
            : String(organicContext || "");

        // 4. 【Transmit 主力激发层】语言中枢涌现灵魂台词
        const communicatedAgent = await dialogueModule({
            ...localPacket,
            sensoryPrompt: sensoryText,
            organicContext: safeContext,
            phenomenon: sensoryText
        });

        let rawDialogue = "...";
        if (typeof communicatedAgent === 'string') {
            rawDialogue = communicatedAgent;
        } else if (communicatedAgent && typeof communicatedAgent === 'object') {
            rawDialogue = communicatedAgent.dialogue || communicatedAgent.currentDialogue || "...";
        }

        // 5. 【Feedback 反哺阶段】生成语义反馈摄动 Δ（微分驱动力契约）
        const feedbackResult = applySemanticFeedback({
            ...localPacket,
            currentDialogue: rawDialogue,
            cognitivePrompt: sensoryText
        });

        // 规范化提取微分摄动 Δ，确保其格式为 { dP, dS, dR }
        const feedbackDelta = feedbackResult?.feedbackDelta || feedbackResult?.delta || {
            dP: (Math.random() - 0.5) * 0.04,
            dS: rawDialogue.length > 12 ? 0.05 : -0.02,
            dR: 0.02
        };

        // 6. 返回纯净的异步结果包，供主控总线安全反哺私有信箱
        return {
            sensoryPrompt: sensoryText,
            currentDialogue: rawDialogue,
            feedbackDelta: feedbackDelta
        };
        
    } catch (error) {
        console.warn(`[后台旁路流水线异常] 实体 ${localPacket.name || '未知'} 链路中断: ${error.message}`);
        // 异常兜底：保持静默，确保系统“不死不崩”
        return {
            sensoryPrompt: "（流水线感官自锁）",
            currentDialogue: "...",
            feedbackDelta: { dP: 0, dS: 0, dR: 0 }
        };
    }
}

module.exports = { runFractalPipeline };