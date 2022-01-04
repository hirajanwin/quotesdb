import mongoose from 'mongoose'
import Models from './schema'

export default async function db() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.DB)
  }
  return Models
}
