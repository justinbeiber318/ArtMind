import { disconnect, query, transaction } from './database/connection.js';
import { createModelWithQuery } from './database/repository.js';

function createDbClient(execute = query) {
  return {
    user: createModelWithQuery('user', execute),
    artist: createModelWithQuery('artist', execute),
    category: createModelWithQuery('category', execute),
    style: createModelWithQuery('style', execute),
    painting: createModelWithQuery('painting', execute),
    favorite: createModelWithQuery('favorite', execute),
    recommendation: createModelWithQuery('recommendation', execute),
    viewHistory: createModelWithQuery('viewHistory', execute),
    collection: createModelWithQuery('collection', execute),
    collectionItem: createModelWithQuery('collectionItem', execute),
    analytics: createModelWithQuery('analytics', execute),
    chatLog: createModelWithQuery('chatLog', execute),
    uploadedImage: createModelWithQuery('uploadedImage', execute),

    async $queryRaw(strings, ...values) {
      return execute(String.raw({ raw: strings }, ...values));
    },
  };
}

export const db = {
  ...createDbClient(),
  async $transaction(operations) {
    if (typeof operations === 'function') {
      return transaction((execute) => operations(createDbClient(execute)));
    }
    throw new Error('Use db.$transaction(async (tx) => { ... }) so queries run on the same connection');
  },

  $disconnect: disconnect,
};
