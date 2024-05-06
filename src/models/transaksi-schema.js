const mongo = require("mongoose");

const transaksiSchema = {
  deskripsi: String,
  fromUser: {
    type: mongo.Schema.Types.ObjectId,
    ref:'users',
    required: true,
  },
  timestamp: {
    type: Date,
    detault: Date.now,
  },
  jumlah: Number,
};

module.exports = transaksiSchema;
