import PriceTable from '~/models/priceTable'

const getPriceTable = async (req, res) => {
  try {
    const priceTable = await PriceTable.find()
    res.json(priceTable)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching price table' })
  }
}

const createPriceTableEntry = async (req, res) => {
  try {
    const newEntry = await PriceTable.insertMany(req.body)
    res.status(201).json(newEntry)
  } catch (error) {
    res.status(500).json({ message: 'Error creating price table entry' })
  }
}

export const priceTableController = {
  getPriceTable,
  createPriceTableEntry
}
