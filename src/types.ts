export interface PDFDocument {
  id: string;
  name: string;
  url: string;
  storagePath: string;
  createdAt: number;
  qrId: string;
  size?: number;
  category?: string;
  department?: string;
}

export type AuthState = "loading" | "authenticated" | "unauthenticated";
