import { useCallback, useEffect, useRef, useState } from 'react';
import type { Scenario } from '../../../shared/types/scenario.contracts';
import { FeedbackViewer } from '../components/FeedbackViewer';
import { NotifySettingsCard } from '../components/NotifySettingsCard';
import { logout } from '../components/RequireAdminAuth';
import { emptyScenario, ScenarioFormModal } from '../components/ScenarioFormModal';
import { CropGrid, ScenarioTable, SeasonGrid, type View } from '../components/ScenarioTable';
import { useAdminScenarios } from '../hooks/useAdminScenarios';
import {
  adminApi,
  AdminApiError,
  type AdminUser,
  type ScenarioInput,
} from '../services/admin-api.service';

type Editing = { id?: string; data: ScenarioInput };

function readView(): View {
  const sp = new URLSearchParams(window.location.search);
  return { crop: sp.get('crop'), season: sp.get('season') };
}

/** แยกเฉพาะ field ที่แก้ได้ (minRatio/maxRatio ระบบกำหนดจากสถานะน้ำ) */
function toInput(s: Scenario): ScenarioInput {
  const { id: _id, minRatio: _min, maxRatio: _max, ...rest } = s;
  return rest;
}

function ConfirmDelete({
  scenario,
  onConfirm,
  onClose,
}: {
  scenario: Scenario;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (ref.current && !ref.current.open) ref.current.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="del-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl p-0 backdrop:bg-text/50"
    >
      <div className="p-6">
        <h2 id="del-title" className="text-lg font-bold text-danger">
          ลบข้อมูลชุดนี้?
        </h2>
        <p className="mt-2 text-base">
          “{scenario.name}” จะถูกลบถาวร ระบบจะตอบเกษตรกรว่าไม่รองรับกรณีนี้จนกว่าจะเพิ่มใหม่
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            autoFocus
            onClick={() => ref.current?.close()}
            className="flex-1 cursor-pointer rounded-lg bg-surface-container-high px-4 py-3 font-semibold"
          >
            ไม่ลบ
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await onConfirm();
              ref.current?.close();
            }}
            className="flex-1 cursor-pointer rounded-lg bg-danger px-4 py-3 font-bold text-white disabled:opacity-60"
          >
            {busy ? 'กำลังลบ…' : 'ลบถาวร'}
          </button>
        </div>
      </div>
    </dialog>
  );
}

export function AdminDashboardPage({ user }: { user: AdminUser | null }) {
  const { scenarios, options, error, reload } = useAdminScenarios();
  const [tab, setTab] = useState<'data' | 'feedback'>('data');
  const [view, setView] = useState<View>(readView);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Scenario | null>(null);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // ปุ่มย้อนกลับของเบราว์เซอร์ = ถอยกลับทีละชั้น
    const onPop = () => setView(readView());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  /** เปลี่ยนชั้นที่ดู + เก็บใน URL (ส่งลิงก์/กดย้อนกลับได้) แล้วย้ายโฟกัสไปหัวข้อใหม่ */
  const go = useCallback((v: View) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('crop');
    url.searchParams.delete('season');
    if (v.crop) url.searchParams.set('crop', v.crop);
    if (v.crop && v.season) url.searchParams.set('season', v.season);
    window.history.pushState(null, '', url);
    setView(v);
    window.scrollTo({ top: 0 });
    setTimeout(() => headingRef.current?.focus(), 0);
  }, []);

  function flash(text: string, isError = false) {
    setToast({ text, error: isError });
    setTimeout(() => setToast(null), 4000);
  }

  function handleAuthError(err: unknown) {
    if (err instanceof AdminApiError && err.status === 401) {
      logout();
      return true;
    }
    return false;
  }

  async function save(data: ScenarioInput) {
    if (!editing) return;
    try {
      if (editing.id) {
        await adminApi.updateScenario(editing.id, data);
        flash(`บันทึก “${data.name}” เรียบร้อย`);
      } else {
        await adminApi.createScenario(data);
        flash(`เพิ่ม “${data.name}” เรียบร้อย`);
      }
      setEditing(null);
      await reload();
      if (data.crop !== view.crop || data.plantingSeason !== view.season) {
        go({ crop: data.crop, season: data.plantingSeason });
      }
    } catch (err) {
      if (!handleAuthError(err)) throw err; // ให้หน้าต่างแก้ไขแสดง error
    }
  }

  async function remove(s: Scenario) {
    try {
      await adminApi.deleteScenario(s.id);
      flash(`ลบ “${s.name}” แล้ว`);
      await reload();
    } catch (err) {
      if (!handleAuthError(err)) flash(err instanceof Error ? err.message : 'ลบไม่สำเร็จ', true);
    }
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(scenarios ?? [], null, 2)], {
      type: 'application/json',
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `warma-scenarios-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const crumb =
    'cursor-pointer rounded font-semibold text-brand hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none';
  const heading = !view.crop
    ? 'เลือกพันธุ์มันสำปะหลัง'
    : !view.season
      ? `พันธุ์${view.crop}: เลือกฤดูปลูก`
      : `พันธุ์${view.crop} · ${view.season}`;

  return (
    <div className="flex min-h-screen flex-col bg-surface-sunken text-on-surface">
      <header className="sticky top-0 z-10 bg-brand text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold sm:text-xl">ตั้งค่าข้อมูล</h1>
            <p className="truncate text-sm opacity-90">แก้ไขคำแนะนำการให้น้ำที่เกษตรกรเห็น</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {user && (
              <span className="hidden max-w-48 truncate opacity-90 sm:inline" title={user.email}>
                {user.name}
              </span>
            )}
            <a href="/input" className="rounded-full border border-white/50 px-3 py-1.5 whitespace-nowrap hover:bg-white/10">
              หน้าหลัก
            </a>
            {user && (
              <button
                type="button"
                onClick={logout}
                className="cursor-pointer rounded-full border border-white/50 px-3 py-1.5 whitespace-nowrap hover:bg-white/10"
              >
                ออกจากระบบ
              </button>
            )}
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-4" role="tablist" aria-label="ส่วนของหน้าตั้งค่า">
          {(
            [
              ['data', 'ข้อมูลคำแนะนำ'],
              ['feedback', 'ความคิดเห็นผู้ใช้'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setTab(key)}
              className={`cursor-pointer rounded-t-lg px-4 py-2.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                tab === key ? 'bg-surface-sunken text-brand-hover' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-5">
        {!user && (
          <p className="rounded-xl bg-warning/10 p-4 text-sm text-warning">
            โหมดพัฒนา: เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า GOOGLE_CLIENT_ID จึงไม่ต้องล็อกอิน
          </p>
        )}

        {tab === 'feedback' && (
          <div role="tabpanel" id="panel-feedback" aria-labelledby="tab-feedback" className="space-y-4">
            <NotifySettingsCard />
            <FeedbackViewer />
          </div>
        )}

        {tab === 'data' && (
          <div role="tabpanel" id="panel-data" aria-labelledby="tab-data" className="space-y-5">
            {error && (
              <div role="alert" className="rounded-xl bg-danger/10 p-4 text-danger">
                <p className="font-bold">โหลดข้อมูลไม่สำเร็จ</p>
                <p className="text-sm">{error}</p>
                <button
                  type="button"
                  onClick={() => void reload()}
                  className="mt-2 cursor-pointer rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white"
                >
                  ลองใหม่
                </button>
              </div>
            )}
            {!scenarios && !error && (
              <p className="py-10 text-center text-on-surface-variant">กำลังโหลดข้อมูล…</p>
            )}

            {scenarios && options && (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <nav aria-label="ตำแหน่งปัจจุบัน" className="text-base">
                    <ol className="flex flex-wrap items-center gap-1.5">
                      <li>
                        {view.crop ? (
                          <button type="button" className={crumb} onClick={() => go({ crop: null, season: null })}>
                            ทุกพันธุ์
                          </button>
                        ) : (
                          <span aria-current="page" className="font-semibold">ทุกพันธุ์</span>
                        )}
                      </li>
                      {view.crop && (
                        <>
                          <li aria-hidden="true" className="text-on-surface-variant">›</li>
                          <li>
                            {view.season ? (
                              <button type="button" className={crumb} onClick={() => go({ crop: view.crop, season: null })}>
                                {view.crop}
                              </button>
                            ) : (
                              <span aria-current="page" className="font-semibold">{view.crop}</span>
                            )}
                          </li>
                        </>
                      )}
                      {view.season && (
                        <>
                          <li aria-hidden="true" className="text-on-surface-variant">›</li>
                          <li aria-current="page" className="font-semibold">{view.season}</li>
                        </>
                      )}
                    </ol>
                  </nav>
                  <div className="flex gap-2">
                    {view.crop && (
                      <button
                        type="button"
                        onClick={() => go({ crop: view.season ? view.crop : null, season: null })}
                        className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-sunken"
                      >
                        ย้อนกลับ
                      </button>
                    )}
                    {!view.crop && (
                      <button
                        type="button"
                        onClick={exportJson}
                        className="cursor-pointer rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-sunken"
                      >
                        สำรองข้อมูล (JSON)
                      </button>
                    )}
                  </div>
                </div>

                <h2 ref={headingRef} tabIndex={-1} className="text-xl font-bold text-brand focus:outline-none">
                  {heading}
                </h2>

                {!view.crop && <CropGrid scenarios={scenarios} options={options} go={go} />}
                {view.crop && !view.season && (
                  <SeasonGrid crop={view.crop} scenarios={scenarios} options={options} go={go} />
                )}
                {view.crop && view.season && (
                  <ScenarioTable
                    crop={view.crop}
                    season={view.season}
                    scenarios={scenarios}
                    options={options}
                    onEdit={(s) => setEditing({ id: s.id, data: toInput(s) })}
                    onDelete={setDeleting}
                    onAdd={(waterCondition) => {
                      // ใช้ค่าความต้องการน้ำเดิมของพันธุ์+ฤดูนี้ ถ้ามี
                      const sibling = scenarios.find(
                        (s) => s.crop === view.crop && s.plantingSeason === view.season,
                      );
                      setEditing({
                        data: emptyScenario({
                          crop: view.crop as ScenarioInput['crop'],
                          plantingSeason: view.season as ScenarioInput['plantingSeason'],
                          waterCondition: waterCondition as ScenarioInput['waterCondition'],
                          waterRequirementM3: sibling?.waterRequirementM3 ?? 0,
                        }),
                      });
                    }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      {editing && options && (
        <ScenarioFormModal
          key={editing.id ?? 'new'}
          initial={editing.data}
          isEdit={!!editing.id}
          options={options}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDelete
          scenario={deleting}
          onConfirm={() => remove(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}

      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {toast && (
          <p
            className={`pointer-events-auto rounded-full px-5 py-3 text-base font-semibold shadow-lg ${toast.error ? 'bg-danger text-white' : 'bg-text text-white'}`}
          >
            {toast.text}
          </p>
        )}
      </div>
    </div>
  );
}
