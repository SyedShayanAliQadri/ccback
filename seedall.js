import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

import User from "./models/user.model.js";
import Gig from "./models/gig.model.js";
import Order from "./models/order.model.js";
import Review from "./models/review.model.js";
import Conversation from "./models/conversation.model.js";
import Message from "./models/message.model.js";

dotenv.config();
mongoose.connect(process.env.MONGO);

const NUM_SELLERS = 50;
const NUM_BUYERS = 50;
const NUM_GIGS = 84;
const NUM_ORDERS = 15;
const NUM_REVIEWS = 10;
const NUM_CONVERSATIONS = 100;

const seedData = async () => {
  try {
    await mongoose.connection.dropDatabase();

    const sellers = [];
    const buyers = [];

    const password = await bcrypt.hash("123", 10); 

    // --- USERS ---
    for (let i = 0; i < NUM_SELLERS; i++) {
      sellers.push(await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password,
        country: faker.location.country(),
        isSeller: true,
        img: faker.image.avatar(),
        desc: faker.person.bio(),
      }));
    }

    for (let i = 0; i < NUM_BUYERS; i++) {
      buyers.push(await User.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        password,
        country: faker.location.country(),
        isSeller: false,
        img: faker.image.avatar(),
      }));
    }

    // --- GIGS ---
    const gigs = [];
    for (let i = 0; i < NUM_GIGS; i++) {
      const seller = faker.helpers.arrayElement(sellers);
      gigs.push(await Gig.create({
        userId: seller._id.toString(),
        title: faker.commerce.productName(),
        shortTitle: faker.commerce.productAdjective(),
        desc: faker.commerce.productDescription(),
        shortDesc: faker.lorem.sentence(),
        price: faker.number.int({ min: 50, max: 500 }),
        deliveryTime: faker.number.int({ min: 1, max: 7 }),
        revisionNumber: faker.number.int({ min: 1, max: 5 }),
        features: faker.helpers.arrayElements([
          "Responsive Design",
          "Fast Delivery",
          "Source File",
          "Revisions",
          "Bug Fixes",
        ], 3),
        images: [faker.image.url(), faker.image.url()],
        cover: faker.image.url(),
        cat: faker.commerce.department(),
      }));
    }

    // --- ORDERS ---
    const orders = [];
    for (let i = 0; i < NUM_ORDERS; i++) {
      const gig = faker.helpers.arrayElement(gigs);
      const buyer = faker.helpers.arrayElement(buyers);
      orders.push(await Order.create({
        gigId: gig._id.toString(),
        img: gig.cover,
        title: gig.title,
        price: gig.price,
        sellerId: gig.userId,
        buyerId: buyer._id.toString(),
        payment_intent: uuidv4(),
        isCompleted: faker.datatype.boolean(),
      }));
    }

    // --- REVIEWS ---
    for (let i = 0; i < NUM_REVIEWS; i++) {
      const gig = faker.helpers.arrayElement(gigs);
      const buyer = faker.helpers.arrayElement(buyers);
      await Review.create({
        gigId: gig._id.toString(),
        userId: buyer._id.toString(),
        star: faker.number.int({ min: 2, max: 5 }),
        desc: faker.lorem.sentences(10),
      });
    }

    // --- CONVERSATIONS & MESSAGES ---
    for (let i = 0; i < NUM_CONVERSATIONS; i++) {
      const buyer = faker.helpers.arrayElement(buyers);
      const seller = faker.helpers.arrayElement(sellers);
      const convId = uuidv4();

      await Conversation.create({
        id: convId,
        sellerId: seller._id.toString(),
        buyerId: buyer._id.toString(),
        readBySeller: faker.datatype.boolean(),
        readByBuyer: faker.datatype.boolean(),
        lastMessage: faker.lorem.sentence(),
      });

      await Message.create({
        conversationId: convId,
        userId: faker.helpers.arrayElement([buyer._id, seller._id]).toString(),
        desc: faker.lorem.sentences(2),
      });
    }

    console.log("✅ Sample data seeded with multiple entries!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
