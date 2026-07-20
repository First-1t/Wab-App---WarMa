// ============================================================
// หน้าผู้ใช้: จับคู่ปัจจัยนำเข้ากับ scenario แล้วแสดงคำแนะนำ
// ============================================================

const scenarios = loadScenarios();

const $ = (id) => document.getElementById(id);
const fmt = (n) => Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 });

// ---------- เติมตัวเลือกในฟอร์มจากข้อมูลจริง ----------
function populateForm() {
  const crops = [...new Set(scenarios.map((s) => s.crop))];
  const seasons = [...new Set(scenarios.map((s) => s.season))];
  $("crop").innerHTML = crops.map((c) => `<option value="${c}">${c}</option>`).join("");
  $("season").innerHTML = seasons.map((s) => `<option value="${s}">${s}</option>`).join("");
}

// ---------- จับคู่ scenario ----------
// ratio = น้ำต้นทุนต่อไร่ / ความต้องการน้ำของพืชในฤดูนั้น
function matchScenario(crop, season, water, area) {
  const candidates = scenarios.filter((s) => s.crop === crop && s.season === season);
  if (candidates.length === 0) return { matched: null, candidates, ratio: 0 };

  const need = (CROP_WATER_NEED[crop] && CROP_WATER_NEED[crop][season]) || Math.max(...candidates.map((s) => s.waterPerRai));
  const ratio = water / area / need;

  let matched = candidates.find((s) => ratio >= s.minRatio && ratio < s.maxRatio);
  if (!matched) {
    // เลือกตัวที่ช่วง ratio ใกล้ที่สุดเป็น fallback
    matched = candidates.slice().sort((a, b) =>
      Math.min(Math.abs(ratio - a.minRatio), Math.abs(ratio - a.maxRatio)) -
      Math.min(Math.abs(ratio - b.minRatio), Math.abs(ratio - b.maxRatio))
    )[0];
  }
  return { matched, candidates, ratio };
}

// ---------- แสดงผล ----------
function renderResult(matched, candidates, input) {
  const { water, area } = input;
  const totalAlloc = Math.min(matched.waterPerRai * area, water);

  const banner = $("result-banner");
  banner.className = `result-banner level-${matched.level}`;
  $("result-name").innerHTML =
    `${matched.name} <span class="badge level-${matched.level}">น้ำ${matched.level}</span>`;
  $("result-desc").textContent =
    `พื้นที่ ${fmt(area)} ไร่ · น้ำต้นทุน ${fmt(water)} ลบ.ม. (คิดเป็น ${fmt(water / area)} ลบ.ม./ไร่)`;

  $("stat-alloc").textContent = fmt(totalAlloc);
  $("stat-per-rai").textContent = fmt(matched.waterPerRai);
  $("stat-yield").textContent = matched.expectedYield || "–";
  $("stat-risk").textContent = matched.risk || "–";

  $("advice-list").innerHTML = (matched.advice || []).map((a) => `<li>${a}</li>`).join("");

  $("schedule-body").innerHTML = (matched.schedule || []).map((row) => `
    <tr>
      <td>${row.phase}</td>
      <td>${row.freq}</td>
      <td class="num">${fmt(row.amount)}</td>
      <td class="num">${fmt(row.amount * area)}</td>
    </tr>`).join("");

  renderComparison(matched, candidates, area);

  $("result-section").style.display = "";
  $("no-result-note").style.display = "none";
  $("result-section").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderComparison(matched, candidates, area) {
  const maxTotal = Math.max(...candidates.map((s) => s.waterPerRai * area));

  $("compare-chart").innerHTML = candidates.map((s) => {
    const total = s.waterPerRai * area;
    const pct = Math.max((total / maxTotal) * 100, 8);
    const sel = s.id === matched.id ? " c-selected" : "";
    return `
      <div class="chart-row">
        <div class="chart-label">${s.name}</div>
        <div class="chart-track">
          <div class="chart-bar c-${s.level}${sel}" style="width:${pct}%">${fmt(total)}</div>
        </div>
      </div>`;
  }).join("");

  $("compare-body").innerHTML = candidates.map((s) => `
    <tr class="${s.id === matched.id ? "highlight" : ""}">
      <td>${s.name}${s.id === matched.id ? " ⭐" : ""}</td>
      <td><span class="badge level-${s.level}">${s.level}</span></td>
      <td class="num">${fmt(s.waterPerRai)}</td>
      <td class="num">${fmt(s.waterPerRai * area)}</td>
      <td>${s.expectedYield || "–"}</td>
      <td>${s.risk || "–"}</td>
    </tr>`).join("");
}

// ---------- Events ----------
document.getElementById("input-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = {
    crop: $("crop").value,
    season: $("season").value,
    water: parseFloat($("water").value),
    area: parseFloat($("area").value)
  };
  if (!input.water || !input.area || input.water <= 0 || input.area <= 0) return;

  const { matched, candidates } = matchScenario(input.crop, input.season, input.water, input.area);
  if (!matched) {
    $("no-result-note").textContent = "ไม่พบ scenario สำหรับพืชและฤดูกาลนี้ กรุณาให้ผู้ดูแลเพิ่มข้อมูลในหน้าอาจารย์";
    $("result-section").style.display = "none";
    $("no-result-note").style.display = "";
    return;
  }
  renderResult(matched, candidates, input);
});

populateForm();
