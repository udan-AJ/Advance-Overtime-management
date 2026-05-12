export function cleanTime(val) {
    if (!val || val === "-" || val === "") return "00:00";
    let m = String(val).match(/(\d{1,2}):(\d{1,2})/);
    return m ? `${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}` : "00:00";
}

export function calculateRow(inTime, outTime, isHoliday, dayOfWeek, isNextDay, wasFullDayShift, leaveData, isLastDay) {
    let [h1, m1] = inTime.split(':').map(Number);
    let [h2, m2] = outTime.split(':').map(Number);
    
    // Check In/Out දත්ත තිබේදැයි බැලීම
    const hasData = (inTime && outTime && inTime !== "00:00" && outTime !== "00:00");
    let totalMinutes = hasData ? ((h2 * 60 + m2) - (h1 * 60 + m1)) : 0;
    if (hasData && isNextDay) totalMinutes += 1440;

    // Short Leave Bonus (ඔබේ පැරණි logic එකම පවත්වා ගෙන ඇත)
    let shortLeaveBonusMinutes = 0;
    if (hasData && leaveData && leaveData.type === "Short Leave") {
        if (leaveData.slot === "Morning") {
            let arrivalMin = h1 * 60 + m1;
            shortLeaveBonusMinutes = Math.min(90, Math.max(0, arrivalMin - (8 * 60 + 30)));
        } else if (leaveData.slot === "Evening") {
            let exitMin = h2 * 60 + m2;
            shortLeaveBonusMinutes = Math.min(90, Math.max(0, (17 * 60) - exitMin));
        }
    }
    
    let finalMinutes = totalMinutes + shortLeaveBonusMinutes;
    let hWork = Math.floor(finalMinutes / 60);
    let mWork = finalMinutes % 60;
    
    // පැය බාගයකට හෝ පැයකට වට කිරීම (Rounding)
    let roundedWorked = hasData ? (hWork + (mWork >= 25 && mWork <= 54 ? 0.5 : (mWork >= 55 ? 1.0 : 0))) : 0;

    let isFullDay = roundedWorked >= 15; 
    let req = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;

    // නිවාඩු අනුව Required පැය ගණන වෙනස් කිරීම
    if (leaveData) {
        if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") {
            req = isFullDay ? 9 : 0; 
        } else if (leaveData.type === "Half Day") {
            req = Math.max(0, req - 4.5);
        }
    } else if (isFullDay && req > 0) {
        req = isLastDay ? 9 : 18; 
    }

    // දවසේ OT සහ Special OT (SOT) වෙන් කිරීම
    let ot = (dayOfWeek === 0 || isHoliday) ? 0 : Math.max(0, roundedWorked - req);
    let sOT = (dayOfWeek === 0 || isHoliday) ? roundedWorked : 0;

    return { worked: roundedWorked, req, ot, sOT, isFullDay };
}
