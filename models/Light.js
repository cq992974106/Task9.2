const mongoose = require('mongoose')

const lightSchema=new mongoose.Schema(
    {
    id: String,
    area: {
      type: String,
    },
    location: {
        type: String,
      },
    locationBrightness: {
      type: Number,
    },
    state: {
        type: String,
      },
    mode: {
        type: String,
      }
    }
)


module.exports = mongoose.model("Light",lightSchema)