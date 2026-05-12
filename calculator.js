export function cleanTime(val) {
    if (!val || val === "-" || val === "" || val === "00:00") return "00:00";
    let m = String(val).match(/(\d{1,2}):(\d{1,2})/);
    return m ? `${m[1].padStart(2,'0')}:${m[2].padStart(2,'0')}` : "00:00";
}

export function calculateRow(inTime, outTime, isHoliday, dayOfWeek, isNextDay, wasFullDayShift, leaveData, isLastDay) {
    // දත්ත තිබේදැයි පරීක්ෂා කිරීම (හිස් නම් හෝ 00:00 නම් hasData = false වේ)
    const hasData = (inTime && outTime && inTime !== "00:00" && outTime !== "00:00");
    
    // දත්ත නොමැති දින සඳහා වන Logic එක
    if (!hasData) {
        // සති අන්ත හෝ නිවාඩු දින නොවේ නම් සාමාන්‍යයෙන් පැය 9ක් වැඩ කළ යුතුය
        let baseReq = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday) ? 0 : 9;
        
        // නිවාඩු (Leaves) ඇතුළත් කර ඇත්නම් ඒ අනුව Required පැය වෙනස් කිරීම
        if (leaveData) {
            if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") baseReq = 0;
            else if (leaveData.type === "Half Day") baseReq = 4.5;
        }

        return { 
            worked: 0, 
            req: baseReq, 
            ot: 0, 
            sOT: 0, 
            isFullDay: false 
        };
    }

    // දත්ත පවතින විට ගණනය කිරීම් ආරම්භය
    let [h1, m1] = inTime.split(':').map(Number);
    let [h2, m2] = outTime.split(':').map(Number);
    
    let totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    
    // පසුදාට මාරු වන shift එකක් නම් පමණක් පැය 24ක් (මිනිත්තු 1440) එකතු කරයි
    if (isNextDay) totalMinutes += 1440;

    // Short Leave Bonus මිනිත්තු එකතු කිරීම
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
    
    // පැය 0.5 හෝ 1.0 ට වට කිරීම
    let roundedWorked = hWork + (mWork >= 25 && mWork <= 54 ? 0.5 : (mWork >= 55 ? 1.0 : 0));

    let isFullDay = roundedWorked >= 15; 
    let req = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday || wasFullDayShift) ? 0 : 9;

    // නිවාඩු හෝ විශේෂ shift අවස්ථා වල Required පැය ගැලපීම
    if (leaveData) {
        if (leaveData.type === "Full Leave" || leaveData.type === "Lieu Leave") {
            req = isFullDay ? 9 : 0; 
        } else if (leaveData.type === "Half Day") {
            req = Math.max(0, req - 4.5);
        }
    } else if (isFullDay && req > 0) {
        req = isLastDay ? 9 : 18; 
    }

    let ot = (dayOfWeek === 0 || isHoliday) ? 0 : Math.max(0, roundedWorked - req);
    let sOT = (dayOfWeek === 0 || isHoliday) ? roundedWorked : 0;

    return { worked: roundedWorked, req, ot, sOT, isFullDay };
}
