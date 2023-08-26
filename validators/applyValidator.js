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

export const applyFormValidator = validateBody(
  Joi.object({
    course: Joi.string()
      .valid("pre-medical", "pre-engineering", "computer-science", "arts")
      .required(),
    status: Joi.string().valid("pending", "view", "accepted", "rejected"),
    marks: Joi.string().required(),
    gender: Joi.string().valid("male", "female", "other"),
    phoneNumber: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    address: Joi.string().max(255).required(),
  })
);

