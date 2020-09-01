var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var methodOverride = require("method-override");
var mongoose   = require('mongoose');
var expressSanitizer = require("express-sanitizer");


//CONFIGURE MONGO ATLAS
mongoose.connect('mongodb+srv://devstart:devstart@cluster0.b8zys.mongodb.net/cluster0?retryWrites=true&w=majority', {
useNewUrlParser: true,
useCreateIndex: true,
useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

//CONFIGURE MONGODB LOCAL
  //mongoose.connect('mongodb://localhost:27017/restful_blog_app', {
  //useNewUrlParser: true,
 // useUnifiedTopology: true
//})
//.then(() => console.log('Connected to DB!'))
//.catch(error => console.log(error.message));

//INITIATE BODY PARSER FOR GATHERING FORM DATA
app.use(bodyParser.urlencoded({extended: true}));

//FOR ACCESS TO METHOD OVERRIDE; FOR PUT AND DELETE REQUESTS
app.use(methodOverride("_method"));

//USE EXPRESS SANITIZER
app.use(expressSanitizer());

//USING EJS FILES FOR APP
app.set("view engine", "ejs");

//FOR ACCESS TO CSS FILE IN PUBLICS FOLDER
app.use(express.static("public"));


//CREATE DB SCHEMA
var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type: Date, default: Date.now}//FOR DISPLAY OF THE DATE POST WAS MADE
}); 

//CREATE DB MODEL
var Blog = mongoose.model("Blog",blogSchema);

//CREATE A BLOG INTO THE DB
//  Blog.create({
//      title: "Test Blog",
//      image: "https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&h=350",
//      body: "HELLO THIS IS A BLOG POST."
//  })

//RESTFUL ROUTES
//INDEX
app.get('/', function(req,res){//ROOT REDIRECTS TO INDEX PAGE FOR DISPLAY OF ALL BLOG POSTS
    res.redirect("/blogs");
});

app.get('/blogs',function(req,res){
    //DISPLAY ALL BLOGS FROM DB
    Blog.find({}, function(err, blogs){//BLOG DATA STORED IN 'blogs'
        if(err){
            console.log('ERROR');
        }else{
            res.render('index', {blogs:blogs});//DISPLAYING 'blogs' on INDEX PG.
        }
    });
});

//NEW ROUTE
app.get('/blogs/new',function(req,res){
    res.render('new');
});

//CREATE ROUTE
app.post("/blogs",function(req,res){
    //CREATE BLOG
    req.body.blog.body = req.sanitize(req.body.blog.body)//REMOVE ANY JAVASCRIPT ENTERED BY USER IN BODY
    Blog.create(req.body.blog,function(err, newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE-MAKING SAME INFO RENDER ON EDIT PG, SO IT CAN THEN BE EDITED.
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        } 
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res) {
    req.body.blog.body = req.sanitize(req.body.blog.body)//REMOVE ANY JAVASCRIPT ENTERED BY USER IN BODY
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/" + req.params.id);//TAKE BACK TO SHOW PAGE AFTER UPDATED BLOG.
        }
    });
});


//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
    //DESTROY BLOG
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    })
})


//SERVER LISTENING FOR LOCAL, OR PORT FOR WHEN DEPLOYED...
app.listen(process.env.PORT || 3000,function(){
    console.log("Server listening on port 3000.") 
});
