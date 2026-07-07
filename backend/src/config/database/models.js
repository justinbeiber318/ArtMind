export const models = {
  user: {
    table: 'users',
    fields: {
      id: 'id', email: 'email', passwordHash: 'password_hash', name: 'name',
      avatarUrl: 'avatar_url', bio: 'bio', role: 'role', refreshToken: 'refresh_token',
      createdAt: 'created_at', updatedAt: 'updated_at',
    },
    relations: {
      collections: { model: 'collection', local: 'id', foreign: 'userId', many: true },
    },
  },
  artist: {
    table: 'artists',
    fields: {
      id: 'id', name: 'name', slug: 'slug', nationality: 'nationality',
      bornYear: 'born_year', diedYear: 'died_year', bio: 'bio',
      portraitUrl: 'portrait_url', createdAt: 'created_at',
    },
    relations: {
      paintings: { model: 'painting', local: 'id', foreign: 'artistId', many: true },
    },
  },
  category: {
    table: 'categories',
    fields: { id: 'id', name: 'name', slug: 'slug' },
    relations: {
      paintings: { model: 'painting', local: 'id', foreign: 'categoryId', many: true },
    },
  },
  style: {
    table: 'styles',
    fields: { id: 'id', name: 'name', slug: 'slug' },
    relations: {
      paintings: { model: 'painting', local: 'id', foreign: 'styleId', many: true },
    },
  },
  painting: {
    table: 'paintings',
    fields: {
      id: 'id', title: 'title', slug: 'slug', description: 'description',
      imageUrl: 'image_url', thumbnailUrl: 'thumbnail_url', artistId: 'artist_id',
      categoryId: 'category_id', styleId: 'style_id', year: 'year', medium: 'medium',
      surface: 'surface', dimensions: 'dimensions', price: 'price',
      dominantColors: 'dominant_colors', tags: 'tags', aiSummary: 'ai_summary',
      viewCount: 'view_count', trendingScore: 'trending_score', featured: 'featured',
      uploadedById: 'uploaded_by_id', createdAt: 'created_at', updatedAt: 'updated_at',
    },
    json: ['dominantColors', 'tags'],
    relations: {
      artist: { model: 'artist', local: 'artistId', foreign: 'id' },
      category: { model: 'category', local: 'categoryId', foreign: 'id' },
      style: { model: 'style', local: 'styleId', foreign: 'id' },
      favorites: { model: 'favorite', local: 'id', foreign: 'paintingId', many: true },
    },
  },
  favorite: {
    table: 'favorites',
    fields: { id: 'id', userId: 'user_id', paintingId: 'painting_id', createdAt: 'created_at' },
    unique: { userId_paintingId: ['userId', 'paintingId'] },
    relations: {
      painting: { model: 'painting', local: 'paintingId', foreign: 'id' },
      user: { model: 'user', local: 'userId', foreign: 'id' },
    },
  },
  recommendation: {
    table: 'recommendations',
    fields: {
      id: 'id', userId: 'user_id', paintingId: 'painting_id',
      score: 'score', reason: 'reason', createdAt: 'created_at',
    },
    relations: {
      painting: { model: 'painting', local: 'paintingId', foreign: 'id' },
      user: { model: 'user', local: 'userId', foreign: 'id' },
    },
  },
  viewHistory: {
    table: 'view_history',
    fields: { id: 'id', userId: 'user_id', paintingId: 'painting_id', viewedAt: 'viewed_at' },
    relations: {
      painting: { model: 'painting', local: 'paintingId', foreign: 'id' },
      user: { model: 'user', local: 'userId', foreign: 'id' },
    },
  },
  collection: {
    table: 'collections',
    fields: { id: 'id', userId: 'user_id', name: 'name', createdAt: 'created_at' },
    relations: {
      items: { model: 'collectionItem', local: 'id', foreign: 'collectionId', many: true },
    },
  },
  collectionItem: {
    table: 'collection_items',
    fields: { id: 'id', collectionId: 'collection_id', paintingId: 'painting_id' },
  },
  analytics: {
    table: 'analytics',
    fields: {
      id: 'id', metric: 'metric', entityType: 'entity_type', entityId: 'entity_id',
      value: 'value', metadata: 'metadata', recordedAt: 'recorded_at',
    },
    json: ['metadata'],
  },
  chatLog: {
    table: 'chat_logs',
    fields: {
      id: 'id', userId: 'user_id', prompt: 'prompt',
      response: 'response', tokensUsed: 'tokens_used', createdAt: 'created_at',
    },
    relations: {
      user: { model: 'user', local: 'userId', foreign: 'id' },
    },
  },
  uploadedImage: {
    table: 'uploaded_images',
    fields: {
      id: 'id', userId: 'user_id', imageUrl: 'image_url',
      detectedStyle: 'detected_style', detectedCategory: 'detected_category',
      dominantColors: 'dominant_colors', confidence: 'confidence', createdAt: 'created_at',
    },
    json: ['dominantColors'],
  },
};
