const express = require("express");
const auth = require("../middleware/auth");
const Task = require("../models/Task");

const router = express.Router();

// Create Task
router.post("/tasks", auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    task.save();
    res.status(201).send(task);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all tasks
router.get("/tasks", auth, async (req, res) => {
  let match = {};
  let sort = {};
  if (req.query.completed)
    match = { completed: req.query.completed.toLowerCase() === "true" };

  if (req.query.sortBy) {
    const sortBy = req.query.sortBy.split(":");
    const sortField = sortBy[0] || "createdAt";
    const sortOrder = sortBy[1] === "asc" ? 1 : -1;
    sort[sortField] = sortOrder;
  }

  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          sort,
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Get a specific task by id
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  if (!_id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(400).send(`Malformed Task Id`);

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send(`Task Not Found`);
    else res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Update a task
router.patch("/tasks/:id", auth, async (req, res) => {
  const allowedProperties = ["description", "completed"];
  const _id = req.params.id;
  const receivedProperties = Object.keys(req.body);
  const isValidOperation = receivedProperties.every((property) =>
    allowedProperties.includes(property)
  );

  if (!isValidOperation)
    return res
      .status(403)
      .send(`Attempt to update forbidden or non existing property`);

  if (!_id.match(/^[0-9a-fA-F]{24}$/))
    return res.status(400).send(`Malformed Task Id`);

  try {
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) return res.status(404).send(`Task Not Found`);
    receivedProperties.forEach(
      (property) => (task[property] = req.body[property])
    );
    task.save();
    res.status(200).send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete a task
router.delete("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  if (!_id.match(/^[0-9A-Fa-f]{24}$/))
    return res.status(400).send(`Malformed Task Id`);

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) return res.status(404).send(`Task Not Found`);

    res.send(task);
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
