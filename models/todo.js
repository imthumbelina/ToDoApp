var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var todoSchema = new Schema({
    name: String,
    status: {type: Boolean, default: false},
    todolist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TodoList'
    }
});


module.exports = mongoose.model('Todo', todoSchema);
