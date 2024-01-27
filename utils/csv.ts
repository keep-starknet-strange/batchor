export const hasExpectedColumns = (jsonData: any[]): boolean => {
    // Define the expected column names
    const expectedColumns = ["token_address", "recipient", "amount"];

    // Get the columns from the first data row
    const firstRow = jsonData[0];
    if (!firstRow) return false;

    // Check if all expected columns are present
    return expectedColumns.every((col) => Object.keys(firstRow).includes(col));
  };


 export  const hasExpectedColumnsERC721 = (jsonData: any[]): boolean => {
    // Define the expected column names
    const expectedColumns = ["token_address", "recipient", "token_id"];

    // Get the columns from the first data row
    const firstRow = jsonData[0];
    if (!firstRow) return false;

    // Check if all expected columns are present
    return expectedColumns.every((col) => Object.keys(firstRow).includes(col));
  };
