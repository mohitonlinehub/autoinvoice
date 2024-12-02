export class BaseListHandler {
    static async refreshList(service, listId, renderFunction, methodName) {
        try {
            const records = await service[methodName]();
            const listElement = document.getElementById(listId);
            listElement.innerHTML = '';
            
            records.items.forEach(item => {
                const li = document.createElement('li');
                renderFunction(li, item);
                listElement.appendChild(li);
            });
        } catch (error) {
            console.error('Failed to fetch items:', error);
        }
    }

    static updateDropdown(selectId, items, valueKey = 'id', textKey = 'name') {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '';
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            select.appendChild(option);
        });
    }
} 