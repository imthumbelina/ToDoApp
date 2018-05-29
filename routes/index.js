var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// var csrf = require('csurf');
// var todoList = ["Item1", "Item2"];
var passport = require('passport');

// var Product = require('../models/product');

var todoSchema = new mongoose.Schema({
    name: String,
    status: { type: Boolean, default: false }
});

var Todo = mongoose.model("Todo", todoSchema);


// var csrfProtection = csrf();
// router.use(csrfProtection);

/* GET home page. */
// router.get('/', function (req, res, next) {
//     Product.find(function (err, docs) {
//         var productChunks = [];
//         var chunkSize = 3;
//         for (var i = 0; i < docs.length; i += chunkSize) {
//             productChunks.push(docs.slice(i, i + chunkSize));
//         }
//         res.render('shop/index', {title: 'Shopping Cart', products: productChunks});
//     });
// });

router.get("/", function (req, res, next) {
    Todo.find({}, function (err, todoList) {
        if (err) console.log(err);
        else
            res.render('shop/index', {todoList: todoList});
    });
});

router.post("/newtodo", function (req, res) {
    console.log("item submitted");
    var newItem = new Todo(
        {
            name: req.body.item,
            status: false
        });
    Todo.create(newItem, function(err, Todo){
        if(err) console.log(err);
        else
            console.log("Inserted item");
    });
    res.redirect("/");
});

router.get('/delete/:id', function(req, res){
    Todo.remove({_id: req.params.id}, function(err){
        res.redirect('/');
    });
});

router.post('/update', function(req, res){
    Todo.where({_id: req.body.id}).update({status: req.body.status}, function(err, doc){
        if(err) res.json(err);
        else    res.send(200);
    });
});

 router.get('/user/signup', function(req, res, next){
   var messages = req.flash('error');
   res.render('user/signup', {messages: messages, hasErrors: messages.length > 0});
 });

router.post('/user/signup', passport.authenticate('local.signup',{
  successRedirect: '/user/profile',
  failureRedirect: '/user/signup',
  failureFlash: true
}));

router.get('/user/profile', function(req, res, next){
  res.render('user/profile')
});

module.exports = router;
