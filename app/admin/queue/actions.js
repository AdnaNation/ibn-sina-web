"use server";
import { revalidatePath } from "next/cache";
import { getSession, canSee, canDoctor, hasPermission } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import {
  advance,
  apptKey,
  book,
  openSession,
  patchSession,
  recall,
  sessionDoc,
} from "@/lib/queue";

const get = (fd, k) => String(fd.get(k) || "");
const done = () => revalidatePath("/admin/queue");

// Every action re-checks that this session belongs to the signed-in person.
async function guard(key) {
  const p = await getSession();
  const s = p && (await sessionDoc(key));
  if (!p || !hasPermission(p, "queue.manage") || !s || !canSee(p, s)) throw new Error("Not allowed");
}
async function guardDoctor(slug) {
  const p = await getSession();
  const doctor = p && (await getDoctor(slug));
  if (!p || !hasPermission(p, "queue.manage") || !doctor || !canDoctor(p, doctor)) throw new Error("Not allowed");
  return doctor;
}

export async function callNext(fd) {
  const k = get(fd, "key");
  await guard(k);
  await advance(k);
  done();
}
export async function skipCurrent(fd) {
  const k = get(fd, "key");
  await guard(k);
  await advance(k, { skip: true });
  done();
}
export async function finishSession(fd) {
  const k = get(fd, "key");
  await guard(k);
  await advance(k, { stop: true });
  done();
}
export async function setStatus(fd) {
  const k = get(fd, "key");
  await guard(k);
  await patchSession(k, { status: get(fd, "status") });
  done();
}
export async function setDelay(fd) {
  const k = get(fd, "key");
  await guard(k);
  await patchSession(k, {
    delayMin: get(fd, "delayMin"),
    notice: get(fd, "notice"),
  });
  done();
}
export async function saveSettings(fd) {
  const k = get(fd, "key");
  await guard(k);
  await patchSession(k, {
    startTime: get(fd, "startTime"),
    maxPatients: get(fd, "maxPatients"),
  });
  done();
}
export async function recallPatient(fd) {
  const ref = get(fd, "ref");
  await guard(await apptKey(ref));
  await recall(ref);
  done();
}
export async function addWalkIn(fd) {
  const doctor = await guardDoctor(get(fd, "doctorSlug"));
  const name = get(fd, "name").trim();
  if (name)
    await book({
      doctor,
      date: get(fd, "date"),
      name,
      phone: get(fd, "phone"),
      walkIn: true,
    });
  done();
}
export async function openNew(fd) {
  const doctor = await guardDoctor(get(fd, "doctorSlug"));
  await openSession(doctor, get(fd, "date"));
  done();
}
