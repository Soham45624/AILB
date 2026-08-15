export type PricingType = 'free' | 'freemium' | 'paid' | 'free_trial' | 'contact';
export type ToolStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
export type UserRole = 'user' | 'editor' | 'admin';

export type PlatformType = 'Web' | 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS' | 'API';

export type SortOption =
  | 'relevant'
  | 'popular'
  | 'highest_rated'
  | 'most_reviewed'
  | 'newest'
  | 'trending'
  | 'most_saved';

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  tool_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  tool_count?: number;
}

export interface Tool {
  id: string;
  tool_code?: number;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  website_url: string;
  logo_url: string | null;
  pricing: PricingType;
  status: ToolStatus;
  featured: boolean;
  trending: boolean;
  avg_rating: number;
  review_count: number;
  view_count: number;
  click_count: number;
  saved_count: number;
  platforms?: string[];
  features?: string[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Relevance ranking when searched
  relevance_score?: number;
  // Joined relations
  categories?: Category[];
  tags?: Tag[];
}

export interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface SearchToolsResult {
  tools: Tool[];
  totalCount: number;
}
