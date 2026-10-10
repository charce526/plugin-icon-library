import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'xzIconLibraryIcons', autoGenId: false, timestamps: true,
  fields: [
    { name: 'name', type: 'string', primaryKey: true, allowNull: false },
    { name: 'label', type: 'string', allowNull: false },
    { name: 'keywords', type: 'string' },
    { name: 'definition', type: 'json', allowNull: false },
  ],
});
