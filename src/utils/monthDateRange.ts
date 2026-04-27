const pad = (value: number) => String(value).padStart(2, '0');

export const getMonthDateRange = (year: number, month: number) => {
  const lastDay = new Date(year, month, 0).getDate();

  return {
    startDate: `${year}-${pad(month)}-01`,
    endDate: `${year}-${pad(month)}-${pad(lastDay)}`,
  };
};

export const getDateMonthRange = (date: Date) => getMonthDateRange(date.getFullYear(), date.getMonth() + 1);

export const getYearMonthRange = (yearMonth: string) => {
  const [yearPart, monthPart] = yearMonth.split('-');
  return getMonthDateRange(Number(yearPart), Number(monthPart));
};
