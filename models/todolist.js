var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var todoListSchema = new Schema({
    name: {type: String, required: true},
    todoList: [{
        name: String,
        status: {type: Boolean, default: false}

    }]
});


module.exports = mongoose.model('TodoList', todoListSchema);
