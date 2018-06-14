var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

var Todo = require('../models/todo');
var TodoList = require('../models/todolist');

router.get("/", function (req, res, next) {
    res.render('todo/home');
});

router.post("/user/lists/newtodo", function (req, res) {
    console.log("item submitted");
    var newItem = new Todo(
        {
            name: req.body.item,
            status: false
        });
  var myTodo = Todo.create(newItem, function (err, Todo) {
        if (err) console.log(err);
        else
            console.log("Inserted item");
    });
      var listName = req.body.label;
      var newVal = { $set: {newtodo: newItem } };

      console.log('inserted into', listName);
      var query = {'name':listName};
      var todolist = {$push: {todoList:newItem}};


      TodoList.findOneAndUpdate(query, todolist, {upsert:true}, function(err, doc){
        if (err) return res.send(500, { error: err });
        console.log('it worked');
      });

    res.redirect("/user/lists");


});


router.post("/user/lists/newtodolist", function (req, res) {
    console.log("item submitted");
    var newTodoList = new TodoList(
        {
            name: req.body.item
        });
    TodoList.create(newTodoList, function (err, TodoList) {
        if (err) console.log(err);
        else
            console.log("Inserted item");
    });
    res.redirect("/user/lists");
});


router.get('/user/lists/delete/:id', function (req, res) {
    Todo.remove({_id: req.params.id}, function (err) {
        res.redirect('/user/lists');
    });
});

router.get('/user/lists/newtodo/delete/:id', function (req, res) {
    TodoList.remove({_id: req.params.id}, function (err) {
        res.redirect('/user/lists');
    });
});

router.post('/user/lists/update', function (req, res) {
    Todo.where({_id: req.body.id}).update({status: req.body.status}, function (err, doc) {
        if (err) res.json(err);
        else res.send(200);
    });
});

router.get('/user/signup', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/lists',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

router.get('/user/lists', function (req, res, next) {
    TodoList.find({}, function (err, todoListSchema) {
        if (err) console.log(err);
        else
            res.render('user/lists', {todoListSchema: todoListSchema});
    });
});

router.get('/user/signin', function (req, res, next) {
    var messages = req.flash('error');
    res.render('user/signin', {messages: messages, hasErrors: messages.length > 0});
});

router.post('/user/signin', passport.authenticate('local.signin', {
    successRedirect: '/user/lists',
    failureRedirect: '/user/signin',
    failureFlash: true
}));


module.exports = router;
