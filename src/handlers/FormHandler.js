export class FormHandler {
    static initializeCreateForm(formId, handleCreate) {
        document.getElementById(formId)?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = e.target.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            try {
                console.log(`Processing ${formId} submission...`);
                await handleCreate(e.target);
                e.target.reset();
                console.log(`${formId} submission successful`);
            } catch (error) {
                console.error(`Form submission failed for ${formId}:`, error);
                alert(error?.message || 'Operation failed. Please try again.');
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    static getFormData(form, fields) {
        const data = {};
        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element) {
                console.warn(`Field ${field.id} not found in form`);
                return;
            }

            try {
                if (field.type === 'multiselect') {
                    data[field.name] = Array.from(element.selectedOptions).map(opt => opt.value);
                } else if (field.type === 'number') {
                    const value = parseFloat(element.value);
                    if (isNaN(value)) {
                        throw new Error(`Invalid number for field ${field.name}`);
                    }
                    data[field.name] = value;
                } else {
                    data[field.name] = element.value.trim();
                }
            } catch (error) {
                console.error(`Error processing field ${field.id}:`, error);
                throw new Error(`Invalid value for ${field.name}`);
            }
        });
        return data;
    }
} 