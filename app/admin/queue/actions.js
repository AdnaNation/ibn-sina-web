"use server";
import { revalidatePath } from "next/cache";
import { getSession, canSee, canDoctor, hasPermission } from "@/lib/auth";
import { getDoctor } from "@/lib/data";
import { writeAudit } from "@/lib/management";
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
  return p;
}
async function guardDoctor(slug) {
  const p = await getSession();
  const doctor = p && (await getDoctor(slug));
  if (!p || !hasPermission(p, "queue.manage") || !doctor || !canDoctor(p, doctor)) throw new Error("Not allowed");
  return { p, doctor };
}

export async function callNext(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  await advance(k);
  await writeAudit({ actor: p, action: "queue.call_next", targetType: "queue", targetId: k });
  done();
}
export async function skipCurrent(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  await advance(k, { skip: true });
  await writeAudit({ actor: p, action: "queue.patient_skipped", targetType: "queue", targetId: k });
  done();
}
export async function finishSession(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  await advance(k, { stop: true });
  await writeAudit({ actor: p, action: "queue.session_finished", targetType: "queue", targetId: k });
  done();
}
export async function setStatus(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  const status = get(fd, "status");
  await patchSession(k, { status });
  await writeAudit({ actor: p, action: "queue.status_changed", targetType: "queue", targetId: k, details: { status } });
  done();
}
export async function setDelay(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  await patchSession(k, {
    delayMin: get(fd, "delayMin"),
    notice: get(fd, "notice"),
  });
  await writeAudit({ actor: p, action: "queue.delay_updated", targetType: "queue", targetId: k, details: { delayMin: get(fd, "delayMin") } });
  done();
}
export async function saveSettings(fd) {
  const k = get(fd, "key");
  const p = await guard(k);
  await patchSession(k, {
    startTime: get(fd, "startTime"),
    maxPatients: get(fd, "maxPatients"),
  });
  await writeAudit({ actor: p, action: "queue.settings_updated", targetType: "queue", targetId: k });
  done();
}
export async function recallPatient(fd) {
  const ref = get(fd, "ref");
  const key = await apptKey(ref);
  const p = await guard(key);
  await recall(ref);
  await writeAudit({ actor: p, action: "queue.patient_recalled", targetType: "queue", targetId: key });
  done();
}
export async function addWalkIn(fd) {
  const { p, doctor } = await guardDoctor(get(fd, "doctorSlug"));
  const name = get(fd, "name").trim();
  if (name)
    await book({
      doctor,
      date: get(fd, "date"),
      name,
      phone: get(fd, "phone"),
      walkIn: true,
    });
    await writeAudit({ actor: p, action: "queue.walk_in_added", targetType: "queue", targetId: doctor.slug });
  }
  done();
}
export async function openNew(fd) {
  const { p, doctor } = await guardDoctor(get(fd, "doctorSlug"));
  await openSession(doctor, get(fd, "date"));
  await writeAudit({ actor: p, action: "queue.session_opened", targetType: "queue", targetId: doctor.slug });
  done();
}
