export interface PostType {
  id: number;

  // Basic info
  title: string;
  slug: string;
  content: string;
  excerpt?: string;

  // Featured image
  featured_image_url?: string;
  featured_image_alt?: string;
  featured_image_caption?: string;

  // SEO meta
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  canonical_url?: string;
  schema_type?: string;

  // Category & Tags
  category_id?: number;
  tags?: string[];

  // Analytics & interactions
  read_time?: number;
  likes?: number;
  comments?: CommentType[];
  interactions?: InteractionType[];

  // Publish
  is_published?: boolean;
  published_at?: string; // ISO date string

  // Timestamps
  created_at?: string;  // ISO date string
  updated_at?: string;  // ISO date string
}

// Comment type
export interface CommentType {
  user: string;
  comment: string;
  date: string; // ISO date string
}

// Interaction type
export interface InteractionType {
  type: "view" | "share" | "reaction";
  user: string;
  time: string; // ISO date string
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string; // ISO date string
  updated_at?: string; // ISO date string
}
