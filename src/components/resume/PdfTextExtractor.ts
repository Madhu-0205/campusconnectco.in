import * as pdfjsLib from"pdfjs-dist";
import type { TextItem } from"pdfjs-dist/types/src/display/api";

// Configure worker (prefer a local worker in production)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPdf(file: File): Promise<string> {
 try {
 const arrayBuffer = await file.arrayBuffer();

 const loadingTask = pdfjsLib.getDocument({
 data: arrayBuffer,
 useSystemFonts: true,
 isEvalSupported: false,
 });

 const pdf = await loadingTask.promise;

 const pages: string[] = [];

 for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
 const page = await pdf.getPage(pageNum);

 const textContent = await page.getTextContent();

 const pageText = textContent.items
 .filter(
 (item): item is TextItem =>
"str" in item && item.str.trim().length > 0
 )
 .map((item) => item.str)
 .join("");

 pages.push(pageText);
 }

 const extracted = pages
 .join("\n")
 .replace(/[ \t]+/g,"")
 .replace(/\n{2,}/g,"\n")
 .trim();

 if (extracted.length < 20) {
 throw new Error(
"Very little text was extracted. This PDF is likely scanned or image-based and requires OCR."
 );
 }

 return extracted;
 } catch (error) {
 console.error("PDF extraction failed:", error);
 throw error;
 }
}