import { BaseListHandler } from './BaseListHandler.js';
import { AgentService } from '../services/AgentService.js';

export class AgentListHandler extends BaseListHandler {
    static async refresh() {
        await this.refreshList(AgentService, 'agentList', (li, agent) => {
            li.className = 'list-item agent-item';
            li.innerHTML = `<span class="agent-username">${agent.username}</span>`;
        }, 'getAgents');
        
        // Update dropdown
        const agents = await AgentService.getAgents();
        this.updateDropdown('companyAgents', agents.items, 'id', 'username');
    }
} 