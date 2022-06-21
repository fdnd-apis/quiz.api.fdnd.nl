const db = require('./db')
const helper = require('./helper')

/**
 * Constructor for new questions that checks if the passed object adheres the
 * format we need and throws errors if it doesn't
 * @param {*} question an object containing the necessary fields to make a new question
 */
const question = function (question) {
  // TODO: Check for sanity...
  this.question_id = question.question_id
  this.quiz_id = question.quiz_id
  this.type = question.type
  this.question = question.question
  this.correct_answer = question.correct_answer
  this.incorrect_answer = question.incorrect_answer
  this.feedback = question.feedback
  this.created_at = question.created_at
}

/**
 * Get all questions from the database, will be paginated if the number of
 * questions in the database exceeds process.env.LIST_PER_PAGE
 * @param {*} page the page of authors you want to get
 * @returns
 */
question.get = async function (page = 1) {
  const rows = await db.query(`SELECT * FROM question LIMIT ?,?`, [
    helper.getOffset(page, process.env.LIST_PER_PAGE),
    Number(process.env.LIST_PER_PAGE),
  ])

  return {
    data: helper.emptyOrRows(rows),
    meta: { page },
  }
}

/**
 *
 * @param {*} question_id
 * @returns
 */
question.getById = async function (question_id) {
  const rows = await db.query(`SELECT * FROM question WHERE question_id = ?`, [question_id])
  return {
    data: helper.emptyOrRows(rows),
    meta: { page },
  }
}

/**
 * Add a new question to the database
 * @param {*} question a new question object created with the question constructor
 * @returns an object containing the inserted question with the newly inserted question_id
 */
question.post = async function (question) {
  const rows = await db.query(
    `INSERT INTO question SET ${prepareQuery(smartzone)}`,
    prepareParams(question)
  )
  question.question_id = rows.insertId
  return {
    data: [question],
    meta: {
      insertId: rows.insertId,
    },
  }
}

/**
 *
 * @param {*} question
 * @returns
 */
question.patch = async function (question) {
  const rows = await db.query(
    `UPDATE question SET ${prepareQuery(question)} WHERE question_id = ?`,
    prepareParams(question)
  )
  return {
    data: helper.emptyOrRows(rows),
    meta: {},
  }
}

/**
 *
 * @param {*} question
 * @returns
 */
question.put = async function (question) {
  const rows = await db.query(
    `UPDATE question SET ${prepareQuery(question)} WHERE question_id = ?`,
    prepareParams(question)
  )
  return {
    data: helper.emptyOrRows(rows),
    meta: {},
  }
}

/**
 *
 * @param {*} question_id
 * @returns
 */
question.delete = async function (question_id) {
  const rows = await db.query(`DELETE FROM question WHERE question_id = ?`, [question_id])
  return {
    data: helper.emptyOrRows(rows),
    meta: {},
  }
}

module.exports = question

/**
 * Prepares part of an SQL query based on a passed partial question object
 * @param {*} question partial question object containing at least the question_id
 * @returns a string to be used in the patch query, eg 'field = ?, field2 = ? ...'
 */
function prepareQuery(question) {
  return Object.keys(question)
    .filter((field) => field != 'question_id')
    .map((field) => `${field} = ?`)
    .reduce((prev, curr) => `${prev}, ${curr}`)
}

/**
 * Prepares a passed partial question object for querying the database. Whatever
 * fields are passed, the question_id needs to be at the end.
 * @param {*} question partial question object containing at least the question_id
 * @returns [] an array to be used in the patch query
 */
function prepareParams(question) {
  const { question_id, ...preparedExample } = question
  return [...Object.values(preparedExample), question_id]
}
