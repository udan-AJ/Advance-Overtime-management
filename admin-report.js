export function generateAdminPDF(data) {
    // Columns Grand Totals Calculate කිරීම
    let totalNormalOT = 0;
    let totalSpecialOT = 0;
    let totalLieu = 0;
    let totalNoPay = 0;

    data.rows.forEach(r => {
        totalNormalOT += r.normalOT;
        totalSpecialOT += r.specialOT;
        totalLieu += r.lieuDays;
        totalNoPay += r.noPayDays;
    });

    const content = `
        <div style="font-family: 'Trebuchet MS', Arial, sans-serif; padding: 15px; color: #000; font-size: 10.5px; line-height: 1.3;">
            <!-- Report Header -->
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 8px;">
                <h2 style="margin:0; font-size: 16px; font-weight: bold; text-transform: uppercase;">CIC FEEDS (PVT) LTD.</h2>
                <h3 style="margin:2px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #444;">QUALITY ASSURANCE DEPARTMENT</h3>
                <h4 style="margin:6px 0 0 0; font-size: 11px; text-decoration: underline; font-weight: bold; text-transform: uppercase;">MONTHLY OVERTIME & LEAVE SUMMARY REPORT</h4>
                <p style="margin: 4px 0 0 0; font-size: 10px; font-weight: bold;">MONTH: ${data.monthName} ${data.year}</p>
            </div>

            <!-- Main Summary Table (Optimized for Portrait) -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 9.5px; text-align: center; table-layout: fixed;">
                <thead>
                    <tr style="background: #e5e7eb; font-weight: bold;">
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 13%;">EPF NO</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 31%; text-align: left; padding-left: 6px;">EMPLOYEE NAME</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">NORMAL OT (HRS)</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">SPECIAL OT (HRS)</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">SPECIAL LIEU</th>
                        <th style="border: 1px solid #000; padding: 7px 2px; width: 14%;">NO PAY DAYS</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.rows.map(row => `
                        <tr>
                            <td style="border: 1px solid #000; padding: 6px 2px; font-weight: bold;">${row.epf}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px; text-align: left; padding-left: 6px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${row.name}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.normalOT.toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.specialOT.toFixed(1)}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.lieuDays}</td>
                            <td style="border: 1px solid #000; padding: 6px 2px;">${row.noPayDays.toFixed(1)}</td>
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

            <!-- Signatures Section -->
            <div style="margin-top: 50px; font-size: 10.5px; font-weight: bold;">
                <div style="display: table; width: 100%; border-spacing: 0 30px;">
                    <div style="display: table-row;">
                        <div style="display: table-cell; width: 150px;">PREPARED BY (ADMIN)</div>
                        <div style="display: table-cell; width: 15px;">:</div>
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
        filename: `CIC_Monthly_Summary_Report_${data.monthName}_${data.year}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } // මෙතන 'portrait' වලට මාරු කළා
    };

    html2pdf().from(content).set(opt).save();
}
