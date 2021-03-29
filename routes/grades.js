import express from "express";
import { promises as fs } from "fs";
const { readFile, writeFile } = fs;
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    let grade = req.body;

    if (
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      grade.value == null
    ) {
      throw new Error("Student name, Subject, Type and Value are required");
    }
    const data = JSON.parse(await readFile(global.fileName));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };
    data.grades.push(grade);

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.send(grade);
  } catch (error) {
    next(error);
  }
});

router.get("/:Id", async (req, res, next) => {});

router.use((error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

export default router;
