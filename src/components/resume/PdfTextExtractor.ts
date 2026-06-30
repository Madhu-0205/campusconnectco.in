// Run this in the browser — never on the server

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source — required for pdfjs-dist
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
             .filter((item) => 'str' in item)
             // eslint-disable-next-line @typescript-eslint/no-explicit-any
             .map((item) => (item as any).str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}
