var mongoose=require("mongoose");

//Schema Setup
var foodSchema=new mongoose.Schema({
	name:String,
	ingredients:String,
	image:String,
	description:String,
	author:{
		id:{
           type:mongoose.Schema.Types.ObjectId,
		},
		username:String
	},
	comments:[
      {
      	type:mongoose.Schema.Types.ObjectId,
      	ref:"Comment"
      }
	]
});

module.exports=mongoose.model("Food",foodSchema)