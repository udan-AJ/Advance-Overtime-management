export function cleanTime(val) {
    if (!val || val === "-" || val === "" || val === "00:00") return "00:00";
    let m = String(val).match(/(\d{1,2}):(\d{1,2})/);
    return m ? `${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}` : "00:00";
}

export function calculateRow(inTime, outTime, isHoliday, dayOfWeek, isNextDay, wasFullDayShift, leaveData, isLastDay) {
    const hasData = (inTime && outTime && inTime !== "00:00" && outTime !== "00:00");
    
    // දත්ත නොමැති දින සඳහා Logic එක
    if (!hasData) {
        // කලින් දවසේ Full Shift එකක් කළා නම් හෝ නිවාඩු/සතිඅන්ත නම් Req 0 වේ.
        let baseReq = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;
        
        if (leaveData) {
            if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") baseReq = 0;
            else if (leaveData.type === "Half Day") baseReq = 4.5;
        }
        return { worked: 0, req: baseReq, ot: 0, sOT: 0, isFullDay: false };
    }

    let [h1, m1] = inTime.split(':').map(Number);
    let [h2, m2] = outTime.split(':').map(Number);
    
    let totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (isNextDay) totalMinutes += 1440;

    // Short Leave Bonus Logic
    let shortLeaveBonusMinutes = 0;
    if (leaveData && leaveData.type === "Short Leave") {
        let arrivalMin = h1 * 60 + m1;
        let exitMin = h2 * 60 + m2;
        if (leaveData.slot === "Morning") shortLeaveBonusMinutes = Math.min(90, Math.max(0, arrivalMin - 510));
        else if (leaveData.slot === "Evening") shortLeaveBonusMinutes = Math.min(90, Math.max(0, 1020 - exitMin));
    }
    
    let finalMinutes = totalMinutes + shortLeaveBonusMinutes;
    let hWork = Math.floor(finalMinutes / 60);
    let mWork = finalMinutes % 60;
    let roundedWorked = hWork + (mWork >= 25 && mWork <= 54 ? 0.5 : (mWork >= 55 ? 1.0 : 0));

    let isFullDay = roundedWorked >= 15; 
    
    // Friday & Day-Night Logic
    // කලින් දවසේ Full Shift එකක් කළා නම් අද Req 0 වේ.
    let req = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;

    if (leaveData) {
        if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") {
            req = isFullDay ? 9 : 0; 
        } else if (leaveData.type === "Half Day") {
            req = Math.max(0, req - 4.5);
        }
    } else if (isFullDay && req > 0) {
        // සිකුරාදා (Day 5) දිනක Full Shift කළහොත් Req 9 ක් පමණි (සෙනසුරාදා නිවාඩු නිසා)
        if (dayOfWeek === 5) {
            req = 9;
        } else {
            req = isLastDay ? 9 : 18; 
        }
    }

    let ot = (dayOfWeek === 0 || isHoliday) ? 0 : Math.max(0, roundedWorked - req);
    let sOT = (dayOfWeek === 0 || isHoliday) ? roundedWorked : 0;

    return { worked: roundedWorked, req, ot, sOT, isFullDay };
}
