import { disconnect, query } from './database/connection.js';
import { createModel } from './database/repository.js';

export const db = {
  user: createModel('user'),
  artist: createModel('artist'),
  category: createModel('category'),
  style: createModel('style'),
  painting: createModel('painting'),
  favorite: createModel('favorite'),
  recommendation: createModel('recommendation'),
  viewHistory: createModel('viewHistory'),
  collection: createModel('collection'),
  collectionItem: createModel('collectionItem'),
  analytics: createModel('analytics'),
  chatLog: createModel('chatLog'),
  uploadedImage: createModel('uploadedImage'),

  async $queryRaw(strings, ...values) {
    return query(String.raw({ raw: strings }, ...values));
  },

  async $transaction(operations) {
    return Promise.all(operations);
  },

  $disconnect: disconnect,
};
