import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// This MySQL/mysql2 setup does not reliably auto-parse JSON columns: a query
// straight after a model's own create() returns real objects/arrays, but the
// same column read back through a later find (or through an association)
// comes back as the raw JSON string. Parse defensively for every model
// instead of patching each controller that touches a JSON column.
const parseJsonAttributes = (instance) => {
  if (!instance || !instance.constructor?.rawAttributes) return;
  for (const [key, attr] of Object.entries(instance.constructor.rawAttributes)) {
    if (attr.type instanceof DataTypes.JSON) {
      const value = instance.getDataValue(key);
      if (typeof value === 'string' && value.length) {
        try {
          instance.setDataValue(key, JSON.parse(value));
        } catch {
          // leave as-is if it isn't valid JSON
        }
      }
    }
  }
};

sequelize.addHook('afterFind', (result) => {
  if (Array.isArray(result)) {
    result.forEach(parseJsonAttributes);
  } else {
    parseJsonAttributes(result);
  }
});

export default sequelize;
