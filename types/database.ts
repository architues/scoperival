export interface Competitor {
  id: string;
  user_id: string;
  name: string;
  url: string;
  last_hash: string | null;
  last_checked: string | null;
  created_at: string;
}

export interface Change {
  id: string;
  competitor_id: string;
  detected_at: string;
  old_hash: string;
  new_hash: string;
  created_at: string;
}

// Types for inserting new records
export type NewCompetitor = Omit<Competitor, 'id' | 'created_at' | 'last_hash' | 'last_checked'>;
export type NewChange = Omit<Change, 'id' | 'created_at'>;

// Database type for Supabase
export interface Database {
  public: {
    Tables: {
      competitors: {
        Row: Competitor;
        Insert: NewCompetitor;
        Update: Partial<Omit<Competitor, 'id' | 'created_at'>>;
      };
      changes: {
        Row: Change;
        Insert: NewChange;
        Update: Partial<Omit<Change, 'id' | 'created_at'>>;
      };
    };
  };
} 