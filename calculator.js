export function cleanTime(val) {
    if (!val || val === "-" || val === "" || val === "00:00") return "00:00";
    let m = String(val).match(/(\d{1,2}):(\d{1,2})/);
    return m ? `${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}` : "00:00";
}

export function calculateRow(inTime, outTime, isHoliday, dayOfWeek, isNextDay, wasFullDayShift, leaveData, isNextDayOff, acceptOver24 = false) {
    const hasData = (inTime && outTime && inTime !== "00:00" && outTime !== "00:00");
    
    // දත්ත නොමැති දින සඳහා
    if (!hasData) {
        let baseReq = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;
        
        if (leaveData) {
            if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") baseReq = 0;
            else if (leaveData.type === "Half Day") baseReq = Math.max(0, baseReq - 4.5);
        }
        return { worked: 0, req: baseReq, ot: 0, sOT: 0, isFullDay: false };
    }

    let [h1, m1] = inTime.split(':').map(Number);
    let [h2, m2] = outTime.split(':').map(Number);
    
    let totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (isNextDay) totalMinutes += 1440;

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

    if (roundedWorked > 24 && !acceptOver24) {
        roundedWorked = 24.0;
    }

    let isFullDay = roundedWorked >= 15; 
    
    let req = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;

    // 1. මුලින්ම Day/Night Shift එකක්ද කියලා බලලා Base Req එක 18ක් (හෝ 9ක්) කරනවා
    if (isFullDay && req > 0) {
        req = isNextDayOff ? 9 : 18; 
    }

    // 2. ඊටපස්සේ තමයි ඒ හැදුණු Base Req එකෙන් Leave අගයන් අඩු කරන්නේ
    if (leaveData) {
        if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") {
            // Full Day එකක් නම් පැය 9ක් අඩු වෙනවා (18 තිබ්බොත් 9 වෙනවා, 9 තිබ්බොත් 0 වෙනවා)
            req = Math.max(0, req - 9); 
        } else if (leaveData.type === "Half Day") {
            // Half Day එකක් නම් පැය 4.5ක් අඩු වෙනවා (18 තිබ්බොත් 13.5 වෙනවා)
            req = Math.max(0, req - 4.5);
        }
    }

    let ot = (dayOfWeek === 0 || isHoliday) ? 0 : Math.max(0, roundedWorked - req);
    let sOT = (dayOfWeek === 0 || isHoliday) ? roundedWorked : 0;

    return { worked: roundedWorked, req, ot, sOT, isFullDay };
}
