const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    min: 4,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const UserModel = model("User", UserSchema);

module.exports = UserModel;
//0qp5wExVE2ZEwYi6
//mongodb+srv://blog:0qp5wExVE2ZEwYi6@cluster0.8ovkv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
