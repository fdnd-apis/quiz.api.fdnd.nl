const db = require('./db')
const helper = require('./helper')

/**
 * Constructor for new quizes that checks if the passed object adheres the
 * format we need and throws errors if it doesn't
 * @param {*} quiz an object containing the necessary fields to make a new quiz
 */
const quiz = function (quiz) {
  // TODO: Check for sanity...
  this.quiz_id = quiz.quiz_id
  this.name = quiz.name
  this.category = quiz.category
  this.image = quiz.image
  this.created_at = quiz.created_at
}

/**
 * Get all quizes from the database, will be paginated if the number of
 * quizes in the database exceeds process.env.LIST_PER_PAGE
 * @param {*} page the page of authors you want to get
 * @returns
 */
quiz.get = async function (page = 1) {
  const rows = await db.query(`SELECT * FROM quiz LIMIT ?,?`, [
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
 * @param {*} quiz_id
 * @returns
 */
quiz.getById = async function (quiz_id) {
  const rows = await db.query(`SELECT * FROM quiz WHERE quiz_id = ?`, [quiz_id])
  return {
    data: helper.emptyOrRows(rows),
    meta: { page },
  }
}

/**
 * Add a new quiz to the database
 * @param {*} quiz a new quiz object created with the quiz constructor
 * @returns an object containing the inserted quiz with the newly inserted quiz_id
 */
quiz.post = async function (quiz) {
  const rows = await db.query(`INSERT INTO quiz SET ${prepareQuery(quiz)}`, prepareParams(quiz))
  quiz.quiz_id = rows.insertId
  return {
    data: [quiz],
    meta: {
      insertId: rows.insertId,
    },
  }
}

/**
 *
 * @param {*} quiz
 * @returns
 */
quiz.patch = async function (quiz) {
  const rows = await db.query(
    `UPDATE quiz SET ${prepareQuery(quiz)} WHERE quiz_id = ?`,
    prepareParams(quiz)
  )
  return {
    data: helper.emptyOrRows(rows),
    meta: {},
  }
}

/**
 *
 * @param {*} quiz
 * @returns
 */
quiz.put = async function (quiz) {
  const rows = await db.query(
    `UPDATE quiz SET ${prepareQuery(quiz)} WHERE quiz_id = ?`,
    prepareParams(quiz)
  )
  return {
    data: helper.emptyOrRows(rows),
    meta: {},
  }
}

/**
 *
 * @param {*} quiz_id
 * @returns
 */
quiz.delete = async function (quiz_id) {
  const rows = await db.query(`DELETE FROM quiz WHERE quiz_id = ?`, [quiz_id])
  return {
    data: helper.emptyOrRows(rows),
    meta: {},
  }
}

module.exports = quiz

/**
 * Prepares part of an SQL query based on a passed partial quiz object
 * @param {*} quiz partial quiz object containing at least the quiz_id
 * @returns a string to be used in the patch query, eg 'field = ?, field2 = ? ...'
 */
function prepareQuery(quiz) {
  return Object.keys(quiz)
    .filter((field) => field != 'quiz_id')
    .map((field) => `${field} = ?`)
    .reduce((prev, curr) => `${prev}, ${curr}`)
}

/**
 * Prepares a passed partial quiz object for querying the database. Whatever
 * fields are passed, the quiz_id needs to be at the end.
 * @param {*} quiz partial quiz object containing at least the quiz_id
 * @returns [] an array to be used in the patch query
 */
function prepareParams(quiz) {
  const { quiz_id, ...preparedExample } = quiz
  return [...Object.values(preparedExample), quiz_id]
}
