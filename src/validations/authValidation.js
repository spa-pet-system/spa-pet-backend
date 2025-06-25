import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const registerByPhone = async (req, res, next) => {
  const correctCondition = Joi.object({
    phone: Joi.string()
      .trim()
      .strict()
      .pattern(/^0[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại không đúng định dạng',
        'any.required': 'Số điện thoại là bắt buộc'
      }),

    password: Joi.string()
      .trim()
      .strict()
      .min(6)
      .required()
      .messages({
        'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
      }),

    name: Joi.string()
      .trim()
      .min(2)
      .max(30)
      .required()
      .messages({
        'string.min': 'Tên phải có ít nhất 2 ký tự',
        'string.max': 'Tên không được vượt quá 30 ký tự',
        'any.required': 'Tên là bắt buộc'
      })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    next()
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: error.details.map(err => err.message) // trả về danh sách lỗi
    })
  }
}

const login = async (req, res, next) => {
  console.log('req.body:', req.body)
  
  const correctCondition = Joi.object({
    phone: Joi.string()
      .trim()
      .strict()
      .pattern(/^0[0-9]{9}$/)
      .required()
      .messages({
        'string.pattern.base': 'Số điện thoại không đúng định dạng',
        'any.required': 'Số điện thoại là bắt buộc'
      }),
    password: Joi.string()
      .trim()
      .strict()
      .min(6)
      .required()
      .messages({
        'string.min': 'Mật khẩu phải ít nhất 6 ký tự',
        'any.required': 'Mật khẩu là bắt buộc'
      })
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    console.log('VALIDATION')
    
    next()
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}


export const authValidation = {
  registerByPhone,
  login
}
