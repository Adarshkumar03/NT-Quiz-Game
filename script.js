const fetchData = async () => {
  const response = await fetch(
    "https://opentdb.com/api.php?amount=10&category=18&difficulty=medium&type=multiple&encode=base64"
  );
  const data = await response.json();
  const results = data.results[0];
  const question = atob(results.question);
  console.log(question);
  const correctAnswer = atob(results.correct_answer);
  console.log(correctAnswer);
  
};

fetchData();
