//Only buyer can send seller messages
// ok so it seems that only a buyer can send message to a seller as per the current code logic but it's not restricting the sellers to send messages so i want to add an alert that should be generated when a seller account click on contact button

// import createError from "../utils/createError.js";
// import Conversation from "../models/conversation.model.js";

// export const createConversation = async (req, res, next) => {
//   const conversationId = req.isSeller
//     ? req.userId + req.body.to
//     : req.body.to + req.userId;

//   try {
//     const existing = await Conversation.findOne({ id: conversationId });
//     if (existing) return res.status(200).send(existing);

//     const saved = await newConversation.save();
//     res.status(201).send(saved);
//   } catch (err) {
//     next(err);
//   }
// };


// export const updateConversation = async (req, res, next) => {
//   try {
//     const updatedConversation = await Conversation.findOneAndUpdate(
//       { id: req.params.id },
//       {
//         $set: {
//           ...(req.isSeller ? { readBySeller: true } : { readByBuyer: true }),
//         },
//       },
//       { new: true }
//     );

//     res.status(200).send(updatedConversation);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getSingleConversation = async (req, res, next) => {
//   try {
//     const conversation = await Conversation.findOne({ id: req.params.id });
//     if (!conversation) return next(createError(404, "Not found!"));
//     res.status(200).send(conversation);
//   } catch (err) {
//     next(err);
//   }
// };

// export const getConversations = async (req, res, next) => {
//   try {
//     const conversations = await Conversation.find(
//       req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }
//     ).sort({ updatedAt: -1 });
//     res.status(200).send(conversations);
//   } catch (err) {
//     next(err);
//   }
// };



// Anyone can send messages
import createError from "../utils/createError.js";
import Conversation from "../models/conversation.model.js";



export const createConversation = async (req, res, next) => {
  const conversationId = req.userId + req.body.to;

  try {
    const existing = await Conversation.findOne({ id: conversationId });
    if (existing) return res.status(200).send(existing);

    const newConversation = new Conversation({
      id: conversationId,
      sellerId: req.userId,      // Just store sender as sellerId
      buyerId: req.body.to,      // and receiver as buyerId
      readBySeller: true,
      readByBuyer: false,
    });

    const saved = await newConversation.save();
    res.status(201).send(saved);
  } catch (err) {
    next(err);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Conversation not found"));

    const isSender = conversation.sellerId === req.userId;

    const updatedConversation = await Conversation.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          ...(isSender ? { readBySeller: true } : { readByBuyer: true }),
        },
      },
      { new: true }
    );

    res.status(200).send(updatedConversation);
  } catch (err) {
    next(err);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({ id: req.params.id });
    if (!conversation) return next(createError(404, "Not found!"));
    res.status(200).send(conversation);
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ sellerId: req.userId }, { buyerId: req.userId }],
    })
    .populate("sellerId", "username img")
    .populate("buyerId", "username img")
    .sort({ updatedAt: -1 });




    // const conversations = await Conversation.find({
    //   $or: [
    //     { sellerId: req.userId },
    //     { buyerId: req.userId }
    //   ]
    // }).sort({ updatedAt: -1 });

    res.status(200).send(conversations);
  } catch (err) {
    next(err);
  }
};