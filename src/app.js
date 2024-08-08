const path = require("path");
const express =require("express");
const app = express();
const hbs =require("hbs");
const nodemailer = require("nodemailer");
const multer  = require("multer");
const unirest = require('unirest');
const PDFDocument = require('pdfkit');
const requests = require("requests");//installed pacakage


//Port
const port = process.env.PORT || 3000;

//Database connection
require("./src/db/conn");

const { json } =require("express");

//Importing Info database schema and collection
// const Info = require("./models/info");

//---------------------------------MODELS----------------------------------
//Importing Feature List model
const Features = require("./src//models/featurelist");

//Importing File Upload model
const ImageUpload = require("./src/models/imagemodel");

//Importing TestData model
const TestData = require("./src/models/testdata");

//Importing Users Database schema and collection
const Users = require("./src//models/registers");
//-------------------------------------------------------------------------


//Path (used for static files)
const staticpath =path.join(__dirname,"/public");
//template path
const templatepath =path.join(__dirname,"/views");
//Partials path
const partialspath =path.join(__dirname,"/partials"); 

//To get data after register,instead of showing undefined
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//use static file
app.use(express.static(staticpath));

//set template engine
app.set("view engine","hbs");

//set Template Path
app.set("views",templatepath);


app.use("/public",express.static("public"));
// app.use("/images",express.static("images"));
//register prtials
hbs.registerPartials(partialspath);



app.get("/",(req,res)=>
{
	res.render("index");
});
app.get("/index",async (req,res)=>
{
	res.render("index");
	// res.status(200).json({name : "rrs"});

});
app.get("/fetch",async (req,res)=>
{
	// res.send("Hello");
	
	// Get counter from database
	//-------------------------------------------
	const featuredb = await Features.find().sort({"category":1});
	const featureCounter = await Features.find().countDocuments();
	const getFeatures = featuredb[0].featurename;
	// console.log(featuredb);
	// Get the feature list
	//-------------------------------------------
	// const featurelist = await()
	//to use hbs engine hbs 
	res.json({
		counter : featureCounter,
		features : featuredb
	})
	// res.render("index");
	// res.status(200).json({name : "rrs"});

});

// --------------------------------------------REGISTARTION------------------------------------------
//-------------------------------------------
app.get("/register",(req,res)=>
{
	res.render("register");
})

// /Creating data in database
app.post("/register",async(req,res)=>
{
	try
	{
		
		// password check
		// if(req.body.psw === req.body.cpsw)
		// {
			const usersData =new Users({
				username :req.body.uname,
				email :  req.body.email ,
				zip_code:req.body.zip,
				phoneno : req.body.phone ,
				password : req.body.psw,
				cpassword : req.body.cpsw,
			})

		const Testuser = await usersData.save();
		res.status(201).render("register",{
			"status":"Registered Succesfully !"
		});
		}
		// else
		// {
		// 	res.render("register",{
		// 		"status":"Password Mismatch"
		// 	});
		// }
		// res.send(req.body.uname);
	// }
	catch(err)
	{
		res.status(400).render("register",{
			"error":"Email or contact no already used !"})
	}

})
// -----------------------------------------------LOGIN------------------------------------------------------------
//-----------------------------------------
app.get("/login",(req,res)=>
{
	res.render("login");
})

app.post("/login",async(req,res)=>
{
	try
	{
		const email = req.body.email;
		const password = req.body.psw;
		// console.log(`Email ${email} ,Passwprd is ${password}`);
		const useremail= await Users.findOne({email:email});
		const userPassword = useremail.password;
		if(password == userPassword)
		{
			res.status(201).render("login",{
			"status":"Logged Succesfully !"
			});
			// res.json({status : "success"});
			// console.log(useremail);
		}
		else
		{
			res.status(201).render("login",{
			"error":"Invalid Credentials !"
			});
			// res.send("invalid credentials");
		}
	}
	catch(err)
	{
		res.status(400).render("login",{
			"error":"Invalid Email !"
			});
	}

})
//-------------------------------------------------FETCH DATA------------------------------
app.get("/fetchData",(req,res)=>
{
	res.render("fetchdata");
})
//--------------------------------------------------FILE UPLOAD----------------------------------------
app.get("/uploadPage",(req,res)=>
{
	res.render("upload");
})
//---------------------Multer Storage set up and file storing---------------
	
	
	const storage = multer.diskStorage({ destination: './public/images/uploads/',
  										 filename: function (req, file, cb) 
  										 {
  										 	const uniqueSuffix = cb(null, '' + file.originalname);
  										 }
                                      })

	const uploads = multer({ storage: storage }).array('images',5);
	// var images =[];

//Request to upload
	app.post("/upload",(req,res)=>
	{

		uploads(req,res,(err)=>{
			// console.log(req.files);
			if (!err) 
			{
				for (var i = 0; i < req.files.length; i++)
				{
					// images.push(req.files[i].filename);
					const newImage = new ImageUpload({
					filename : req.files[i].filename,
					size:req.files[i].size,
					type :req.files[i].fieldname,
				  })
				   newImage.save();				   
				}
				console.log("Succefully uploaded");
				res.render("upload");
			}
			else
			{
				console.log(err);				
			}
		})
	})

//Fetch Images
app.get("/upload/fetchImg",async (req,res)=>
{
	var images =[];
	const imagedb = await ImageUpload.find();
	for (var i = 0; i < imagedb.length; i++)
	{
		images.push(imagedb[i].filename)
		// const getImages = imagedb[0].filename;
	}
	res.json({images : images})
})
app.get("/upload",(req,res)=>
{
	res.render("upload");
})
//--------------------------------------------DYNAMIC DIV-----------------------------------------------------
//-------------------------------------------
app.get("/dynamicdiv",(req,res)=>
{
	res.render("dynamicdiv");
})
app.post("/dynamicdiv",(req,res)=>
{
	res.render("dynamicdiv",{
		"divs":req.body.divs
	});
})
//--------------------------------------------SENDING MAILS----------------------------------------------------
//-------------------------------------------
app.get("/sentEmail",(req,res)=>
{
	res.render("sentEmail");
})
const emailOpts = multer({ storage: storage }).single("files");
app.post("/sendEmail",(req,res)=>
//------Transported contains the authentictions------
{
	emailOpts(req,res,async (err)=>{
			if (!err) 
			{
				const transporter = nodemailer.createTransport({
						host : "smtp.gmail.com",
						auth :
						{
							user: 'sadangirashmiranjan@gmail.com',
        					pass: 'ibzbknacmtrvmoac'
						}
					})
					const options = {
						from:"Rashmi Ranjan Sadangi",
						to : req.body.to,
						cc:req.body.cc,
						bcc:req.body.bcc,
						subject :req.body.subject,
						text:req.body.message,
						attachments: [
										{
											filename:req.file.orginalname,
											path :req.file.path
										}
									 ]
					}

					transporter.sendMail(options , (err,info) =>
					{
						if (err) {res.send(err);console.log(err);}
						else{res.render("sentEmail");console.log(info);}	
					})
			}
			else
			{
					console.log(err);
			}
		})
})
//--------------------------------------------DYNAMIC PDF ----------------------------------------------------
//-------------------------------------------

app.get('/generate-pdf', async (req, res) => {
    // Create a new PDF document
    const doc = new PDFDocument();

    // Set headers to tell the browser to download the file as an attachment
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Users Data.pdf"');

    // Pipe the PDF into the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(25).text('Users Data', { align: 'center' });

    try {
        // Fetching data from database
        const usersdb = await Users.find();

        // Add table header
        doc.fontSize(12).text('Name', 100, 100);
        doc.text('Email', 150, 100);
        doc.text('Zip Code', 350, 100);
        doc.text('Contact', 400, 100);

        // Add data rows
        let y = 150;
        usersdb.forEach(item => {
            doc.text(item.username, 100, y);
            doc.text(item.email, 150, y);
            doc.text(item.zip_code, 350, y);
            doc.text(item.phoneno, 400, y);
            y += 30;
        });

        // Finalize the PDF and end the stream
        doc.end();
    } catch (err) {
        console.error('Error fetching data from database:', err);
        res.status(500).send('An error occurred while generating the PDF');
    }
});

//----------------------------CRUD OPERATIONS----------------------------------------------
//-------------------------------------------------
app.get("/crud",(req,res)=>
{
	res.render("crud");
})
app.post("/crud/getData",async (req,res)=>
{
	try
	{
		const email = req.body.searchingdata;
		const useremail= await TestData.findOne({email:email});
		const uemail = useremail.email;
		const uname = useremail.username;
		const age = useremail.age;
		if(useremail != null)
		{
			res.render("crud",{email: uemail,uname : uname,age :age});
			// console.log(useremail);
		}
		else
		{
			res.render("crud",{status:"Email data not found try again !"});
		}
	}
	catch(err)
	{
		res.render("crud",{status:"Email not found"});
	}
})
app.post("/crud/addData",async (req,res)=>
{
	try
	{
		const email=req.body.email;
		const uname = req.body.uname;
		const age = req.body.age;
		// inserting data
		const usersDatas =new TestData({
				email :  email,
				username : uname,
				age : age
			})

		const user = await usersDatas.save();
		res.status(201).render("crud",{
			"status":"Registered Succesfully !"
		});
	}
	catch(err)
	{
		res.status(400).send(err);
	}
})
app.post("/crud/updateData",async (req,res)=>
{
	const filter = {email: req.body.email };
    const update = { $set: { username: req.body.uname, age: req.body.age } };

    const result = await TestData.updateOne(filter, update);
	res.status(201).render("crud",{
		"status":"Updated Succesfully !"
	});
	
})
app.post("/crud/deleteData",async (req,res)=>
{
	const filter = {email: req.body.email };

    const result = await TestData.deleteOne(filter);
	res.status(201).render("crud",{
		"status":"Deleted Succesfully !"
	});
})
//----------------------------SEARCH AND FILTER------------------------------------------
//-------------------------------------------------
app.get("/filter",async (req,res)=>
{
    res.render("filter");
})
app.get("/filter/requests",async (req,res) =>
{
     try {
        const { search } = req.query;
        let filter = {};

        if (search) {
            filter.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await Users.find(filter);
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
});
// data visualization
app.get("/datav",async (req,res) =>
{
	res.render("datav");
})
app.get('/api/users', async (req, res) => 
{
	try 
	{
	    const { search } = req.query;
	    let filter = {};

	    if (search) {
	      filter.$or = [
	        { username: { $regex: search, $options: 'i' } },
	        { email: { $regex: search, $options: 'i' } },
	      ];
	    }

	    const users = await User.find(filter);
	    res.status(200).json(users);
  	} 
  	catch (err) 
  	{
    	res.status(500).json({ error: 'An error occurred while fetching users' });
  	}

// Call this function to update the chart with new data
fetchDataAndUpdateChart();
});

//----------------------------Dynamic Pdf Feature------------------------------------------
//-------------------------------------------------
app.get("/dynamicpdf",(req,res)=>
{
	res.render("dynamicpdf");
})
app.get("/dynamicpdf/data", async (req,res)=>
{
	try
	{
		var usersData =[];
		const usersdb = await Users.find();
		for (var i = 0; i < usersdb.length; i++)
		{
			usersData.push(usersdb[i]);
		}
		 // Use res.status(status).json(obj)
		res.status(200).json({usersData : usersData});
	}
	catch(err)
	{
		res.status(400).send("Invalid Email");
	}
	// res.render("dynamicpdf",
	// 	{
	// 		itemNo : req.body.itemno,
	// 		itemName : req.body.itemname,
	// 		price:req.body.price,
	// 		date : Date.now()
	// 	});
})
//---------------------------Google Sheet API----------------------------------------------
//------------------------------------------
//--------------------------
//---------------
const { GoogleSpreadsheet } = require("google-spreadsheet");
const fs=require("fs");
const { title } = require("process");
// const Testdata = require("./src/models/testdata");

// //Sheet Id
// -----------------------------------------------------------------------------------------

const spreadsheetId='1Smi-gO6vT2Q57Tgt0ccLvS_OtnXQp89lYcrQ9dUZB8I';


// //Create instance of sheet
const doc = new GoogleSpreadsheet(spreadsheetId);

//Credentials for the google service account stores in json
const credentials = JSON.parse(fs.readFileSync('wired-victor-361517-dea632793eca.json'));
var username;
var password;

//-------------Fetch Data Function(Google sheet)------------------------
const getData= async (email) =>
{
	//use service account creds
	doc.useServiceAccountAuth({
		client_email:credentials.client_email,
		private_key:credentials.private_key
	})

	//load the document info
	await doc.loadInfo();
	// console.log(doc.title);

	//Index of the sheet
	let sheet = doc.sheetsByIndex[0];

	//Get all the rows
	let data = await sheet.getRows();

	for (let i = 0; i < data.length; i++)
	{
		const row =data[i];
		if(row.email == email)
		{
			username=row.user_name;
			password = row.password;
			console.log(row.user_name);	console.log(row.password);
		}
	}
}
//--------------Add Data Function(Google sheet)-----------------
const addData = async(row)=>
{
	//use service account creds
	doc.useServiceAccountAuth({
		client_email:credentials.client_email,
		private_key:credentials.private_key
	})

	await doc.loadInfo();

	let sheet = doc.sheetsByIndex[0];

	await sheet.addRow(row);

}
//------------Update Data Function(Google spreadsheet)---------
const updateData = async(keyValue,oldValue,newValue)=>
{
	//use service account creds
	doc.useServiceAccountAuth({
		client_email:credentials.client_email,
		private_key:credentials.private_key
	})
	await doc.loadInfo();

	let sheet = doc.sheetsByIndex[0];

	let rows = await sheet.getRows();
	// console.log(rows.length);

	for (let i =0; i < rows.length; i++)
	{
		const row = rows[i];
		if (row[keyValue] === oldValue)
		{
			rows[i][keyValue]=newValue;
			await rows[i].save();
			break; 
		}
	}
}

//----------Delete Data Function(Google spreadsheet)-----------
const deleteData = async (keyValue,thisValue)=>
{
	//use service account creds
	doc.useServiceAccountAuth({
		client_email:credentials.client_email,
		private_key:credentials.private_key
	})
	await doc.loadInfo();

	let sheet = doc.sheetsByIndex[0];

	let rows = await sheet.getRows();

	for (let i =0; i < rows.length; i++)
	{
		const row = rows[i];
		if (row[keyValue] === thisValue)
		{
			await rows[i].delete();
			break; 
		}
	}
}
// ----------End of Sheet related functions-----------------



//-----------Google sheet related API calls-------------

app.get("/googlesheetapi",(req,res)=>
{
	res.render("googlesheetapi");
})
app.post("/googlesheetapi/getData",async (req,res)=>
{
	await getData(req.body.searchingdata);
	res.render("googlesheetapi",{username : username,password :password});
})
app.post("/googlesheetapi/addData",async (req,res)=>
{
	const row = ({ email: req.body.email,user_name: req.body.uname,password:req.body.psw });
	await addData(row);
	res.render("googlesheetapi");
})
app.post("/googlesheetapi/updateData",async (req,res)=>
{
	await updateData(req.body.keyValue,req.body.oemail,req.body.nemail);
	res.render("googlesheetapi");
})
app.post("/googlesheetapi/deleteData",async (req,res)=>
{
	await deleteData('email',req.body.email);
	res.render("googlesheetapi");
})

// -----------------------------------------------WORDS API------------------------------------------------------------
//-----------------------------------------
// app.get("/wordsapi",(req,res)=>
// {
// 	res.render("wordsapi");
// })
// app.post("/wordsapi", (req,res)=>
// {
// 	const word = req.body.word;
// 	const type= req.body.type;
// 	var temp;
// 	const apilink = "https://wordsapiv1.p.mashape.com/words/"+word+"/"+type;
// 	const link = apilink.toString();
// 	requests(link)
// 			.on("data",(chunk) =>
// 			{
// 				const objData=JSON.parse(chunk);//Passing chunk data as JSON
// 				const arrData=[objData];
// 				// console.log(arrData[0].main.temp);
// 				temp = arrData[0].word;
// 			})
// 			.on("end",(err)=>
// 			{
// 				if(err)  return console.log("Connection closed due to errors",err);

// 				console.log("end");
// 				res.render("wordsapi",{temp :temp });
// 			});
// })
//-------------------------------------------IMDB API ---------------------------------------------------------
//-----------------------------------
app.get("/imdb", (req,res)=>
{
	res.render("imdbapi");
})
app.post("/imdbdetails",(req,res)=>
{
	const rank = req.body.rank;
	const link = unirest('GET', 'https://imdb-top-100-movies.p.rapidapi.com/top'+rank);

	link.headers({
		'content-type': 'application/octet-stream',
		'X-RapidAPI-Key': '178e8540a3msha5820b2b2a818f1p1035f8jsn632a71f2a1df',
		'X-RapidAPI-Host': 'imdb-top-100-movies.p.rapidapi.com'
	});

	link.end(function (result) {
		if (result.error) throw new Error(result.error);
		res.render("imdbapi",{"rank":result.body.rank,"mvname":result.body.title,"rating":result.body.rating,"year":result.body.year,"director":result.body.director[0]});
		//res.render("imdbapi",{"response":result.body});

		//  console.log(result.body.rank);
	});
  })

//-------------------------------------------WEATHER API ---------------------------------------------------------
//-----------------------------------
//-------------------------
//-----------------
app.get("/weatherapi", (req,res)=>
{
	res.render("weatherapi");
})
app.post("/weatherfetch",async (req,res)=>
{
	const location = req.body.place;
	var temp;
	const apilink = "https://api.openweathermap.org/data/2.5/weather?q="+location+"&appid=80bb6ba7792f875529f8644f469fcce6";
	const link = apilink.toString();
	console.log(location);
	requests(link)
			.on("data",(chunk) =>
			{
				const objData=JSON.parse(chunk);//Passing chunk data as JSON
				const arrData=[objData];
				// console.log(arrData[0].main.temp);
				temp = arrData[0].main.temp-273.15 + " C";
			})
			.on("end",(err)=>
			{
				if(err)  return res.render("weatherapi",{err :err });

				console.log("end");
				res.render("weatherapi",{temp :temp });
			});
})

//-------------------------------------------DYNAMIC QUOTE API ---------------------------------------------------------
//-----------------------------------
app.get("/dynamicquote", (req,res)=>
{
	res.render("dynamicquote");
})

// Port
//---------------------------------------
app.listen(port,()=>{
	console.log(`Serving in the ${port}`);
});
