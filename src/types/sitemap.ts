export interface SitemapPage {
  url: string;
  path: string;
  title: string;
  depth: number;
  statusCode: number;
  contentType: string;
  h1: string;
  metaDescription: string;
  internalLinks: number;
  externalLinks: number;
}

export interface CrawlResult {
  baseUrl: string;
  pages: SitemapPage[];
  totalPages: number;
  crawledAt: string;
  elapsedMs: number;
}

export interface CrawlRequest {
  url: string;
  maxDepth: number;
  maxPages: number;
}
