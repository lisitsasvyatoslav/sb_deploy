export interface LinkPreviewData {
  url: string;
  domain: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
}

/** No backend: parse hostname only (sufficient for Storybook / UI preview). */
export async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  try {
    const u = new URL(url);
    return { url, domain: u.hostname };
  } catch {
    return { url, domain: url };
  }
}
