// core/engine/tickEngine.js - 严格自主的心脏脉冲与同构异步旁路引擎
const { translateStateWithDeepSeek } = require('../modules/deepseekTranslator');
const dialogueModule = require('../modules/transmitModule');
const { dynamicsModule } = require('../modules/dynamicsModule');

// 局域异步摄动事件队列（只存纯粹的 Δ，不存旧实体）
const pendingDeltaQueue = [];

// 后台推理任务锁：防止同一个实体在后台重叠排队
const activeInferenceAgents = new Set();

/**
 * 核心时空脉冲（Tick）：绝对自主、纯数学推进、绝不因大模型而挂起
 */
async function runTick(worldState, tickCount) {
    console.log(`\n--- [自主时空脉冲 Tick #${tickCount}] ---`);

    // 1. 【心脏绝对自主演化与摄动消费】
    for (let agent of worldState.agents) {
        if (!agent.memoryBuffer) agent.memoryBuffer = [];

        // 检索该实体是否有待消费的语言宣泄扰动 Δ
        const deltaIndex = pendingDeltaQueue.findIndex(item => item.agentId === agent.name);
        let deltaToApply = { physique: 0, stance: 0, resonance: 0 };

        if (deltaIndex !== -1) {
            const [consumedEvent] = pendingDeltaQueue.splice(deltaIndex, 1);
            deltaToApply = consumedEvent.delta;
            console.log(`  🌊 [消费语言摄动] ${agent.name} 吸收了 Tick #${consumedEvent.sourceTick} 的宣泄: ΔP=${deltaToApply.physique.toFixed(2)}, ΔS=${deltaToApply.stance.toFixed(2)}`);
        }

        // 核心微积分演化：X_{k+1} = F(X_k, Delta, E_k)
        const evolvedState = dynamicsModule(agent, deltaToApply);

        // 提交新状态到当前实体
        Object.assign(agent, evolvedState);

        // 打印实时物理心跳
        const p = Number(agent.physique || 0).toFixed(2);
        const s = Number(agent.stance || 0).toFixed(2);
        const r = Number(agent.resonance || 0).toFixed(2);
        console.log(`  · [心脏心跳] ${agent.name} (${agent.profession}) | P: ${p} | S: ${s} | R: ${r}`);
    }

    // 2. 【非阻塞异步旁路触发】
    for (let agent of worldState.agents) {
        if (activeInferenceAgents.has(agent.name)) continue;

        // 计算当前相空间张力
        const tension = Math.abs(agent.physique) * 0.3 + Math.abs(agent.stance) * 0.4 + Math.abs(agent.resonance) * 0.3;

        // 阈值激发波函数坍塌（例如 1.8）
        if (tension >= 1.8) {
            activeInferenceAgents.add(agent.name);

            // 复制一份轻量快照送入后台，主循环继续向前奔跑，绝不等待
            const agentSnapshot = {
                agentId: agent.name,
                name: agent.name,
                profession: agent.profession,
                region: agent.region,
                archetype: agent.archetype || "中立者",
                shortTermGoal: agent.shortTermGoal || "生存",
                physique: agent.physique,
                stance: agent.stance,
                resonance: agent.resonance,
                ambientEnergy: agent.ambientEnergy,
                sourceTick: tickCount
            };

            triggerAsyncBypassPipeline(agentSnapshot, tickCount).finally(() => {
                activeInferenceAgents.delete(agent.name);
            });
        }
    }
}

/**
 * 独立的异步旁路管线：采样 -> 测算 -> 具现 -> 编译为有限 Δ 推入队列
 */
async function triggerAsyncBypassPipeline(snapshot, sourceTick) {
    try {
        // 步骤 A: DeepSeek 局域感官测算（输入数值，输出 sensoryPrompt）
        const transResult = await translateStateWithDeepSeek(snapshot);
        if (transResult.translationStatus !== "success" || !transResult.sensoryPrompt) {
            return;
        }

        const sensoryPrompt = transResult.sensoryPrompt;
        console.log(`    🔍 [旁路感官测算] ${snapshot.name} -> "${sensoryPrompt}"`);

        // 步骤 B: Qwen 具现化角色台词（输入 sensoryPrompt + 白名单身份）
        const dialogueRes = await dialogueModule({
            ...snapshot,
            sensoryPrompt
        });

        if (!dialogueRes.currentDialogue) return;

        const dialogue = dialogueRes.currentDialogue;
        console.log(`    🗣️ [旁路实体具现] ${snapshot.name}: "${dialogue}"`);

        // 将生成的台词挂载回实体当前引用（仅展示用，不参与状态回写）
        // 注：由于快照和主循环引用可能存在时间差，这里可以通过事件或直接修改主对象属性（如果存在）
        // 为安全起见，我们只产出物理摄动 Δ

        // 步骤 C: 反向同构编译 -> 将表达转化为有限的宣泄摄动 Δ
        const deltaStance = -snapshot.stance * 0.12; // 立场宣泄向 0 回弹
        const deltaPhysique = -snapshot.physique * 0.03;

        // 严格遵守契约：旁路只提交摄动事件，绝不提交旧实体覆盖世界时间
        pendingDeltaQueue.push({
            eventId: `delta_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            agentId: snapshot.name,
            sourceTick,
            delta: {
                physique: Number(deltaPhysique.toFixed(2)),
                stance: Number(deltaStance.toFixed(2)),
                resonance: 0
            }
        });

        // 顺便把生成的台词安全地写入实体的最新展示字段（如果能找到对应实体，这里简化为由外部管理，或者直接在下个 Tick 呈现）
        // 核心原则：绝不覆写 P, S, R 核心数值。

    } catch (e) {
        // 旁路静默容错：模型超时或断连不影响心脏跳动
    }
}

module.exports = { runTick };