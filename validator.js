// validator.js
import { calculateRow } from './calculator.js';

export function validateMonthSheet(savedData, userHolidays, userLeaves, daysInMonth, year, month) {
    let validationResults = {};

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
        const isoDate = dateObj.toLocaleDateString('en-CA');
        
        const isHoliday = userHolidays.includes(isoDate);
        const dayData = savedData[String(d)] || { in: "00:00", out: "00:00", isNextDay: false, workType: "" };
        const leaveData = userLeaves[d];
        
        const hasData = (dayData.in && dayData.out && dayData.in !== "00:00" && dayData.out !== "00:00");
        const isWeekendOrHoliday = (dayOfWeek === 0 || dayOfWeek === 6 || isHoliday);

        // --- RULE 1: කලින් දවසේ Full Shift (Day-Night) එකක් කරලද බැලීම ---
        let wasFullDayShift = false;
        if (d > 1) {
            const prevDayData = savedData[String(d - 1)] || { in: "00:00", out: "00:00", isNextDay: false };
            const prevLeave = userLeaves[d - 1];
            const prevDateObj = new Date(year, month, d - 1);
            const prevIso = prevDateObj.toLocaleDateString('en-CA');
            const prevRes = calculateRow(prevDayData.in, prevDayData.out, userHolidays.includes(prevIso), prevDateObj.getDay(), prevDayData.isNextDay, false, prevLeave, false);
            wasFullDayShift = prevRes.isFullDay;
        }

        // --- RULE 2: සතියේ සාමාන්‍ය දිනක වැඩට පැමිණීම හෝ නිවාඩු වාර්තා පරීක්ෂාව ---
        if (!isWeekendOrHoliday && !wasFullDayShift) {
            if (!hasData && !leaveData) {
                validationResults[d] = { status: "ERROR", msg: "LEAVE (No Attendance & No Leave Recorded)" };
                continue;
            }
        }

        // --- RULE 3: වේලාවන් සහ Shift වර්ගය පරීක්ෂාව (In/Out Time & Hours Rules) ---
        if (hasData) {
            let [h1, m1] = dayData.in.split(':').map(Number);
            let [h2, m2] = dayData.out.split(':').map(Number);
            
            let totalMin = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (dayData.isNextDay) totalMin += 1440;
            let workedHours = totalMin / 60;

            const inTimeNum = h1 + (m1 / 60);
            const outTimeNum = h2 + (m2 / 60);

            // Shift Logic Verification
            if (dayData.isNextDay) {
                // Day-Night Shift එකක් නම් පැය 15කට වඩා තිබිය යුතු අතර Next Day Tick එක තිබිය යුතුය
                if (workedHours < 15) {
                    validationResults[d] = { status: "ERROR", msg: `Day-Night expected but worked only ${workedHours.toFixed(1)} Hrs` };
                } else {
                    validationResults[d] = { status: "OK", msg: `Day-Night Shift OK (${workedHours.toFixed(1)} Hrs)` };
                }
            } else {
                // සාමාන්‍ය Day Shift හෝ Night Shift
                if (inTimeNum >= 17 || inTimeNum < 4) { 
                    // සවස 5න් පසු හෝ පාන්දර 4ට පෙර ආවොත් Night Shift එකක් ලෙස උපකල්පනය කරයි
                    if (workedHours < 9) {
                        validationResults[d] = { status: "ERROR", msg: `Night Shift short hours (${workedHours.toFixed(1)}/9.0 Hrs)` };
                    } else {
                        validationResults[d] = { status: "OK", msg: `Night Shift OK (${workedHours.toFixed(1)} Hrs)` };
                    }
                } else {
                    // සාමාන්‍ය Day Shift එකක් පැය 9ක් විය යුතුය
                    if (workedHours < 9) {
                        validationResults[d] = { status: "ERROR", msg: `Day Shift short hours (${workedHours.toFixed(1)}/9.0 Hrs)` };
                    } else {
                        validationResults[d] = { status: "OK", msg: `Day Shift OK (${workedHours.toFixed(1)} Hrs)` };
                    }
                }
            }
        } else if (leaveData) {
            validationResults[d] = { status: "OK", msg: `Approved Leave (${leaveData.type})` };
        } else {
            validationResults[d] = { status: "OK", msg: isHoliday ? "Public/Poya Holiday" : "Weekend Off" };
        }
    }

    return validationResults;
}
