const difficultyMap = {
  easy: 10,
  medium: 15,
  hard: 20,
};

const form = document.getElementById("form");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const categoryName = document.getElementById("category-name");
const difficultyName = document.getElementById("difficulty-name");
const quizContainer = document.getElementById("quiz-container");

const fetchData = async (category, difficulty) => {
  const noOfQuestions = difficultyMap[difficulty];

  const response = await fetch(
    `https://opentdb.com/api.php?amount=${noOfQuestions}&category=${category}&difficulty=${difficulty}&type=multiple&encode=base64`
  );
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    quizContainer.innerHTML = `<p class="error-message">Sorry, we couldn't find enough questions for this category and difficulty. Try again!</p>`;
    return [];
  }

  return data.results;
};

const decodeQuestions = (questions) => {
  return questions.map((question) => ({
    question: atob(question.question),
    correct_answer: atob(question.correct_answer),
    incorrect_answers: question.incorrect_answers.map(atob),
  }));
};

const populateQuiz = (questions) => {
  quizContainer.innerHTML = "";

  questions.forEach((question) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question");

    questionElement.innerHTML = `
      <div class="question-header">
        <h2 class="question-title">${question.question}</h2>
      </div>
      <div class="answers">
        <button class="answer">${question.correct_answer}</button>
        ${question.incorrect_answers
          .map((answer) => `<button class="answer">${answer}</button>`)
          .join("")}
      </div>
    `;

    quizContainer.appendChild(questionElement);
  });
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = categorySelect.value;
  const difficulty = difficultySelect.value;

  const rawQuestions = await fetchData(category, difficulty);
  const decodedQuestions = decodeQuestions(rawQuestions);

  populateQuiz(decodedQuestions.slice(0, 2));
});
