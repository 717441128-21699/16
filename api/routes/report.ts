import { Router, Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import {
  getCollection,
  findById,
} from '../db.js';

const router = Router();

// GET /api/report/weekly - 获取本周报告数据
router.get('/weekly', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    const formatDate = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const districts = await getCollection<any>('districts');
    const districtHistoryList = await getCollection<any>('districtHistory');
    const historyRecord = districtHistoryList[0];

    const districtStats = districts.map((d: any) => {
      const history = historyRecord?.data?.[d.id] || [];
      return {
        districtId: d.id,
        crimeRateData: history.length > 0
          ? history.map((h: any) => h.crimeRate)
          : Array.from({ length: 7 }, () => d.crimeRate + (Math.random() - 0.5) * 10),
        satisfactionData: history.length > 0
          ? history.map((h: any) => h.satisfaction)
          : Array.from({ length: 7 }, () => d.citizenSatisfaction + (Math.random() - 0.5) * 10),
      };
    });

    const heroActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        date: formatDate(d),
        activeHeroes: Math.floor(Math.random() * 30) + 50,
      };
    });

    const events = await getCollection<any>('events');
    const totalEvents = events.length || Math.floor(Math.random() * 50) + 100;

    const report = {
      weekStart: formatDate(weekStart),
      weekEnd: formatDate(today),
      districtStats,
      heroActivity,
      totalEvents,
      totalMissions: Math.floor(Math.random() * 200) + 300,
      totalResources: Math.floor(Math.random() * 50000) + 100000,
    };

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: '获取周报数据失败' });
  }
});

// GET /api/report/weekly/pdf - 生成并返回 PDF 文件
router.get('/weekly/pdf', async (_req: Request, res: Response) => {
  try {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);

    const formatDate = (d: Date) =>
      `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const districts = await getCollection<any>('districts');
    const districtHistoryList = await getCollection<any>('districtHistory');
    const historyRecord = districtHistoryList[0];

    const districtStats = districts.map((d: any) => {
      const history = historyRecord?.data?.[d.id] || [];
      return {
        districtId: d.id,
        districtName: d.name,
        crimeRateData: history.length > 0
          ? history.map((h: any) => h.crimeRate)
          : Array.from({ length: 7 }, () => d.crimeRate + (Math.random() - 0.5) * 10),
        satisfactionData: history.length > 0
          ? history.map((h: any) => h.satisfaction)
          : Array.from({ length: 7 }, () => d.citizenSatisfaction + (Math.random() - 0.5) * 10),
      };
    });

    const heroActivity = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return {
        date: formatDate(d),
        activeHeroes: Math.floor(Math.random() * 30) + 50,
      };
    });

    const events = await getCollection<any>('events');
    const totalEvents = events.length || Math.floor(Math.random() * 50) + 100;
    const totalMissions = Math.floor(Math.random() * 200) + 300;
    const totalResources = Math.floor(Math.random() * 50000) + 100000;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="weekly-report-${formatDate(weekStart)}-${formatDate(today)}.pdf"`
    );

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // 标题
    doc.fontSize(24).font('Helvetica-Bold').text('超级英雄城市安全周报', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').fillColor('#666').text(
      `报告周期：${formatDate(weekStart)} 至 ${formatDate(today)}`,
      { align: 'center' }
    );
    doc.moveDown(1.5);

    // 统计卡片
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333').text('本周概览');
    doc.moveDown(0.5);

    const cardWidth = 170;
    const cardHeight = 80;
    const startY = doc.y;

    doc.roundedRect(50, startY, cardWidth, cardHeight, 8).fill('#E3F2FD');
    doc.fillColor('#1565C0').fontSize(12).font('Helvetica-Bold').text('总事件数', 60, startY + 15);
    doc.fillColor('#333').fontSize(24).font('Helvetica-Bold').text(String(totalEvents), 60, startY + 40);

    doc.roundedRect(50 + cardWidth + 15, startY, cardWidth, cardHeight, 8).fill('#E8F5E9');
    doc.fillColor('#2E7D32').fontSize(12).font('Helvetica-Bold').text('总任务数', 50 + cardWidth + 25, startY + 15);
    doc.fillColor('#333').fontSize(24).font('Helvetica-Bold').text(String(totalMissions), 50 + cardWidth + 25, startY + 40);

    doc.roundedRect(50 + (cardWidth + 15) * 2, startY, cardWidth, cardHeight, 8).fill('#FFF3E0');
    doc.fillColor('#E65100').fontSize(12).font('Helvetica-Bold').text('资源产出', 50 + (cardWidth + 15) * 2 + 10, startY + 15);
    doc.fillColor('#333').fontSize(20).font('Helvetica-Bold').text(`${totalResources} 金币`, 50 + (cardWidth + 15) * 2 + 10, startY + 40);

    doc.y = startY + cardHeight + 30;

    // 犯罪率数据
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333').text('各区域犯罪率数据');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('（数值为近7天平均犯罪率百分比）');
    doc.moveDown(0.5);

    districtStats.forEach((stat) => {
      const avgCrimeRate =
        stat.crimeRateData.reduce((sum: number, v: number) => sum + v, 0) / stat.crimeRateData.length;

      const barWidth = (avgCrimeRate / 100) * 300;
      const barY = doc.y;

      doc.fillColor('#333').fontSize(11).font('Helvetica').text(stat.districtName, 50, barY);
      doc
        .roundedRect(130, barY + 2, barWidth, 14, 4)
        .fill(avgCrimeRate > 50 ? '#E53935' : avgCrimeRate > 35 ? '#FB8C00' : '#43A047');
      doc.fillColor('#333').fontSize(10).font('Helvetica').text(`${avgCrimeRate.toFixed(1)}%`, 130 + barWidth + 10, barY + 3);

      doc.y = barY + 22;
    });

    doc.moveDown(1);

    // 活跃度趋势
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333').text('英雄活跃度趋势');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('（近7天每日活跃英雄数量）');
    doc.moveDown(0.5);

    const tableStartX = 50;
    const tableStartY = doc.y;
    const cellWidth = 65;
    const cellHeight = 25;

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
    heroActivity.forEach((activity, i) => {
      doc
        .rect(tableStartX + i * cellWidth, tableStartY, cellWidth, cellHeight)
        .stroke('#CCC');
      doc.text(activity.date, tableStartX + i * cellWidth + 5, tableStartY + 8, {
        width: cellWidth - 10,
        align: 'center',
      });
    });

    doc.fontSize(10).font('Helvetica').fillColor('#555');
    heroActivity.forEach((activity, i) => {
      doc
        .rect(tableStartX + i * cellWidth, tableStartY + cellHeight, cellWidth, cellHeight)
        .stroke('#CCC');
      doc.text(String(activity.activeHeroes), tableStartX + i * cellWidth + 5, tableStartY + cellHeight + 8, {
        width: cellWidth - 10,
        align: 'center',
      });
    });

    doc.y = tableStartY + cellHeight * 2 + 20;

    // 满意度趋势
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333').text('市民满意度趋势');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('（各区域近7天平均满意度）');
    doc.moveDown(0.5);

    districtStats.forEach((stat) => {
      const avgSatisfaction =
        stat.satisfactionData.reduce((sum: number, v: number) => sum + v, 0) / stat.satisfactionData.length;

      doc.fontSize(11).font('Helvetica').fillColor('#333').text(
        `${stat.districtName}：${avgSatisfaction.toFixed(1)}%`
      );
    });

    doc.moveDown(1);

    // 数据表格
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333').text('每日详细数据');
    doc.moveDown(0.5);

    const tblStartX = 50;
    const tblStartY = doc.y;
    const colWidths = [70, 80, 80, 80, 80];
    const colHeaders = ['日期', '活跃英雄', '犯罪率', '满意度', '事件数'];

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#FFF');
    colHeaders.forEach((header, i) => {
      let x = tblStartX;
      for (let j = 0; j < i; j++) x += colWidths[j];
      doc.rect(x, tblStartY, colWidths[i], 25).fill('#1976D2');
      doc.fillColor('#FFF').text(header, x + 5, tblStartY + 8, {
        width: colWidths[i] - 10,
        align: 'center',
      });
    });

    heroActivity.forEach((activity, rowIndex) => {
      const rowY = tblStartY + 25 + rowIndex * 22;
      const crimeRate = districtStats[0]?.crimeRateData[rowIndex] || 0;
      const satisfaction = districtStats[0]?.satisfactionData[rowIndex] || 0;
      const eventsCount = Math.floor(Math.random() * 20) + 10;

      const rowData = [
        activity.date,
        String(activity.activeHeroes),
        `${Math.round(crimeRate)}%`,
        `${Math.round(satisfaction)}%`,
        String(eventsCount),
      ];

      const textColor = rowIndex % 2 === 0 ? '#333' : '#555';

      if (rowIndex % 2 === 0) {
        doc.rect(tblStartX, rowY, colWidths.reduce((a, b) => a + b, 0), 22).fill('#F5F5F5');
      }

      doc.fontSize(9).font('Helvetica').fillColor(textColor);
      rowData.forEach((data, i) => {
        let x = tblStartX;
        for (let j = 0; j < i; j++) x += colWidths[j];
        doc.text(data, x + 5, rowY + 6, {
          width: colWidths[i] - 10,
          align: 'center',
        });
      });
    });

    doc.y = tblStartY + 25 + heroActivity.length * 22 + 30;

    doc.fontSize(9).font('Helvetica').fillColor('#999').text('— 报告结束 —', { align: 'center' });

    doc.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: '生成PDF失败' });
    }
  }
});

export default router;
