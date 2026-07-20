// ============================================================
// Admin panel: เพิ่ม/แก้ไข/ลบ scenario โดยไม่ต้องแก้โค้ด
// ข้อมูลบันทึกลง localStorage — ส่งออก/นำเข้าเป็นไฟล์ JSON ได้
// ============================================================

let list = loadScenarios();

const $ = (id) => document.getElementById(id);

function showMsg(text, type = "success") {
  const el = $("msg");
  el.textContent = text;
  el.className = `msg show ${type}`;
  setTimeout(() => { el.className = "msg"; }, 3500);
}

// ---------- รายการ ----------
function renderList() {
  $("count").textContent = list.length;
  if (list.length === 0) {
    $("scenario-list").innerHTML = `<p class="empty-note">ยังไม่มีข้อมูล scenario</p>`;
    return;
  }
  $("scenario-list").innerHTML = list.map((s, i) => `
    <div class="scenario-item">
      <div>
        <div class="si-name">${s.name} <span class="badge level-${s.level}">${s.level}</span></div>
        <div class="si-meta">${s.crop} · ${s.season} · ${Number(s.waterPerRai).toLocaleString("th-TH")} ลบ.ม./ไร่ · ratio ${s.minRatio}–${s.maxRatio >= 99 ? "∞" : s.maxRatio}</div>
      </div>
      <div class="si-actions">
        <button class="btn btn-secondary btn-small" data-edit="${i}">✏️ แก้ไข</button>
        <button class="btn btn-danger btn-small" data-del="${i}">🗑️</button>
      </div>
    </div>`).join("");

  updateDatalists();
}

function updateDatalists() {
  const crops = [...new Set(list.map((s) => s.crop))];
  const seasons = [...new Set(list.map((s) => s.season))];
  $("crop-list").innerHTML = crops.map((c) => `<option value="${c}">`).join("");
  $("season-list").innerHTML = seasons.map((s) => `<option value="${s}">`).join("");
}

$("scenario-list").addEventListener("click", (e) => {
  const editBtn = e.target.closest("[data-edit]");
  const delBtn = e.target.closest("[data-del]");
  if (editBtn) openEditor(parseInt(editBtn.dataset.edit, 10));
  if (delBtn) {
    const i = parseInt(delBtn.dataset.del, 10);
    if (confirm(`ลบ scenario "${list[i].name}" ?`)) {
      list.splice(i, 1);
      saveScenarios(list);
      renderList();
      showMsg("ลบ scenario เรียบร้อย");
    }
  }
});

// ---------- ตารางให้น้ำใน editor ----------
function addScheduleRow(row = { phase: "", freq: "", amount: "" }) {
  const div = document.createElement("div");
  div.className = "schedule-editor";
  div.innerHTML = `
    <div class="form-group">
      <input type="text" class="se-phase" placeholder="ระยะ เช่น แตกกอ (วันที่ 16–45)" value="${row.phase || ""}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <input type="text" class="se-freq" placeholder="ความถี่ เช่น ทุก 5–7 วัน" value="${row.freq || ""}">
      </div>
      <div class="form-group">
        <input type="number" class="se-amount" placeholder="น้ำต่อไร่ (ลบ.ม.)" min="0" step="any" value="${row.amount ?? ""}">
      </div>
    </div>
    <button type="button" class="btn btn-danger btn-small se-remove">ลบระยะนี้</button>`;
  div.querySelector(".se-remove").addEventListener("click", () => div.remove());
  $("schedule-rows").appendChild(div);
}

$("btn-add-phase").addEventListener("click", () => addScheduleRow());

function readScheduleRows() {
  return [...document.querySelectorAll("#schedule-rows .schedule-editor")]
    .map((div) => ({
      phase: div.querySelector(".se-phase").value.trim(),
      freq: div.querySelector(".se-freq").value.trim(),
      amount: parseFloat(div.querySelector(".se-amount").value) || 0
    }))
    .filter((r) => r.phase);
}

// ---------- เปิด/ปิด editor ----------
function openEditor(index = -1) {
  $("editor-card").style.display = "";
  $("schedule-rows").innerHTML = "";
  const s = index >= 0 ? list[index] : null;

  $("editor-title").textContent = s ? `✏️ แก้ไข: ${s.name}` : "➕ เพิ่ม scenario";
  $("f-id").value = index;
  $("f-name").value = s ? s.name : "";
  $("f-crop").value = s ? s.crop : "";
  $("f-season").value = s ? s.season : "";
  $("f-level").value = s ? s.level : "เพียงพอ";
  $("f-water-per-rai").value = s ? s.waterPerRai : "";
  $("f-min-ratio").value = s ? s.minRatio : 0;
  $("f-max-ratio").value = s ? s.maxRatio : 99;
  $("f-yield").value = s ? (s.expectedYield || "") : "";
  $("f-risk").value = s ? (s.risk || "ต่ำ") : "ต่ำ";
  $("f-advice").value = s ? (s.advice || []).join("\n") : "";

  (s ? s.schedule || [] : []).forEach(addScheduleRow);
  if (!s) addScheduleRow();

  $("editor-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeEditor() {
  $("editor-card").style.display = "none";
}

$("btn-new").addEventListener("click", () => openEditor(-1));
$("btn-cancel").addEventListener("click", closeEditor);

// ---------- บันทึก ----------
$("editor-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const index = parseInt($("f-id").value, 10);
  const item = {
    id: index >= 0 ? list[index].id : "sc-" + Date.now(),
    name: $("f-name").value.trim(),
    crop: $("f-crop").value.trim(),
    season: $("f-season").value.trim(),
    level: $("f-level").value,
    waterPerRai: parseFloat($("f-water-per-rai").value) || 0,
    minRatio: parseFloat($("f-min-ratio").value) || 0,
    maxRatio: parseFloat($("f-max-ratio").value) || 99,
    expectedYield: $("f-yield").value.trim(),
    risk: $("f-risk").value,
    advice: $("f-advice").value.split("\n").map((a) => a.trim()).filter(Boolean),
    schedule: readScheduleRows()
  };

  if (index >= 0) list[index] = item; else list.push(item);
  saveScenarios(list);
  renderList();
  closeEditor();
  showMsg(index >= 0 ? "แก้ไข scenario เรียบร้อย" : "เพิ่ม scenario ใหม่เรียบร้อย");
});

// ---------- ส่งออก / นำเข้า / คืนค่า ----------
$("btn-export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "warma-scenarios.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

$("btn-import").addEventListener("click", () => $("import-file").click());
$("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error("รูปแบบไม่ถูกต้อง");
      list = data;
      saveScenarios(list);
      renderList();
      showMsg(`นำเข้าข้อมูล ${data.length} scenario เรียบร้อย`);
    } catch (err) {
      showMsg("ไฟล์ JSON ไม่ถูกต้อง: " + err.message, "error");
    }
  };
  reader.readAsText(file);
  e.target.value = "";
});

$("btn-reset").addEventListener("click", () => {
  if (confirm("คืนค่าข้อมูลเป็นชุดเริ่มต้น? ข้อมูลที่แก้ไขไว้จะหายทั้งหมด")) {
    resetScenarios();
    list = loadScenarios();
    renderList();
    showMsg("คืนค่าเริ่มต้นเรียบร้อย");
  }
});

renderList();
