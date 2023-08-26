import Joi from "joi";

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

export const signUpValidator = validateBody(
  Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "passwords must match",
      }),
  })
);

export const signInValidator = validateBody(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);
