import { format } from 'date-fns';

// Format the EUR currency amount to 2 decimal places with comma as thousand separator
const formattedAmount = (amount: number | string) => {
  if (amount === null || amount === undefined || amount === "") {
    return "";
  }
  return new Intl.NumberFormat("en-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

const dateFormatter = (dateStr: any) => {
  if (!dateStr) return "";
  return format(new Date(dateStr), "dd-MMM-yyyy");
};

const dateTimeFormatter = (value: any) => {
  if (!value) return "";
  return format(new Date(value), "dd-MMM-yyyy HH:mm:ss a");
}

// Convert comma-formatted number to dot-formatted number for backend
const convertCommaToDot = (value: string | number): number => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  // convert to string, and replace comma separator with dot
  const stringvalue = String(value).replace(/,/g, '.');
  return parseFloat(stringvalue) || 0;
};

// convert dot formatted numbe to comma formatted to display
const convertDotToComma = (value: number | string): string => {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  // convert to number first, then format with comma as decimal separator
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return numValue.toFixed(2).replace(".", ",");
};

export { formattedAmount, dateFormatter, dateTimeFormatter, convertCommaToDot, convertDotToComma };

