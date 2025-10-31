const { io } = require("../../../index");

exports.createReading = async (req, res) => {
  try {
    const data = req.body;
    const newReading = await Reading.create(data);

    // 🔴 Real-time signal
    io.emit("reading:new", newReading);

    res.status(201).json(newReading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
