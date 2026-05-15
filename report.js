export function generatePDF(data, rows, name, epf, userLeaves) {
    const formatAMPM = (timeStr) => {
        if (!timeStr || timeStr === "-" || timeStr === "00:00") return "-";
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        return `${hours}:${minutes} ${ampm}`;
    };

    const officialWorkingDays = data.daysInMonth - (data.weekendCount + data.holidayCount);

    // Filter logic: Worked hours 0 ta wadi (overtime karapu) dawas witarak table ekata gannawa
    const filteredOTRows = rows.filter(row => row.worked > 0);

    // Index eke leaves section eken okkoma leaves summary ekata gannawa
    const leaveEntries = Object.entries(userLeaves || {})
        .map(([day, val]) => ({
            day: parseInt(day),
            date: `${data.year}/${data.monthId.split('-')[1].padStart(2,'0')}/${day.padStart(2,'0')}`,
            type: val.type
        }))
        .sort((a, b) => a.day - b.day);

    const cleanName = name.trim().replace(/\s+/g, '_');
    const cleanEpf = epf.trim().replace(/\s+/g, '_');

    const content = `
        <div style="font-family: 'Trebuchet MS', Arial, sans-serif; padding: 20px; color: #000; font-size: 11px; line-height: 1.3;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <div>
                    <h2 style="margin:0; font-size: 15px; font-weight: bold;">CIC FEEDS (PVT) LTD.</h2>
                    <h3 style="margin:0; font-size: 12px; font-weight: bold;">QUALITY ASSURANCE DEPARTMENT</h3>
                    <h4 style="margin:5px 0; font-size: 11px; text-decoration: underline; font-weight: bold;">OVER TIME CLAIM FORM - MONTH - ${data.monthName} - ${data.year}</h4>
                </div>
                <div style="text-align: right; font-size: 9px; font-weight: bold; color: #333;">
                    IR - INGREDIENT RECEIVING | DR - DRUG ROOM<br>FFL - FINISHED FEED LINE | LAB - LABORATORY WORKS
                </div>
            </div>

            <div style="margin-bottom: 15px; font-size: 12px; font-weight: bold;">
                <p style="margin: 3px 0;">NAME : ${name.toUpperCase()}</p>
                <p style="margin: 3px 0;">EPF NO. : ${epf.toUpperCase()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9px; text-align: center; table-layout: fixed;">
                <thead>
                    <tr style="background: #f2f2f2; font-weight: bold;">
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 12%;">DATE</th>
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 12%;">TIME IN</th>
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 12%;">TIME OUT</th>
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 10%;">TOTAL HOURS</th>
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 12%;">OVER TIME</th>
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 17%;">SIGNATURE OF EMPLOYEE</th>
                        <th style="border: 1px solid #000; padding: 5.5px 2px; width: 17%;">SIGNATURE OF SUPERVISOR</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredOTRows.map(row => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 5.5px 2px; font-weight: bold;">${row.date}</td>
                            <td style="border: 1px solid #000; padding: 5.5px 2px;">${formatAMPM(row.in)}</td>
                            <td style="border: 1px solid #000; padding: 5.5px 2px;">${formatAMPM(row.out)}</td>
                            <td style="border: 1px solid #000; padding: 5.5px 2px;">${row.worked || 0}</td>
                            <td style="border: 1px solid #000; padding: 5.5px 2px; font-weight: bold;">${(row.ot + row.sOT).toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 5.5px 2px;"></td>
                            <td style="border: 1px solid #000; padding: 5.5px 2px;"></td>
                        </tr>
                    `).join('')}
                    <tr style="background: #fafafa; font-weight: bold;">
                        <td colspan="4" style="border: 1px solid #000; padding: 7px; text-align: right;">TOTAL OT HOURS</td>
                        <td style="border: 1px solid #000; padding: 7px;">${(data.tNormalOT + data.tSpecialOT).toFixed(1)}</td>
                        <td style="border: 1px solid #000;"></td>
                        <td style="border: 1px solid #000;"></td>
                    </tr>
                </tbody>
            </table>

            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div style="flex: 3; font-size: 10px; font-weight: bold; background: #fdfdfd; padding: 12px; border: 1px solid #eee; border-radius: 8px;">
                    <div style="display: table; width: 100%;">
                        <div style="display: table-row;">
                            <div style="display: table-cell; width: 180px; padding: 2px 0;">NO. OF WORKING DAYS IN THE MONTH</div>
                            <div style="display: table-cell; width: 15px;">-</div>
                            <div style="display: table-cell; padding-left: 10px;">${officialWorkingDays}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 2px 0;">NO. OF LEAVES TAKEN</div>
                            <div style="display: table-cell;">-</div>
                            <div style="display: table-cell; padding-left: 10px;">${data.fullLeaveCount + (data.halfDayCount * 0.5)}</div>
                        </div>
                        <div style="display: table-row; border-top: 1px dotted #ccc;">
                            <div style="display: table-cell; padding: 4px 0 2px 0;">∴ NO. OF HOURS HE SHOULD WORK</div>
                            <div style="display: table-cell; padding-top: 4px;">-</div>
                            <div style="display: table-cell; padding-left: 10px; padding-top: 4px;">${data.tShouldWork}</div>
                        </div>
                        <div style="display: table-row;"><div style="display: table-cell; height: 8px;"></div></div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 2px 0;">TOTAL HOURS OF NORMAL OVERTIME</div>
                            <div style="display: table-cell;">-</div>
                            <div style="display: table-cell; padding-left: 10px;">${data.tNormalOT.toFixed(1)}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 2px 0;">TOTAL HOURS OF SPECIAL OVERTIME</div>
                            <div style="display: table-cell;">-</div>
                            <div style="display: table-cell; padding-left: 10px;">${data.tSpecialOT.toFixed(1)}</div>
                        </div>
                        <div style="display: table-row;">
                            <div style="display: table-cell; padding: 2px 0;">NUMBER OF SPECIAL LIEU LEAVES</div>
                            <div style="display: table-cell;">-</div>
                            <div style="display: table-cell; padding-left: 10px;">${data.tLieuDays}</div>
                        </div>
                    </div>
                </div>

                <div style="flex: 2; font-size: 9px; background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 8px;">
                    <div style="font-weight: bold; border-bottom: 1px solid #000; margin-bottom: 5px; padding-bottom: 2px; text-transform: uppercase;">Leaves Summary</div>
                    ${leaveEntries.length > 0 ? `
                        <table style="width: 100%; border-collapse: collapse;">
                            ${leaveEntries.map(l => `
                                <tr>
                                    <td style="padding: 2px 0; font-weight: bold; width: 50%;">${l.date}</td>
                                    <td style="padding: 2px 0; color: #555;">${l.type}</td>
                                </tr>
                            `).join('')}
                        </table>
                    ` : '<p style="color: #999; font-style: italic;">No leaves recorded.</p>'}
                </div>
            </div>

            <div style="margin-top: 60px; font-size: 11px; font-weight: bold;">
                <div style="display: table; width: 100%; border-spacing: 0 25px;">
                    <div style="display: table-row;">
                        <div style="display: table-cell; width: 140px;">PREPARED BY</div>
                        <div style="display: table-cell; width: 20px;">:</div>
                        <div style="display: table-cell;">............................................................</div>
                    </div>
                    <div style="display: table-row;">
                        <div style="display: table-cell;">CHECKED BY</div>
                        <div style="display: table-cell;">:</div>
                        <div style="display: table-cell;">............................................................</div>
                    </div>
                    <div style="display: table-row;">
                        <div style="display: table-cell;">HEAD OF THE DEPT.</div>
                        <div style="display: table-cell;">:</div>
                        <div style="display: table-cell;">............................................................</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const opt = {
        margin: 0.1,
        filename: `${cleanEpf}_${cleanName}_${data.year}_${data.monthName}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(content).set(opt).save();
}
