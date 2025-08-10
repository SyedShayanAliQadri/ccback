// import mongoose from "mongoose";
// import fs from "fs/promises";
// import User from "./models/user.model.js";
// import Gig from "./models/gig.model.js";

// import dotenv from "dotenv";
// dotenv.config();

// const MONGO_URI = "mongodb://127.0.0.1:27017/campusconnect"; // Change if needed

// async function seedAll() {
//   try {
//     // Connect to Mongo
//     await mongoose.connect(process.env.MONGO);
//     console.log("✅ Connected to MongoDB");

//     // Clear old data
//     await User.deleteMany({});
//     await Gig.deleteMany({});
//     console.log("🗑️ Cleared old Users & Gigs");

//     // Read users JSON
//     let usersData = JSON.parse(await fs.readFile("./users_data.json", "utf-8"));
//     if (!Array.isArray(usersData) && usersData.users) {
//       usersData = usersData.users;
//     }
//     if (!Array.isArray(usersData)) {
//       throw new Error("users_data.json is not in array format.");
//     }

//     // Insert users
//     const insertedUsers = await User.insertMany(usersData);
//     console.log(`👥 Inserted ${insertedUsers.length} users`);

//     // Read gigs JSON
//     let gigsData = JSON.parse(await fs.readFile("./gigs_data.json", "utf-8"));
//     if (!Array.isArray(gigsData) && gigsData.gigs) {
//       gigsData = gigsData.gigs;
//     }
//     if (!Array.isArray(gigsData)) {
//       throw new Error("gigs_data.json is not in array format.");
//     }

//     // Assign userId from sellers randomly
//     const sellers = insertedUsers.filter((u) => u.isSeller);
//     gigsData = gigsData.map((gig) => {
//       const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
//       return {
//         ...gig,
//         userId: randomSeller._id.toString(),
//       };
//     });

//     // Insert gigs
//     await Gig.insertMany(gigsData);
//     console.log(`🛒 Inserted ${gigsData.length} gigs`);

//     console.log("🎉 Seeding completed successfully!");
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Error during seeding:", error);
//     process.exit(1);
//   }
// }

// seedAll();




import mongoose from "mongoose";
import fs from "fs/promises";
import bcrypt from "bcrypt";
import path from "path";
import User from "./models/user.model.js";
import Gig from "./models/gig.model.js";
import dotenv from "dotenv";

dotenv.config();


const MONGO_URI = process.env.MONGO;
const SALT_ROUNDS = 10;

// Set price range here
const MIN_PRICE = 500;  // Change to your desired min price
const MAX_PRICE = 2000; // Change to your desired max price

function getRandomPrice(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Auto-load all category image files
async function loadAllCategoryImages() {
  const categories = [
    "Data_Entry",
    "Content_Writing",
    "Graphics_Design",
    "Lab_Assistance",
    "Photography",
    "Presentation_Designer",
    "Programming_Tech",
    "Tutoring",
    "Video_Editing",
    "Web_Development",
  ];

  const categoryImagesMap = {};
  for (const category of categories) {
    try {
      const filePath = path.join(`./image_links/${category}_image_links.txt`);
      const fileContent = await fs.readFile(filePath, "utf-8");
      categoryImagesMap[category.replace(/_/g, " ")] = fileContent
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    } catch (err) {
      console.warn(`⚠️ Could not load image file for category "${category}":`, err.message);
      categoryImagesMap[category.replace(/_/g, " ")] = [];
    }
  }
  return categoryImagesMap;
}

async function seedAll() {
  try {
    // Connect to Mongo
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await User.deleteMany({});
    await Gig.deleteMany({});
    console.log("🗑️ Cleared old Users & Gigs");

    // Load and hash users
    let usersData = JSON.parse(await fs.readFile("./users_data.json", "utf-8"));
    if (!Array.isArray(usersData) && usersData.users) {
      usersData = usersData.users;
    }
    if (!Array.isArray(usersData)) throw new Error("users_data.json is not in array format.");

    const hashedUsers = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, SALT_ROUNDS),
      }))
    );

    const insertedUsers = await User.insertMany(hashedUsers);
    console.log(`👥 Inserted ${insertedUsers.length} users`);

    // Load gigs
    let gigsData = JSON.parse(await fs.readFile("./gigs_data.json", "utf-8"));
    if (!Array.isArray(gigsData) && gigsData.gigs) {
      gigsData = gigsData.gigs;
    }
    if (!Array.isArray(gigsData)) throw new Error("gigs_data.json is not in array format.");

    // Load category images
    const categoryImagesMap = await loadAllCategoryImages();
    const usedImagesTracker = {};

    for (const category in categoryImagesMap) {
      usedImagesTracker[category] = new Set();
    }

    // Assign gigs to sellers + unique images per category
    const sellers = insertedUsers.filter((u) => u.isSeller);

    gigsData = gigsData.map((gig) => {
      const randomSeller = sellers[Math.floor(Math.random() * sellers.length)];
      const category = gig.cat || "General";
      const categoryImages = categoryImagesMap[category] || [];

      const availableImages = categoryImages.filter(
        (url) => !usedImagesTracker[category].has(url)
      );

      if (availableImages.length < 3) {
        console.warn(`⚠️ Not enough unique images left for category: ${category}`);
      }

      const selectedImages = availableImages.slice(0, 3);
      selectedImages.forEach((img) => usedImagesTracker[category].add(img));

      return {
        ...gig,
        price: getRandomPrice(MIN_PRICE, MAX_PRICE),
        userId: randomSeller._id.toString(),
        cover: selectedImages[0] || "",
        images: selectedImages.slice(1),
      };
    });

    // Insert gigs
    await Gig.insertMany(gigsData);
    console.log(`🛒 Inserted ${gigsData.length} gigs`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

seedAll();
