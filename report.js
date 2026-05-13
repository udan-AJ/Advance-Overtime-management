export function generatePDF(data, rows, name, epf) {
    const content = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #000; font-size: 11px; line-height: 1.4;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <h2 style="margin:0; font-size: 16px; font-weight: bold;">CIC FEEDS (PVT) LTD.</h2>
                    <h3 style="margin:0; font-size: 12px; font-weight: bold;">QUALITY ASSURANCE DEPARTMENT</h3>
                    <h4 style="margin:8px 0; font-size: 11px; text-decoration: underline; font-weight: bold;">OVER TIME CLAIM FORM - MONTH - ${data.monthName} - ${data.year}</h4>
                </div>
                <div style="text-align: right; font-size: 8px; font-weight: bold; color: #555;">
                    IR - Ingredient Receiving<br>DR - Drug Room<br>FFL - Finished Feed Line<br>LAB - Laboratory Works
                </div>
            </div>

            <div style="margin-bottom: 25px; font-size: 12px; font-weight: bold;">
                <p style="margin: 4px 0;">NAME : ${name.toUpperCase()}</p>
                <p style="margin: 4px 0;">EPF NO. : ${epf.toUpperCase()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 10px; text-align: center;">
                <thead>
                    <tr style="background: #f2f2f2;">
                        <th style="border: 1px solid #000; padding: 8px;">DATE</th>
                        <th style="border: 1px solid #000; padding: 8px;">TIME IN</th>
                        <th style="border: 1px solid #000; padding: 8px;">TIME OUT</th>
                        <th style="border: 1px solid #000; padding: 8px;">Total Hours</th>
                        <th style="border: 1px solid #000; padding: 8px;">Type OF Works</th>
                        <th style="border: 1px solid #000; padding: 8px;">Over Time</th>
                        <th style="border: 1px solid #000; padding: 8px;">SIGNATURE</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${row.date}</td>
                            <td style="border: 1px solid #000; padding: 6px;">${row.in}</td>
                            <td style="border: 1px solid #000; padding: 6px;">${row.out}</td>
                            <td style="border: 1px solid #000; padding: 6px;">${row.worked || 0}</td>
                            <td style="border: 1px solid #000; padding: 6px; font-size: 9px; font-style: italic;">${row.type}</td>
                            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">${(row.ot + row.sOT).toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 6px;"></td>
                        </tr>
                    `).join('')}
                    <tr style="background: #fafafa; font-weight: bold;">
                        <td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: right;">Total OT Hours</td>
                        <td style="border: 1px solid #000; padding: 8px;">${(data.tNormalOT + data.tSpecialOT).toFixed(1)}</td>
                        <td style="border: 1px solid #000;"></td>
                    </tr>
                </tbody>
            </table>

            <div style="font-size: 11px; font-weight: bold; background: #fdfdfd; padding: 15px; border: 1px solid #eee; border-radius: 10px;">
                <p style="margin: 6px 0;">NO. OF WORKING DAYS IN THE MONTH - <span style="margin-left: 10px;">${data.workingDays}</span></p>
                <p style="margin: 6px 0;">NO. OF LEAVES TAKEN - <span style="margin-left: 77px;">${data.fullLeaveCount + (data.halfDayCount * 0.5)}</span></p>
                <p style="margin: 6px 0; border-top: 1px dotted #ccc; padding-top: 6px;">∴ NO. OF HOURS HE SHOULD WORK - <span style="margin-left: 18px;">${data.tShouldWork}</span></p>
                <br>
                <p style="margin: 6px 0;">TOTAL HOURS OF NORMAL OVERTIME - <span style="margin-left: 15px;">${data.tNormalOT.toFixed(1)}</span></p>
                <p style="margin: 6px 0;">TOTAL HOURS OF SPECIAL OVERTIME - <span style="margin-left: 15px;">${data.tSpecialOT.toFixed(1)}</span></p>
                <p style="margin: 6px 0;">NUMBER OF SPECIAL LIEU LEAVES - <span style="margin-left: 60px;">${data.tLieuDays}</span></p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px; margin-top: 60px; font-size: 11px; font-weight: bold;">
                <p>PREPARED BY : ............................................................</p>
                <p>CHECKED BY : ............................................................</p>
                <p>HEAD OF THE DEPT. : ............................................................</p>
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
