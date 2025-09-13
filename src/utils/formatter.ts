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

export { formattedAmount, dateFormatter, dateTimeFormatter };

