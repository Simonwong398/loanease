import { jsPDF } from 'jspdf';
import { PaymentMethod } from './loanCalculations';
import { ExportOptions } from '../types/export';

export async function generatePDF(
  loanData: PaymentMethod,
  options: ExportOptions
): Promise<string> {
  const doc = new jsPDF();
  const { template } = options;

  // 添加水印
  if (options.watermark) {
    doc.setTextColor(200);
    doc.setFontSize(40);
    doc.text(options.watermark, 30, 100, { angle: 45 });
  }

  // 根据模板配置生成内容
  template.sections.forEach((section, index) => {
    if (!section.enabled) return;

    switch (section.type) {
      case 'basic':
        generateBasicInfo(doc, loanData);
        break;
      case 'schedule':
        generateSchedule(doc, loanData, section.options);
        break;
      case 'analysis':
        generateAnalysis(doc, loanData, section.options);
        break;
      case 'comparison':
        generateComparison(doc, loanData, section.options);
        break;
    }

    // 添加分页
    if (index < template.sections.length - 1) {
      doc.addPage();
    }
  });

  // 如果设置了密码，添加加密
  if (options.password) {
    doc.setEncryption(options.password);
  }

  // 保存文件
  const fileName = `loan_report_${Date.now()}.pdf`;
  const filePath = `${__dirname}/exports/${fileName}`;
  await doc.save(filePath);

  return filePath;
}

function generateBasicInfo(doc: jsPDF, loanData: PaymentMethod) {
  doc.setFontSize(16);
  doc.text('贷款基本信息', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`贷款金额: ¥${loanData.totalPayment - loanData.totalInterest}`, 20, 40);
  doc.text(`月供: ¥${loanData.monthlyPayment}`, 20, 50);
  doc.text(`总利息: ¥${loanData.totalInterest}`, 20, 60);
  doc.text(`总还款: ¥${loanData.totalPayment}`, 20, 70);
}

function generateSchedule(
  doc: jsPDF,
  loanData: PaymentMethod,
  options?: { detailLevel?: 'summary' | 'detailed' }
) {
  doc.setFontSize(16);
  doc.text('还款计划', 20, 90);

  if (options?.detailLevel === 'detailed') {
    // 生成详细还款计划
    const headers = ['期数', '月供', '本金', '利息', '剩余本金'];
    const startY = 110;
    const rowHeight = 10;

    doc.setFontSize(10);
    headers.forEach((header, index) => {
      doc.text(header, 20 + index * 35, startY);
    });

    loanData.schedule.forEach((item, index) => {
      const y = startY + (index + 1) * rowHeight;
      doc.text(item.month.toString(), 20, y);
      doc.text(item.payment.toFixed(2), 55, y);
      doc.text(item.principal.toFixed(2), 90, y);
      doc.text(item.interest.toFixed(2), 125, y);
      doc.text(item.remainingBalance.toFixed(2), 160, y);
    });
  } else {
    // 生成摘要信息
    doc.setFontSize(12);
    doc.text(`还款期数: ${loanData.schedule.length}期`, 20, 110);
    doc.text(`首期还款: ¥${loanData.schedule[0].payment}`, 20, 120);
    doc.text(`末期还款: ¥${loanData.schedule[loanData.schedule.length - 1].payment}`, 20, 130);
  }
}

function generateAnalysis(
  doc: jsPDF,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // 实现分析报告生成逻辑
}

function generateComparison(
  doc: jsPDF,
  loanData: PaymentMethod,
  options?: { includeCharts?: boolean }
) {
  // 实现对比报告生成逻辑
} 