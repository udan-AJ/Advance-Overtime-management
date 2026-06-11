export function generateAdminPDF(data) {
    // Columns Grand Totals Calculate කිරීම
    let totalNormalOT = 0;
    let totalSpecialOT = 0;
    let totalLieu = 0;
    let totalNoPay = 0;

    if (data.rows && Array.isArray(data.rows)) {
        data.rows.forEach(r => {
            totalNormalOT += r.normalOT || 0;
            totalSpecialOT += r.specialOT || 0;
            totalLieu += r.lieuDays || 0;
            totalNoPay += r.noPayDays || 0;
        });
    }

    const hName = (data.hod && data.hod.name) ? data.hod.name : "...................................................";
    const hPos = (data.hod && data.hod.position) ? data.hod.position : "HEAD OF THE DEPT.";

    const content = `
        <div style="font-family: 'Trebuchet MS', Arial, sans-serif; padding: 15px; color: #000; font-size: 10.5px; line-height: 1.3;">
            <!-- Report Header -->
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 8px;">
                <h2 style="margin:0; font-size: 16px; font-weight: bold; text-transform: uppercase;">CIC FEEDS (PVT) LTD.</h2>
                <h3 style="margin:2px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #444;">QUALITY ASSURANCE DEPARTMENT</h3>
                <h4 style="margin:6px 0 0 0; font-size: 11px; text-decoration: underline; font-weight: bold; text-transform: uppercase;">MONTHLY OVERTIME SUMMARY REPORT</h4>
                <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: bold;">MONTH: ${data.monthName} ${data.year}</p>
            </div>

            <!-- Main Summary Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9.5px; text-align: center; table-layout: fixed;">
                <thead>
                    <tr style="background: #e5e7eb; font-weight: bold;">
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 13%;">EPF NO</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 31%; text-align: left; padding-left: 6px;">EMPLOYEE NAME</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">NORMAL OT (HRS)</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">SPECIAL OT (HRS)</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">LIEU LEAVES</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">NO PAY DAYS</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.rows.map(row => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 6px 2px; font-weight: bold;">${row.epf}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px; text-align: left; padding-left: 6px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${row.name}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${(row.normalOT || 0).toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${(row.specialOT || 0).toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.lieuDays || 0}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${(row.noPayDays || 0).toFixed(1)}</td>
                        </tr>
                    `).join('')}
                    
                    <!-- Grand Total Row -->
                    <tr style="background: #f3f4f6; font-weight: bold; border-top: 2px solid #000;">
                        <td colspan="2" style="border: 1px solid #000; padding: 8px 4px; text-align: right; padding-right: 10px; font-size: 10px;">GRAND TOTAL</td>
                        <td style="border: 1px solid #000; padding: 8px 2px; font-size: 10px;">${totalNormalOT.toFixed(1)}</td>
                        <td style="border: 1px solid #000; padding: 8px 2px; font-size: 10px;">${totalSpecialOT.toFixed(1)}</td>
                        <td style="border: 1px solid #000; padding: 8px 2px; font-size: 10px;">${totalLieu}</td>
                        <td style="border: 1px solid #000; padding: 8px 2px; font-size: 10px;">${totalNoPay.toFixed(1)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- Dynamic Left-Aligned Single Signature Section -->
            <div style="margin-top: 60px; font-size: 10px; text-align: left;">
                <p style="margin: 0 0 4px 0;">............................................................</p>
                <p style="margin: 0 0 2px 0; font-weight: bold; text-transform: uppercase; letter-spacing: 0.3px;">${hName}</p>
                <p style="margin: 0; font-weight: bold; text-transform: uppercase; color: #444; font-size: 9px;">${hPos}</p>
            </div>
        </div>
    `;

    const opt = {
        margin: 0.1,
        filename: `CIC_Monthly_Summary_Report_${data.monthName}_${data.year}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } 
    };

    html2pdf().from(content).set(opt).save();
}
