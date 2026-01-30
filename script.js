let questions = {};
let currentSet = [];
let index = 0;
let score = 0;
let timer;

/* SOUNDS */
const sounds = {
  click: new Audio("sounds/click.mp3"),
  correct: new Audio("sounds/correct.mp3"),
  wrong: new Audio("sounds/wrong.mp3"),
  win: new Audio("sounds/win.mp3")
};

/* LOAD QUESTIONS */
fetch("questions.json")
  .then(r => r.json())
  .then(d => {
    questions = d;
    createTopicButtons();
  });

/* DARK MODE */
document.getElementById("darkToggle").onclick = () =>
  document.body.classList.toggle("dark");

/* LOGIN */
document.getElementById("loginForm").onsubmit = e => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  localStorage.setItem("user", name);
  document.getElementById("userName").textContent = name;
  show("mainPage");
};

/* CREATE TOPICS */
function createTopicButtons() {
  const box = document.getElementById("topicButtons");
  box.innerHTML = "";
  Object.keys(questions).forEach(t => {
    const b = document.createElement("button");
    b.textContent = t.toUpperCase();
    b.onclick = () => startQuiz(t);
    box.appendChild(b);
  });
}

/* START QUIZ */
function startQuiz(topic) {
  sounds.click.play();
  score = 0;
  index = 0;
  currentSet = shuffle([...questions[topic]]).slice(0, 10);
  document.getElementById("score").textContent = 0;
  document.getElementById("topicTitle").textContent = topic.toUpperCase();
  show("quizPage");
  loadQuestion();
}

/* LOAD QUESTION */
function loadQuestion() {
  clearInterval(timer);
  let timeLeft = 10;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("nextBtn").disabled = true;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timer);
      document.getElementById("nextBtn").disabled = false;
    }
  }, 1000);

  const q = currentSet[index];
  document.getElementById("questionContainer").innerHTML = `
    <p>${q.question}</p>
    <ul>
      ${q.options.map(o =>
        `<li onclick="checkAnswer(this,'${o}')">${o}</li>`
      ).join("")}
    </ul>
  `;
}

/* CHECK ANSWER */
function checkAnswer(el, ans) {
  clearInterval(timer);
  document.querySelectorAll("li").forEach(li => li.onclick = null);

  const correct = currentSet[index].answer;
  document.querySelectorAll("li").forEach(li => {
    if (li.textContent === correct) li.classList.add("correct");
  });

  if (ans === correct) {
    score++;
    sounds.correct.play();
    document.getElementById("score").textContent = score;
  } else {
    sounds.wrong.play();
    el.classList.add("wrong");
  }

  document.getElementById("nextBtn").disabled = false;
}

/* NEXT */
function nextQuestion() {
  sounds.click.play();
  index++;
  index >= currentSet.length ? finishQuiz() : loadQuestion();
}

/* FINISH */
function finishQuiz() {
  show("resultPage");
  const percent = Math.round((score / currentSet.length) * 100);
  document.getElementById("finalScore").textContent = score;
  document.getElementById("percentage").textContent = percent;
  document.getElementById("grade").textContent =
    percent >= 80 ? "A" : percent >= 60 ? "B" : "C";

  saveScore(percent);
  renderLeaderboard();
  if (percent >= 70) sounds.win.play();
}

/* SAVE SCORE */
function saveScore(p) {
  let scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push({ user: localStorage.getItem("user"), percent: p });
  localStorage.setItem("scores", JSON.stringify(scores));
}

/* LEADERBOARD */
function renderLeaderboard() {
  const ul = document.getElementById("leaderboard");
  ul.innerHTML = "";
  JSON.parse(localStorage.getItem("scores") || "[]")
    .sort((a,b)=>b.percent-a.percent)
    .slice(0,5)
    .forEach(s=>{
      const li=document.createElement("li");
      li.textContent=`${s.user} - ${s.percent}%`;
      ul.appendChild(li);
    });
}

/* RESTART */
function restartQuiz() {
  show("mainPage");
}

/* HELPERS */
function show(id) {
  document.querySelectorAll(".container").forEach(c=>c.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
