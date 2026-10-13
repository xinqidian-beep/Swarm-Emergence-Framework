// core/actor/SovereignAgent.js - 生产环境就绪的主权节点自治引擎
const { stepDynamics } = require('../modules/dynamicsModule');
const { translateStateWithDeepSeek } = require('../modules/deepseekTranslator');
const dialogueModule = require('../modules/transmitModule');

class SovereignAgent {
    constructor(config, worldBus) {
        // 1. 局部身份边界
        this.identity = {
            name: config.name || "未知实体",
            profession: config.profession || "流民",
            region: config.region || "荒野"
        };

        // 2. 私有内生状态（保持高精度浮点数，完全独立隔离）
        this.dynamics = {
            physique: config.physique ?? 5.0,
            stance: config.stance ?? 0.0,
            resonance: config.resonance ?? 3.0
        };

        this.ambientEnergy = config.ambientEnergy ?? 0.3;

        // 3. 私有信箱：带有容量上限与过期衰减的局部缓冲区
        this.mailbox = [];
        this.maxMailboxSize = 5; 

        // 4. 挂载世界总线（用于空间扰动投递）
        this.worldBus = worldBus;
        if (this.worldBus && typeof this.worldBus.register === 'function') {
            this.worldBus.register(this);
        }

        this.isAlive = false;
    }

    /**
     * 【独立内生时钟】点火并启动异步事件循环
     * 彻底摒弃全局 Tick，每一个实体按自身的节奏呼吸。
     */
    async awaken() {
        this.isAlive = true;
        console.log(`[主权觉醒] ${this.identity.name} (${this.identity.profession}) 在 [${this.identity.region}] 启动自主生命循环。`);

        while (this.isAlive) {
            // 心跳间隔由实体的当前心理张力与信箱拥堵度动态决定
            const sleepMs = this.calculateEndogenousHeartbeat();
            await this.sleep(sleepMs);

            // 执行局部的稀疏递归生命周期
            await this.cognitiveTick();
        }
    }

    /**
     * 动态内生心跳算法：张力越高、信箱消息越多，心跳越快
     */
    calculateEndogenousHeartbeat() {
        const tension = Math.abs(this.dynamics.stance) + (this.mailbox.length * 0.4);
        const interval = Math.max(4000, 22000 / (tension + 0.5));
        return Math.floor(interval);
    }

    /**
     * 【稀疏精算与焦点闭环】
     */
    async cognitiveTick() {
        // 1. 处理信箱扰动并执行【过期压缩】
        const unreadMessages = this.processAndCompressMailbox();
        
        // 将信箱中的异质扰动转化为 dynamicsModule 所需的 deltaQueue 驱动力
        const deltaQueue = unreadMessages.map(msg => ({
            type: 'AUDITORY_PERTURBATION',
            intensity: 0.3,
            content: msg.content
        }));

        // 【马斯洛式静默】：若内心平衡且无外部扰动，进入深度沉浸，拒绝无效算力消耗
        if (unreadMessages.length === 0 && this.isLocallyBalanced()) {
            const nextDyn = stepDynamics(this.dynamics, [], this.ambientEnergy);
            this.dynamics = {
                physique: nextDyn.physique,
                stance: nextDyn.stance,
                resonance: nextDyn.resonance
            };
            return;
        }

        try {
            // 2. 采样层：调用纯净转译算子（局部状态 + 有限扰动 -> 体感提示词）
            const agentPacket = {
                name: this.identity.name,
                profession: this.identity.profession,
                region: this.identity.region,
                physique: this.dynamics.physique,
                stance: this.dynamics.stance,
                resonance: this.dynamics.resonance,
                ambientEnergy: this.ambientEnergy,
                recentStimuli: unreadMessages.map(m => `${m.sender}: ${m.content}`).join("; ")
            };

            const translationRes = await translateStateWithDeepSeek(agentPacket);
            const sensoryPrompt = typeof translationRes === 'string' ? translationRes : (translationRes?.sensoryPrompt || "");

            // 3. 计算层：当体感生成且越过阈值，触发具现坍缩
            if (sensoryPrompt.trim() !== "") {
                const dialogueRes = await dialogueModule({
                    ...agentPacket,
                    sensoryPrompt
                });

                const spokenText = dialogueRes?.currentDialogue;

                // 4. IO 算子：通过 WorldBus 将台词广播给同区域的其他实体
                if (spokenText && spokenText !== "..." && spokenText.trim() !== "") {
                    if (this.worldBus && typeof this.worldBus.publish === 'function') {
                        this.worldBus.publish({
                            from: this.identity.name,
                            region: this.identity.region,
                            content: spokenText
                        });
                    }
                }
            }

            // 5. 动力学演化：调用原汁原味的 stepDynamics（不变的演化规则）更新内部状态
            const updatedDynamics = stepDynamics(this.dynamics, deltaQueue, this.ambientEnergy);
            this.dynamics = {
                physique: updatedDynamics.physique,
                stance: updatedDynamics.stance,
                resonance: updatedDynamics.resonance
            };

        } catch (error) {
            console.warn(`[主权节点异常] ${this.identity.name} 认知循环受到局部扰动阻碍: ${error.message}`);
        }
    }

    /**
     * 【过期压缩算法】：防止信箱无限堆积，旧扰动自动衰减为轻微信心损耗
     */
    processAndCompressMailbox() {
        if (this.mailbox.length > this.maxMailboxSize) {
            const overflowCount = this.mailbox.length - this.maxMailboxSize;
            this.mailbox.splice(0, overflowCount);
            this.dynamics.stance -= 0.05 * overflowCount; // 历史积压转化为轻度心理压力底色
        }
        
        const batch = [...this.mailbox];
        this.mailbox = [];
        return batch;
    }

    isLocallyBalanced() {
        return this.dynamics.stance >= 0 && this.mailbox.length === 0;
    }

    receiveMessage(msg) {
        // 接收来自 WorldBus 的空间局域扰动
        this.mailbox.push(msg);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { SovereignAgent };