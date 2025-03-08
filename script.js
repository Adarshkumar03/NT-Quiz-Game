const difficultyMap = {
  easy: 10,
  medium: 15,
  hard: 20,
};

const categoryColors = {
  9: "#ff5733",
  10: "#8e44ad",
  11: "#e74c3c",
  12: "#3498db",
  14: "#f39c12",
  15: "#2ecc71",
  17: "#16a085",
  18: "#2980b9",
  20: "#d35400",
  21: "#e67e22",
  22: "#27ae60",
  23: "#c0392b",
  25: "#9b59b6",
  26: "#fd79a8",
  27: "#f4a261",
  28: "#2d3436",
  29: "#e84393",
  30: "#1abc9c",
  31: "#f368e0",
};

const form = document.getElementById("form");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");
const quizContainer = document.getElementById("quiz-container");

let decodedQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let semicircles;

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
    allAnswers.sort(() => Math.random() - 0.5);
    quizContainer.innerHTML = `
      <div class="question-container" style="border-top: 10px solid ${
        categoryColors[categorySelect.value]
      };">
        <div class="question-header">
            <p class="ques-amt">${currentQuestionIndex + 1} of ${
      decodedQuestions.length
    }</p>
            <div class="circle-container">
                <div class="semicircle"></div>
                <div class="semicircle"></div>
                <div class="semicircle"></div>
                <div class="outermost-circle"></div>
                <p id="timer-text"></p>
           </div>
          <p id="score">Score: <span class="score-text">${score}</span></p>
        </div>
        <div class="question-body">
          <h2 class="question-text">${questionData.question}</h2>
          <div class="answers">
            ${allAnswers
              .map((answer) => `<button class="answer">${answer}</button>`)
              .join("")}
          </div>
          <button id="next-button">Next →</button>
        </div>
      </div>
    `;
    semicircles = document.getElementsByClassName("semicircle");
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
  }, 300);
};

const handleAnswer = (button, correctAnswer) => {
  clearInterval(timer);
  const allButtons = document.querySelectorAll(".answer");
  allButtons.forEach((btn) => (btn.disabled = true));
  if (button.textContent === correctAnswer) {
    button.classList.add("correct");
    score++;
    document.querySelector(".score-text").innerText = score;
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
  let totalTime = 15;
  let timeLeft = 15;
  document.getElementById("timer-text").innerText = timeLeft;
  timer = setInterval(() => {
    let angle = ((totalTime - timeLeft) / totalTime) * 360;
    document.getElementById("timer-text").innerText = timeLeft;
    if (angle > 180) {
      semicircles[2].style.display = "none";
      semicircles[0].style.transform = "rotate(180deg)";
      semicircles[1].style.transform = `rotate(${angle}deg)`;
    } else {
      semicircles[2].style.display = "block";
      semicircles[0].style.transform = `rotate(${angle}deg)`;
      semicircles[1].style.transform = `rotate(${angle}deg)`;
    }

    if(timeLeft <= 5){
      semicircles[0].style.backgroundColor = "red";
      semicircles[1].style.backgroundColor = "red";
    }
    timeLeft--;
    if (timeLeft < 0) {
      semicircles[0].style.display = "none";
      semicircles[1].style.display = "none";
      semicircles[2].style.display = "none";
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
    <div class="result-container fade-in">
      <h2>Quiz Completed!</h2>
      <p class="final-score">Your Final Score: <strong>${score}</strong></p>
      <p class="feedback">Nice work—review your answers and try again!</p>
      <button class="btn restart-btn" onclick="restart()">Play Again</button>
    </div>
  `;
};

const restart = () => {
  quizContainer.innerHTML = "";
  form.reset();
  document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
};
