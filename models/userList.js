var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userListSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  lists: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Todo'
  }]
});

module.exports = mongoose.model('UserList', userListSchema);
