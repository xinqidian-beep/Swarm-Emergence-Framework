// core/engine/tickEngine.js - 杜绝嵌套污染的纯净版

const dynamicsModule = require('./modules/dynamicsModule');
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { dialogueModule } = require('./modules/transmitModule');

const pendingDeltaQueue = [];
const activeInferenceAgents = new Set();
const computeQueue = []; 
let isComputeBusy = false;

async function runTick(worldState, tickCount) {
    console.log(`\n--- [自主时空脉冲 Tick #${tickCount}] ---`);

    // 1. 【心脏自主演化与摄动消费】
    for (let agent of worldState.agents) {
        if (!agent.memoryBuffer) agent.memoryBuffer = [];

        // 消费 Δ
        const deltaIndex = pendingDeltaQueue.findIndex(item => item.agentId === agent.name);
        let deltaToApply = { physique: 0, stance: 0, resonance: 0 };

        if (deltaIndex !== -1) {
            const [consumedEvent] = pendingDeltaQueue.splice(deltaIndex, 1);
            deltaToApply = consumedEvent.delta;
            console.log(`  🌊 [消费语言摄动] ${agent.name} 吸收宣泄: ΔP=${deltaToApply.physique.toFixed(2)}, ΔS=${deltaToApply.stance.toFixed(2)}`);
        }

        // 核心演化
        const evolved = dynamicsModule(agent, deltaToApply);

        // 关键防御：只更新数值与状态，绝对不写入任何嵌套对象（彻底切断套娃）
        agent.physique = evolved.physique;
        agent.stance = evolved.stance;
        agent.resonance = evolved.resonance;
        agent.expressionDrive = evolved.expressionDrive;
        agent.endogenousThreshold = evolved.endogenousThreshold;
        agent.wantsToExpress = evolved.wantsToExpress;
        agent.memoryBuffer = evolved.memoryBuffer;

        // 彻底清理旧代码遗留的嵌套脏属性
        delete agent.phenomenon;
        delete agent.cognitivePrompt;
        delete agent.organicContext;

        // 打印实时物理心跳
        console.log(`  * 实体: ${agent.name} (${agent.profession} @ ${agent.region})`);
        console.log(`    [P: ${agent.physique} | S: ${agent.stance} | R: ${agent.resonance} | 驱动: ${agent.expressionDrive} / 阈值: ${agent.endogenousThreshold} (欲言: ${agent.wantsToExpress})]`);
        console.log(`    └─ [当前台词展示]: "${agent.currentDialogue || '...'}"`);

        // 2. 【旁路激发：只读取纯净的快照】
        if (agent.wantsToExpress && !activeInferenceAgents.has(agent.name)) {
            activeInferenceAgents.add(agent.name);

            // 纯净扁平快照（绝对不带任何旧的 prompt 对象）
            const snapshot = {
                name: agent.name,
                profession: agent.profession,
                region: agent.region,
                archetype: agent.archetype || "中立者",
                shortTermGoal: agent.shortTermGoal || "生存",
                physique: agent.physique,
                stance: agent.stance,
                resonance: agent.resonance,
                ambientEnergy: agent.ambientEnergy || 0.2,
                sourceTick: tickCount
            };

            computeQueue.push({ snapshot, liveAgentRef: agent });
        }
    }

    processComputeQueue();
}

async function processComputeQueue() {
    if (isComputeBusy || computeQueue.length === 0) return;
    isComputeBusy = true;

    const task = computeQueue.shift();

    try {
        // Step A: DeepSeek 局域感官测算
        const transRes = await translateStateWithDeepSeek(task.snapshot);

        // 防御：确保提取出的 sensoryPrompt 只是 string
        const sensoryPrompt = typeof transRes === 'object' ? transRes.sensoryPrompt : transRes;

        if (sensoryPrompt && typeof sensoryPrompt === 'string') {
            console.log(`    🔍 [DeepSeek 状态转译] ${task.snapshot.name}: "${sensoryPrompt}"`);

            // Step B: Qwen 角色具现化
            const dialRes = await dialogueModule({
                ...task.snapshot,
                sensoryPrompt
            });

            const dialogueText = typeof dialRes === 'object' ? dialRes.currentDialogue : dialRes;

            if (dialogueText && typeof dialogueText === 'string') {
                // 安全挂载台词纯字符串用于展示，绝不做 Object.assign(agent, dialRes)
                task.liveAgentRef.currentDialogue = dialogueText;
                console.log(`    🗣️ [Qwen 具现化台词] ${task.snapshot.name}: "${dialogueText}"`);

                // Step C: 反向同构编译 -> 有限摄动 Δ 压入队列
                const deltaStance = -task.snapshot.stance * 0.12;
                const deltaPhysique = -task.snapshot.physique * 0.03;

                pendingDeltaQueue.push({
                    agentId: task.snapshot.name,
                    sourceTick: task.snapshot.sourceTick,
                    delta: {
                        physique: Number(deltaPhysique.toFixed(4)),
                        stance: Number(deltaStance.toFixed(4)),
                        resonance: 0
                    }
                });
            }
        }
    } catch (e) {
        console.warn(`    [算力调度异常] ${task.snapshot.name}: ${e.message}`);
    } finally {
        activeInferenceAgents.delete(task.snapshot.name);
        isComputeBusy = false;

        if (computeQueue.length > 0) {
            setImmediate(processComputeQueue);
        }
    }
}

module.exports = { runTick };