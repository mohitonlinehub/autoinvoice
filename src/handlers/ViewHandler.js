export function showView(viewId, username = '') {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show requested view
    document.getElementById(viewId).classList.remove('hidden');
    
    if (username) {
        if (viewId === 'adminView') {
            document.getElementById('adminUsername').textContent = username;
            // Trigger refresh events
            document.dispatchEvent(new Event('refreshLists'));
        } else if (viewId === 'agentView') {
            document.getElementById('agentUsername').textContent = username;
        }
    }

    // Dispatch custom event for view change
    document.dispatchEvent(new CustomEvent('viewChanged', {
        detail: { view: viewId }
    }));
} 