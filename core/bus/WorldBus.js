// core/bus/WorldBus.js - 去中心化空间消息总线
class WorldBus {
    constructor() {
        this.agents = new Map(); // 注册的所有主权节点：name -> agent instance
    }

    // 注册节点
    register(agent) {
        this.agents.set(agent.identity.name, agent);
        console.log(`[WorldBus] 实体已接入总线: ${agent.identity.name} (${agent.identity.region})`);
    }

    // 注销节点
    unregister(agentName) {
        this.agents.delete(agentName);
    }

    // 广播消息到同区域的其他实体信箱（空间局域性）
    publish(messagePacket) {
        const { from, region, content } = messagePacket;
        console.log(`[WorldBus 广播] 来自 [${from}] (${region}) 的声音: "${content}"`);

        for (const [name, agent] of this.agents.entries()) {
            // 严禁发给自己，且必须在同一个区域（空间局域感知）
            if (name !== from && agent.identity.region === region) {
                agent.receiveMessage({
                    type: "AUDITORY_STIMULUS",
                    sender: from,
                    content: content,
                    timestamp: Date.now()
                });
            }
        }
    }
}

module.exports = { WorldBus };