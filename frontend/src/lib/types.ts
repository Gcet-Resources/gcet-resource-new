// Shared types for PDF mappings and chapters
export type Chapter = {
  id: string;
  title: string;
  // URL to the PDF stored in Azure Blob Storage or public URL
  fileUrl: string;
  // optional extra fields
  description?: string;
  pages?: number;
};

export type PdfMappingEntry = {
  year: string;
  subjectId: string;
  resourceType: string;
  chapters: Chapter[];
};
