const mongoose = require('mongoose')
const { Schema, model } = mongoose

const quoteSchema = new Schema({
  quote: String,
  show: { type: Schema.Types.ObjectId, ref: 'Shows' },
  character: { type: Schema.Types.ObjectId, ref: 'Characters' },
})

const showSchema = new Schema({
  title: String,
  type: { type: Schema.Types.ObjectId, ref: 'Type' },
})

const characterSchema = new Schema({
  name: String,
  show: { type: Schema.Types.ObjectId, ref: 'Shows' },
})

const typeSchema = new Schema({ name: String })

const Quotes = mongoose.models.Quotes || model('Quotes', quoteSchema)
const Shows = mongoose.models.Shows || model('Shows', showSchema)
const Characters =
  mongoose.models.Characters || model('Characters', characterSchema)
const Types = mongoose.models.Types || model('Types', typeSchema)

export default { Quotes, Shows, Characters, Types }
