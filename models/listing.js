const mongoose = require("mongoose");
const Schmema = mongoose.Schema;

const listingSchema = new Schmema({
    title :{
        type: String,
        required:true,
    },
    description:String,
    image:{
        type:String,
        default : "https://unsplash.com/photos/brown-rock-formation-on-sea-during-daytime-gArHMgq6xms",
        set :(v) => v === "" ? "https://unsplash.com/photos/brown-rock-formation-on-sea-during-daytime-gArHMgq6xms" : v,
    },
    price:Number,
    location:String,
    country:String,
});

const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing;