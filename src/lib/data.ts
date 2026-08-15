import { createClient } from './supabase/server';
import { Tool, Category, Tag, SortOption, SearchToolsResult } from './types';

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get tool counts per category
  const { data: toolCats } = await supabase
    .from('tool_categories')
    .select('category_id');

  const countMap: Record<string, number> = {};
  toolCats?.forEach((tc: any) => {
    countMap[tc.category_id] = (countMap[tc.category_id] || 0) + 1;
  });

  return (categories || []).map((cat: any) => ({
    ...cat,
    tool_count: countMap[cat.id] || 0,
  }));
}

export async function getTags(): Promise<Tag[]> {
  const supabase = await createClient();
  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  // Get tool counts per tag
  const { data: toolTags } = await supabase
    .from('tool_tags')
    .select('tag_id');

  const countMap: Record<string, number> = {};
  toolTags?.forEach((tt: any) => {
    countMap[tt.tag_id] = (countMap[tt.tag_id] || 0) + 1;
  });

  return (tags || []).map((t: any) => ({
    ...t,
    tool_count: countMap[t.id] || 0,
  }));
}

export interface SearchAiToolsOptions {
  searchQuery?: string;
  categorySlug?: string;
  tagSlugs?: string[];
  pricingFilters?: string[];
  minRating?: number;
  platformFilters?: string[];
  sortBy?: SortOption;
  limit?: number;
  offset?: number;
}

export async function searchAiTools(
  options: SearchAiToolsOptions = {}
): Promise<SearchToolsResult> {
  const supabase = await createClient();
  const {
    searchQuery = '',
    categorySlug = '',
    tagSlugs = [],
    pricingFilters = [],
    minRating,
    platformFilters = [],
    sortBy = 'relevant',
    limit = 50,
    offset = 0,
  } = options;

  // Call the search_ai_tools Postgres RPC function
  const { data, error } = await supabase.rpc('search_ai_tools', {
    search_term: searchQuery?.trim() || null,
    category_slug: categorySlug && categorySlug !== 'all' ? categorySlug : null,
    tag_slugs: tagSlugs.length > 0 ? tagSlugs : null,
    pricing_filters: pricingFilters.length > 0 && !pricingFilters.includes('all') ? pricingFilters : null,
    min_rating: minRating && minRating > 0 ? minRating : null,
    platform_filters: platformFilters.length > 0 ? platformFilters : null,
    sort_by: sortBy,
    limit_val: limit,
    offset_val: offset,
  });

  if (error) {
    console.error('Error calling search_ai_tools RPC:', error);
    // Fallback to basic getTools if RPC encounters any issue
    const fallbackTools = await getToolsFallback(options);
    return {
      tools: fallbackTools,
      totalCount: fallbackTools.length,
    };
  }

  if (!data || data.length === 0) {
    return { tools: [], totalCount: 0 };
  }

  const totalCount = data[0]?.total_count ? Number(data[0].total_count) : data.length;

  const tools: Tool[] = data.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    long_description: row.long_description,
    website_url: row.website_url,
    logo_url: row.logo_url,
    pricing: row.pricing,
    status: row.status,
    featured: Boolean(row.featured),
    trending: Boolean(row.trending),
    avg_rating: Number(row.avg_rating || 0),
    review_count: Number(row.review_count || 0),
    view_count: Number(row.view_count || 0),
    click_count: Number(row.click_count || 0),
    saved_count: Number(row.saved_count || 0),
    platforms: Array.isArray(row.platforms) ? row.platforms : ['Web'],
    features: Array.isArray(row.features) ? row.features : [],
    relevance_score: Number(row.relevance_score || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
    categories: Array.isArray(row.categories) ? row.categories : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
  }));

  return { tools, totalCount };
}

export interface GetToolsOptions {
  categorySlug?: string;
  tagSlug?: string;
  pricing?: string;
  searchQuery?: string;
  status?: string;
  featuredOnly?: boolean;
  trendingOnly?: boolean;
  sortBy?: 'trending' | 'highest_rated' | 'newest' | 'most_viewed' | 'popular' | 'most_saved' | 'relevant';
  limit?: number;
}

export async function getTools(options: GetToolsOptions = {}): Promise<Tool[]> {
  const {
    categorySlug,
    tagSlug,
    pricing,
    searchQuery,
    featuredOnly,
    trendingOnly,
    sortBy = 'trending',
    limit = 50,
  } = options;

  let sortOption: SortOption = 'trending';
  if (sortBy === 'highest_rated') sortOption = 'highest_rated';
  else if (sortBy === 'newest') sortOption = 'newest';
  else if (sortBy === 'most_viewed' || sortBy === 'popular') sortOption = 'popular';
  else if (sortBy === 'most_saved') sortOption = 'most_saved';
  else if (sortBy === 'relevant') sortOption = 'relevant';

  const pricingArray = pricing && pricing !== 'all' ? [pricing] : [];
  const tagsArray = tagSlug ? [tagSlug] : [];

  const { tools } = await searchAiTools({
    searchQuery,
    categorySlug,
    tagSlugs: tagsArray,
    pricingFilters: pricingArray,
    sortBy: sortOption,
    limit,
  });

  let result = tools;
  if (featuredOnly) {
    result = result.filter((t) => t.featured);
  }
  if (trendingOnly) {
    result = result.filter((t) => t.trending);
  }

  return result;
}

// Fallback direct query if RPC ever fails
async function getToolsFallback(options: SearchAiToolsOptions): Promise<Tool[]> {
  const supabase = await createClient();
  const { data: toolsData, error } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'approved')
    .limit(options.limit || 50);

  if (error || !toolsData) return [];

  const toolIds = toolsData.map((t: any) => t.id);
  const [allCategories, allTags, toolCatsRes, toolTagsRes] = await Promise.all([
    getCategories(),
    getTags(),
    supabase.from('tool_categories').select('tool_id, category_id').in('tool_id', toolIds),
    supabase.from('tool_tags').select('tool_id, tag_id').in('tool_id', toolIds),
  ]);

  const catById = new Map<string, Category>(allCategories.map((c) => [c.id, c]));
  const tagById = new Map<string, Tag>(allTags.map((tg) => [tg.id, tg]));

  const categoryMap: Record<string, Category[]> = {};
  toolCatsRes.data?.forEach((r: any) => {
    const c = catById.get(r.category_id);
    if (c) {
      if (!categoryMap[r.tool_id]) categoryMap[r.tool_id] = [];
      categoryMap[r.tool_id].push(c);
    }
  });

  const tagMap: Record<string, Tag[]> = {};
  toolTagsRes.data?.forEach((r: any) => {
    const t = tagById.get(r.tag_id);
    if (t) {
      if (!tagMap[r.tool_id]) tagMap[r.tool_id] = [];
      tagMap[r.tool_id].push(t);
    }
  });

  return toolsData.map((t: any) => ({
    ...t,
    avg_rating: Number(t.avg_rating || 0),
    review_count: Number(t.review_count || 0),
    view_count: Number(t.view_count || 0),
    click_count: Number(t.click_count || 0),
    saved_count: Number(t.saved_count || 0),
    platforms: Array.isArray(t.platforms) ? t.platforms : ['Web'],
    features: Array.isArray(t.features) ? t.features : [],
    categories: categoryMap[t.id] || [],
    tags: tagMap[t.id] || [],
  }));
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  // Fetch categories & tags
  const [allCategories, allTags, catRes, tagRes] = await Promise.all([
    getCategories(),
    getTags(),
    supabase.from('tool_categories').select('category_id').eq('tool_id', data.id),
    supabase.from('tool_tags').select('tag_id').eq('tool_id', data.id),
  ]);

  const categoryById = new Map<string, Category>(allCategories.map((c) => [c.id, c]));
  const tagById = new Map<string, Tag>(allTags.map((tg) => [tg.id, tg]));

  const categories = (catRes.data || [])
    .map((r: any) => categoryById.get(r.category_id))
    .filter((c: any): c is Category => Boolean(c));

  const tags = (tagRes.data || [])
    .map((r: any) => tagById.get(r.tag_id))
    .filter((t: any): t is Tag => Boolean(t));

  return {
    ...data,
    avg_rating: Number(data.avg_rating || 0),
    review_count: Number(data.review_count || 0),
    view_count: Number(data.view_count || 0),
    click_count: Number(data.click_count || 0),
    saved_count: Number(data.saved_count || 0),
    platforms: Array.isArray(data.platforms) ? data.platforms : ['Web'],
    features: Array.isArray(data.features) ? data.features : [],
    categories,
    tags,
  };
}
