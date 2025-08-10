import Gig from "../models/gig.model.js";
import createError from "../utils/createError.js";

export const createGig = async (req, res, next) => {
  if (!req.isSeller)
    return next(createError(403, "Only sellers can create a gig!"));

  const newGig = new Gig({
    userId: req.userId,
    ...req.body,
  });

  try {
    const savedGig = await newGig.save();
    res.status(201).json(savedGig);
  } catch (err) {
    next(err);
  }
};
export const deleteGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (gig.userId !== req.userId)
      return next(createError(403, "You can delete only your gig!"));

    await Gig.findByIdAndDelete(req.params.id);
    res.status(200).send("Gig has been deleted!");
  } catch (err) {
    next(err);
  }
};
export const getGig = async (req, res, next) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) next(createError(404, "Gig not found!"));
    res.status(200).send(gig);
  } catch (err) {
    next(err);
  }
};

export const getGigs = async (req, res) => {
  try {
    const {
      userId,
      cat,
      min,
      max,
      sort,
      page = 1,
      limit = 12,
      search,
    } = req.query;

    const filters = {};

    if (userId) filters.userId = userId;

    if (cat) {
      filters.cat = { $regex: new RegExp(`^${cat}$`, "i") };
    }

    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: "i" } },
        { cat: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
        { shortDesc: { $regex: search, $options: "i" } }
      ];
    }

    if (min || max) {
      filters.price = {};
      if (min) filters.price.$gte = parseInt(min);
      if (max) filters.price.$lte = parseInt(max);
    }

    const sortBy = sort === "sales" ? { sales: -1 } : { createdAt: -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const gigs = await Gig.find(filters)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Gig.countDocuments(filters);

    res.status(200).json({ gigs, total });
  } catch (err) {
    res.status(500).send("Failed to fetch gigs: " + err.message);
  }
};


// export const getGigs = async (req, res) => {

//   try {
//     const {
//       userId,
//       cat,           // category
//       min,
//       max,
//       sort,
//       page = 1,
//       limit = 12
//     } = req.query;

//     const filters = {};

//     if (userId) filters.userId = userId;
//     if (cat) filters.category = cat;

//     if (min || max) {
//       filters.price = {};
//       if (min) filters.price.$gte = parseInt(min);
//       if (max) filters.price.$lte = parseInt(max);
//     }

//     const sortBy = sort === "sales" ? { sales: -1 } : { createdAt: -1 };
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const gigs = await Gig.find(filters)
//       .sort(sortBy)
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Gig.countDocuments(filters);

//     res.status(200).json({ gigs, total });
//   } catch (err) {
//     res.status(500).send("Failed to fetch gigs: " + err.message);
//   }
// };




//   const { userId } = req.query;

//   try {
//     let gigs;

//     if (userId) {
//       gigs = await Gig.find({ userId });
//     } else {
//       gigs = await Gig.find();
//     }

//     res.status(200).json(gigs);
//   } catch (err) {
//     res.status(500).send("Failed to fetch gigs: " + err.message);
//   }
// };


