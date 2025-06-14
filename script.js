const form = document.getElementById("schedule-form");
const list = document.getElementById("schedule-items");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const title = document.getElementById("title").value;

  const schedule = { date, title };
  saveSchedule(schedule);
  addScheduleToList(schedule);
  form.reset();
});

function saveSchedule(schedule) {
  const data = JSON.parse(localStorage.getItem("schedules") || "[]");
  data.push(schedule);
  localStorage.setItem("schedules", JSON.stringify(data));
}

function addScheduleToList(schedule) {
  const li = document.createElement("li");
  li.textContent = `${schedule.date}:${schedule.title}`;
  list.appendChild(li);
}

function loadSchedules() {
  const data = JSON.parse(localStorage.getItem("schedules") || "[]");
  data.forEach(addScheduleToList);
}

loadSchedules();
