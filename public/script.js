
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("header nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => nav.classList.toggle("open"));
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

const fileLists = new WeakMap();


function showFiles(input) {
  const form = input.closest("form");
  const list = form.querySelector(".file-list");
  const isMultiple = input.hasAttribute("multiple")

  if (!isMultiple) list.innerHTML = "";

 
  if (!fileLists.has(form)) fileLists.set(form, []);
  const files = fileLists.get(form);

  Array.from(input.files).forEach(file => {
    if (!files.find(f => f.name === file.name)) {
      if (!isMultiple)
      {
        files.map(file =>{
          console.log(file)
          files.splice(-1)
        })
      }
      files.push(file);
      

      const li = document.createElement("li");
      li.draggable = true;
      li.innerHTML = `
        <span>${file.name}</span>
        <button type="button" class="remove">❌</button>
      `;

      // Entfernen
      li.querySelector(".remove").addEventListener("click", () => {
        const idx = files.findIndex(f => f.name === file.name);
        if (idx > -1) files.splice(idx, 1);
        li.remove();
      });

      list.appendChild(li);
    }
  });

  input.value = ""; // reset → erlaubt nochmal gleiche Datei wählen
  makeSortable(list, form);
}


function makeSortable(list, form) {
  let draggedItem = null;

  list.querySelectorAll("li").forEach(li => {
    li.addEventListener("dragstart", () => {
      draggedItem = li;
      setTimeout(() => li.classList.add("dragging"), 0);
    });

    li.addEventListener("dragend", () => {
      li.classList.remove("dragging");
      draggedItem = null;

      // Liste nach Reihenfolge im DOM sortieren
      const files = fileLists.get(form);
      const newOrder = [];
      list.querySelectorAll("li span").forEach(span => {
        const f = files.find(file => file.name === span.textContent);
        if (f) newOrder.push(f);
      });
      fileLists.set(form, newOrder);
    });
  });

  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement == null) {
      list.appendChild(draggedItem);
    } else {
      list.insertBefore(draggedItem, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll("li:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ===== Upload mit Fortschrittsanzeige =====
document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const files = fileLists.get(form) || [];
    if (!files.length) {
      alert("Bitte zuerst Dateien auswählen!");
      return;
    }

    // Progressbar einfügen
    let progress = form.querySelector(".progress");
    if (!progress) {
      progress = document.createElement("div");
      progress.className = "progress";
      progress.innerHTML = `<div class="bar"></div><span>0%</span>`;
      form.appendChild(progress);
    }

    const formData = new FormData();
    files.forEach(file => formData.append("file", file));

    // Backend-Endpoint auswählen
    let endpoint = "";
    if (location.pathname.includes("compress")) endpoint = "https://pdf-libre.de/compress";
    else if (location.pathname.includes("merge-compress")) endpoint = "https://pdf-libre.de/merge-compress";
    else if (location.pathname.includes("merge")) endpoint = "https://pdf-libre.de/merge";
    else if (location.pathname.includes("pdf-to-docx")) endpoint = "https://pdf-libre.de/pdf-to-docx";
    else if (location.pathname.includes("docx-to-pdf")) endpoint = "https://pdf-libre.de/docx-to-pdf";

    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        progress.querySelector(".bar").style.width = percent + "%";
        progress.querySelector("span").textContent = percent + "%";
      }
    };
    xhr.upload.onload = (e)=>{
       progress.querySelector(".bar").style.height = 50 + "%";
      progress.querySelector("span").textContent = "Warten Sie...";
    }

    xhr.onload = function () {
      if (xhr.status === 200) {
        progress.querySelector("span").textContent = "Fertig!";
        const blob = new Blob([xhr.response], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const disposition = xhr.getResponseHeader("Content-Disposition");
        let filename = "output.pdf"; 
        if (url.includes("pdf-to-docx")) filename = "output.docx";
        if (disposition && disposition.includes("filename=")) {
        filename = disposition
          .split("filename=")[1]
          .replace(/['"]/g, ""); // Anführungszeichen entfernen
        }
        
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.textContent = "📥 Download Datei";
        link.className = "btn success";
        form.appendChild(link);
        progress.remove()
      } else {
        alert("Fehler beim Upload!");
      }
    };

    xhr.responseType = "blob";
    xhr.send(formData);
  });
});