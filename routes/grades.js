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

router.put("/", async (req, res, next) => {
  try {
    const grade = req.body;
    if (
      !grade.id ||
      !grade.student ||
      !grade.subject ||
      !grade.type ||
      !grade.value == null
    ) {
      throw new Error("All parameters are required");
    }
    const data = JSON.parse(await readFile(global.fileName));
    const index = data.grades.findIndex((a) => a.id == grade.id);

    if (index === -1) {
      throw new Error("Grade not found");
    }

    data.grades[index].student = grade.student;
    data.grades[index].subject = grade.subject;
    data.grades[index].type = grade.type;
    data.grades[index].value = grade.value;
    data.grades[index].timestamp = new Date();
    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.send(grade);
  } catch (error) {
    next(error);
  }
});

router.delete("/eliminar/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    data.grades = data.grades.filter(
      (grade) => grade.id !== parseInt(req.params.id)
    );

    await writeFile(global.fileName, JSON.stringify(data, null, 2));
    res.end();
  } catch (error) {
    next(error);
  }
});

router.get("/buscar/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.fileName));
    const grade = data.grades.find(
      (grade) => grade.id === parseInt(req.params.id)
    );
    res.send(grade);
  } catch (error) {
    next(error);
  }
});

router.get("/total", async (req, res, next) => {
  try {
    const { student, subject } = req.query;
    const data = JSON.parse(await readFile(global.fileName));
    const sumGrades = data.grades
      .filter((grade) => {
        return grade.student === student && grade.subject === subject;
      })
      .reduce((acc, curr) => acc + curr.value, 0);

    console.log(sumGrades);
    res.send(sumGrades.toString());
  } catch (error) {
    next(error);
  }
});

router.get("/subjectType", async (req, res, next) => {
  try {
    const { subject, type } = req.query;
    const data = JSON.parse(await readFile(global.fileName));
    const totalElementos = data.grades.filter((grade) => {
      return grade.subject === subject && grade.type === type;
    }).length;
    const sumValues = data.grades
      .filter((grade) => {
        return grade.subject === subject && grade.type === type;
      })
      .reduce((acc, curr) => acc + curr.value, 0);
    const media = sumValues / totalElementos;
    console.log(media);
    res.send(media.toString());
  } catch (error) {
    next(error);
  }
});

router.get("/threeBest", async (req, res, next) => {
  try {
    const { subject, type } = req.query;
    const data = JSON.parse(await readFile(global.fileName));
    const threeBest = data.grades
      .filter((grade) => {
        return grade.subject === subject && grade.type === type;
      })
      .sort((a, b) => b.value - a.value)
      .splice(0, 3);
    console.log(threeBest);
    res.send(threeBest);
  } catch (error) {
    next(error);
  }
});

router.use((error, req, res, next) => {
  res.status(400).send({ error: error.message });
});

export default router;
