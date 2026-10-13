// core/autonomousWorld.js - 真正具备涌现特性的自主世界引擎
const { translateStateWithDeepSeek } = require('./modules/deepseekTranslator');
const { generateNarrativeWithQwen } = require('./modules/qwenNarrator');

class AutonomousWorld {
    constructor(initialAgents) {
        this.agents = initialAgents;
        this.globalTick = 0;
        this.isRunning = false;
    }

    async start() {
        this.isRunning = true;
        console.log(`[涌现世界] 自主物理场已启动。剥离上帝视角轮询，切换至势能势差驱动模型。\n`);
        
        while (this.isRunning) {
            this.globalTick++;
            
            // 1. 底座层：所有实体在无声的数学空间中进行轻量级演化
            for (let agent of this.agents) {
                this.stepFieldDynamics(agent);
            }

            // 2. 检索当前谁突破了“能量阈值”（谁有资格让波函数坍塌）
            const readyToCollapse = this.agents.filter(agent => this.calculateTension(agent) > 3.0);

            if (readyToCollapse.length > 0) {
                console.log(`\n--- [物理势能释放] Tick #${this.globalTick} 触发局域坍塌 ---`);
                
                // 串行或异步精算：仅让突破阈值的实体触发大模型链路
                for (let agent of readyToCollapse) {
                    await this.triggerFractalCollapse(agent);
                    
                    // 能量释放（放电清零，防止连续轰炸）
                    agent.accumulatedTension = 0.0; 
                }
            }

            // 微观步进延时（例如每秒推进一次纯数学物理场演化）
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // 纯数学的轻量级场动力学演化（无大模型）
    stepFieldDynamics(agent) {
        // 代谢漂移、自然衰减或环境摩擦
        agent.physique += (Math.random() - 0.5) * 0.1;
        agent.stance += (Math.random() - 0.5) * 0.1;
        agent.resonance += (Math.random() - 0.5) * 0.15;
        
        // 动态累积张力（偏离中心越远，张力累积越快）
        const currentTension = Math.abs(agent.physique) * 0.3 + 
                               Math.abs(agent.stance) * 0.4 + 
                               Math.abs(agent.resonance) * 0.3;
        
        agent.accumulatedTension = (agent.accumulatedTension || 0) + currentTension * 0.1;
    }

    calculateTension(agent) {
        return agent.accumulatedTension || 0;
    }

    // 焦点精算：单例定向坍塌
    async triggerFractalCollapse(agent) {
        console.log(`\n  ⚡ [观测坍塌] 实体: ${agent.name} (${agent.profession} @ ${agent.region}) 突破张力阈值！`);
        console.log(`     [当前态] P: ${agent.physique.toFixed(1)} | S: ${agent.stance.toFixed(1)} | R: ${agent.resonance.toFixed(1)}`);

        try {
            // 1. DeepSeek 现象学转译
            const cognitivePrompt = await translateStateWithDeepSeek(agent);
            console.log(`     ├─ [DeepSeek 转译]: "${cognitivePrompt}"`);

            // 2. Qwen 叙事具现化
            const currentDialogue = await generateNarrativeWithQwen({
                ...agent,
                tick: this.globalTick,
                cognitivePrompt
            });
            console.log(`     └─ [Qwen 具现台词]: "${currentDialogue.trim().replace(/\n/g, ' ')}"`);
            
        } catch (e) {
            console.warn(`     [坍塌异常] 实体 ${agent.name} 观测失败: ${e.message}`);
        }
    }
}

module.exports = { AutonomousWorld };