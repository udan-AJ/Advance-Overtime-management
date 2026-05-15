export function generatePDF(data, rows, name, epf) {
    // Logic: Working Days = Total Days - (Saturdays + Sundays + Holidays)
    const officialWorkingDays = data.daysInMonth - (data.weekendCount + data.holidayCount);

    const content = `
        <div style="font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; padding: 20px; color: #000; font-size: 11px; line-height: 1.3;">
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
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 12%; word-wrap: break-word;">DATE</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 10%; word-wrap: break-word;">TIME IN</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 10%; word-wrap: break-word;">TIME OUT</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 10%; word-wrap: break-word;">TOTAL HOURS</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 18%; word-wrap: break-word;">TYPE OF WORKS</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 10%; word-wrap: break-word;">OVER TIME</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 15%; word-wrap: break-word;">SIGNATURE OF EMPLOYEE</th>
                        <th style="border: 1px solid #000; padding: 6px 2px; width: 15%; word-wrap: break-word;">SIGNATURE OF SUPERVISOR</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 6px 2px; font-weight: bold;">${row.date}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.in}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.out}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.worked || 0}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px; font-weight: bold; font-size: 8px;">${row.type}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px; font-weight: bold;">${(row.ot + row.sOT).toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;"></td>
                            <td style="border: 1px solid #000; padding: 6px 2px;"></td>
                        </tr>
                    `).join('')}
                    <tr style="background: #fafafa; font-weight: bold;">
                        <td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: right;">TOTAL OT HOURS</td>
                        <td style="border: 1px solid #000; padding: 8px;">${(data.tNormalOT + data.tSpecialOT).toFixed(1)}</td>
                        <td style="border: 1px solid #000;"></td>
                        <td style="border: 1px solid #000;"></td>
                    </tr>
                </tbody>
            </table>

            <div style="font-size: 11px; font-weight: bold; background: #fdfdfd; padding: 12px; border: 1px solid #eee; border-radius: 8px;">
                <div style="display: table; width: 100%;">
                    <div style="display: table-row;">
                        <div style="display: table-cell; width: 220px; padding: 3px 0;">NO. OF WORKING DAYS IN THE MONTH</div>
                        <div style="display: table-cell; width: 20px;">-</div>
                        <div style="display: table-cell; padding-left: 15px;">${officialWorkingDays}</div>
                    </div>
                    <div style="display: table-row;">
                        <div style="display: table-cell; padding: 3px 0;">NO. OF LEAVES TAKEN</div>
                        <div style="display: table-cell;">-</div>
                        <div style="display: table-cell; padding-left: 15px;">${data.fullLeaveCount + (data.halfDayCount * 0.5)}</div>
                    </div>
                    <div style="display: table-row; border-top: 1px dotted #ccc;">
                        <div style="display: table-cell; padding: 6px 0 3px 0;">∴ NO. OF HOURS HE SHOULD WORK</div>
                        <div style="display: table-cell; padding-top: 6px;">-</div>
                        <div style="display: table-cell; padding-left: 15px; padding-top: 6px;">${data.tShouldWork}</div>
                    </div>
                    <div style="display: table-row;"><div style="display: table-cell; height: 10px;"></div></div>
                    <div style="display: table-row;">
                        <div style="display: table-cell; padding: 3px 0;">TOTAL HOURS OF NORMAL OVERTIME</div>
                        <div style="display: table-cell;">-</div>
                        <div style="display: table-cell; padding-left: 15px;">${data.tNormalOT.toFixed(1)}</div>
                    </div>
                    <div style="display: table-row;">
                        <div style="display: table-cell; padding: 3px 0;">TOTAL HOURS OF SPECIAL OVERTIME</div>
                        <div style="display: table-cell;">-</div>
                        <div style="display: table-cell; padding-left: 15px;">${data.tSpecialOT.toFixed(1)}</div>
                    </div>
                    <div style="display: table-row;">
                        <div style="display: table-cell; padding: 3px 0;">NUMBER OF SPECIAL LIEU LEAVES</div>
                        <div style="display: table-cell;">-</div>
                        <div style="display: table-cell; padding-left: 15px;">${data.tLieuDays}</div>
                    </div>
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
        filename: `CIC_OT_Report_${data.monthName}_${data.year}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(content).set(opt).save();
}
