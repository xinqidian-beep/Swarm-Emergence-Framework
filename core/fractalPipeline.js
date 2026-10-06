// core/fractalPipeline.js - 四元分形闭环流水线（集成 DeepSeek 神经转译）
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { buildOrganicPrompt } = require('./modules/organicNarrative');
const { dialogueModule } = require('./modules/transmitModule');

async function runFractalPipeline(sensoryPacket) {
    // 1. 让 DeepSeek 把冷冰冰的数字翻译成温热的生物直觉,【神经转译层】让 DeepSeek 把冷冰冰的数字转译为温热的生物直觉
    const phenomenon = await translateStateWithDeepSeek(sensoryPacket);
    
    // 2. 将直觉封装进 organicNarrative 生成无缝文学背景,【叙事织网层】将直觉和记忆融合成无缝的文学前置背景
    const organicContext = buildOrganicPrompt({
        ...sensoryPacket,
        phenomenon: phenomenon
    });

    // 3. 传给主力对话生成模块,【主力激发层】让 0.5B 主模型顺着文学背景涌现出灵魂台词
    // 注意：这里把封装好的 organicContext 传递给对话模块
    const processedAgent = await dialogueModule({
        ...sensoryPacket,
        organicContext: organicContext
    });
    return processedAgent;
}
module.exports = { runFractalPipeline };