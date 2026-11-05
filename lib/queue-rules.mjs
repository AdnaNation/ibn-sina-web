export function buildSessionPatch(current, patch) {
  if (!current || typeof current !== "object") {
    return { error: "Queue session not found. Refresh and try again." };
  }
  if (["finished", "cancelled"].includes(current.status)) {
    return { error: "This queue is closed and can no longer be changed." };
  }
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    return { error: "No valid queue changes were provided." };
  }

  const set = {};
  if (patch.status !== undefined) {
    const allowed = {
      scheduled: ["in_progress"],
      in_progress: ["break"],
      break: ["in_progress"],
    };
    if (!allowed[current.status]?.includes(patch.status)) {
      return { error: "That queue status change is not allowed. Refresh and try again." };
    }
    set.status = patch.status;
  }
  if (patch.delayMin !== undefined) {
    const delay = Number(patch.delayMin);
    if (!Number.isInteger(delay) || delay < 0 || delay > 600) {
      return { error: "Delay must be a whole number between 0 and 600 minutes." };
    }
    set.delayMin = delay;
  }
  if (patch.notice !== undefined) {
    if (typeof patch.notice !== "string" || patch.notice.length > 140) {
      return { error: "Queue notice must be 140 characters or fewer." };
    }
    set.notice = patch.notice.trim();
  }
  if (patch.startTime !== undefined) {
    if (typeof patch.startTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(patch.startTime)) {
      return { error: "Enter a valid start time." };
    }
    set.startTime = patch.startTime;
  }
  if (patch.maxPatients !== undefined) {
    const capacity = Number(patch.maxPatients);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
      return { error: "Daily serial capacity must be a whole number between 1 and 200." };
    }
    if (capacity < (current.lastSerial || 0)) {
      return { error: "Capacity cannot be lower than the number of serials already issued." };
    }
    set.maxPatients = capacity;
  }
  if (!Object.keys(set).length) {
    return { error: "No valid queue changes were provided." };
  }
  return { set };
}
