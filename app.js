
var express    =require("express"),
    app        =express(),
    bodyParser =require("body-parser"),
    mongoose   =require("mongoose"),
    flash      =require("connect-flash"),
    passport   =require("passport"),
   LocalStrategy =require("passport-local"),
   methodOverride=require("method-override"),
    Food =require("./models/food"),
    Comment    =require("./models/comment"),
    User       =require("./models/user"),
    middleware =require("./middleware");
mongoose.connect("mongodb+srv://Shreyam:Shreyam1999@cluster0-5pt7f.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser: true});
// mongoose.connect("mongodb://localhost/My_food",{useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());

/**************PASSPORT CONFIGURATION***********************/
app.use(require("express-session")({
   secret:"Shreyam is the best developer!",
   resave:false,
   saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware so that user id and username is associated automatically
app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  res.locals.error=req.flash("error");
  res.locals.success=req.flash("success");
  next();
});

/**************************************************************************************/

//ROUTES SETTING FOR BHARAT CAMP WEBSITE

/****************************************************************************************/


//ROOT Route-Homepage of website
app.get("/",function(req,res){
    res.render("landing");
});


//INDEX Route -show all foods
app.get("/foods",function(req,res){
   if(req.query.search){
     const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Food.find({name:regex},function(err,allFoods){
      if(err){
        console.log(err);
      }
      else{
        //send or rendering the whole data to foods page via variable 'foods = allFoods'  
           res.render("foods/index",{foods:allFoods});
      }
    });
   }
   else{
	//Get all foods from DB
    Food.find({},function(err,allFoods){
    	if(err){
    		console.log(err);
    	}
    	else{
    		//send or rendering the whole data to foods page via variable 'foods = allFoods'  
           res.render("foods/index",{foods:allFoods});
    	}
    });
  }
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//CREATE Route-add new food to database
app.post("/foods",middleware.isLoggedIn,function(req,res){
	//Get a new Food data from form page 
	var name=req.body.name;
  var ingredients=req.body.ingredients;
	var image=req.body.image;
	var desc=req.body.description;
  var author={
    id:req.user._id,
    username:req.user.username
  }
	var newFood={name:name,ingredients:ingredients,image:image,description:desc,author:author}

	// save the new Food data to database
      Food.create(newFood,function(err,newlyCreated){
      	if(err){
      		console.log(err);
      	}else{
            //redirect to food image
	        res.redirect("/foods");
      	}
      });
});


//NEW Route-show form to create a food
app.get("/foods/new",middleware.isLoggedIn,function(req,res){
	res.render("foods/new");
});


//SHOW Route-show info about one food
app.get("/foods/:id",function(req,res){
	//find the food with provided ID
	Food.findById(req.params.id).populate("comments").exec(function(err,foundFood){
		if(err){
	 		console.log(err);
		}else{
            //render show template with that food
	        res.render("foods/show",{food:foundFood});
		}
	});
});

//EDIT FOOD ROUTE- edit food by its associated user only
app.get("/foods/:id/edit",middleware.checkFoodOwnership,function(req,res){
    Food.findById(req.params.id,function(err,foundFood){
     res.render("foods/edit",{food:foundFood});
    });
  });

//UPDATE FOOD ROUTE- update food data to database
app.put("/foods/:id",middleware.checkFoodOwnership,function(req,res){
  //find and update the correct food
  Food.findByIdAndUpdate(req.params.id,req.body.food,function(err,updatedFood){
    if(err){
      res.redirect("/foods");
    }else{
      res.redirect("/foods/"+req.params.id);
    }
  });
});

//DESTROY ROUTE-delete food
app.delete("/foods/:id",middleware.checkFoodOwnership,function(req,res){
  Food.findByIdAndRemove(req.params.id,function(err){
    if(err){
      res.redirect("/foods");
    }else{
      res.redirect("/foods");
    }
  });
});

/******************************************************************************************/
//COMMENT ROUTES

/****************************************************************************************************/

app.get("/foods/:id/comments/new",middleware.isLoggedIn,function(req,res){
	//find food by id
    Food.findById(req.params.id,function(err,food){
    	if(err){
    		console.log(err);
    	}else{
    		res.render("comments/new",{food:food});
    	}
    });
});
//lookup food using ID
	//create new comment
	//connect new comment to food
	 //redirect food show page
app.post("/foods/:id/comments",middleware.isLoggedIn,function(req,res){
    Food.findById(req.params.id,function(err,food){
    	if(err){
    		console.log(err);
    		res.redirect("/foods");
    	}else{
    		Comment.create(req.body.comment,function(err,comment){
      	if(err){

      		console.log(err);
      	}else{
             //add username and id to comment
             comment.author.id=req.user._id;
             comment.author.username=req.user.username;
             //save comment
             comment.save();
            food.comments.push(comment);
            food.save();
            req.flash("success","Successfully added comment!");
	        res.redirect('/foods/'+ food._id);
      	}
      });
    	}
    });
});

//EDIT ROUTE-edit comments 
app.get("/foods/:id/comments/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
   Comment.findById(req.params.comment_id,function(err,foundComment){
    if(err){
      res.redirect("back");
    }else{
      res.render("comments/edit",{food_id:req.params.id,comment:foundComment});
    }
   });
});


//UPDATE COMMENT ROUTE- update comment data to database
app.put("/foods/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
  //find and update the correct comment
  Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
    if(err){
      res.redirect("back");
    }else{
      res.redirect("/foods/"+req.params.id);
    }
  });
});

//DESTROY ROUTE-delete comment
app.delete("/foods/:id/comments/:comment_id",middleware.checkCommentOwnership,function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id,function(err){
    if(err){
      res.redirect("back");
    }else{
      req.flash("success","Comment deleted!");
      res.redirect("/foods/"+req.params.id);
    }
  });
});


/***************************************************************/	

//AUTH ROUTES

/***************************************************************************/

app.get("/register",function(req,res){
  res.render("register");
});

//Handle Sign up 
app.post("/register",function(req,res){
  var newUser=new User({username:req.body.username});
  User.register(newUser,req.body.password,function(err,user){
    if(err){
      req.flash("error",err.message);
      return res.render("register");
    }
      passport.authenticate("local")(req,res,function(){
        req.flash("success","Welcome to Taste Buddy "+ user.username);
        res.redirect("/foods");
      });
   });   
});


//Login Routes
app.get("/login",function(req,res){
  res.render("login");
});
//middleware passport.authenticate
app.post("/login",  passport.authenticate("local",
  {
    successRedirect:"/foods",
   failureRedirect:"/login"
  }),  function(req,res){
   
});


//Logout Routes
app.get("/logout",function(req,res){
  req.logout();
  req.flash("success","Logged you out!");
  res.redirect("/foods");
});


/********************************************************************************************/
// LISTENER
/*********************************************************************************************************/

//Listener
const PORT = process.env.PORT || 2300;
app.listen(PORT,function(){
	console.log("The Food Recipe Server has started");
});