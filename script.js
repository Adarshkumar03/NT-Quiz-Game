const difficultyMap = {
  easy: 10,
  medium: 15,
  hard: 20,
};

const categoryColors = {
  9: "#ff5733",  // General Knowledge - Orange Red
  10: "#8e44ad", // Entertainment: Books - Purple
  11: "#e74c3c", // Entertainment: Film - Bright Red
  12: "#3498db", // Entertainment: Music - Blue
  14: "#f39c12", // Entertainment: Television - Orange
  15: "#2ecc71", // Entertainment: Video Games - Green
  17: "#16a085", // Science & Nature - Teal
  18: "#2980b9", // Science: Computers - Dark Blue
  20: "#d35400", // Mythology - Dark Orange
  21: "#e67e22", // Sports - Light Orange
  22: "#27ae60", // Geography - Dark Green
  23: "#c0392b", // History - Deep Red
  25: "#9b59b6", // Art - Purple
  26: "#fd79a8", // Celebrities - Pink
  27: "#f4a261", // Animals - Peach
  28: "#2d3436", // Vehicles - Dark Gray
  29: "#e84393", // Comics - Magenta
  30: "#1abc9c", // Gadgets - Cyan
  31: "#f368e0"  // Japanese Anime & Manga - Light Pink
};

const form = document.getElementById("form");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const quizContainer = document.getElementById("quiz-container");

let decodedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;

const fetchData = async (category, difficulty) => {
  const noOfQuestions = difficultyMap[difficulty];

  let apiUrl = `https://opentdb.com/api.php?amount=${noOfQuestions}&category=${category}&type=multiple&encode=base64`;

  if (difficulty !== "any") {
    apiUrl += `&difficulty=${difficulty}`;
  }

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    quizContainer.innerHTML = `
      <p class="error-message">Sorry, we couldn't find enough questions for this category and difficulty. Try again!</p> 
      <button onclick="restart()">Restart</button>
    `;
    return [];
  }

  return data.results.map((ques) => ({
    question: atob(ques.question),
    correctAnswer: atob(ques.correct_answer),
    incorrectAnswers: ques.incorrect_answers.map((answer) => atob(answer)),
  }));
};


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const category = categorySelect.value;
  const difficulty = difficultySelect.value;

  decodedQuestions = await fetchData(category, difficulty);
  currentQuestionIndex = 0;
  score = 0;

  document
    .getElementById("quiz-container")
    .scrollIntoView({ behavior: "smooth" });

  if (decodedQuestions.length > 0) {
    showQuestion();
  }
});

const showQuestion = () => {
  clearInterval(timer);

  if (currentQuestionIndex >= decodedQuestions.length) {
    showResults();
    return;
  }

  quizContainer.classList.add("fade-out");

  setTimeout(() => {
    const questionData = decodedQuestions[currentQuestionIndex];
    const allAnswers = [
      ...questionData.incorrectAnswers,
      questionData.correctAnswer,
    ];
    allAnswers.sort(() => Math.random() - 0.5); // Shuffle answers

    quizContainer.innerHTML = `
      <div class="question-container" style="border-top: 10px solid ${categoryColors[categorySelect.value]};">
        <div class="question-header" >
          <p>Question ${currentQuestionIndex + 1} of ${decodedQuestions.length}</p>
          <p id="timer">15s</p>
          <p id="score">Score: ${score}</p>
        </div>
        <h2 class="question-text">${questionData.question}</h2>
        <div class="answers">
          ${allAnswers
            .map((answer) => `<button class="answer">${answer}</button>`)
            .join("")}
        </div>
        <button id="next-button">Next →</button>
      </div>
    `;

    quizContainer.classList.remove("fade-out");
    quizContainer.classList.add("fade-in");

    startTimer();

    document.querySelectorAll(".answer").forEach((button) => {
      button.addEventListener("click", () =>
        handleAnswer(button, questionData.correctAnswer)
      );
    });

    document.getElementById("next-button").addEventListener("click", () => {
      currentQuestionIndex++;
      showQuestion();
    });
  }, 500);
};



const handleAnswer = (button, correctAnswer) => {
  clearInterval(timer);

  const allButtons = document.querySelectorAll(".answer");
  allButtons.forEach((btn) => (btn.disabled = true));

  if (button.textContent === correctAnswer) {
    button.classList.add("correct");
    score++;
    document.getElementById("score").textContent = `Score: ${score}`;
  } else {
    button.classList.add("wrong");
    allButtons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct-border");
      }
    });
  }
  document.getElementById("next-button").style.display = "block";
};

const startTimer = () => {
  let timeLeft = 15;
  document.getElementById("timer").textContent = `${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = `${timeLeft}s`;

    if (timeLeft == 0) {
      clearInterval(timer);
      showCorrectAnswer();
    }
  }, 1000);
};

const showCorrectAnswer = () => {
  document.querySelectorAll(".answer").forEach((btn) => {
    if (
      btn.textContent === decodedQuestions[currentQuestionIndex].correctAnswer
    ) {
      btn.classList.add("correct");
    }
    btn.disabled = true;
  });

  document.getElementById("next-button").style.display = "block";
};

const showResults = () => {
  quizContainer.innerHTML = `
    <div class="result">
      <h2>Quiz Completed!</h2>
      <p>Your Final Score: ${score}</p>
      <button onclick="restart()">Play Again</button>
    </div>
  `;
};

const restart = () => {
  quizContainer.innerHTML = ""; 
  form.reset(); 
  document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
};
