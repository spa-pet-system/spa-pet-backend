import Service from '~/models/Service'
import { StatusCodes } from 'http-status-codes'

const getAll = async (req, res) => {
  try {
    const services = await Service.find()
    res.status(StatusCodes.OK).json(services)
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: 'Not Found' })
  }
}