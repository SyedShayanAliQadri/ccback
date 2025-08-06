// seedAll.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/user.model.js";
import Gig from "./models/gig.model.js";
// import faker from "faker";
import { faker } from '@faker-js/faker';
import Conversation from "./models/conversation.model.js";
import Message from "./models/message.model.js";

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGO);
console.log("✅ Connected to MongoDB");

// Realistic Muslim name parts
const firstNames = [
  "Ahmed",
  "Mohammed",
  "Ali",
  "Hassan",
  "Hussain",
  "Ibrahim",
  "Yusuf",
  "Usman",
  "Zaid",
  "Bilal",
  "Saad",
  "Imran",
  "Tariq",
  "Faisal",
  "Noman",
  "Khalid",
  "Junaid",
  "Zeeshan",
  "Farhan",
  "Waqas",
];

const lastNames = [
  "Khan",
  "Malik",
  "Qureshi",
  "Ansari",
  "Siddiqui",
  "Hashmi",
  "Abbasi",
  "Shaikh",
  "Mughal",
  "Butt",
  "Raza",
  "Mirza",
  "Chaudhry",
  "Niazi",
  "Rehman",
  "Shah",
  "Bukhari",
  "Jatoi",
  "Soomro",
  "Mehmood",
];

const countries = [
  "Pakistan",
  "India",
  "Bangladesh",
  "Malaysia",
  "Egypt",
  "Turkey",
  "UAE",
];

const imagePool = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/men/65.jpg",
  "https://randomuser.me/api/portraits/women/42.jpg",
  "https://randomuser.me/api/portraits/women/88.jpg",
  "https://randomuser.me/api/portraits/men/14.jpg",
  "https://randomuser.me/api/portraits/women/33.jpg",
  "https://randomuser.me/api/portraits/men/25.jpg",
  "https://randomuser.me/api/portraits/men/76.jpg",
  "https://randomuser.me/api/portraits/women/67.jpg",
];

const categories = [
  "web",
  "design",
  "animation",
  "music",
  "writing",
  "seo",
  "video",
];
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateUsers = async () => {
  const users = [];
  const usernames = new Set();

  while (users.length < 100) {
    const first = getRandom(firstNames);
    const last = getRandom(lastNames);
    const username = `${first}${last}${Math.floor(Math.random() * 1000)}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(
      Math.random() * 1000
    )}@mail.com`;

    if (usernames.has(username)) continue; // Avoid duplicates
    usernames.add(username);

    const password = await bcrypt.hash("123", 10); // default password for all

    users.push({
      username,
      email,
      password,
      img: getRandom(imagePool),
      country: getRandom(countries),
      phone: `+92${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      desc: `Hi, I'm ${first} ${last}, a passionate freelancer ready to deliver top-notch work.`,
      isSeller: true,
    });
  }

  const insertedUsers = await User.insertMany(users);
  console.log(`👥 Inserted ${insertedUsers.length} users`);
  return insertedUsers;
};

const imagePoolGigCover = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    "https://images.unsplash.com/photo-1511376777868-611b54f68947",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
  ];
  
const imagePoolGig = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    "https://images.unsplash.com/photo-1626785774573-4b799315345d",
    "https://images.unsplash.com/photo-1511376777868-611b54f68947",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d",
    "https://images.unsplash.com/photo-1553729459-efe14ef6055d",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71"
  ];
  
const weightedStars = [5, 4, 3, 2, 1];

const generateGigs = async (users) => {
  const gigs = [];

  for (const category of categories) {
    for (let i = 0; i < 12; i++) {
      const user = getRandom(users.filter((u) => u.isSeller));

      if (!user) continue; // skip if no sellers available

      // Shuffle the image pool and pick 2 to 4 images randomly
      const shuffledImages = imagePoolGig.sort(() => 0.5 - Math.random());
      const randomImages = shuffledImages.slice(0, Math.floor(Math.random() * 3) + 2); // 2 to 4 images

      const starNumber = getRandom(weightedStars);
      // const randomImages = Array.from({ length: 3 }).map(() => getRandom(imagePoolGig));

      gigs.push({
        userId: user._id,
        title: `I will create a professional ${category} gig #${i + 1}`,
        desc: `This is a detailed and professional gig created for ${category} services.`,
        starNumber,
        totalStars: starNumber + getRandom(weightedStars),
        cat: category,
        price: Math.floor(Math.random() * 100) + 50,
        cover: getRandom(imagePoolGigCover),
        images: randomImages,
        shortTitle: `Quick ${category} gig`,
        shortDesc: `Efficient and reliable ${category} service`,
        deliveryTime: Math.floor(Math.random() * 7) + 1,
        revisionNumber: Math.floor(Math.random() * 3) + 1,
        features: ["Fast Delivery", "Source File", "Responsive Design"],
        sales: Math.floor(Math.random() * 100),
      });
    }
  }

  const insertedGigs = await Gig.insertMany(gigs);
  console.log(`🎨 Inserted ${insertedGigs.length} gigs`);
};

const NUM_CONVERSATIONS = 20; // or however many you want

const createTestConversations = async () => {
  try {
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    const users = await User.find({});
    const userIds = users.map((u) => u._id.toString());

    const conversations = [];

    for (let i = 0; i < NUM_CONVERSATIONS; i++) {
      // Random buyer and seller (make sure they're not the same)
      let sellerId = userIds[Math.floor(Math.random() * userIds.length)];
      let buyerId = userIds[Math.floor(Math.random() * userIds.length)];
      while (buyerId === sellerId) {
        buyerId = userIds[Math.floor(Math.random() * userIds.length)];
      }

      const conversationId = sellerId + buyerId;

      const lastMessage = faker.lorem.sentence();
      const readByBuyer = faker.datatype.boolean();
      const readBySeller = faker.datatype.boolean();

      const conversation = new Conversation({
        id: conversationId,
        sellerId,
        buyerId,
        readByBuyer,
        readBySeller,
        lastMessage,
      });

      await conversation.save();

      // Create random 3–6 messages per conversation
      const messageCount = Math.floor(Math.random() * 4) + 3;
      const participants = [sellerId, buyerId];

      for (let j = 0; j < messageCount; j++) {
        const senderId = participants[Math.floor(Math.random() * 2)];

        const message = new Message({
          conversationId: conversationId,
          userId: senderId,
          desc: faker.lorem.sentences(Math.floor(Math.random() * 2) + 1),
        });

        await message.save();
      }

      conversations.push(conversation);
    }

    console.log(`${conversations.length} conversations and messages created.`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};


const seedAll = async () => {
  try {
    // Optional: Clean existing data
    await User.deleteMany({});
    await Gig.deleteMany({});

    const users = await generateUsers();
    await generateGigs(users);

    console.log("✅ Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
};

seedAll();

//createTestConversations();