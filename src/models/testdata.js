// const mongoose =require("mongoose");

// const TestdataSchema =new mongoose.Schema({
//     email :    {
//         type:String,
//         required :true,
//         unique : true
//    },
// 	name :    {
// 		 			type:String,
// 		 			required :true,
// 		 	   },
// 	age:{
// 		 			type:Number,
// 		 			required :true
// 		 	   }
// })

// // Collectiion creation
// const Testdata = new mongoose.model("Testdata",TestdataSchema);

// module.exports = Testdata;
const mongoose =require("mongoose");

const usersSchema =new mongoose.Schema({

	username : { 
					type:String,
					required :true
			   },
	email :    {
		 			type:String,
		 			required :true,
		 			unique : true
		 	   },
	age :  {
					type:Number
			   }
})

// Collectiion creation
const TestData = new mongoose.model("testdata",usersSchema);

module.exports = TestData;