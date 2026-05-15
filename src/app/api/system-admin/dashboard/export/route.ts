import { NextResponse } from 'next/server';

// NOTE: This route uses `pdfkit`. Install it in the frontend container/workspace:
// npm install pdfkit

export async function POST() {
  try {
    // Use pdf-lib to avoid font asset resolution issues in the dev server
    const mod = await import('pdf-lib');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PDFDocument, StandardFonts } = mod as any;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fileName = `UrbanNest-System-Admin-Dashboard-${new Date().toISOString().slice(0, 10)}.pdf`;

    page.drawText('UrbanNest - System Admin Dashboard Export', {
      x: 50,
      y: 780,
      size: 18,
      font: helvetica,
    });
    page.drawText(`Generated: ${new Date().toISOString()}`, { x: 50, y: 760, size: 10, font: helvetica });
    page.drawText('Summary:', { x: 50, y: 740, size: 12, font: helvetica });
    page.drawText('- Total admins: (placeholder)\n- Total residents: (placeholder)\n- Active buildings: (placeholder)', {
      x: 50,
      y: 720,
      size: 10,
      font: helvetica,
    });

    const pdfBytes = await pdfDoc.save();
    const buffer = Buffer.from(pdfBytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    // Log full error for debugging in container logs
    // eslint-disable-next-line no-console
    console.error('export route error', err);
    return NextResponse.json({ detail: 'Failed to generate export PDF.', error: String(err) }, { status: 500 });
  }
}