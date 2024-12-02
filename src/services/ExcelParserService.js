export class ExcelParserService {
    static parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    console.log("File read successfully. Starting to parse...");
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    console.log("Workbook read successfully");
                    
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    console.log("Accessing worksheet:", sheetName);

                    if (!worksheet) {
                        throw new Error("Worksheet is undefined");
                    }

                    const range = XLSX.utils.decode_range(worksheet['!ref']);
                    console.log("Sheet range:", range);

                    const wantedColumns = ["Sl. No.", "Tran Date", "Particulars", "Withdrawal", "Deposit", "Balance Amount"];
                    let entries = [];
                    let headers = [];
                    let dataStartRow = -1;

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

                    if (dataStartRow === -1) {
                        throw new Error("Could not find the starting point of data ('Sl. No.' cell)");
                    }

                    console.log("Data starts at row:", dataStartRow + 1);

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
                                    const parsedParticulars = ExcelParserService.parseParticulars(cell.v);
                                    entry[header] = cell.v;
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

            reader.onerror = (error) => {
                console.error("Error in reading file:", error);
                reject(error);
            };

            console.log("Starting to read file...");
            reader.readAsArrayBuffer(file);
        });
    }

    static parseParticulars(particulars) {
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
} 