import { getCollection } from 'astro:content';

type CollectionName = 'notes' | 'reports' | 'projects' | 'posts';

/**
 * Gets all entries in a collection, excluding drafts.
 */
export async function getAllContent(collection: CollectionName) {
  const entries = await getCollection(collection);
  return entries.filter(entry => !entry.data.draft);
}

/**
 * Gets only the entries that are meant to be listed (listed !== false and no parent), excluding drafts.
 */
export async function getListedContent(collection: CollectionName) {
  const entries = await getAllContent(collection);
  return entries.filter(entry => {
    // If explicitly unlisted, hide it
    if (entry.data.listed === false) return false;
    // If it has a parent, it's a subpage, so it shouldn't be listed in the main index
    if (entry.data.parent) return false;
    return true;
  });
}

/**
 * Gets subpages for a given parent slug.
 */
export async function getSubPages(collection: CollectionName, parentSlug: string) {
  const entries = await getAllContent(collection);
  return entries.filter(entry => entry.data.parent === parentSlug);
}

/**
 * Finds the parent entry for a given subpage.
 */
export async function getParentPage(collection: CollectionName, parentSlug: string) {
  const entries = await getAllContent(collection);
  return entries.find(entry => entry.id === parentSlug);
}
