export type PostType = {
  id: number;
  title: string;
  slug: string;
  content?: string | null;
  excerpt?: string | null;
  featured_image_url?: string | null;
  featured_image_public_id?: string | null;
  featured_image_alt?: string | null;
  featured_image_caption?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  canonical_url?: string | null;
  schema_type?: string | null;
  category_id?: number | null;
  author_id?: number | null;
  tags?: string[] | null;
  read_time?: number | null;
  likes?: number | null;
  comments?: unknown;
  interactions?: unknown;
  is_published?: boolean | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  category?: {
    id: number;
    name: string;
    slug?: string;
  } | null;
  author?: {
    id: number;
    name?: string;
    avatar_url?: string;
  } | null;
  related_posts?: PostType[];
};