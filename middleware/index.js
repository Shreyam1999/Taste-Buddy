var Food=require("../models/food");
var Comment=require("../models/comment");

var middlewareObj={};

middlewareObj.checkFoodOwnership=function(req,res,next){
if(req.isAuthenticated()){
    Food.findById(req.params.id,function(err,foundFood){
      if(err){
      	req.flash("error","Recipe not found!");
        res.redirect("back");
      }else{
         //does user own campground
         if(foundFood.author.id.equals(req.user._id)){
           next();
         }else{
         	req.flash("error","You do not have permission to do that!");
             res.redirect("back");
         }
      }
    });

  }else{
  	req.flash("error","You need to be logged in to do that!");
    res.redirect("back");

  }
}

middlewareObj.checkCommentOwnership=function(req,res,next){
 if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id,function(err,foundComment){
      if(err){
        res.redirect("back");
      }else{
         //does user own comment
         if(foundComment.author.id.equals(req.user._id)){
           next();
         }else{
         	req.flash("error","You dont have permission to do that!");
             res.redirect("back");
         }
      }
    });

  }else{
  	req.flash("error","You need to be logged in to do that!");
    res.redirect("back");

  }	
}

middlewareObj.isLoggedIn=function(req,res,next){
	 if(req.isAuthenticated()){
    return next();
  }
  req.flash("error","You need to be logged in to do that!");
  res.redirect("/login");
}



module.exports=middlewareObj;