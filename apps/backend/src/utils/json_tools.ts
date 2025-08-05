import { isValidJSON } from "./string_tools";

// Define the allowed table enum values
type TableType = "Customer" | "Vendor" | "Factories";

const FkIdTableEnums = {
    Customer: "Customers",
    Vendor: "Vendors",
    Factories: "Factories"
}

// Interface for the expected JSON structure
interface FkIDTableData {
  id: number;
  table: TableType;
}

/**
 * Validates a JSON string to ensure it contains the expected fkSource structure
 * @param jsonString - The JSON string to validate
 * @returns Object with isValid boolean and parsed data if valid, or error message if invalid
 */
function validateFkIDTableJSON(jsonString: string): { 
  isValid: boolean; 
  data?: FkIDTableData; 
  error?: string 
} {
  // First check if it's valid JSON
  if (!isValidJSON(jsonString)) {
    return {
      isValid: false,
      error: "Invalid JSON format"
    };
  }

  try {
    const parsed = JSON.parse(jsonString);

    // Check if parsed data is an object
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        isValid: false,
        error: "JSON must be an object"
      };
    }

    // Check if required fields exist
    if (!('id' in parsed) || !('table' in parsed)) {
      return {
        isValid: false,
        error: "Missing required fields: 'id' and 'table'"
      };
    }

    // Validate id is a number
    if (typeof parsed.id !== 'number' || !Number.isInteger(parsed.id)) {
      return {
        isValid: false,
        error: "'id' must be a number"
      };
    }

    // Validate table is one of the allowed enum values
    const allowedTables: TableType[] = ["Customer", "Vendor", "Factories"];
    if (typeof parsed.table !== 'string' || !allowedTables.includes(parsed.table as TableType)) {
      return {
        isValid: false,
        error: `'table' must be one of: ${allowedTables.join(', ')}`
      };
    }

    // If all validations pass, return the parsed data
    return {
      isValid: true,
      data: {
        id: parsed.id,
        table: parsed.table as TableType
      }
    };

  } catch (error) {
    return {
      isValid: false,
      error: `JSON parsing error: ${error.message}`
    };
  }
}

export {
  validateFkIDTableJSON,
  FkIdTableEnums,
  type TableType,
  type FkIDTableData
}
