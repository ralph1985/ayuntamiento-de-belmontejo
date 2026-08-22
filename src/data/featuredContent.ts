const DEFAULT_FEATURED_DAYS = 90;

type FeaturedPost = {
  data: {
    date: Date;
    isFeatured?: boolean;
    featuredUntil?: Date;
  };
};

export function getDefaultFeaturedUntil(
  date: Date,
  days = DEFAULT_FEATURED_DAYS
) {
  const until = new Date(date);
  until.setDate(until.getDate() + days);
  return until;
}

export function getFeaturedUntil(post: FeaturedPost) {
  return post.data.featuredUntil ?? getDefaultFeaturedUntil(post.data.date);
}

export function isCurrentlyFeatured(post: FeaturedPost, now = new Date()) {
  return post.data.isFeatured === true && getFeaturedUntil(post) >= now;
}
