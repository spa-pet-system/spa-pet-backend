import { StatusCodes } from 'http-status-codes'

const getProfile = (req, res) => {
  const user = req.user
  res.status(StatusCodes.ACCEPTED).json(user)
}

export const userController = {
  getProfile
}