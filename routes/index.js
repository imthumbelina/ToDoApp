var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongodb = require('mongodb');

var Todo = require('../models/todo');
var TodoList = require('../models/todolist');
var UserList = require('../models/userList');


router.get("/", function (req, res) {
    res.render('todo/home');
});


router.get('/logout', function (req, res) {
    res.render('todo/logout');
});

router.post("/user/lists/newtodo", function (req, res) {
    var newItem = new Todo(
        {
            name: req.body.item,
            status: false
        });
    Todo.create(newItem, function (err) {
        if (err) console.log(err);
        else
            console.log("Inserted item");
    });
    var listName = req.body.label;

    console.log('inserted into', listName);
    var query = {'name': listName};
    var todolist = {$push: {todoList: newItem}};


    TodoList.findOneAndUpdate(query, todolist, {upsert: true}, function (err) {
        if (err) return res.send(500, {error: err});
    });

    res.redirect("/user/lists");


});


router.post("/user/lists/newtodolist", function (req, res) {
    console.log("item submitted");
    var newTodoList = new TodoList(
        {
            name: req.body.item
        });
    TodoList.create(newTodoList, function (err) {
        if (err) console.log(err);
        else
            console.log("Inserted item");
    });

    var query = {user: req.user};
    var list = {$push: {lists: newTodoList}};


    UserList.findOneAndUpdate(query, list, {upsert: true}, function (err) {
        if (err) return res.send(500, {error: err});
    });


    res.redirect("/user/lists");
});


router.get('/user/lists/delete/:id', function (req, res) {
    Todo.remove({_id: req.params.id}, function () {
        res.redirect('/user/lists');
    });
});


router.get('/user/lists/todolist/delete/:id', function (req, res) {
    TodoList.deleteOne({_id: new mongodb.ObjectID(req.params.id)}, function () {
        res.redirect('/user/lists');
    });
});


router.get('/user/lists/todo/delete/:todoListId/:id', function (req, res) {
    console.log("dadasd");
    Todo.deleteOne({_id: new mongodb.ObjectID(req.params.id)}, function () {
        console.log(req.params.id);
        console.log(req.params.todoListId);

    });
    TodoList.update(
        {_id: new mongodb.ObjectID(req.params.todoListId)},
        {$pull: {"todoList": {_id: new mongodb.ObjectID(req.params.id)}}},
        function () {
            res.redirect('/user/lists');
        });
});

router.post('/user/lists/update', function (req, res) {
    TodoList.findOneAndUpdate(
        {"_id": req.body.parent_id, "todoList._id": req.body.id},
        {
            "$set": {
                "todoList.$.status": req.body.status
            }
        },

        function (err, doc) {
            console.log(err);
        }
    )

});

router.get('/user/signup', function (req, res) {
    var messages = req.flash('error');
    res.render('user/signup', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/lists',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/user/lists', function (req, res) {
    var userlist = new UserList({
        user: req.user
    });

    UserList.findOneAndUpdate({user: req.user}, {user: req.user}, {upsert: true}, function (err) {
        if (err) return res.send(500, {error: err});
        console.log('it updated list');
    });

    UserList.find({user: req.user}, 'lists', function (err, users) {
        if (err) return handleError(err);
        if (users === undefined || users.length == 0) {
            res.render('user/lists')

        } else {
            TodoList.find({'_id': {$in: users[0].lists}}, function (err, todoListSchema) {
                if (err) console.log(err);
                else
                    res.render('user/lists', {todoListSchema: todoListSchema});
            });
        }
    });

});

router.get('/user/signin', function (req, res) {
    var messages = req.flash('error');
    res.render('user/signin', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signin', passport.authenticate('local.signin', {
    successRedirect: '/user/lists',
    failureRedirect: '/user/signin',
    failureFlash: true
}));


module.exports = router;
