export const calculateAddonDeliveryDates = (startDate, endDate, scheduleType) => {
  const dates = [];

  if (!(startDate instanceof Date) || isNaN(startDate)) return dates;

  // Force local date (no timezone shift)
  const current = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  // ONCE → only start date
  if (scheduleType === "once") {
    dates.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
    );
    return dates;
  }

  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );

  let step = 1;
  if (scheduleType === "alternate") step = 2;
  if (scheduleType === "every_3_days") step = 3;
  if (scheduleType === "weekly") step = 7;

  while (current <= end) {
    dates.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`
    );
    current.setDate(current.getDate() + step);
  }

  return dates;
};
