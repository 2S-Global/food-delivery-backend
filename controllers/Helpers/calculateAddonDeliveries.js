export const calculateAddonDeliveries = (startDate, endDate, scheduleType) => {
  if (!(startDate instanceof Date) || !(endDate instanceof Date)) return 0;
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 0;
  if (endDate <= startDate) return 0;

  const diffInMs = endDate - startDate;
  const totalDays =
    Math.ceil(diffInMs / (1000 * 60 * 60 * 24)) + 1;

  switch (scheduleType) {
    case "daily":
      return totalDays;
    case "alternate":
      return Math.ceil(totalDays / 2);
    case "every_3_days":
      return Math.ceil(totalDays / 3);
    case "weekly":
      return Math.ceil(totalDays / 7);
    case "monthly":
      return 1;
    default:
      return 0;
  }
};
