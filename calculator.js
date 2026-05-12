export function cleanTime(val) {
    if (!val || val === "-" || val === "") return "00:00";
    let m = String(val).match(/(\d{1,2}):(\d{1,2})/);
    return m ? `${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}` : "00:00";
}

export function calculateRow(inTime, outTime, isHoliday, dayOfWeek, isNextDay, wasFullDayShift, leaveData, isLastDay) {
    let [h1, m1] = inTime.split(':').map(Number);
    let [h2, m2] = outTime.split(':').map(Number);
    let totalMinutes = (inTime && outTime && inTime !== "00:00") ? ((h2 * 60 + m2) - (h1 * 60 + m1)) : 0;
    if (isNextDay) totalMinutes += 1440;

    let shortLeaveBonusMinutes = 0;
    if (leaveData && leaveData.type === "Short Leave") {
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
    let roundedWorked = hWork + (mWork >= 25 && mWork <= 54 ? 0.5 : (mWork >= 55 ? 1.0 : 0));

    let isFullDay = roundedWorked >= 15; 
    let req = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;

    if (leaveData) {
        if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") {
            req = isFullDay ? 9 : 0; 
        } else if (leaveData.type === "Half Day") {
            req = Math.max(0, req - 4.5);
        }
    } else if (isFullDay && req > 0) {
        req = isLastDay ? 9 : 18; 
    }

    let isShort = false;
    if (roundedWorked > 0 && !leaveData) {
        if (isFullDay) { if (h1*60+m1 > 525 || !isNextDay || (isNextDay && h2*60+m2 < 295)) isShort = true; }
        else if (isNextDay) { if (h1*60+m1 > 1200 || h2*60+m2 < 300) isShort = true; }
        else { if (h1*60+m1 > 525 || h2*60+m2 < 1020) isShort = true; }
    }

    let ot = (dayOfWeek === 0 || isHoliday) ? 0 : Math.max(0, roundedWorked - req);
    let sOT = (dayOfWeek === 0 || isHoliday) ? roundedWorked : 0;

    return { worked: roundedWorked, req, ot, sOT, lieu: (dayOfWeek === 0 || isHoliday) && roundedWorked >= 9, isFullDay, isShort };
}
