const mongoose = require("mongoose");
const { Schema } = mongoose;

let metaDataSchema = new Schema({
  name: String,
  description: String,
  image: String,
  animation_url: String,
  duration: Number,
  attributes: [
    {
      trait_type: String,
      value: String,
    },
  ],
});

const metaDataModel = mongoose.model("MetaData", metaDataSchema);
module.exports = metaDataModel;
