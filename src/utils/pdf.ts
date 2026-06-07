import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportReportToPdf(
  element: HTMLElement,
  filename: string = "report.pdf",
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#0A1628",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;

  const outputWidth = imgWidth * ratio;
  const outputHeight = imgHeight * ratio;

  if (outputHeight <= pdfHeight) {
    pdf.addImage(imgData, "PNG", imgX, imgY, outputWidth, outputHeight);
  } else {
    let heightLeft = outputHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", imgX, position, outputWidth, outputHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - outputHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", imgX, position, outputWidth, outputHeight);
      heightLeft -= pdfHeight;
    }
  }

  pdf.save(filename);
}

export default exportReportToPdf;
