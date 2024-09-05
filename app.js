const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path"); 
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/expressErr.js");
const {listingSchema} = require("./schema.js");



const MONGO_URL = "mongodb://127.0.0.1:27017/airbnb";
main().then(()=>{
    console.log("connected to database");
}).catch((err) =>{
    console.log(err);
})
async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.send("hi i am root");
})

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(","); 
        throw new ExpressError(400,result.errMsg);
    }
    else{
        next();
    }
}

//index route
app.get("/listings", wrapAsync(async(req,res)=>{
   const allListings = await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));


//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
     const listing = await Listing.findById(id);
     res.render("listings/show.ejs",{listing});
}));

//create route
app.post("/listings",validateListing,wrapAsync(async(req,res)=>{
    //let {title,description,image,price,country,location} = req.body;
    // if(!req.body.listing){
    //     throw new ExpressError(400,"send valid data for listing");
    // }
      
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");

}));

//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));

//update route
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);

}));

//delete route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedLisiting = await Listing.findByIdAndDelete(id);
    console.log(deletedLisiting);
    res.redirect("/listings");
}));


// app.get("/testListing",async(req,res)=>{
//     let sampleListing = new Listing({
//         title: "my homee",
//         description : "by the beach",
//         price : 1200,
//         location : "goa",
//         country: "India",
//     });
//      await sampleListing.save();
//      console.log("sample was saved");
//      res.send("successful");
// });


app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found !!!"))
})

//error handling
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080,()=>{
    console.log("app is listening on port 8080");
})