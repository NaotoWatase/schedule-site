let selectedDate = null;
let calendar = null;
let currentPage = 'home';

document.addEventListener('DOMContentLoaded', function() {
    showHome();
    // サイドバーのハンバーガーメニュー
    document.getElementById('menu-toggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('show');
    });
});

function showPage(pageId) {
    const pages = ['home-page', 'calendar-page', 'contact-page', 'docs-page', 'qa-page'];
    pages.forEach(page => {
    document.getElementById(page).style.display = 'none';
    });
    document.getElementById(pageId).style.display = 'block';
    // アクティブなメニューの切り替え
    const menuItems = document.querySelectorAll('.sidebar a');
    menuItems.forEach(item => item.classList.remove('active'));
    if(pageId === 'home-page') document.querySelector('.sidebar a[onclick="showHome()"]').classList.add('active');
    if(pageId === 'calendar-page') document.querySelector('.sidebar a[onclick="showCalendar()"]').classList.add('active');
    if(pageId === 'contact-page') document.querySelector('.sidebar a[onclick="showContact()"]').classList.add('active');
    if(pageId === 'docs-page') document.querySelector('.sidebar a[onclick="showDocs()"]').classList.add('active');
    if(pageId === 'qa-page') document.querySelector('.sidebar a[onclick="showQA()"]').classList.add('active');

    if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('show');
    }
}

function showHome() {
    showPage('home-page');
    currentPage = 'home';
}
function showCalendar() {
    showPage('calendar-page');
    currentPage = 'calendar';
    if (!calendar) {
    setTimeout(initCalendar, 100);
    }
}
function showContact() {
    showPage('contact-page');
    currentPage = 'contact';
    loadContactList();
}
function showDocs() {
    showPage('docs-page');
    currentPage = 'docs';
}
function showQA() {
    showPage('qa-page');
    currentPage = 'qa';
    loadQAList();
}

// カレンダー初期化
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const stored = JSON.parse(localStorage.getItem("schedules") || "[]");

    calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'ja',
    dayCellContent: function(arg) {
        return arg.date.getDate(); // 「日」など付けず、数字だけ返す
    },
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek'
    },
    height: 'auto',
    dayMaxEventRows: false,
    // 時間ラベルのフォーマットを明示
    slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24時間表記
    },
    slotMinTime: "08:00:00", // 必要に応じて
    slotMaxTime: "20:00:00", // 必要に応じて
    slotDuration: "00:30:00", // 30分刻み

    events: stored.map(item => ({
        title: item.title,
        start: item.date,
        classNames: item.color ? [`label-${item.color}`] : [],
        extendedProps: {
            datetime: item.date // 追加（念のため）
        }
    })),
    eventContent: function(arg) {
        // 色マッピング
        const colorMap = {
          red: "#FF6B6B",
          orange: "#FFB366",
          yellow: "#FFD93D",
          green: "#6BCB77",
          blue: "#4D96FF",
          purple: "#6B47DC",
          pink: "#FF7EB9"
        };
        const classColor = arg.event.classNames.find(c => c.startsWith("label-"));
        const colorKey = classColor ? classColor.replace("label-", "") : "blue";
        const barColor = colorMap[colorKey] || "#4D96FF";
      
        // 日時（予定データから取得）
        const dateObj = arg.event.start;
        const options = {
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
          hour: '2-digit', minute: '2-digit', hour12: false
        };
        const dateStr = dateObj
          ? dateObj.toLocaleString('ja-JP', options).replace(/:\d\d$/, '')
          : '';
      
        // HTML組み立て
        return {
          html: `
            <div class="custom-event-label">
              <div class="label-color-bar" style="background:${barColor};"></div>
              <div class="label-body">
                <div class="label-title">${arg.event.title}</div>
                <div class="label-datetime">${dateStr}</div>
              </div>
            </div>
          `
        };
    },
    dateClick: function(info) {
        selectedDate = info.dateStr;
        openModal();
    }
    });
    calendar.render();
}
// モーダル操作
function openModal() {
    document.getElementById('eventModal').style.display = 'block';
}
function closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('eventTitle').value = '';
}
function saveEvent() {
    const title = document.getElementById('eventTitle').value;
    const dateTime = document.getElementById('eventDateTime').value;
    if (!title || !dateTime) return;
  
    const color = document.querySelector('input[name="eventColor"]:checked').value;
    const newEvent = { title: title, date: dateTime, color: color };
    const current = JSON.parse(localStorage.getItem("schedules") || "[]");
    current.push(newEvent);
    localStorage.setItem("schedules", JSON.stringify(current));
    if (calendar) {
      calendar.addEvent({
        title: title,
        start: dateTime,
        classNames: [`label-${color}`],
        extendedProps: { datetime: dateTime }
      });
    }
    closeModal();
  }
// 連絡事項追加・表示
function loadContactList() {
    const list = JSON.parse(localStorage.getItem("contacts") || "[]");
    const container = document.getElementById('contact-list');
    container.innerHTML = '';
    list.reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${item.title}</h3><p>${item.content}</p><small style="color:var(--text-muted);">Posted: ${item.date}</small>`;
    container.appendChild(div);
    });
}
function addContact() {
    const title = document.getElementById('contact-title').value;
    const content = document.getElementById('contact-content').value;
    if(!title || !content) return;
    const date = new Date().toLocaleDateString('ja-JP', {year:'numeric',month:'long',day:'numeric'});
    const contact = {title, content, date};
    const current = JSON.parse(localStorage.getItem("contacts") || "[]");
    current.push(contact);
    localStorage.setItem("contacts", JSON.stringify(current));
    document.getElementById('contact-title').value = '';
    document.getElementById('contact-content').value = '';
    loadContactList();
}
// Q&A追加・表示
function loadQAList() {
    const list = JSON.parse(localStorage.getItem("qa") || "[]");
    const container = document.getElementById('qa-list');
    container.innerHTML = '';
    list.reverse().forEach(item => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>Q: ${item.q}</h3><p><strong>A:</strong> ${item.a}</p>`;
    container.appendChild(div);
    });
}
function addQA() {
    const q = document.getElementById('question').value;
    const a = document.getElementById('answer').value;
    if(!q || !a) return;
    const qa = {q, a}
    const current = JSON.parse(localStorage.getItem("qa") || "[]");
    current.push(qa);
    localStorage.setItem("qa", JSON.stringify(current));
    document.getElementById('question').value = '';
    document.getElementById('answer').value = '';
    loadQAList();
}