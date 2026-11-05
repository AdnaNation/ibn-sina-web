"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, canSee, canDoctor, hasPermission } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { writeAudit } from "@/lib/management";
import { advance, apptKey, book, openSession, patchSession, recall, sessionDoc } from "@/lib/queue";

const get = (fd, k) => String(fd.get(k) || "");
const validDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const parts = value.split("-").map(Number);
  const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  return date.getUTCFullYear() === parts[0] && date.getUTCMonth() === parts[1] - 1 && date.getUTCDate() === parts[2];
};
const done = () => revalidatePath("/admin/queue");
const failQueue = (key, message) => {
  const [doc, date] = String(key).split("|");
  redirect(`/admin/queue?date=${encodeURIComponent(date || "")}&doc=${encodeURIComponent(doc || "")}&err=${encodeURIComponent(message)}`);
};

async function guard(key) {
  const p = await getSession();
  const s = p && (await sessionDoc(key));
  if (!p || !hasPermission(p, "queue.manage") || !s || !canSee(p, s)) throw new Error("Not allowed");
  return p;
}
async function guardDoctor(slug) {
  const p = await getSession();
  const doctor = p && (await getDoctor(slug));
  if (!p || !hasPermission(p, "queue.manage") || !doctor || !canDoctor(p, doctor)) throw new Error("Not allowed");
  return { p, doctor };
}
async function record(p, action, targetId, details = {}) {
  await writeAudit({ actor: p, action, targetType: "queue", targetId, details });
}

export async function callNext(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await advance(k);
  if (result?.error) failQueue(k, result.error);
  await record(p, "queue.call_next", k);
  done();
}
export async function skipCurrent(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await advance(k, { skip: true });
  if (result?.error) failQueue(k, result.error);
  await record(p, "queue.patient_skipped", k);
  done();
}
export async function finishSession(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await advance(k, { stop: true });
  if (result?.error) failQueue(k, result.error);
  await record(p, "queue.session_finished", k);
  done();
}
export async function setStatus(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const status = get(fd, "status");
  const result = await patchSession(k, { status });
  if (result?.error) failQueue(k, result.error);
  await record(p, "queue.status_changed", k, { status });
  done();
}
export async function setDelay(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const delayMin = get(fd, "delayMin");
  const result = await patchSession(k, { delayMin, notice: get(fd, "notice") });
  if (result?.error) failQueue(k, result.error);
  await record(p, "queue.delay_updated", k, { delayMin });
  done();
}
export async function saveSettings(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await patchSession(k, { startTime: get(fd, "startTime"), maxPatients: get(fd, "maxPatients") });
  if (result?.error) failQueue(k, result.error);
  await record(p, "queue.settings_updated", k);
  done();
}
export async function recallPatient(fd) {
  const ref = get(fd, "ref");
  const key = await apptKey(ref);
  const p = await guard(key);
  const result = await recall(ref);
  if (result?.error) failQueue(key, result.error);
  await record(p, "queue.patient_recalled", key);
  done();
}
export async function addWalkIn(fd) {
  const { p, doctor } = await guardDoctor(get(fd, "doctorSlug"));
  const date = get(fd, "date");
  const key = `${doctor.slug}|${date}`;
  const name = get(fd, "name").trim();
  const phone = get(fd, "phone").trim();

  if (name.length < 2 || name.length > 80) {
    failQueue(key, "Enter a patient name between 2 and 80 characters.");
  }
  if (phone && !/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
    failQueue(key, "Enter a valid Bangladesh mobile number or leave it blank.");
  }
  if (!validDate(date)) {
    failQueue(key, "Choose a valid queue date.");
  }

  const result = await book({
    doctor,
    date,
    name,
    phone,
    walkIn: true,
  });
  if (result?.error) failQueue(key, result.error);
  await record(p, "queue.walk_in_added", key, { doctor: doctor.name, date });
  done();
}
export async function openNew(fd) {
  const { p, doctor } = await guardDoctor(get(fd, "doctorSlug"));
  const date = get(fd, "date");
  if (!validDate(date)) failQueue(doctor.slug + "|" + date, "Choose a valid queue date.");
  const opened = await openSession(doctor, date);
  if (opened?.error) failQueue(doctor.slug + "|" + date, opened.error);
  await record(p, "queue.session_opened", doctor.slug, { date });
  done();
}
