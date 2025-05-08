export interface Application {
    _id: string;
    company: string;
    role?: string;
    location?: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    appliedDate?: string;
    status: "Skickad" | "Pågående" | "Intervju" | "Avslutat" | "Nej tack";
    notes?: string;
    source?: string;
  }