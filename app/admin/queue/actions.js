"use server";
import { revalidatePath } from "next/cache";
import { getSession, canSee, canDoctor, hasPermission } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { isValidISODate } from "@/lib/time";
import { writeAudit } from "@/lib/management";
import { advance, apptKey, book, openSession, patchSession, recall, sessionDoc } from "@/lib/queue";

const get = (fd, k) => String(fd.get(k) || "");
const validDate = isValidISODate;
const done = () => revalidatePath("/admin/queue");
const failQueue = (_key, message) => ({ error: message });

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
  if (result?.error) return failQueue(k, result.error);
  await record(p, "queue.call_next", k);
  done();
  return { success: true };
}
export async function skipCurrent(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await advance(k, { skip: true });
  if (result?.error) return failQueue(k, result.error);
  await record(p, "queue.patient_skipped", k);
  done();
  return { success: true };
}
export async function finishSession(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await advance(k, { stop: true });
  if (result?.error) return failQueue(k, result.error);
  await record(p, "queue.session_finished", k);
  done();
  return { success: true };
}
export async function setStatus(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const status = get(fd, "status");
  const result = await patchSession(k, { status });
  if (result?.error) return failQueue(k, result.error);
  await record(p, "queue.status_changed", k, { status });
  done();
  return { success: true };
}
export async function setDelay(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const delayMin = get(fd, "delayMin");
  const result = await patchSession(k, { delayMin, notice: get(fd, "notice") });
  if (result?.error) return failQueue(k, result.error);
  await record(p, "queue.delay_updated", k, { delayMin });
  done();
  return { success: true };
}
export async function saveSettings(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const result = await patchSession(k, { startTime: get(fd, "startTime"), maxPatients: get(fd, "maxPatients") });
  if (result?.error) return failQueue(k, result.error);
  await record(p, "queue.settings_updated", k);
  done();
  return { success: true };
}
export async function recallPatient(fd) {
  const ref = get(fd, "ref");
  const key = await apptKey(ref);
  const p = await guard(key);
  const result = await recall(ref);
  if (result?.error) return failQueue(key, result.error);
  await record(p, "queue.patient_recalled", key);
  done();
  return { success: true };
}
export async function addWalkIn(fd) {
  const { p, doctor } = await guardDoctor(get(fd, "doctorSlug"));
  const date = get(fd, "date");
  const key = `${doctor.slug}|${date}`;
  const name = get(fd, "name").trim();
  const phone = get(fd, "phone").trim();

  if (name.length < 2 || name.length > 80) {
    return failQueue(key, "Enter a patient name between 2 and 80 characters.");
  }
  if (phone && !/^(?:\+?88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ""))) {
    return failQueue(key, "Enter a valid Bangladesh mobile number or leave it blank.");
  }
  if (!validDate(date)) {
    return failQueue(key, "Choose a valid queue date.");
  }

  const result = await book({
    doctor,
    date,
    name,
    phone,
    walkIn: true,
  });
  if (result?.error) return failQueue(key, result.error);
  await record(p, "queue.walk_in_added", key, { doctor: doctor.name, date });
  done();
  return { success: true };
}
export async function openNew(fd) {
  const { p, doctor } = await guardDoctor(get(fd, "doctorSlug"));
  const date = get(fd, "date");
  if (!validDate(date)) return failQueue(doctor.slug + "|" + date, "Choose a valid queue date.");
  const opened = await openSession(doctor, date);
  if (opened?.error) return failQueue(doctor.slug + "|" + date, opened.error);
  await record(p, "queue.session_opened", doctor.slug, { date });
  done();
  return { success: true };
}
