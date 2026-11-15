function emergencyTime(patient) {
  const value = patient?.emergencyAt instanceof Date
    ? patient.emergencyAt.getTime()
    : new Date(patient?.emergencyAt || 0).getTime();
  return Number.isFinite(value) ? value : 0;
}

function compareWaitingPatients(a, b) {
  const aEmergency = a.emergencyPriority === true;
  const bEmergency = b.emergencyPriority === true;
  if (aEmergency !== bEmergency) return aEmergency ? -1 : 1;
  if (aEmergency && bEmergency) {
    const byPriorityTime = emergencyTime(a) - emergencyTime(b);
    if (byPriorityTime) return byPriorityTime;
  }
  return Number(a.serial) - Number(b.serial);
}

export function getNextPatientsBySession(patients) {
  const nextBySession = new Map();
  const emergencyNextBySession = new Map();
  for (const patient of [...patients].sort(compareWaitingPatients)) {
    if (!nextBySession.has(patient.sessionKey)) {
      nextBySession.set(patient.sessionKey, patient.serial);
    }
    if (patient.emergencyPriority === true && !emergencyNextBySession.has(patient.sessionKey)) {
      emergencyNextBySession.set(patient.sessionKey, patient.serial);
    }
  }
  return { nextBySession, emergencyNextBySession };
}
