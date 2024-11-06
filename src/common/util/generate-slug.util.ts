export const generateSlug = (title: string) => {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // remove non-word, non-whitespace, non-hyphen characters
      .replace(/[\s_-]+/g, '-') // replace whitespace, underscore and hyphen characters with a single hyphen
      .replace(/^-+/, '') // trim beginning hyphens
      .replace(/-+$/, '') + // trim ending hyphens
    `-${new Date().getTime()}`
  );
};
