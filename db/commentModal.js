// {
//     userId: 'jatinchopra2053@gmail.com',
//     text: 'what',
//     img: 'https://avatars.githubusercontent.com/u/67048953?v=4',
//     username: 'JatinChopra',
//     songId: '66bbf16d899a67709f2f0baf',
//     timestamp: 26.753973
//   }

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: String,
  text: String,
  img: String,
  username: String,
  songId: String,
  timestamp: Number,
});

const commentModal = mongoose.model("comment", commentSchema);

module.exports = commentModal;
