export interface VenueHours {
  monday?: string | null;
  tuesday?: string | null;
  wednesday?: string | null;
  thursday?: string | null;
  friday?: string | null;
  saturday?: string | null;
  sunday?: string | null;
}

export interface Venue {
  id: number;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  neighbourhood?: string;
  phone?: string;

  // Music & vibe
  music_types: string[];
  vibe_tags: string[];

  // Operational
  primary_nights: string[];
  hours?: VenueHours | null;
  special_nights: string[];

  // Pricing
  price_tier?: string | null;
  cover_charge_info?: string | null;
  bottle_minimum?: number | null;

  // Access & atmosphere
  dress_code?: string | null;
  age_restriction?: number | null;
  hospitality_company?: string | null;

  capacity?: number;
  image_url?: string;
  website_url?: string;
  instagram_url?: string;
  reservation_link?: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  name: string;
  slug: string;
  venue_id?: number;
  venue?: Venue;
  date: string;
  category?: string;
  music_type?: string;
  description?: string;
  image_url?: string;
  ticket_url?: string;
  is_published: boolean;
  source: string;
  external_id?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  body: string;
  cover_image_url?: string;
  tags: string[];
  music_type?: string;
  author?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestlistEntry {
  email: string;
  full_name: string;
  event_id?: number;
  venue_id?: number;
  music_type?: string;
  party_size?: number;
  source_page?: string;
}

export interface TableReservation {
  email: string;
  full_name: string;
  phone?: string;
  venue_id?: number;
  event_id?: number;
  date_requested?: string;
  party_size: number;
  occasion?: string;
  preferences?: string;
  budget_range?: string;
}

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Genre {
  genre: string;
  venue_count: number;
}

export interface Recommendation {
  venue: Venue;
  score: number;
  has_event_tonight: boolean;
}

export interface AnalyticsSummary {
  top_venues: { name: string; count: number }[];
  music_type_distribution: { genre: string; count: number }[];
  total_guestlist: number;
  total_reservations: number;
  pending_reservations: number;
}
