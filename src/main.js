import { AuthService } from './services/AuthService';
import { AgentService } from './services/AgentService';
import { ProductService } from './services/ProductService';
import { BankService } from './services/BankService';
import { showView } from './handlers/ViewHandler';
import { ModalHandler } from './handlers/ModalHandler';
import { CompanyFormHandler } from './handlers/CompanyFormHandler';
import { CompanyService } from './services/CompanyService';

// Initial setup and auth check
if (AuthService.isLoggedIn()) {
    const { role, username } = AuthService.getCurrentUser();
    showView(role === 'admin' ? 'adminView' : 'agentView', username);
} else {
    showView('loginView');
}

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const authData = await AuthService.login(
            document.getElementById('username').value,
            document.getElementById('password').value
        );
        showView(
            authData.record.role === 'admin' ? 'adminView' : 'agentView',
            authData.record.username
        );
    } catch (error) {
        console.error('Login failed:', error);
        alert('Invalid username or password. Please try again.');
    }
});

// Logout handlers
['admin', 'agent'].forEach(role => {
    document.getElementById(`${role}LogoutBtn`)?.addEventListener('click', () => {
        // Reset file input and company select before logout
        if (role === 'agent') {
            const fileInput = document.getElementById('excelFile');
            const companySelect = document.getElementById('companySelect');
            if (fileInput) fileInput.value = '';
            if (companySelect) companySelect.value = '';
        }
        AuthService.logout();
        showView('loginView');
    });
});

// Refresh functions
async function refreshAgentList() {
    try {
        const records = await AgentService.getAgents();
        const agentList = document.getElementById('agentList');
        agentList.innerHTML = '';
        
        records.items.forEach(agent => {
            const li = document.createElement('li');
            li.className = 'agent-item';
            
            const agentInfo = document.createElement('span');
            agentInfo.textContent = agent.username;
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => ModalHandler.showEditAgentModal(agent);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete agent ${agent.username}?`)) {
                    await AgentService.deleteAgent(agent.id);
                    refreshAgentList();
                }
            };
            
            li.append(agentInfo, editBtn, deleteBtn);
            agentList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch agents:', error);
    }
}

async function refreshProductList() {
    try {
        const records = await ProductService.getProducts();
        const productList = document.getElementById('productList');
        productList.innerHTML = '';
        
        records.items.forEach(product => {
            const li = document.createElement('li');
            
            const productInfo = document.createElement('span');
            productInfo.textContent = `${product.name} - ₹${product.price.toFixed(2)}`;
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => ModalHandler.showEditProductModal(product);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete product ${product.name}?`)) {
                    await ProductService.deleteProduct(product.id);
                    refreshProductList();
                }
            };
            
            li.append(productInfo, editBtn, deleteBtn);
            productList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch products:', error);
    }
}

async function refreshBankList() {
    try {
        const records = await BankService.getBanks();
        const bankList = document.getElementById('bankList');
        bankList.innerHTML = '';
        
        records.items.forEach(bank => {
            const li = document.createElement('li');
            
            const bankInfo = document.createElement('span');
            bankInfo.textContent = `${bank.name} - A/C: ${bank.account} - IFSC: ${bank.ifsc}`;
            
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.onclick = () => ModalHandler.showEditBankModal(bank);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.onclick = async () => {
                if (confirm(`Delete bank ${bank.name}?`)) {
                    await BankService.deleteBank(bank.id);
                    refreshBankList();
                }
            };
            
            li.append(bankInfo, editBtn, deleteBtn);
            bankList.appendChild(li);
        });
    } catch (error) {
        console.error('Failed to fetch banks:', error);
    }
}

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Create Agent Form
    document.getElementById('createAgentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await AgentService.createAgent(
                document.getElementById('newAgentUsername').value,
                document.getElementById('newAgentPassword').value
            );
            e.target.reset();
            refreshAgentList();
        } catch (error) {
            console.error('Failed to create agent:', error);
            alert('Failed to create agent. Please try again.');
        }
    });

    // Create Product Form
    document.getElementById('createProductForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await ProductService.createProduct(
                document.getElementById('productName').value,
                parseFloat(document.getElementById('productPrice').value)
            );
            e.target.reset();
            refreshProductList();
        } catch (error) {
            console.error('Failed to create product:', error);
            alert('Failed to create product. Please try again.');
        }
    });

    // Create Bank Form
    document.getElementById('createBankForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await BankService.createBank(
                document.getElementById('bankName').value,
                document.getElementById('bankAccount').value,
                document.getElementById('bankIFSC').value
            );
            e.target.reset();
            refreshBankList();
        } catch (error) {
            console.error('Failed to create bank:', error);
            alert('Failed to create bank. Please try again.');
        }
    });

    // Edit form handlers
    ['Agent', 'Product', 'Bank'].forEach(type => {
        document.getElementById(`edit${type}Form`)?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const modal = document.getElementById(`edit${type}Modal`);
            const id = modal.dataset[`${type.toLowerCase()}Id`];
            
            try {
                const service = { AgentService, ProductService, BankService }[`${type}Service`];
                const data = type === 'Agent' 
                    ? {
                        username: document.getElementById('editAgentUsername').value,
                        password: document.getElementById('editAgentPassword').value || undefined
                    }
                    : type === 'Product'
                    ? {
                        name: document.getElementById('editProductName').value,
                        price: parseFloat(document.getElementById('editProductPrice').value)
                    }
                    : {
                        name: document.getElementById('editBankName').value,
                        account: document.getElementById('editBankAccount').value,
                        ifsc: document.getElementById('editBankIFSC').value
                    };
                
                await service.update(id, data);
                modal.classList.add('hidden');
                window[`refresh${type}List`]();
            } catch (error) {
                console.error(`Failed to update ${type.toLowerCase()}:`, error);
                alert(`Failed to update ${type.toLowerCase()}. Please try again.`);
            }
        });
        
        // Cancel button handlers
        document.getElementById(`cancelEdit${type}`)?.addEventListener('click', () => {
            document.getElementById(`edit${type}Modal`).classList.add('hidden');
        });
    });

    // Create Company Form
    const createCompanyForm = document.getElementById('createCompanyForm');
    if (createCompanyForm) {
        // Populate select lists when form is loaded
        CompanyFormHandler.populateSelectLists();
        
        createCompanyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const formData = {
                    name: document.getElementById('companyName').value,
                    address: document.getElementById('companyAddress').value,
                    mobile: document.getElementById('companyMobile').value,
                    email: document.getElementById('companyEmail').value,
                    website: document.getElementById('companyWebsite').value,
                    banks: Array.from(document.getElementById('companyBanks').selectedOptions).map(opt => opt.value),
                    products: Array.from(document.getElementById('companyProducts').selectedOptions).map(opt => opt.value),
                    agents: Array.from(document.getElementById('companyAgents').selectedOptions).map(opt => opt.value)
                };
                
                await CompanyService.createCompany(formData);
                e.target.reset();
                CompanyFormHandler.refreshCompanyList();
                alert('Company created successfully!');
            } catch (error) {
                console.error('Failed to create company:', error);
                alert('Failed to create company. Please try again.');
            }
        });
    }

    // Refresh lists when admin view is shown
    document.addEventListener('refreshLists', () => {
        refreshAgentList();
        refreshProductList();
        refreshBankList();
        CompanyFormHandler.refreshCompanyList();
    });

    // Set default date to today
    const invoiceDatePicker = document.getElementById('invoiceDate');
    if (invoiceDatePicker) {
        // Set max date to today to prevent future date selection
        const today = new Date();
        const maxDate = today.toISOString().split('T')[0];
        invoiceDatePicker.setAttribute('max', maxDate);
        
        // Set default value to today
        invoiceDatePicker.value = maxDate;
        
        // Format the displayed date as YYYY/MM/DD
        invoiceDatePicker.addEventListener('change', (e) => {
            const selectedDate = new Date(e.target.value);
            const formattedDate = selectedDate.toLocaleDateString('en-CA'); // Uses YYYY/MM/DD format
            console.log('Selected date:', formattedDate);
            // Store the formatted date for later use
            invoiceDatePicker.dataset.formattedDate = formattedDate;
        });
    }

    // Populate company dropdown when agent view is shown
    document.addEventListener('viewChanged', async (e) => {
        if (e.detail.view === 'agentView') {
            await populateCompanyDropdown();
        }
    });

    // Handle file upload functionality
    const companySelect = document.getElementById('companySelect');
    const fileInput = document.getElementById('excelFile');

    if (companySelect && fileInput) {
        // Enable/disable file input based on company selection
        companySelect.addEventListener('change', (e) => {
            console.log('Company selected:', e.target.value);
            fileInput.disabled = e.target.value === '';
        });

        // Handle file selection and parsing
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log('File selected:', file.name);
                try {
                    const entries = await parseExcelFile(file);
                    console.log('Parsed Excel Data:', entries);
                    
                    // You can store this data or process it further as needed
                    // For example:
                    // const selectedCompanyId = companySelect.value;
                    // await processInvoiceData(selectedCompanyId, entries);
                    
                } catch (error) {
                    console.error('Error parsing Excel file:', error);
                    alert('Error parsing Excel file: ' + error.message);
                }
            }
        });
    }
});

async function populateCompanyDropdown() {
    const companySelect = document.getElementById('companySelect');
    if (!companySelect) return;

    try {
        const result = await CompanyService.getAssignedCompanies();
        
        // Store current selection if any
        const currentSelection = companySelect.value;
        
        // Clear existing options except the first default option
        while (companySelect.options.length > 1) {
            companySelect.remove(1);
        }

        // Add companies to dropdown
        result.items.forEach(company => {
            const option = new Option(company.name, company.id);
            companySelect.add(option);
        });

        // Restore previous selection if it exists
        if (currentSelection) {
            companySelect.value = currentSelection;
        }
    } catch (error) {
        console.error('Failed to load companies:', error);
        alert('Failed to load assigned companies. Please try again.');
    }
}

// Add the parseExcelFile function
function parseExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
    
            reader.onload = function(e) {
                try {
                    console.log("File read successfully. Starting to parse...");
                    // Convert the ArrayBuffer to a Uint8Array for XLSX.js to process
                    const data = new Uint8Array(e.target.result);
                    // Parse the Excel file using XLSX.js
                    const workbook = XLSX.read(data, { type: 'array' });
                    console.log("Workbook read successfully");
                    
                    // Assume we're working with the first sheet in the workbook
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    console.log("Accessing worksheet:", sheetName);
    
                    // Ensure the worksheet exists
                    if (!worksheet) {
                        throw new Error("Worksheet is undefined");
                    }
    
                    // Get the range of the sheet to know how many rows and columns we're dealing with
                    const range = XLSX.utils.decode_range(worksheet['!ref']);
                    console.log("Sheet range:", range);
    
                    // Define the columns we want to extract, in the order they appear in the sheet
                    const wantedColumns = ["Sl. No.", "Tran Date", "Particulars", "Withdrawal", "Deposit", "Balance Amount"];
    
                    let entries = []; // Will hold our parsed data
                    let headers = []; // Will hold the headers we actually find in the sheet
                    let dataStartRow = -1; // Will hold the row number where our data starts
    
                    // Find the row containing "Sl. No." which indicates the start of our data
                    for (let R = range.s.r; R <= range.e.r; ++R) {
                        for (let C = range.s.c; C <= range.e.c; ++C) {
                            const cellAddress = {c:C, r:R};
                            const cellRef = XLSX.utils.encode_cell(cellAddress);
                            const cell = worksheet[cellRef];
                            if (cell && cell.v === "Sl. No.") {
                                dataStartRow = R;
                                break;
                            }
                        }
                        if (dataStartRow !== -1) break;
                    }
    
                    // If we couldn't find the start of the data, throw an error
                    if (dataStartRow === -1) {
                        throw new Error("Could not find the starting point of data ('Sl. No.' cell)");
                    }
    
                    console.log("Data starts at row:", dataStartRow + 1);
    
                    // Process headers and map column indices
                    // This allows us to handle cases where columns might be in a different order
                    let columnMap = new Map();
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        const cellAddress = {c:C, r:dataStartRow};
                        const cellRef = XLSX.utils.encode_cell(cellAddress);
                        const cell = worksheet[cellRef];
                        if (cell && cell.v) {
                            const header = cell.v.toString().trim();
                            if (wantedColumns.includes(header)) {
                                headers.push(header);
                                columnMap.set(header, C);
                            }
                        }
                    }
    
                    console.log("Headers:", headers);
    
                    // Process data rows
                    for (let R = dataStartRow + 1; R <= range.e.r; ++R) {
                        let entry = {};
                        let hasData = false;
    
                        for (const header of headers) {
                            const C = columnMap.get(header);
                            const cellAddress = {c:C, r:R};
                            const cellRef = XLSX.utils.encode_cell(cellAddress);
                            const cell = worksheet[cellRef];
                            
                            if (cell && cell.v !== undefined) {
                                if (header === "Tran Date") {
                                    const excelDate = cell.v;
                                    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
                                    entry[header] = jsDate.toISOString().split('T')[0];
                                } else if (header === "Particulars") {
                                    const parsedParticulars = parseParticulars(cell.v);
                                    entry[header] = cell.v;  // Keep original string
                                    entry.tranType = parsedParticulars.tranType;
                                    entry.tranId = parsedParticulars.tranId;
                                    
                                    if (!parsedParticulars.matched) {
                                        console.warn('Unmatched transaction pattern:', {
                                            row: R + 1,
                                            particulars: cell.v,
                                            date: entry["Tran Date"]
                                        });
                                    }
                                } else {
                                    entry[header] = cell.v;
                                }
                                hasData = true;
                            } else {
                                entry[header] = (header === "Withdrawal" || header === "Deposit") ? 0 : null;
                            }
                        }
    
                        if (hasData) {
                            entries.push(entry);
                        } else {
                            console.log("Empty row encountered. Stopping data processing.");
                            break;
                        }
                    }
    
                    console.log("Parsed entries:", entries);
                    resolve(entries);
                } catch (error) {
                    console.error("Error in parsing:", error);
                    reject(error);
                }
            };
    
            reader.onerror = function(error) {
                console.error("Error in reading file:", error);
                reject(error);
            };
    
            console.log("Starting to read file...");
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Wait for the DOM to be fully loaded before attaching event listeners
    document.addEventListener('DOMContentLoaded', () => {
        // Get references to the DOM elements we'll be interacting with
        const fileInput = document.getElementById('fileInput');
        const uploadButton = document.getElementById('uploadButton');
        const fileName = document.getElementById('fileName');
        const resultContainer = document.getElementById('resultContainer');
    
        // When the upload button is clicked, trigger the file input
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });
    
        // When a file is selected, process it
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                // Display the name of the selected file
                fileName.textContent = file.name;
                console.log("File selected:", file.name, "Type:", file.type);
                try {
                    // Parse the Excel file
                    const entries = await parseExcelFile(file);
                    console.log('Parsed entries:', entries);
                    // Display the parsed data in the result container
                    resultContainer.innerHTML = `<pre>${JSON.stringify(entries, null, 2)}</pre>`;
                    // TODO: Send these entries to your Supabase backend
                } catch (error) {
                    console.error('Error parsing Excel file:', error);
                    resultContainer.textContent = `Error: ${error.message}`;
                }
            }
        });
    });

    // Add this function at the top
    function parseParticulars(particulars) {
        const patterns = [
            // FT IMPS pattern (more flexible)
            {
                type: /^(FT IMPS\/[A-Z]+)/,
                id: /\/([0-9]{11,16})(?:\/|\s)/
            },
            // UPI pattern (more flexible)
            {
                type: /^(UPI IN)/,
                id: /\/([0-9]{11,16})(?:\/|\s)/
            },
            // NFT pattern
            {
                type: /^(NFT)/,
                id: /\/([A-Z0-9]{11,16})(?:\/|\s)/
            },
            // MB IMPS pattern (more flexible)
            {
                type: /^(MB IMPS\/[A-Z]+)/,
                id: /\/([0-9]{11,16})(?:\/|\s)/
            },
            // IFN pattern (updated for all cases)
            {
                type: /^(IFN)/,
                id: /\/(SMEFB[A-Za-z0-9]{1,20})\s/  // Added lowercase letters
            },
            // CHRG pattern
            {
                type: /^(CHRG\/IMPS)/,
                id: /(Count:\d+)/
            },
            // RTG pattern
            {
                type: /^(RTG)/,
                id: /\/(?:[A-Z]+\s)?([A-Z0-9]{20,25})(?:\/|\s)/
            },
            // MB FTB pattern (more flexible)
            {
                type: /^(MB FTB)/,
                id: /\/([0-9]{11,16})(?:\/|\s)/
            },
            // FN pattern (more flexible)
            {
                type: /^(FN)/,
                id: /(?:\/|\s)([0-9]{1,16})(?:\/|\s|$)/
            }
        ];

        for (const pattern of patterns) {
            const typeMatch = particulars.match(pattern.type);
            const idMatch = particulars.match(pattern.id);
            
            if (typeMatch && idMatch) {
                return {
                    tranType: typeMatch[1],
                    tranId: idMatch[1],
                    matched: true
                };
            }
        }

        // Enhanced logging for unmatched patterns
        console.warn('Unmatched transaction pattern:', {
            particulars,
            possibleType: particulars.split('/')[0],
            fullString: particulars
        });

        return {
            tranType: null,
            tranId: null,
            matched: false,
            originalString: particulars
        };
    }