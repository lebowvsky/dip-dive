import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // STAGE
  STAGE: Joi.string().required(),

  // DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().min(8).required(),
  DB_DATABASE: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.number().default(3600),
});
