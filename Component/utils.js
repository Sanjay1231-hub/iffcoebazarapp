// Function to format date as 'dd-mmm-yyyy', this function takes three parameters
export const getAsOnDate = (year, mm, dd) => {
    const date = new Date(year, mm, dd); // Month is 0-indexed (0 = January)    
    const day = String(date.getDate()).padStart(2, '0'); // Get day and ensure two digits
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const yearddmmm = date.getFullYear();    
    return `${day}-${month}-${yearddmmm}`;
};

// Function to format date as 'dd-MM-yyyy'
export const getTodayDate = () => {
    const today = new Date();  // Get current date
    const day = String(today.getDate()).padStart(2, '0');  // Get day and ensure two digits
    const month = String(today.getMonth() + 1).padStart(2, '0');  // Get month (0-indexed, so add 1) and ensure two digits
    const year = today.getFullYear();  // Get full year    
    return `${day}-${month}-${year}`;  // Return the formatted date
};

// Function to format Number as '0,00,000'
export const formatIndianNumber = (num) => {
    const numStr = num.toString();
    // Split the number into integer and decimal parts (if any)
    let [integerPart, decimalPart] = numStr.split('.');
    // Format the integer part
    const lastThreeDigits = integerPart.slice(-3);
    const otherDigits = integerPart.slice(0, -3);
    // Add commas for the Indian number system
    const formattedInteger = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherDigits.length > 0 ? "," : "") + lastThreeDigits;  
    // Return the formatted number
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

// Function to format date as 'dd-MMM-yyyy'
export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};
