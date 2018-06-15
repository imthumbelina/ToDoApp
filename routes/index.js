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

router.post("/user/lists/newtodo", function (req, res) {
    console.log("item submitted");
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
      var query = {'name':listName};
      var todolist = {$push: {todoList:newItem}};


      TodoList.findOneAndUpdate(query, todolist, {upsert:true}, function(err){
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
    TodoList.create(newTodoList, function (err) {
        if (err) console.log(err);
        else
            console.log("Inserted item");
    });

    var query = {user:req.user};
    var list = {$push: {lists:newTodoList}};


    UserList.findOneAndUpdate(query, list, {upsert:true}, function(err){
      if (err) return res.send(500, { error: err });
      console.log('it updated user list');
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
        // res.redirect('/user/lists');

    });
    TodoList.update(
        {_id: new mongodb.ObjectID(req.params.todoListId)},
        {$pull: {"todoList": {_id: new mongodb.ObjectID(req.params.id)}}},
        function () {
            console.log(req.params.todoListId);
            console.log(req.params.id);
            console.log("ddddddddddd");
            res.redirect('/user/lists');
        });
    // TodoList.where({_id: new mongodb.ObjectID(req.params.todoListId)}).remove();
    //db.todolists.update({"_id": ObjectId("5b22c3d7c1841d22fb7fdaf0")}, {$pull: {"todoList":{"name":"maso"}}})

});

router.post('/user/lists/update', function (req, res) {
    Todo.where({_id: req.body.id}).update({status: req.body.status}, function (err) {
        if (err) res.json(err);
        else res.send(200);
    });
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
    user : req.user,
  })

  UserList.findOneAndUpdate({user: req.user}, {user : req.user}, {upsert:true},  function (err) {
    if (err) return res.send(500, { error: err });
    console.log('it updated list');
  });

  UserList.find({ user: req.user },'lists', function (err, users) {
    if (err) return handleError(err);

    TodoList.find({'_id': { $in: users[0].lists}}, function(err, todoListSchema){
    if (err) console.log(err);
          else
              res.render('user/lists', {todoListSchema: todoListSchema});
      });

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
