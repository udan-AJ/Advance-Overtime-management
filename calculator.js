export function cleanTime(val) {
    if (!val || val === "-" || val === "" || val === "00:00") return "00:00";
    let m = String(val).match(/(\d{1,2}):(\d{1,2})/);
    return m ? `${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}` : "00:00";
}

export function calculateRow(inTime, outTime, isHoliday, dayOfWeek, isNextDay, wasFullDayShift, leaveData, isLastDay) {
    const hasData = (inTime && outTime && inTime !== "00:00" && outTime !== "00:00");
    
    if (!hasData) {
        let baseReq = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) ? 0 : 9;
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

    // --- Short Leave Logic (Worked Hours වලට එකතු කිරීම) ---
    let shortLeaveBonusMinutes = 0;
    if (leaveData && leaveData.type === "Short Leave") {
        let arrivalMin = h1 * 60 + m1;
        let exitMin = h2 * 60 + m2;

        if (leaveData.slot === "Morning") {
            // Morning Shift: 08:30 සිට In Time එක දක්වා
            shortLeaveBonusMinutes = Math.min(90, Math.max(0, arrivalMin - 510));
        } 
        else if (leaveData.slot === "Evening") {
            // Evening Shift: Out Time සිට 17:00 (05:00 PM) දක්වා
            shortLeaveBonusMinutes = Math.min(90, Math.max(0, 1020 - exitMin));
        } 
        else if (leaveData.slot === "Night Start") {
            // Night Shift Start: 20:00 (08:00 PM) සිට In Time දක්වා
            shortLeaveBonusMinutes = Math.min(90, Math.max(0, arrivalMin - 1200));
        }
        else if (leaveData.slot === "Night End") {
            // Night Shift End: Out Time සිට 05:00 AM (පසුදා) දක්වා
            shortLeaveBonusMinutes = Math.min(90, Math.max(0, 300 - exitMin));
        }
    }
    
    let finalMinutes = totalMinutes + shortLeaveBonusMinutes;
    let hWork = Math.floor(finalMinutes / 60);
    let mWork = finalMinutes % 60;
    let roundedWorked = hWork + (mWork >= 25 && mWork <= 54 ? 0.5 : (mWork >= 55 ? 1.0 : 0));

    let isFullDay = roundedWorked >= 15; 
    
    // Short Leave තිබුණත් සාමාන්‍ය දවසක Required පැය 9 ම වේ
    let req = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;

    if (leaveData) {
        if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") {
            req = isFullDay ? 9 : 0; 
        } else if (leaveData.type === "Half Day") {
            req = Math.max(0, req - 4.5);
        }
        // Short Leave සඳහා මෙහිදී req වෙනස් නොකරයි (එය 9 ලෙස පවතී)
    } else if (isFullDay && req > 0) {
        req = isLastDay ? 9 : 18; 
    }

    let ot = (dayOfWeek === 0 || isHoliday) ? 0 : Math.max(0, roundedWorked - req);
    let sOT = (dayOfWeek === 0 || isHoliday) ? roundedWorked : 0;

    return { worked: roundedWorked, req, ot, sOT, isFullDay };
}
